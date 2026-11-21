const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const {
  parseQuestionBlocks,
  normalizeQuestionType,
  normalizeQuestionText,
  uniqueQuestionsByText,
  scanHierarchyBlocks,
  validateQuestion,
  calculateStepCoverage,
  tuGapsByFrequency
} = require('./question-engine');
const TrackerEngine = require('./public/tracker-engine');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const DATA_DIR = process.env.ANGLES_DATA_DIR || path.join(ROOT, 'data');
const PUBLIC_DIR = path.join(ROOT, 'public');
app.use(express.json({ limit: '4mb' }));

function isSafeSegment(value) {
  return typeof value === 'string' && value.length > 0 && value !== '.' && value !== '..' && !value.includes('/') && !value.includes('\\') && !value.includes('..');
}
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character])); }
function ensureInsideData(target) {
  const relative = path.relative(DATA_DIR, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Path escapes data directory');
}
function folderPath(folder) {
  if (!isSafeSegment(folder)) throw new Error('Invalid chapter name');
  const target = path.join(DATA_DIR, folder); ensureInsideData(target); return target;
}
function filePath(folder, file) {
  if (!isSafeSegment(folder) || !isSafeSegment(file)) throw new Error('Invalid file path');
  if (!(file.endsWith('.html') || file.endsWith('.css'))) throw new Error('Only .html and .css files are supported');
  const target = path.join(folderPath(folder), file); ensureInsideData(target); return target;
}
function cleanChapterName(name) {
  const cleaned = String(name || '').trim().replace(/[\\/]+/g, '-').replace(/\s+/g, ' ');
  if (!cleaned || cleaned === '.' || cleaned === '..') throw new Error('Chapter name is required');
  return cleaned.slice(0, 80);
}
function cleanFileName(name, type = 'html') {
  let cleaned = String(name || '').trim().replace(/[\\/]+/g, '-').replace(/\s+/g, '-');
  if (!cleaned) throw new Error('File name is required');
  const extension = type === 'css' ? '.css' : '.html';
  if (!/\.(html|css)$/i.test(cleaned)) cleaned += extension;
  if (!/^[\w .-]+\.(html|css)$/i.test(cleaned) || cleaned.includes('..')) throw new Error('Use a simple .html or .css filename');
  if (type === 'css' && !cleaned.endsWith('.css')) throw new Error('CSS files must end with .css');
  if (type === 'html' && !cleaned.endsWith('.html')) throw new Error('HTML files must end with .html');
  return cleaned.slice(0, 100);
}

function escapeRegExp(value) { return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function folderRoot(content) {
  const chMatch = /<Chapter\s*==\s*([^,>]+)/i.exec(String(content || ''));
  if (chMatch) return chMatch[1].trim().toUpperCase();
  return '';
}

const SKIP_INDEX_FOLDERS = new Set(['global unmapped', 'prototype', 'basics', 'basic', 'pronoun']);

/**
 * Builds the live Step-ID + Tu PYQ Coverage Index directly from disk chapter files
 * using permanent Full Base IDs (<Domain>-<Chapter>-<Subtopic>-<Concept>-<MC#>) + TG + Tu.
 * Zero MID dependency, zero unstable Tn numbering.
 */
async function indexQuestionData() {
  const chapters = await scanChapters();
  const microConceptRegistry = [];
  const mcByBaseId = new Map();
  const conceptRegistry = new Map(); // UPPER(conceptId) -> { conceptId, title, folder, file, chapterId }
  const chapterByCode = new Map(); // UPPER(chapterId) -> { folder, name, chapterId, domainId }

  // Pass 1: Absorb all <Chapter>, <Concept>, and <MC == FullBaseId, name = ...>
  const chapterFileContents = [];
  for (const chapter of chapters) {
    if (SKIP_INDEX_FOLDERS.has(chapter.folder.toLowerCase())) continue;
    const htmlFiles = chapter.files
      .filter((name) => name.toLowerCase().endsWith('.html'))
      .sort((a, b) => a.localeCompare(b));
    const files = [];
    let chapterId = '';
    let domainId = '';
    for (const file of htmlFiles) {
      const content = await fs.readFile(path.join(folderPath(chapter.folder), file), 'utf8');
      files.push({ file, content });
      const hierarchy = scanHierarchyBlocks(content);
      if (!domainId && hierarchy.domain?.id) domainId = hierarchy.domain.id;
      if (!chapterId && hierarchy.chapter?.id) chapterId = hierarchy.chapter.id;
      for (const con of hierarchy.concepts) {
        const cKey = con.conceptId.toUpperCase();
        if (cKey && !conceptRegistry.has(cKey)) {
          conceptRegistry.set(cKey, {
            conceptId: con.conceptId,
            title: con.title || con.conceptId,
            folder: chapter.folder,
            file,
            chapterId: hierarchy.chapter?.id || chapterId || chapter.folder
          });
        }
      }
      for (const mc of hierarchy.microConcepts) {
        const key = mc.baseId.toUpperCase();
        if (!key || mcByBaseId.has(key)) continue;
        const entry = {
          baseId: mc.baseId,
          shortId: mc.baseId,
          name: mc.name || mc.baseId,
          folder: chapter.folder,
          file,
          chapterId: hierarchy.chapter?.id || chapterId || chapter.folder,
          conceptId: mc.baseId.split('-').slice(0, 4).join('-')
        };
        mcByBaseId.set(key, entry);
        microConceptRegistry.push(entry);
      }
    }
    const resolvedChId = chapterId || chapter.folder;
    chapterByCode.set(resolvedChId.toUpperCase(), { folder: chapter.folder, name: chapter.name, chapterId: resolvedChId, domainId });
    chapterFileContents.push({ chapter, files, chapterId: resolvedChId, domainId });
  }

  // Pass 2: Scan questions (from both study files and questions.html), concepts, and Step-ID / Tu coverage
  const results = [];
  const targetCounts = {};
  for (const { chapter, files, chapterId, domainId } of chapterFileContents) {
    const conceptsMap = new Map();
    const allQuestions = [];
    const stepCounts = {};

    // Register concepts declared in this chapter
    for (const { file, content } of files) {
      const hierarchy = scanHierarchyBlocks(content);
      for (const con of hierarchy.concepts) {
        const key = con.conceptId.toUpperCase();
        if (!conceptsMap.has(key)) {
          conceptsMap.set(key, {
            conceptId: con.conceptId,
            title: con.title || con.conceptId,
            folder: chapter.folder,
            file,
            questions: []
          });
        }
      }
      const parsedInFile = parseQuestionBlocks(content).map((q) => {
        const enclosing = hierarchy.concepts
          .filter((con) => q.start >= con.start && q.start < con.end)
          .sort((a, b) => (a.end - a.start) - (b.end - b.start))[0];
        const targetConcept = q.target || (enclosing ? enclosing.conceptId : '') || q.inferredTarget || '';
        return {
          ...q,
          targetConcept,
          folder: chapter.folder,
          file
        };
      });
      allQuestions.push(...parsedInFile);
    }

    const uniqueQuestions = uniqueQuestionsByText(allQuestions);

    // Group questions into their target concept bucket (works identically for questions.html and inline <Concept>)
    uniqueQuestions.forEach((q) => {
      const targetKey = String(q.targetConcept || '').trim();
      if (targetKey) {
        const upperTarget = targetKey.toUpperCase();
        targetCounts[upperTarget] = (targetCounts[upperTarget] || 0) + 1;
        if (!conceptsMap.has(upperTarget)) {
          conceptsMap.set(upperTarget, {
            conceptId: targetKey,
            title: targetKey,
            folder: chapter.folder,
            file: q.file,
            questions: []
          });
        }
        conceptsMap.get(upperTarget).questions.push(q);
      }
    });

    const concepts = [...conceptsMap.values()].map((con) => {
      const conQuestions = uniqueQuestionsByText(con.questions);
      const conTu = conQuestions.filter((q) => q.hasTu).length;
      const conTypeCounts = {};
      conQuestions.forEach((q) => {
        const t = normalizeQuestionType(q.type) || 'UNTYPED';
        conTypeCounts[t] = (conTypeCounts[t] || 0) + 1;
      });
      return {
        conceptId: con.conceptId,
        title: con.title || con.conceptId,
        folder: con.folder,
        file: con.file,
        questions: conQuestions.length,
        tuCount: conTu,
        coveredCount: conQuestions.length - conTu,
        typeCounts: conTypeCounts,
        uniqueQuestionCount: conQuestions.length
      };
    });

    const tuQuestions = uniqueQuestions.filter((q) => q.hasTu);
    const coveredQuestions = uniqueQuestions.filter((q) => q.steps.length > 0 && !q.hasTu);
    const untaggedQuestions = uniqueQuestions.filter((q) => q.steps.length === 0);
    const typeCounts = {};

    uniqueQuestions.forEach((q) => {
      const t = normalizeQuestionType(q.type) || 'UNTYPED';
      typeCounts[t] = (typeCounts[t] || 0) + 1;
      const seenInQ = new Set();
      q.steps.forEach((step) => {
        step.stepIds.forEach((rawToken) => {
          const upper = rawToken.toUpperCase();
          const resolved =
            upper === 'TU'
              ? { baseId: 'Tu', name: 'Unmapped Step (Missing MC)', isTu: true, isTg: false }
              : upper === 'TG'
                ? { baseId: 'TG', name: 'Global General Knowledge', isTu: false, isTg: true }
                : (() => {
                    const mc = mcByBaseId.get(upper);
                    return mc
                      ? { baseId: mc.baseId, name: mc.name, isTu: false, isTg: false }
                      : { baseId: rawToken, name: 'Unregistered Step ID', isTu: false, isTg: false };
                  })();
          const key = resolved.baseId;
          if (!stepCounts[key]) {
            stepCounts[key] = {
              stepId: resolved.baseId,
              baseId: resolved.baseId,
              name: resolved.name,
              stepCount: 0,
              questionCount: 0,
              isTu: resolved.isTu,
              isTg: resolved.isTg
            };
          }
          stepCounts[key].stepCount++;
          seenInQ.add(key);
        });
      });
      seenInQ.forEach((key) => { stepCounts[key].questionCount++; });
    });

    const uncoveredCount = tuQuestions.length + untaggedQuestions.length;
    const totalQuestions = uniqueQuestions.length;

    results.push({
      folder: chapter.folder,
      name: chapter.name,
      domainId: domainId || '',
      chapterId: chapterId || chapter.folder,
      concepts,
      stepCounts: Object.values(stepCounts).sort((a, b) => b.questionCount - a.questionCount || a.baseId.localeCompare(b.baseId, undefined, { numeric: true })),
      totalQuestions,
      coveredCount: coveredQuestions.length,
      tuCount: tuQuestions.length,
      untaggedCount: untaggedQuestions.length,
      coverage: calculateStepCoverage(coveredQuestions.length, uncoveredCount),
      gaps: tuGapsByFrequency(tuQuestions),
      typeCounts,
      uniqueQuestionCount: totalQuestions
    });
  }

  const totalAcrossChapters = results.reduce((sum, row) => sum + row.totalQuestions, 0);
  results.forEach((row) => {
    row.totalShare = totalAcrossChapters ? (row.totalQuestions / totalAcrossChapters) * 100 : 0;
  });

  const typeSet = new Set();
  results.forEach((row) => Object.keys(row.typeCounts || {}).forEach((t) => typeSet.add(t)));
  const types = [...typeSet].sort((a, b) => (a === 'UNTYPED' ? 1 : b === 'UNTYPED' ? -1 : a.localeCompare(b)));
  const typeFolders = results.map((row) => ({
    folder: row.folder,
    name: row.name,
    chapterId: row.chapterId,
    counts: row.typeCounts,
    uniqueCount: row.uniqueQuestionCount,
    concepts: row.concepts.map((c) => ({
      conceptId: c.conceptId,
      title: c.title,
      counts: c.typeCounts,
      uniqueCount: c.uniqueQuestionCount
    }))
  }));

  return {
    chapters: results,
    microConcepts: microConceptRegistry,
    concepts: [...conceptRegistry.values()],
    targetCounts,
    typeBreakdown: { types, folders: typeFolders }
  };
}

function resolveStepTokenMeta(token, microConcepts) {
  const upper = String(token || '').trim().toUpperCase();
  if (upper === 'TU') {
    return { kind: 'tu', shortId: 'Tu', baseId: 'Tu', name: 'Unmapped Step (Missing MC)' };
  }
  if (upper === 'TG') {
    return { kind: 'tg', shortId: 'TG', baseId: 'TG', name: 'Global General Knowledge' };
  }
  const match = microConcepts.find((mc) => mc.baseId.toUpperCase() === upper);
  if (match) {
    return { kind: 'mc', shortId: match.baseId, baseId: match.baseId, name: match.name, folder: match.folder, file: match.file, conceptId: match.conceptId };
  }
  return { kind: 'unknown', shortId: token, baseId: token, name: 'Not found in MC Registry (use Full Base ID, TG, or Tu)' };
}

function ensureQuestionMetadata(block, questionId, targetPath) {
  let out = String(block || '').trim();
  if (targetPath && !/<target\s*={1,2}\s*[^>]+>/i.test(out)) {
    out = out.replace(/<Qn\b[^>]*>/i, (open) => `${open}\n  <target == ${targetPath}>`);
  }
  if (questionId && !/<id\s*={1,2}\s*[^>]+>/i.test(out)) {
    out = out.replace(/<Qn\b[^>]*>/i, (open) => `${open}\n  <id == ${questionId}>`);
  }
  return out;
}

function nextSequentialQuestionId(existingQuestions, targetPath) {
  const prefix = String(targetPath || 'QA-Q').trim();
  const escaped = escapeRegExp(prefix);
  const re = new RegExp(`^${escaped}-(\\d+)$`, 'i');
  let maxNum = 0;
  for (const q of existingQuestions || []) {
    const m = re.exec(String(q.id || '').trim());
    if (m) maxNum = Math.max(maxNum, Number(m[1]));
  }
  return `${prefix}-${maxNum + 1}`;
}

async function appendQuestionToBank(folder, targetFile, targetPath, questionBlock, questionText, existingContentCache) {
  const dir = folderPath(folder);
  await fs.mkdir(dir, { recursive: true });
  const targetPathFull = path.join(dir, targetFile);
  let content = existingContentCache.has(targetPathFull) ? existingContentCache.get(targetPathFull) : null;
  if (content === null) {
    try { content = await fs.readFile(targetPathFull, 'utf8'); }
    catch (err) {
      if (err.code !== 'ENOENT') throw err;
      const heading = targetFile === 'tu-gaps.html'
        ? `${folder} — Unmapped Tu Step Gaps`
        : `${folder} — Question Bank`;
      content = `<h1>${escapeHtml(heading)}</h1>\n<qn all mode = normal>\n</qn all>\n`;
    }
  }
  const existing = parseQuestionBlocks(content);
  if (existing.some((q) => normalizeQuestionText(q.text) === normalizeQuestionText(questionText))) {
    return { path: targetPathFull, content, duplicate: true, assignedId: '' };
  }
  const assignedId = nextSequentialQuestionId(existing, targetPath || folder.toUpperCase().replace(/\s+/g, '-'));
  const enrichedBlock = ensureQuestionMetadata(questionBlock, assignedId, targetPath);
  const qnClose = content.lastIndexOf('</qn all>');
  let updated;
  if (qnClose !== -1) {
    updated = content.slice(0, qnClose) + `\n${enrichedBlock}\n` + content.slice(qnClose);
  } else {
    updated = content + `\n<qn all mode = normal>\n${enrichedBlock}\n</qn all>\n`;
  }
  existingContentCache.set(targetPathFull, updated);
  return { path: targetPathFull, content: updated, duplicate: false, assignedId };
}
async function atomicWriteBatch(changes) {
  const originals = new Map();
  try {
    for (const [file, content] of changes) {
      let original;
      try { original = await fs.readFile(file, 'utf8'); } catch (error) { if (error.code !== 'ENOENT') throw error; original = null; }
      originals.set(file, original);
      const temp = `${file}.angles-tmp`; await fs.writeFile(temp, content, 'utf8'); await fs.rename(temp, file);
    }
  } catch (error) {
    for (const [file, content] of originals) { try { if (content === null) await fs.unlink(file); else await fs.writeFile(file, content, 'utf8'); } catch (_) {} }
    for (const file of changes.keys()) { try { await fs.unlink(`${file}.angles-tmp`); } catch (_) {} }
    throw error;
  }
}

class TrackerError extends Error {
  constructor(code, message, status = 409, details = []) { super(message); this.code = code; this.status = status; this.details = details; }
}
const trackerLocks = new Map();
async function withTrackerLock(key, task) {
  const previous = trackerLocks.get(key) || Promise.resolve();
  let release;
  const current = new Promise((resolve) => { release = resolve; });
  trackerLocks.set(key, current);
  await previous;
  try { return await task(); }
  finally { release(); if (trackerLocks.get(key) === current) trackerLocks.delete(key); }
}
function trackerApiError(res, error) {
  res.status(error.status || 500).json({ error: error.message || 'Tracker request failed', code: error.code || 'TRACKER_ERROR', details: error.details || [] });
}
function stripHtmlCommentsPreservingOffsets(source) {
  return String(source || '').replace(/<!--[\s\S]*?-->/g, (comment) => ' '.repeat(comment.length));
}
function trackerQuestionSignature(question) {
  const optionsBlock = /<Options\s*>([\s\S]*?)<\/Options\s*>/i.exec(question.block || '')?.[1] || '';
  const options = [...optionsBlock.matchAll(/<([A-D])\s*=\s*([\s\S]*?)(?=<[A-D]\s*=|$)/gi)]
    .map((match) => [match[1].toUpperCase(), normalizeQuestionText(match[2])]);
  const prompt = normalizeQuestionText(question.text) || normalizeQuestionText(question.block);
  return crypto.createHash('sha256').update(JSON.stringify({ prompt, options })).digest('hex');
}
async function trackerChapterInventory() {
  const chapters = await scanChapters();
  const rows = [];
  for (const chapter of chapters) {
    const mids = new Set();
    for (const file of chapter.files.filter((name) => name.toLowerCase().endsWith('.html'))) {
      const root = folderRoot(await fs.readFile(path.join(folderPath(chapter.folder), file), 'utf8'));
      if (root) mids.add(root);
    }
    rows.push({ folder: chapter.folder, name: chapter.name, htmlCount: chapter.htmlCount, rootMids: [...mids].sort() });
  }
  const owners = new Map();
  for (const row of rows) for (const mid of row.rootMids.filter((value) => value !== 'UN')) {
    if (!owners.has(mid)) owners.set(mid, new Set());
    owners.get(mid).add(row.folder);
  }
  for (const row of rows) {
    row.rootMid = row.rootMids.length === 1 ? row.rootMids[0] : '';
    row.status = 'ready'; row.issue = '';
    if (row.rootMids.length === 0) { row.status = 'missing-mid'; row.issue = 'No chapter MID marker was found in this folder.'; }
    else if (row.rootMids.length > 1) { row.status = 'mid-conflict'; row.issue = `Conflicting MIDs in this folder: ${row.rootMids.join(', ')}.`; }
    else if (row.rootMid === 'UN') { row.status = 'reserved'; row.issue = 'UN is reserved for global unmapped questions, not a chapter tracker.'; }
    else if ((owners.get(row.rootMid)?.size || 0) > 1) {
      row.status = 'duplicate-mid';
      row.issue = `Root MID ${row.rootMid} is shared by: ${[...owners.get(row.rootMid)].join(', ')}.`;
    }
  }
  return rows;
}
async function collectTrackerQuestionPool(folder, rootMid, files) {
  const pool = []; const warnings = []; const conceptMids = new Set(); const seen = new Set();
  for (const file of files.filter((name) => name.toLowerCase().endsWith('.html')).sort((a, b) => a.localeCompare(b))) {
    const raw = await fs.readFile(path.join(folderPath(folder), file), 'utf8');
    const source = stripHtmlCommentsPreservingOffsets(raw);
    const hierarchy = scanHierarchyBlocks(source);
    hierarchy.concepts.forEach((con) => conceptMids.add(con.conceptId));
    for (const question of parseQuestionBlocks(source)) {
      const enclosing = hierarchy.concepts.filter((con) => question.start >= con.start && question.start < con.end).sort((a, b) => (a.end - a.start) - (b.end - b.start))[0];
      const conceptMid = question.target || (enclosing ? enclosing.conceptId : '') || question.inferredTarget || 'C1';
      conceptMids.add(conceptMid);
      const signature = trackerQuestionSignature(question);
      if (seen.has(signature)) continue;
      seen.add(signature);
      if (!question.text) warnings.push({ code: 'QUESTION_TEXT_MISSING', file, message: 'A question block has no readable <text> value; it is still counted using its source signature.' });
      pool.push({
        conceptMid,
        signature,
        sourceFile: file,
        type: question.type || 'UNTYPED',
        stepId: question.stepIds.join(', '),
        gap: question.gap || '',
        text: question.text || '',
        optionsMap: question.optionsMap || {},
        answer: question.answer || '',
        explanation: question.explanation || ''
      });
    }
  }
  return { pool, conceptMids: [...conceptMids].sort((a, b) => a.localeCompare(b)), warnings };
}
async function readOrSyncTracker(folder, rootMid, topic, lockHeld = false) {
  const sync = async () => {
    const dir = folderPath(folder); const filePathname = path.join(dir, 'tracker-ledger.json');
    let original = '';
    try { original = await fs.readFile(filePathname, 'utf8'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    let ledger;
    if (original) {
      try { ledger = JSON.parse(original); } catch (_) { throw new TrackerError('INVALID_LEDGER_JSON', `The tracker ledger for ${folder} is not valid JSON. Preserve the file and repair it before continuing.`, 409); }
      if (ledger.chapterMid && ledger.chapterMid !== rootMid) throw new TrackerError('LEDGER_MID_MISMATCH', `The saved ledger MID is ${ledger.chapterMid}, but this folder now has MID ${rootMid}. No IDs or records were changed.`, 409);
      ledger.chapterMid = rootMid; ledger.topic = topic;
      ledger.timingConfig ||= { locked: false, fastLimit: null, mediumLimit: null, slowLimit: null };
      ledger.concepts ||= {};
    } else ledger = TrackerEngine.createLedger(rootMid, topic);
    const chapter = (await scanChapters()).find((item) => item.folder === folder);
    if (!chapter) throw new TrackerError('CHAPTER_NOT_FOUND', `Folder ${folder} no longer exists.`, 404);
    const collected = await collectTrackerQuestionPool(folder, rootMid, chapter.files);
    TrackerEngine.reconcileQuestionPool(ledger, collected.pool, collected.conceptMids);
    const result = TrackerEngine.calculateMetrics(ledger);
    if (!result.ok) throw new TrackerError('LEDGER_VALIDATION_FAILED', `The saved tracker ledger for ${folder} failed validation. Totals are withheld.`, 409, result.errors);
    const serialized = `${JSON.stringify(ledger, null, 2)}\n`;
    if (original !== serialized) await atomicWriteBatch(new Map([[filePathname, serialized]]));
    return { ledger, metrics: result.metrics, invariants: result.invariants, warnings: collected.warnings };
  };
  return lockHeld ? sync() : withTrackerLock(folder, sync);
}

async function ensureData() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const entries = await fs.readdir(DATA_DIR, { withFileTypes: true });
  if (entries.some((entry) => entry.isDirectory())) return;
  const starterChapters = [
    { folder: 'subject-verb-agreement', content: `<h1>Subject–Verb Agreement</h1>\n<p class="lede">Build the rule once. Retrieve it under pressure.</p>\n<table r = 3 c = 3>\n  <c11 = Signal> <c12 = Rule> <c13 = Example>\n  <c21 = Singular subject> <c22 = Use a singular verb> <c23 = The dog <strong>runs</strong> fast.>\n  <c31 = Either / neither> <c32 = Match the nearer subject> <c33 = Either the cats or the dog <strong>has</strong> eaten.>\n</table>\n\n<qn all mode = exam>\n  <text = Choose the correct verb.>\n  <A = The list of names are on the desk.>\n  <B = The list of names is on the desk.>\n  <answer = b>\n  <explanation = “List” is the head noun, so the singular verb “is” agrees.>\n</qn>` },
    { folder: 'time-and-work', content: `<h1>Time & Work</h1>\n<p class="lede">A compact calculation sheet for rate-based questions.</p>\n<grid pos="2, 4" span="11, 8">\n  <span class="eyebrow">RULE 01</span>\n  <h2>Work = Rate × Time</h2>\n  <p>When two workers combine, add their daily rates before taking the reciprocal.</p>\n</grid>\n<p class="note-callout">Try writing one line of reasoning before checking the answer.</p>` }
  ];
  await Promise.all(starterChapters.map(async ({ folder, content }) => {
    const dir = path.join(DATA_DIR, folder); await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, 'styles.css'), ':root { --chapter-accent: #2457ff; }\n.preview-content h1 { color: var(--chapter-accent); }\n', 'utf8');
    await fs.writeFile(path.join(dir, '01-start-here.html'), content, 'utf8');
  }));
}

async function scanChapters() {
  await ensureData();
  const entries = await fs.readdir(DATA_DIR, { withFileTypes: true });
  const chapters = [];
  for (const entry of entries.filter((item) => item.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
    const dir = path.join(DATA_DIR, entry.name);
    const files = await fs.readdir(dir, { withFileTypes: true });
    const topicFiles = files.filter((file) => file.isFile() && /\.(html|css)$/i.test(file.name)).sort((a, b) => (a.name.endsWith('.css') ? 1 : 0) - (b.name.endsWith('.css') ? 1 : 0) || a.name.localeCompare(b.name));
    chapters.push({ folder: entry.name, name: entry.name.replace(/[-_]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()), htmlCount: topicFiles.filter((file) => file.name.endsWith('.html')).length, cssCount: topicFiles.filter((file) => file.name.endsWith('.css')).length, files: topicFiles.map((file) => file.name), hasStyles: topicFiles.some((file) => file.name.endsWith('.css')) });
  }
  return chapters;
}
function apiError(res, error, status = 400) { res.status(status).json({ error: error.message || 'Something went wrong' }); }

app.get('/api/chapters', async (_req, res) => { try { res.json({ chapters: await scanChapters() }); } catch (error) { apiError(res, error, 500); } });
app.post('/api/chapters', async (req, res) => {
  try {
    await ensureData();
    const folder = cleanChapterName(req.body?.name);
    const target = folderPath(folder);
    await fs.mkdir(target, { recursive: false });
    await fs.writeFile(path.join(target, 'styles.css'), ':root { --chapter-accent: #2457ff; }\n', 'utf8');
    await fs.writeFile(path.join(target, '01-start-here.html'), `<h1>${escapeHtml(folder)}</h1>\n<p>Start shaping this sheet.</p>\n`, 'utf8');
    res.status(201).json({ folder, chapter: (await scanChapters()).find((chapter) => chapter.folder === folder) });
  } catch (error) { apiError(res, error, error.code === 'EEXIST' ? 409 : 400); }
});
app.delete('/api/chapters/:folder', async (req, res) => {
  try {
    const folder = String(req.params.folder || '').trim();
    if (!folder || folder === '.' || folder === '..' || /[\\/]/.test(folder)) {
      throw new Error('Invalid chapter folder name.');
    }
    if (folder.toLowerCase() === 'global unmapped') {
      throw new Error('Global Unmapped is a reserved system folder and cannot be deleted.');
    }
    const target = folderPath(folder);
    const stat = await fs.stat(target);
    if (!stat.isDirectory()) throw new Error('Target is not a chapter folder.');
    await fs.rm(target, { recursive: true, force: true });
    res.json({ ok: true, deleted: folder });
  } catch (error) { apiError(res, error, error.code === 'ENOENT' ? 404 : 400); }
});
app.get('/api/chapters/:folder/files', async (req, res) => {
  try {
    const dir = folderPath(req.params.folder); const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = entries.filter((entry) => entry.isFile() && /\.(html|css)$/i.test(entry.name)).sort((a, b) => (a.name.endsWith('.css') ? 1 : 0) - (b.name.endsWith('.css') ? 1 : 0) || a.name.localeCompare(b.name)).map((entry) => ({ name: entry.name, type: entry.name.endsWith('.css') ? 'css' : 'html' }));
    res.json({ folder: req.params.folder, files });
  } catch (error) { apiError(res, error, error.code === 'ENOENT' ? 404 : 400); }
});
app.get('/api/chapters/:folder/files/:file', async (req, res) => { try { const target = filePath(req.params.folder, req.params.file); const [content, stat] = await Promise.all([fs.readFile(target, 'utf8'), fs.stat(target)]); res.json({ folder: req.params.folder, file: req.params.file, content, updatedAt: stat.mtime.toISOString() }); } catch (error) { apiError(res, error, error.code === 'ENOENT' ? 404 : 400); } });
app.put('/api/chapters/:folder/files/:file', async (req, res) => { try { const target = filePath(req.params.folder, req.params.file); if (typeof req.body?.content !== 'string') throw new Error('File content must be a string'); await fs.writeFile(target, req.body.content, 'utf8'); res.json({ ok: true, folder: req.params.folder, file: req.params.file, savedAt: new Date().toISOString() }); } catch (error) { apiError(res, error, error.code === 'ENOENT' ? 404 : 400); } });
app.post('/api/chapters/:folder/files', async (req, res) => { try { const file = cleanFileName(req.body?.name, req.body?.type); const target = path.join(folderPath(req.params.folder), file); ensureInsideData(target); await fs.writeFile(target, typeof req.body?.content === 'string' ? req.body.content : req.body?.type === 'css' ? '/* New chapter stylesheet */\n' : '<h1>New topic</h1>\n', { encoding: 'utf8', flag: 'wx' }); res.status(201).json({ file, type: file.endsWith('.css') ? 'css' : 'html', content: await fs.readFile(target, 'utf8') }); } catch (error) { apiError(res, error, error.code === 'EEXIST' ? 409 : error.code === 'ENOENT' ? 404 : 400); } });
app.patch('/api/chapters/:folder/files/:file', async (req, res) => { try { const current = filePath(req.params.folder, req.params.file); const next = cleanFileName(req.body?.name, req.params.file.endsWith('.css') ? 'css' : 'html'); const target = path.join(folderPath(req.params.folder), next); ensureInsideData(target); await fs.rename(current, target); res.json({ ok: true, oldName: req.params.file, file: next }); } catch (error) { apiError(res, error, error.code === 'EEXIST' ? 409 : error.code === 'ENOENT' ? 404 : 400); } });
app.delete('/api/chapters/:folder/files/:file', async (req, res) => {
  try {
    const folder = req.params.folder;
    const file = req.params.file;
    const target = filePath(folder, file);
    const dir = folderPath(folder);

    let removedQuestionIds = [];
    let removedConceptIds = [];
    let ledgerRemoved = false;

    if (file.toLowerCase().endsWith('.html')) {
      const deletedContent = await fs.readFile(target, 'utf8');
      const deletedQuestions = parseQuestionBlocks(deletedContent);
      const deletedHierarchy = scanHierarchyBlocks(deletedContent);
      const deletedQidSet = new Set(deletedQuestions.map((q) => String(q.id || '').trim()).filter(Boolean));
      const deletedConceptIdSet = new Set(deletedHierarchy.concepts.map((c) => c.conceptId.toUpperCase()));

      await fs.unlink(target);

      // Inspect remaining HTML files to find concepts that were uniquely defined in the deleted file
      const remainingEntries = await fs.readdir(dir, { withFileTypes: true });
      const remainingHtmlFiles = remainingEntries
        .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.html'))
        .map((e) => e.name);

      const survivingConcepts = new Set();
      for (const remFile of remainingHtmlFiles) {
        const remContent = await fs.readFile(path.join(dir, remFile), 'utf8');
        const remHierarchy = scanHierarchyBlocks(remContent);
        remHierarchy.concepts.forEach((c) => survivingConcepts.add(c.conceptId.toUpperCase()));
      }

      const orphanedConcepts = new Set(
        [...deletedConceptIdSet].filter((cid) => !survivingConcepts.has(cid))
      );
      removedConceptIds = [...orphanedConcepts];

      // If the deleted file owned concepts not defined elsewhere, also purge ingested questions targeting them from questions.html
      if (orphanedConcepts.size > 0 && remainingHtmlFiles.includes('questions.html')) {
        const qBankPath = path.join(dir, 'questions.html');
        let qBankContent = await fs.readFile(qBankPath, 'utf8');
        const qBlocks = parseQuestionBlocks(qBankContent);
        const blocksToRemove = qBlocks.filter((q) => {
          const targetId = String(q.target || q.inferredTarget || '').trim().toUpperCase();
          if (targetId && orphanedConcepts.has(targetId)) return true;
          const qidUpper = String(q.id || '').trim().toUpperCase();
          return [...orphanedConcepts].some((cid) => qidUpper.startsWith(`${cid}-`));
        });

        if (blocksToRemove.length > 0) {
          // Remove matched blocks from bottom to top so indices remain valid
          const sortedDesc = [...blocksToRemove].sort((a, b) => b.start - a.start);
          for (const blk of sortedDesc) {
            if (blk.id) deletedQidSet.add(String(blk.id).trim());
            qBankContent = `${qBankContent.slice(0, blk.start).trimEnd()}\n${qBankContent.slice(blk.end).trimStart()}`;
          }
          await atomicWriteBatch(new Map([[qBankPath, `${qBankContent.trim()}\n`]]));
        }
      }

      // Check how many questions still survive in the chapter folder
      let survivingQuestionCount = 0;
      for (const remFile of remainingHtmlFiles) {
        const remContent = await fs.readFile(path.join(dir, remFile), 'utf8');
        survivingQuestionCount += parseQuestionBlocks(remContent).length;
      }

      removedQuestionIds = [...deletedQidSet];

      // Purge deleted questions & attempt history from tracker-ledger.json
      const ledgerPath = path.join(dir, 'tracker-ledger.json');
      try {
        const ledgerRaw = await fs.readFile(ledgerPath, 'utf8');
        const ledger = JSON.parse(ledgerRaw);
        const removedUpper = new Set(removedQuestionIds.map((id) => id.toUpperCase()));

        if (survivingQuestionCount === 0 || (file.toLowerCase() === 'questions.html' && survivingQuestionCount === 0)) {
          await fs.unlink(ledgerPath);
          ledgerRemoved = true;
        } else if (removedUpper.size > 0 && ledger && typeof ledger === 'object') {
          if (ledger.concepts && typeof ledger.concepts === 'object') {
            for (const [cKey, qMap] of Object.entries(ledger.concepts)) {
              if (!qMap || typeof qMap !== 'object') continue;
              for (const qid of Object.keys(qMap)) {
                if (removedUpper.has(qid.toUpperCase())) delete qMap[qid];
              }
              if (Object.keys(qMap).length === 0) delete ledger.concepts[cKey];
            }
          }
          if (ledger.attemptLog && typeof ledger.attemptLog === 'object') {
            for (const qid of Object.keys(ledger.attemptLog)) {
              if (removedUpper.has(qid.toUpperCase())) delete ledger.attemptLog[qid];
            }
          }
          if (ledger.questionMeta && typeof ledger.questionMeta === 'object') {
            for (const qid of Object.keys(ledger.questionMeta)) {
              if (removedUpper.has(qid.toUpperCase())) delete ledger.questionMeta[qid];
            }
          }
          if (Array.isArray(ledger.testSessions)) {
            ledger.testSessions = ledger.testSessions
              .map((sess) => ({
                ...sess,
                entries: Array.isArray(sess.entries)
                  ? sess.entries.filter((e) => !removedUpper.has(String(e.questionId || '').toUpperCase()))
                  : []
              }))
              .filter((sess) => sess.entries.length > 0);
          }
          const remainingLedgerQs = Object.values(ledger.concepts || {}).reduce(
            (sum, qMap) => sum + Object.keys(qMap || {}).length,
            0
          );
          if (remainingLedgerQs === 0) {
            await fs.unlink(ledgerPath);
            ledgerRemoved = true;
          } else {
            ledger.lastUpdated = new Date().toISOString();
            await atomicWriteBatch(new Map([[ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`]]));
          }
        }
      } catch (err) {
        if (!err || err.code !== 'ENOENT') throw err;
      }
    } else {
      await fs.unlink(target);
    }

    res.json({ ok: true, folder, file, removedQuestionIds, removedConceptIds, ledgerRemoved });
  } catch (error) { apiError(res, error, error.code === 'ENOENT' ? 404 : 400); }
});

app.post('/api/chapters/:folder/rewrite-domain-prefix', async (req, res) => {
  try {
    const folder = req.params.folder;
    const oldDomain = String(req.body?.oldDomainCode || req.body?.oldDomain || '').trim();
    const newDomain = String(req.body?.newDomainCode || req.body?.newDomain || '').trim();
    const chapterCode = String(req.body?.chapterCode || '').trim();
    if (!oldDomain || !newDomain || !chapterCode) {
      throw new Error('oldDomainCode, newDomainCode, and chapterCode are required.');
    }
    if (oldDomain.toUpperCase() === newDomain.toUpperCase()) {
      return res.json({ ok: true, updatedFiles: [] });
    }

    const dir = folderPath(folder);
    const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
    const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const oldPrefix = `${oldDomain}-${chapterCode}`;
    const newPrefix = `${newDomain}-${chapterCode}`;
    const prefixRe = new RegExp(`\\b${escapeRegex(oldPrefix)}(?=[\\s>,\\-\\/"'\\)])`, 'gi');
    const domainTagRe = new RegExp(`(<Domain\\s*==\\s*)${escapeRegex(oldDomain)}(?=\\s*[,>])`, 'gi');

    const writes = new Map();
    const updatedFiles = [];

    for (const entry of entries) {
      if (!entry.isFile()) continue;
      if (!entry.name.toLowerCase().endsWith('.html') && entry.name !== 'tracker-ledger.json') continue;
      const fullPath = path.join(dir, entry.name);
      const original = await fs.readFile(fullPath, 'utf8');
      const next = original
        .replace(domainTagRe, `$1${newDomain}`)
        .replace(prefixRe, newPrefix);
      if (next !== original) {
        writes.set(fullPath, next);
        updatedFiles.push(entry.name);
      }
    }

    if (writes.size > 0) await atomicWriteBatch(writes);
    res.json({ ok: true, folder, updatedFiles });
  } catch (error) { apiError(res, error, error.code === 'ENOENT' ? 404 : 400); }
});
app.get('/api/chapters/:folder/questions', async (req, res) => {
  try {
    const folder = req.params.folder;
    const requestedPath = String(req.query.path || '').trim().toUpperCase();
    const dir = folderPath(folder);
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const htmlFiles = entries
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.html'))
      .map((entry) => entry.name)
      .sort((a, b) => (a === 'questions.html' ? -1 : b === 'questions.html' ? 1 : a.localeCompare(b)));
    const all = [];
    for (const file of htmlFiles) {
      const content = await fs.readFile(path.join(dir, file), 'utf8');
      const hierarchy = scanHierarchyBlocks(content);
      for (const q of parseQuestionBlocks(content)) {
        const enclosing = hierarchy.concepts
          .filter((con) => q.start >= con.start && q.start < con.end)
          .sort((a, b) => (a.end - a.start) - (b.end - b.start))[0];
        const targetConcept = q.target || (enclosing ? enclosing.conceptId : '') || q.inferredTarget || '';
        all.push({ ...q, targetConcept, file });
      }
    }
    const unique = uniqueQuestionsByText(all);
    const filtered = requestedPath
      ? unique.filter((q) => {
          const tc = String(q.targetConcept || '').toUpperCase();
          return tc === requestedPath || tc.startsWith(`${requestedPath}-`) || String(q.id || '').toUpperCase().startsWith(`${requestedPath}-`);
        })
      : unique;
    res.set('Cache-Control', 'no-store').json({
      folder,
      path: requestedPath,
      count: filtered.length,
      questions: filtered.map((q) => ({
        id: q.id,
        target: q.targetConcept,
        type: q.type,
        text: q.text,
        stepIds: q.stepIds,
        hasTu: q.hasTu,
        block: q.block,
        file: q.file
      }))
    });
  } catch (error) { apiError(res, error, error.code === 'ENOENT' ? 404 : 400); }
});
app.get('/api/question-index', async (_req, res) => { try { res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate').set('Pragma', 'no-cache').set('Expires', '0').json(await indexQuestionData()); } catch (error) { apiError(res, error, 500); } });
app.post('/api/question-index/dry-run', async (req, res) => {
  try {
    const source = String(req.body?.source || '');
    const questions = parseQuestionBlocks(source);
    if (!questions.length) throw new Error('No <Qn> question blocks were found.');
    const { microConcepts, concepts, chapters } = await indexQuestionData();
    const resolveDestination = (question, resolvedSteps) => {
      const explicitTarget = String(question.target || '').trim();
      const primaryMc = resolvedSteps.flatMap((s) => s.tokens).find((t) => t.kind === 'mc');
      const targetPath = explicitTarget || question.inferredTarget || primaryMc?.conceptId || '';
      const matchedConcept = targetPath
        ? concepts.find((c) => c.conceptId.toUpperCase() === targetPath.toUpperCase())
        : null;
      const targetChapterPrefix = targetPath ? targetPath.split('-').slice(0, 2).join('-').toUpperCase() : '';
      const matchedChapter = targetChapterPrefix
        ? chapters.find((ch) => ch.chapterId.toUpperCase() === targetChapterPrefix)
        : null;
      const folder = matchedConcept?.folder || matchedChapter?.folder || primaryMc?.folder || 'Trigonometry';
      const file = question.hasTu && !explicitTarget && !matchedConcept && !primaryMc ? 'tu-gaps.html' : 'questions.html';
      return {
        kind: question.hasTu ? 'tu-gap' : 'covered',
        folder,
        file,
        targetPath: targetPath || (matchedChapter ? matchedChapter.chapterId : ''),
        label: `${folder}/${file}${targetPath ? ` (${targetPath})` : ''}`
      };
    };
    const routes = questions.map((question) => {
      const issues = validateQuestion(question);
      const resolvedSteps = question.steps.map((step) => ({
        stepNumber: step.stepNumber,
        hasTu: step.hasTu,
        tokens: step.stepIds.map((tok) => resolveStepTokenMeta(tok, microConcepts))
      }));
      const unknownTokens = resolvedSteps
        .flatMap((s) => s.tokens)
        .filter((t) => t.kind === 'unknown')
        .map((t) => t.baseId);
      if (unknownTokens.length) {
        issues.push(`Unknown Step ID(s) not in MC Registry: ${[...new Set(unknownTokens)].join(', ')} (use Full Base ID like QA-TRG-BS-FR-MC1, TG, or Tu)`);
      }
      const target = resolveDestination(question, resolvedSteps);
      return {
        index: question.index,
        id: question.id,
        text: question.text,
        type: question.type || 'UNTYPED',
        stepIds: question.stepIds,
        hasTu: question.hasTu,
        isCovered: question.isCovered && !unknownTokens.length,
        gap: question.gap,
        resolvedSteps,
        target,
        issues
      };
    });
    const covered = routes.filter((r) => !r.hasTu && r.stepIds.length > 0).length;
    const tuCount = routes.filter((r) => r.hasTu).length;
    res.json({
      routes,
      valid: routes.every((r) => !r.issues.length),
      covered,
      tuCount,
      coveragePercent: routes.length ? (covered / routes.length) * 100 : null
    });
  } catch (error) { apiError(res, error); }
});
app.post('/api/question-index/commit', async (req, res) => {
  try {
    const questions = parseQuestionBlocks(String(req.body?.source || ''));
    if (!questions.length) throw new Error('No <Qn> question blocks were found.');
    const { microConcepts, concepts, chapters } = await indexQuestionData();
    const validationIssues = [];
    for (const q of questions) {
      const qIssues = validateQuestion(q);
      const unknownTokens = q.stepIds
        .map((tok) => resolveStepTokenMeta(tok, microConcepts))
        .filter((t) => t.kind === 'unknown')
        .map((t) => t.baseId);
      if (unknownTokens.length) {
        qIssues.push(`Unknown Step ID(s): ${[...new Set(unknownTokens)].join(', ')}`);
      }
      qIssues.forEach((msg) => validationIssues.push(`Q${q.index}: ${msg}`));
    }
    if (validationIssues.length) return res.status(422).json({ error: 'Fix validation issues before committing.', issues: validationIssues });
    const targetFolderOverride = String(req.body?.folder || '').trim();
    const changed = new Map();
    const contentCache = new Map();
    const added = [];
    const duplicates = [];

    for (const q of questions) {
      const resolvedTokens = q.stepIds.map((tok) => resolveStepTokenMeta(tok, microConcepts));
      const primaryMc = resolvedTokens.find((t) => t.kind === 'mc');
      const explicitTarget = String(q.target || '').trim();
      const targetPath = explicitTarget || q.inferredTarget || primaryMc?.conceptId || '';
      const matchedConcept = targetPath
        ? concepts.find((c) => c.conceptId.toUpperCase() === targetPath.toUpperCase())
        : null;
      const targetChapterPrefix = targetPath ? targetPath.split('-').slice(0, 2).join('-').toUpperCase() : '';
      const matchedChapter = targetChapterPrefix
        ? chapters.find((ch) => ch.chapterId.toUpperCase() === targetChapterPrefix)
        : null;
      const folder = targetFolderOverride || matchedConcept?.folder || matchedChapter?.folder || primaryMc?.folder || 'Trigonometry';
      const file = q.hasTu && !explicitTarget && !matchedConcept && !primaryMc ? 'tu-gaps.html' : 'questions.html';
      const result = await appendQuestionToBank(folder, file, targetPath, q.block, q.text, contentCache);
      if (result.duplicate) {
        duplicates.push({ text: q.text, folder, file, targetPath });
      } else {
        changed.set(result.path, result.content);
        added.push({ folder, file, targetPath, id: result.assignedId, status: q.hasTu ? 'Tu-gap' : 'covered' });
      }
    }
    await atomicWriteBatch(changed);
    res.json({ ok: true, added, duplicates, warnings: [], index: await indexQuestionData() });
  } catch (error) { apiError(res, error, error.code === 'ENOENT' ? 404 : 400); }
});
app.get('/api/tracker', async (_req, res) => {
  try {
    const chapters = await trackerChapterInventory();
    for (const chapter of chapters.filter((row) => row.status === 'ready')) {
      try {
        const record = await readOrSyncTracker(chapter.folder, chapter.rootMid, chapter.name);
        chapter.questionCount = Object.values(record.ledger.concepts).reduce((sum, questions) => sum + Object.keys(questions).length, 0);
        chapter.conceptCount = Object.keys(record.ledger.concepts).length;
        chapter.completionPercent = record.metrics.completionPercent;
        chapter.timingLocked = record.ledger.timingConfig.locked === true;
      } catch (error) { chapter.status = 'ledger-error'; chapter.issue = error.message; chapter.errorCode = error.code || 'TRACKER_ERROR'; }
    }
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate').json({ chapters });
  } catch (error) { trackerApiError(res, error); }
});
app.get('/api/tracker/:folder', async (req, res) => {
  try {
    const folder = req.params.folder;
    const chapter = (await trackerChapterInventory()).find((row) => row.folder === folder);
    if (!chapter) throw new TrackerError('CHAPTER_NOT_FOUND', `Folder ${folder} was not found.`, 404);
    if (chapter.status !== 'ready') throw new TrackerError(chapter.status.toUpperCase().replace(/-/g, '_'), chapter.issue, 409, [{ folder, rootMids: chapter.rootMids }]);
    const record = await readOrSyncTracker(folder, chapter.rootMid, chapter.name);
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate').json({ chapter, ...record });
  } catch (error) { trackerApiError(res, error); }
});
app.put('/api/tracker/:folder/timing', async (req, res) => {
  try {
    const folder = req.params.folder;
    const chapter = (await trackerChapterInventory()).find((row) => row.folder === folder);
    if (!chapter) throw new TrackerError('CHAPTER_NOT_FOUND', `Folder ${folder} was not found.`, 404);
    if (chapter.status !== 'ready') throw new TrackerError(chapter.status.toUpperCase().replace(/-/g, '_'), chapter.issue, 409);
    const saved = await withTrackerLock(folder, async () => {
      const record = await readOrSyncTracker(folder, chapter.rootMid, chapter.name, true);
      if (record.ledger.timingConfig.locked === true) throw new TrackerError('TIMING_ALREADY_LOCKED', 'Timing limits are already locked. Use the confirmed chapter reset to re-enter them.', 409);
      const timingConfig = { locked: true, fastLimit: req.body?.fastLimit, mediumLimit: req.body?.mediumLimit, slowLimit: req.body?.slowLimit };
      const validation = TrackerEngine.timingConfigErrors(timingConfig);
      if (validation.length) throw new TrackerError('INVALID_TIMING_CONFIG', 'Timing limits were not saved. Enter positive integers with strict Fast < Medium < Slow ordering.', 422, validation);
      record.ledger.timingConfig = timingConfig;
      const valid = TrackerEngine.calculateMetrics(record.ledger);
      if (!valid.ok) throw new TrackerError('LEDGER_VALIDATION_FAILED', 'Timing limits were not saved because the ledger is invalid.', 409, valid.errors);
      const pathname = path.join(folderPath(folder), 'tracker-ledger.json');
      await atomicWriteBatch(new Map([[pathname, `${JSON.stringify(record.ledger, null, 2)}\n`]]));
      return { ledger: record.ledger, metrics: valid.metrics, invariants: valid.invariants };
    });
    res.json({ ok: true, ...saved });
  } catch (error) { trackerApiError(res, error); }
});
app.post('/api/tracker/:folder/reset', async (req, res) => {
  try {
    const folder = req.params.folder;
    if (req.body?.confirm !== true) throw new TrackerError('CONFIRMATION_REQUIRED', 'Explicit confirmation is required before clearing a chapter tracker.', 400);
    const chapter = (await trackerChapterInventory()).find((row) => row.folder === folder);
    if (!chapter) throw new TrackerError('CHAPTER_NOT_FOUND', `Folder ${folder} was not found.`, 404);
    if (chapter.status !== 'ready') throw new TrackerError(chapter.status.toUpperCase().replace(/-/g, '_'), chapter.issue, 409);
    const reset = await withTrackerLock(folder, async () => {
      const record = await readOrSyncTracker(folder, chapter.rootMid, chapter.name, true);
      TrackerEngine.clearAttempts(record.ledger);
      const valid = TrackerEngine.calculateMetrics(record.ledger);
      if (!valid.ok) throw new TrackerError('LEDGER_VALIDATION_FAILED', 'The reset could not be saved because the ledger is invalid.', 409, valid.errors);
      const pathname = path.join(folderPath(folder), 'tracker-ledger.json');
      await atomicWriteBatch(new Map([[pathname, `${JSON.stringify(record.ledger, null, 2)}\n`]]));
      return { ledger: record.ledger, metrics: valid.metrics, invariants: valid.invariants };
    });
    res.json({ ok: true, ...reset });
  } catch (error) { trackerApiError(res, error); }
});
app.post('/api/tracker/:folder/attempt', async (req, res) => {
  try {
    const folder = req.params.folder;
    const chapter = (await trackerChapterInventory()).find((row) => row.folder === folder);
    if (!chapter) throw new TrackerError('CHAPTER_NOT_FOUND', `Folder ${folder} was not found.`, 404);
    if (chapter.status !== 'ready') throw new TrackerError(chapter.status.toUpperCase().replace(/-/g, '_'), chapter.issue, 409);
    const saved = await withTrackerLock(folder, async () => {
      const record = await readOrSyncTracker(folder, chapter.rootMid, chapter.name, true);
      if (record.ledger.timingConfig?.locked !== true) {
        if (req.body?.autoLockTiming) {
          record.ledger.timingConfig = { locked: true, fastLimit: 30, mediumLimit: 60, slowLimit: 120 };
        } else {
          throw new TrackerError('TIMING_NOT_LOCKED', 'Lock timing limits in Part 1 before recording permanent attempts.', 409);
        }
      }
      const { questionId, status, seconds, selectedOption, stepId } = req.body || {};
      const cleanSeconds = Math.max(1, Math.round(Number(seconds) || 1));
      const cleanStatus = ['C', 'W', 'S'].includes(status) ? status : 'S';
      const cleanSelected = cleanStatus === 'S' ? '-' : (/^[A-D]$/i.test(String(selectedOption || '')) ? String(selectedOption).toUpperCase() : 'A');
      let targetConcept = '';
      for (const [cMid, questions] of Object.entries(record.ledger.concepts || {})) {
        if (Object.prototype.hasOwnProperty.call(questions, questionId)) {
          targetConcept = cMid;
          break;
        }
      }
      if (!targetConcept) throw new TrackerError('QUESTION_NOT_FOUND', `Question ID ${questionId} not found in ledger.`, 404);
      const accMark = TrackerEngine.ACCURACY[cleanStatus];
      const timeMark = TrackerEngine.expectedTimeMark(cleanStatus, cleanSeconds, record.ledger.timingConfig);
      record.ledger.concepts[targetConcept][questionId].push([cleanStatus, cleanSeconds, accMark, timeMark, cleanSelected]);
      record.ledger.lastUpdated = new Date().toISOString();
      if (stepId && record.ledger.questionMeta?.[questionId]) {
        record.ledger.questionMeta[questionId].stepId = String(stepId).trim().toUpperCase();
      }
      const valid = TrackerEngine.calculateMetrics(record.ledger);
      if (!valid.ok) throw new TrackerError('LEDGER_VALIDATION_FAILED', 'Attempt could not be saved because the ledger is invalid.', 409, valid.errors);
      const pathname = path.join(folderPath(folder), 'tracker-ledger.json');
      await atomicWriteBatch(new Map([[pathname, `${JSON.stringify(record.ledger, null, 2)}\n`]]));
      return { ledger: record.ledger, metrics: valid.metrics, invariants: valid.invariants };
    });
    res.json({ ok: true, ...saved });
  } catch (error) { trackerApiError(res, error); }
});
app.put('/api/tracker/:folder/question-meta', async (req, res) => {
  try {
    const folder = req.params.folder;
    const chapter = (await trackerChapterInventory()).find((row) => row.folder === folder);
    if (!chapter) throw new TrackerError('CHAPTER_NOT_FOUND', `Folder ${folder} was not found.`, 404);
    if (chapter.status !== 'ready') throw new TrackerError(chapter.status.toUpperCase().replace(/-/g, '_'), chapter.issue, 409);
    const saved = await withTrackerLock(folder, async () => {
      const record = await readOrSyncTracker(folder, chapter.rootMid, chapter.name, true);
      const { questionId, stepId } = req.body || {};
      if (!questionId || !record.ledger.questionMeta?.[questionId]) {
        throw new TrackerError('QUESTION_NOT_FOUND', `Question ${questionId} not found in metadata.`, 404);
      }
      record.ledger.questionMeta[questionId].stepId = String(stepId || '').trim().toUpperCase();
      const pathname = path.join(folderPath(folder), 'tracker-ledger.json');
      await atomicWriteBatch(new Map([[pathname, `${JSON.stringify(record.ledger, null, 2)}\n`]]));
      return { ledger: record.ledger };
    });
    res.json({ ok: true, ...saved });
  } catch (error) { trackerApiError(res, error); }
});
app.get('/api/registry/files', async (_req, res) => {
  try {
    const chapters = await scanChapters();
    const skipFolders = new Set(['global unmapped', 'prototype']);
    const folders = [];
    for (const chapter of chapters) {
      if (skipFolders.has(chapter.folder.toLowerCase())) continue;
      const htmlFiles = chapter.files
        .filter((name) => name.toLowerCase().endsWith('.html'))
        .sort((a, b) => a.localeCompare(b));
      let rootMid = '';
      const files = [];
      for (const file of htmlFiles) {
        const content = await fs.readFile(path.join(folderPath(chapter.folder), file), 'utf8');
        if (!rootMid) rootMid = folderRoot(content);
        files.push({ file, content });
      }
      folders.push({
        folder: chapter.folder,
        name: chapter.name,
        rootMid,
        files
      });
    }
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate').json({ folders });
  } catch (error) { apiError(res, error, 500); }
});

const STUDIO_STATE_FILE = path.join(DATA_DIR, 'studio-state.json');

app.get('/api/state', async (_req, res) => {
  try {
    await ensureData();
    const raw = await fs.readFile(STUDIO_STATE_FILE, 'utf8');
    const state = JSON.parse(raw);
    res.set('Cache-Control', 'no-store').json({ ok: true, exists: true, state });
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return res.set('Cache-Control', 'no-store').json({ ok: true, exists: false, state: null });
    }
    apiError(res, error, 500);
  }
});

app.put('/api/state', async (req, res) => {
  try {
    await ensureData();
    const state = req.body?.state;
    if (!state || typeof state !== 'object') {
      throw new Error('Request body must contain a valid state object.');
    }
    const payload = {
      ...state,
      savedAt: typeof state.savedAt === 'string' && state.savedAt ? state.savedAt : new Date().toISOString()
    };
    await atomicWriteBatch(new Map([[STUDIO_STATE_FILE, `${JSON.stringify(payload, null, 2)}\n`]]));
    res.json({ ok: true, savedAt: payload.savedAt, file: 'data/studio-state.json' });
  } catch (error) { apiError(res, error, 400); }
});

function buildAttemptLogFromConcepts(concepts = {}, existingLog = {}) {
  const nextLog = {};
  for (const questions of Object.values(concepts || {})) {
    if (!questions || typeof questions !== 'object') continue;
    for (const [qid, tuples] of Object.entries(questions)) {
      if (!Array.isArray(tuples)) continue;
      const priorEntries = Array.isArray(existingLog?.[qid]) ? existingLog[qid] : [];
      nextLog[qid] = tuples.map((tuple, idx) => {
        const [status, seconds, accMark, timeMark, option] = tuple;
        const prior = priorEntries[idx];
        return {
          attempt: `A${idx + 1}`,
          status,
          seconds,
          accMark,
          timeMark,
          option,
          ...(prior?.recordedAt ? { recordedAt: prior.recordedAt } : {})
        };
      });
    }
  }
  return nextLog;
}

app.get('/api/marks', async (_req, res) => {
  try {
    await ensureData();
    const chapters = await scanChapters();
    const skipFolders = new Set(['global unmapped', 'prototype']);
    const ledgers = [];
    for (const chapter of chapters) {
      if (skipFolders.has(chapter.folder.toLowerCase())) continue;
      const pathname = path.join(folderPath(chapter.folder), 'tracker-ledger.json');
      try {
        const raw = await fs.readFile(pathname, 'utf8');
        const ledger = JSON.parse(raw);
        if (ledger && typeof ledger === 'object') {
          ledgers.push({
            folder: chapter.folder,
            file: `${chapter.folder}/tracker-ledger.json`,
            chapterCode: String(ledger.chapterCode || ledger.chapterMid || '').trim().toUpperCase(),
            ledger
          });
        }
      } catch (err) {
        if (!err || err.code !== 'ENOENT') continue;
      }
    }
    res.set('Cache-Control', 'no-store').json({ ok: true, ledgers });
  } catch (error) { apiError(res, error, 500); }
});

app.post('/api/marks/:folder/submit-test', async (req, res) => {
  try {
    await ensureData();
    const folder = req.params.folder;
    const dir = folderPath(folder);
    await fs.mkdir(dir, { recursive: true });
    const pathname = path.join(dir, 'tracker-ledger.json');

    const chapterCode = String(req.body?.chapterCode || '').trim().toUpperCase() || folder.slice(0, 3).toUpperCase();
    const chapterName = String(req.body?.chapterName || folder).trim();
    const evaluations = Array.isArray(req.body?.evaluations) ? req.body.evaluations : [];
    if (!evaluations.length) throw new Error('At least one evaluated question is required.');

    const saved = await withTrackerLock(folder, async () => {
      let ledger = null;
      try {
        const raw = await fs.readFile(pathname, 'utf8');
        ledger = JSON.parse(raw);
      } catch (err) {
        if (!err || err.code !== 'ENOENT') throw err;
      }

      const incomingTiming = req.body?.timing || {};
      const timingConfig = {
        locked: true,
        fastLimit: Number.isInteger(incomingTiming.fastLimit) && incomingTiming.fastLimit > 0 ? incomingTiming.fastLimit : (ledger?.timingConfig?.fastLimit || 45),
        mediumLimit: Number.isInteger(incomingTiming.mediumLimit) && incomingTiming.mediumLimit > 0 ? incomingTiming.mediumLimit : (ledger?.timingConfig?.mediumLimit || 75),
        slowLimit: Number.isInteger(incomingTiming.slowLimit) && incomingTiming.slowLimit > 0 ? incomingTiming.slowLimit : (ledger?.timingConfig?.slowLimit || 110)
      };

      if (!ledger || typeof ledger !== 'object') {
        ledger = TrackerEngine.createLedger(chapterCode, chapterName);
        ledger.chapterCode = chapterCode;
        ledger.timingConfig = timingConfig;
        if (req.body?.existingConcepts && typeof req.body.existingConcepts === 'object') {
          ledger.concepts = JSON.parse(JSON.stringify(req.body.existingConcepts));
        }
      } else {
        ledger.chapterMid = ledger.chapterMid || chapterCode;
        ledger.chapterCode = chapterCode;
        ledger.topic = chapterName;
        ledger.timingConfig = timingConfig;
        ledger.concepts = ledger.concepts && typeof ledger.concepts === 'object' ? ledger.concepts : {};
      }

      const nowIso = new Date().toISOString();
      const existingLog = ledger.attemptLog && typeof ledger.attemptLog === 'object' ? ledger.attemptLog : {};
      const appendedAttempts = [];

      for (const ev of evaluations) {
        const uniqueId = String(ev?.uniqueId || '').trim();
        if (!uniqueId) continue;
        const cleanStatus = ['C', 'W', 'S'].includes(ev?.status) ? ev.status : 'S';
        const cleanSeconds = Math.max(1, Math.round(Number(ev?.seconds) || 1));
        const cleanOption = cleanStatus === 'S'
          ? '-'
          : (/^[A-D]$/i.test(String(ev?.option || '')) ? String(ev.option).toUpperCase() : 'A');
        const accMark = TrackerEngine.ACCURACY[cleanStatus];
        const timeMark = TrackerEngine.expectedTimeMark(cleanStatus, cleanSeconds, timingConfig);

        let targetConceptKey = '';
        for (const [cKey, qMap] of Object.entries(ledger.concepts)) {
          if (qMap && Object.prototype.hasOwnProperty.call(qMap, uniqueId)) {
            targetConceptKey = cKey;
            break;
          }
        }
        if (!targetConceptKey) {
          targetConceptKey = String(ev?.conceptKey || Object.keys(ledger.concepts)[0] || 'C1').trim() || 'C1';
          if (!ledger.concepts[targetConceptKey]) ledger.concepts[targetConceptKey] = {};
          if (!Array.isArray(ledger.concepts[targetConceptKey][uniqueId])) {
            ledger.concepts[targetConceptKey][uniqueId] = [];
          }
        }

        const tuple = [cleanStatus, cleanSeconds, accMark, timeMark, cleanOption];
        ledger.concepts[targetConceptKey][uniqueId].push(tuple);
        const attemptIndex = ledger.concepts[targetConceptKey][uniqueId].length;
        const attemptLabel = `A${attemptIndex}`;

        if (!Array.isArray(existingLog[uniqueId])) {
          existingLog[uniqueId] = ledger.concepts[targetConceptKey][uniqueId].slice(0, -1).map((t, i) => ({
            attempt: `A${i + 1}`,
            status: t[0],
            seconds: t[1],
            accMark: t[2],
            timeMark: t[3],
            option: t[4]
          }));
        }
        const entry = {
          attempt: attemptLabel,
          status: cleanStatus,
          seconds: cleanSeconds,
          accMark,
          timeMark,
          option: cleanOption,
          recordedAt: nowIso
        };
        existingLog[uniqueId].push(entry);
        appendedAttempts.push({ questionId: uniqueId, conceptKey: targetConceptKey, ...entry });
      }

      ledger.attemptLog = buildAttemptLogFromConcepts(ledger.concepts, existingLog);
      ledger.testSessions = Array.isArray(ledger.testSessions) ? ledger.testSessions : [];
      const sessionMeta = req.body?.testSession || {};
      ledger.testSessions.push({
        id: String(sessionMeta.id || `test-${Date.now()}`),
        label: String(sessionMeta.label || `test id(${ledger.testSessions.length + 1})`),
        recordedAt: nowIso,
        entries: appendedAttempts
      });
      ledger.lastUpdated = nowIso;

      await atomicWriteBatch(new Map([[pathname, `${JSON.stringify(ledger, null, 2)}\n`]]));
      return { ledger, appendedAttempts };
    });

    res.json({
      ok: true,
      folder,
      file: `${folder}/tracker-ledger.json`,
      ...saved
    });
  } catch (error) { apiError(res, error, 400); }
});

app.put('/api/marks/:folder/sync', async (req, res) => {
  try {
    await ensureData();
    const folder = req.params.folder;
    const dir = folderPath(folder);
    await fs.mkdir(dir, { recursive: true });
    const pathname = path.join(dir, 'tracker-ledger.json');

    const incoming = req.body?.ledger;
    if (!incoming || typeof incoming !== 'object') throw new Error('ledger object is required.');

    const saved = await withTrackerLock(folder, async () => {
      let existing = null;
      try {
        existing = JSON.parse(await fs.readFile(pathname, 'utf8'));
      } catch (err) {
        if (!err || err.code !== 'ENOENT') throw err;
      }
      const chapterCode = String(incoming.chapterCode || existing?.chapterCode || folder.slice(0, 3)).toUpperCase();
      const timing = incoming.timing || {};
      const nextLedger = {
        schemaVersion: 1,
        chapterMid: chapterCode,
        chapterCode,
        topic: String(incoming.chapterName || existing?.topic || folder),
        lastUpdated: new Date().toISOString(),
        timingConfig: {
          locked: Boolean(timing.locked),
          fastLimit: Number(timing.fastLimit) || 45,
          mediumLimit: Number(timing.mediumLimit) || 75,
          slowLimit: Number(timing.slowLimit) || 110
        },
        concepts: incoming.concepts && typeof incoming.concepts === 'object' ? incoming.concepts : {},
        attemptLog: buildAttemptLogFromConcepts(incoming.concepts || {}, existing?.attemptLog || {}),
        testSessions: Array.isArray(existing?.testSessions) ? existing.testSessions : [],
        questionMeta: existing?.questionMeta || {},
        identity: existing?.identity || { nextIndexByConcept: {}, signatureToId: {}, retiredAttemptsByConcept: {} }
      };
      await atomicWriteBatch(new Map([[pathname, `${JSON.stringify(nextLedger, null, 2)}\n`]]));
      return nextLedger;
    });

    res.json({ ok: true, folder, file: `${folder}/tracker-ledger.json`, ledger: saved });
  } catch (error) { apiError(res, error, 400); }
});

app.post('/api/questions/update-step', async (req, res) => {
  try {
    await ensureData();
    const questionId = String(req.body?.questionId || '').trim();
    const preferredFolder = String(req.body?.folder || '').trim();
    const steps = Array.isArray(req.body?.steps) ? req.body.steps : null;
    if (!questionId) throw new Error('questionId is required.');
    if (!steps || steps.length === 0) throw new Error('At least one step is required.');

    const cleanSteps = steps.map((s, idx) => {
      const stepNum = idx + 1;
      const stepId = String(s?.stepId || 'Tu').trim() || 'Tu';
      const body = String(s?.text ?? '').trim();
      const indentedBody = body.includes('\n')
        ? `\n${body.split('\n').map((line) => `        ${line}`).join('\n')}\n      `
        : body;
      return `      <step ${stepNum} - ${stepId}>${indentedBody}</step ${stepNum}>`;
    });
    const nextExplanation = `<explanation>\n${cleanSteps.join('\n')}\n    </explanation>`;

    const chapters = await scanChapters();
    const orderedChapters = preferredFolder
      ? [
          ...chapters.filter((c) => c.folder.toLowerCase() === preferredFolder.toLowerCase()),
          ...chapters.filter((c) => c.folder.toLowerCase() !== preferredFolder.toLowerCase())
        ]
      : chapters;

    const targetIdUpper = questionId.toUpperCase();
    for (const chapter of orderedChapters) {
      const htmlFiles = chapter.files
        .filter((f) => f.toLowerCase().endsWith('.html'))
        .sort((a, b) => (a === 'questions.html' ? -1 : b === 'questions.html' ? 1 : a.localeCompare(b)));
      for (const file of htmlFiles) {
        const fullPath = path.join(folderPath(chapter.folder), file);
        const content = await fs.readFile(fullPath, 'utf8');
        const blocks = parseQuestionBlocks(content);
        const matched = blocks.find((q) => String(q.id || '').trim().toUpperCase() === targetIdUpper);
        if (!matched) continue;

        const originalBlock = content.slice(matched.start, matched.end);
        let updatedBlock;
        if (/<explanation\b[^>]*>[\s\S]*?<\/explanation\s*>/i.test(originalBlock)) {
          updatedBlock = originalBlock.replace(/<explanation\b[^>]*>[\s\S]*?<\/explanation\s*>/i, nextExplanation);
        } else if (/<explanation\s*=\s*[\s\S]*?>/i.test(originalBlock)) {
          updatedBlock = originalBlock.replace(/<explanation\s*=\s*[\s\S]*?>/i, nextExplanation);
        } else {
          updatedBlock = originalBlock.replace(/<\/Qn\s*>/i, `    ${nextExplanation}\n  </Qn>`);
        }

        const nextContent = content.slice(0, matched.start) + updatedBlock + content.slice(matched.end);
        await atomicWriteBatch(new Map([[fullPath, nextContent]]));
        return res.json({
          ok: true,
          folder: chapter.folder,
          file,
          questionId,
          savedAt: new Date().toISOString()
        });
      }
    }
    return res.status(404).json({
      ok: false,
      error: `Question "${questionId}" was not found in any disk HTML file (kept in LocalStorage).`
    });
  } catch (error) { apiError(res, error, 400); }
});

app.get('/api/health', (_req, res) => res.json({ ok: true, app: 'angles' }));
app.use(express.static(PUBLIC_DIR, {
  setHeaders(res, filePath) {
    const rel = path.relative(PUBLIC_DIR, filePath);
    if (!rel.startsWith('vendor') && /\.(html|js|css)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));
app.get(/^(?!\/api(?:\/|$)|\/manus-routes\.json$).*/, (_req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    .set('Pragma', 'no-cache')
    .set('Expires', '0')
    .sendFile(path.join(PUBLIC_DIR, 'index.html'));
});
ensureData().then(() => app.listen(PORT, '0.0.0.0', () => console.log(`Angles listening on ${PORT}`))).catch((error) => { console.error(error); process.exit(1); });
