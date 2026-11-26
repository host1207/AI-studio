import type {
  DomainItem,
  ChapterItem,
  SubtopicItem,
  ConceptItem,
  MicroConceptItem,
} from '../components/ExamRegistryDashboard';
import { NOTE_DRAFTS_STORAGE_KEY } from './trackerLocalStorage';

export interface DiskChapterFile {
  file: string;
  content: string;
}

export interface DiskChapterFolder {
  folder: string;
  name: string;
  rootMid: string;
  files: DiskChapterFile[];
}

export interface InvalidRegistryTag {
  id: string;
  tier: 'Subtopic' | 'Concept' | 'MicroConcept';
  rawId: string;
  name: string;
  source: string;
  reason: string;
}

export interface OrphanedStepOverride {
  baseId: string;
  shortCode: string;
}

export interface AbsorbedRegistryResult {
  subtopics: SubtopicItem[];
  concepts: ConceptItem[];
  microConcepts: MicroConceptItem[];
  invalidIds: InvalidRegistryTag[];
  orphanedOverrides: OrphanedStepOverride[];
  liveMkmlByChapter: Record<string, string>;
  unregisteredDiskFolders: DiskChapterFolder[];
  scannedFileCount: number;
  linkedFolderByChapterCode: Record<string, string>;
}

/**
 * Parses tag headers in either canonical inline-name form or legacy bare-ID form:
 * - `<Subtopic == QA-TnD-RL, name = Relative Speed>` -> `{ id: 'QA-TnD-RL', name: 'Relative Speed' }`
 * - `<Subtopic == QA-TRG-BS>` -> `{ id: 'QA-TRG-BS', name: '' }`
 */
export function parseHierarchyTagHeader(raw: string): { id: string; name: string } {
  const trimmed = String(raw || '').trim();
  const match = trimmed.match(/^([^,]+?)\s*,\s*name\s*=\s*([\s\S]+)$/i);
  if (match) {
    const id = match[1].trim();
    const name = match[2].trim().replace(/^["']|["']$/g, '');
    return { id, name };
  }
  return { id: trimmed, name: '' };
}

function stripHtmlComments(source: string): string {
  return String(source || '').replace(/<!--[\s\S]*?-->/g, '');
}

function readLocalNoteDrafts(): Record<string, { content: string; updatedAt?: string }> {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return {};
    const raw = window.localStorage.getItem(NOTE_DRAFTS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function normalizeKey(value: string): string {
  return String(value || '').trim().toUpperCase();
}

function isValidSegmentToken(segment: string): boolean {
  return /^[A-Za-z0-9_]+$/.test(segment.trim());
}

/**
 * Matches a registered ChapterItem to an actual disk folder in `Angles-ultimate/data/*`.
 * Priority: explicit `chapter.folderName` -> exact `rootMid === chapter.code` -> case-insensitive folder name match.
 */
function findLinkedDiskFolder(
  chapter: ChapterItem,
  diskFolders: DiskChapterFolder[]
): DiskChapterFolder | undefined {
  if (chapter.folderName) {
    const byExplicit = diskFolders.find(
      (f) => f.folder.toLowerCase() === chapter.folderName!.toLowerCase()
    );
    if (byExplicit) return byExplicit;
  }
  const chCodeUp = normalizeKey(chapter.code);
  const byRootMid = diskFolders.find((f) => f.rootMid && normalizeKey(f.rootMid) === chCodeUp);
  if (byRootMid) return byRootMid;

  const chNameLow = chapter.name.trim().toLowerCase();
  return diskFolders.find(
    (f) => f.folder.toLowerCase() === chNameLow || f.name.toLowerCase() === chNameLow
  );
}

/**
 * Extracts readable fallback description for an `<MC == ...>...</MC>` block when `, name = ...` wasn't supplied.
 */
function inferMicroConceptLabel(rawBody: string, fallbackShortCode: string): string {
  const cleaned = stripHtmlComments(rawBody);
  const headMatch =
    cleaned.match(/<div\s+class=["'][^"']*head[^"']*["'][^>]*>([\s\S]*?)<\/div>/i) ||
    cleaned.match(/<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/i);
  if (headMatch) {
    const plain = headMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (plain) return plain;
  }
  const plain = cleaned
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (plain && plain.length <= 120) return plain;
  if (plain) return `${plain.slice(0, 117)}...`;
  return fallbackShortCode;
}

const FALLBACK_SUBTOPIC_NAMES: Record<string, string> = {};

const FALLBACK_CONCEPT_NAMES: Record<string, string> = {};

function isTestingDomainEntry(domain?: DomainItem): boolean {
  if (!domain) return false;
  return (
    Boolean(domain.isTesting) ||
    normalizeKey(domain.code) === 'TST' ||
    domain.name.trim().toLowerCase() === 'testing'
  );
}

/**
 * Live Disk-Absorbing, Strictly Cascading 5-Tier Registry Engine.
 *
 * Tier 1 (Domains) & Tier 2 (Chapters) are permanent and created in the Registry.
 * Tier 3 (Subtopics), Tier 4 (Concepts), and Tier 5 (Micro Concepts) are NEVER saved
 * permanently — they are dynamically absorbed on the fly from registered chapter `.html`
 * files (with unsaved local note drafts overlaid) and strictly validated via cascading
 * prefixes:
 *   Domain:       QA
 *   Chapter:      QA-TRG
 *   Subtopic:     QA-TRG-BS
 *   Concept:      QA-TRG-BS-FR
 *   MicroConcept: QA-TRG-BS-FR-MC1  <--->  Auto-assigned unique 1-to-1 Step ID (T1, T2, ...)
 *
 * Special rules:
 * - `TG` is the sole Global General Knowledge step ID and has NO Base ID.
 * - Domains marked as Testing (`TST` / `isTesting`) are sandbox-only and excluded from
 *   Subtopic/Concept/MC absorption, Tracker, Exam Info, and Analytics.
 */
export function absorbLiveRegistryFromFiles(
  domains: DomainItem[],
  chapters: ChapterItem[],
  diskFolders: DiskChapterFolder[],
  fallbackMkmlByChapter: Record<string, string>,
  stepIdOverrides: Record<string, string> = {}
): AbsorbedRegistryResult {
  const localDrafts = readLocalNoteDrafts();

  // Build validated domain & chapter lookup tables
  const validDomainByKey = new Map<string, DomainItem>();
  for (const d of domains) {
    if (d.code.trim()) validDomainByKey.set(normalizeKey(d.code), d);
  }

  const validChapterByFullId = new Map<string, { chapter: ChapterItem; fullId: string }>();
  const validChapterByCode = new Map<string, { chapter: ChapterItem; fullId: string }>();
  const linkedFolderByChapterCode: Record<string, string> = {};
  const matchedFolderNames = new Set<string>();

  for (const ch of chapters) {
    const dom = validDomainByKey.get(normalizeKey(ch.domainCode));
    if (!dom) continue;
    const folder = findLinkedDiskFolder(ch, diskFolders);
    if (folder) {
      linkedFolderByChapterCode[ch.code] = folder.folder;
      matchedFolderNames.add(folder.folder.toLowerCase());
    }
    // Testing sandbox domain holds test/legacy folders so they don't appear unregistered,
    // but its chapters are excluded from active cascading absorption & app analytics.
    if (isTestingDomainEntry(dom)) continue;

    const fullId = `${dom.code}-${ch.code}`;
    const entry = { chapter: ch, fullId };
    validChapterByFullId.set(normalizeKey(fullId), entry);
    validChapterByCode.set(normalizeKey(ch.code), entry);
  }

  /**
   * Resolves a `<Domain>-<Chapter>` tag pair as valid whenever BOTH the domain code
   * and chapter code are registered active entries, even if the chapter currently
   * resides under a different registered domain in the Registry.
   */
  const resolveRegisteredDomainChapter = (
    domPart: string,
    chPart: string
  ): { domEntry: DomainItem; chEntry: { chapter: ChapterItem; fullId: string } } | null => {
    const domEntry = validDomainByKey.get(normalizeKey(domPart));
    if (!domEntry || isTestingDomainEntry(domEntry)) return null;
    const exactMatch = validChapterByFullId.get(normalizeKey(`${domPart}-${chPart}`));
    if (exactMatch) return { domEntry, chEntry: exactMatch };
    const byCodeMatch = validChapterByCode.get(normalizeKey(chPart));
    if (byCodeMatch) {
      return {
        domEntry,
        chEntry: {
          chapter: byCodeMatch.chapter,
          fullId: `${domEntry.code}-${byCodeMatch.chapter.code}`,
        },
      };
    }
    return null;
  };

  const unregisteredDiskFolders = diskFolders.filter(
    (f) => !matchedFolderNames.has(f.folder.toLowerCase())
  );

  // Assemble the live source documents to scan:
  // 1. Every active (non-Testing) registered chapter's linked disk folder `.html` files (with local drafts overlaid)
  // 2. Unregistered disk folders only if they contain explicit <Subtopic>/<Concept>/<MC> tags (to flag invalid IDs)
  interface ScanDocument {
    sourceLabel: string;
    chapterCodeHint?: string;
    content: string;
  }

  const docsToScan: ScanDocument[] = [];
  const liveMkmlByChapter: Record<string, string> = {};
  let scannedFileCount = 0;

  for (const ch of chapters) {
    const dom = validDomainByKey.get(normalizeKey(ch.domainCode));
    if (!dom || isTestingDomainEntry(dom)) continue;

    const folder = findLinkedDiskFolder(ch, diskFolders);
    if (folder && folder.files.length > 0) {
      const mergedParts: string[] = [];
      for (const f of folder.files) {
        const draftKey = `${folder.folder}/${f.file}`;
        const draft = localDrafts[draftKey];
        const liveContent = draft && typeof draft.content === 'string' ? draft.content : f.content;
        mergedParts.push(liveContent);
        docsToScan.push({
          sourceLabel: `${folder.folder}/${f.file}`,
          chapterCodeHint: ch.code,
          content: liveContent,
        });
        scannedFileCount++;
      }
      liveMkmlByChapter[ch.code] = mergedParts.join('\n\n');
    } else if (fallbackMkmlByChapter[ch.code]) {
      liveMkmlByChapter[ch.code] = fallbackMkmlByChapter[ch.code];
      docsToScan.push({
        sourceLabel: `${ch.code} (Reference)`,
        chapterCodeHint: ch.code,
        content: fallbackMkmlByChapter[ch.code],
      });
      scannedFileCount++;
    }
  }

  // Also scan unregistered disk folders for any stray <Subtopic>/<Concept>/<MC> tags so invalid IDs are caught
  for (const folder of unregisteredDiskFolders) {
    for (const f of folder.files) {
      const draftKey = `${folder.folder}/${f.file}`;
      const draft = localDrafts[draftKey];
      const liveContent = draft && typeof draft.content === 'string' ? draft.content : f.content;
      if (/<(?:Subtopic|Concept|MC)\s*==/i.test(liveContent)) {
        docsToScan.push({
          sourceLabel: `${folder.folder}/${f.file}`,
          content: liveContent,
        });
        scannedFileCount++;
      }
    }
  }

  const subtopicMap = new Map<string, SubtopicItem>();
  const conceptMap = new Map<string, ConceptItem>();
  interface RawMcCandidate {
    baseId: string;
    baseKey: string;
    mcShortSegment: string;
    name: string;
    conceptFullId: string;
    conceptCode: string;
    subtopicCode: string;
    chapterCode: string;
    domainCode: string;
    sourceFile: string;
  }
  const mcCandidateMap = new Map<string, RawMcCandidate>();
  const invalidIds: InvalidRegistryTag[] = [];
  const invalidSeen = new Set<string>();

  const pushInvalid = (
    tier: InvalidRegistryTag['tier'],
    rawId: string,
    name: string,
    source: string,
    reason: string
  ) => {
    const key = `${tier}|${normalizeKey(rawId)}|${source}`;
    if (invalidSeen.has(key)) return;
    invalidSeen.add(key);
    invalidIds.push({
      id: `inv-${invalidIds.length + 1}`,
      tier,
      rawId,
      name,
      source,
      reason,
    });
  };

  // PASS 1: Absorb and strictly validate all <Subtopic == ...> tags against registered Domains & Chapters
  for (const doc of docsToScan) {
    const source = stripHtmlComments(doc.content);
    const stRegex = /<Subtopic\s*==\s*([^>]+)>/gi;
    let m: RegExpExecArray | null;
    while ((m = stRegex.exec(source)) !== null) {
      const { id: rawId, name } = parseHierarchyTagHeader(m[1]);
      if (!rawId) continue;
      const parts = rawId.split('-').map((p) => p.trim()).filter(Boolean);
      if (parts.length !== 3 || !parts.every(isValidSegmentToken)) {
        pushInvalid(
          'Subtopic',
          rawId,
          name,
          doc.sourceLabel,
          `Expected 3-tier cascading ID "<Domain>-<Chapter>-<Subtopic>" (e.g. QA-TnD-RL), got "${rawId}".`
        );
        continue;
      }
      const [domPart, chPart, stPart] = parts;
      const domEntry = validDomainByKey.get(normalizeKey(domPart));
      if (!domEntry || isTestingDomainEntry(domEntry)) {
        pushInvalid(
          'Subtopic',
          rawId,
          name,
          doc.sourceLabel,
          `Domain "${domPart}" does not exist in Domain Registry.`
        );
        continue;
      }
      const resolved = resolveRegisteredDomainChapter(domPart, chPart);
      if (!resolved) {
        pushInvalid(
          'Subtopic',
          rawId,
          name,
          doc.sourceLabel,
          `Chapter "${chPart}" is not registered in Chapter Registry.`
        );
        continue;
      }
      const chEntry = resolved.chEntry;

      const canonicalFullId = `${domEntry.code}-${chEntry.chapter.code}-${stPart}`;
      const mapKey = normalizeKey(canonicalFullId);
      const displayName =
        name || FALLBACK_SUBTOPIC_NAMES[normalizeKey(stPart)] || stPart;

      const existing = subtopicMap.get(mapKey);
      if (!existing) {
        subtopicMap.set(mapKey, {
          id: `st-${canonicalFullId}`,
          code: displayName,
          fullId: canonicalFullId,
          shortCode: stPart,
          chapterCode: chEntry.chapter.code,
          chapterFullId: chEntry.fullId,
          domainCode: domEntry.code,
          sourceFile: doc.sourceLabel,
        });
      } else if (name && existing.code === existing.shortCode) {
        existing.code = name;
      }
    }
  }

  // PASS 2: Absorb and strictly validate all <Concept == ...> tags against valid absorbed Subtopics
  for (const doc of docsToScan) {
    const source = stripHtmlComments(doc.content);
    const conRegex = /<Concept\s*==\s*([^>]+)>/gi;
    let m: RegExpExecArray | null;
    while ((m = conRegex.exec(source)) !== null) {
      const { id: rawId, name } = parseHierarchyTagHeader(m[1]);
      if (!rawId) continue;
      const parts = rawId.split('-').map((p) => p.trim()).filter(Boolean);
      if (parts.length !== 4 || !parts.every(isValidSegmentToken)) {
        pushInvalid(
          'Concept',
          rawId,
          name,
          doc.sourceLabel,
          `Expected 4-tier cascading ID "<Domain>-<Chapter>-<Subtopic>-<Concept>" (e.g. QA-TnD-RL-SPD), got "${rawId}".`
        );
        continue;
      }
      const [domPart, chPart, stPart, conPart] = parts;
      if (!resolveRegisteredDomainChapter(domPart, chPart)) {
        pushInvalid(
          'Concept',
          rawId,
          name,
          doc.sourceLabel,
          `Parent chapter "${domPart}-${chPart}" is not registered in Domain/Chapter Registry.`
        );
        continue;
      }
      const subtopicKey = normalizeKey(`${domPart}-${chPart}-${stPart}`);
      const parentSt = subtopicMap.get(subtopicKey);
      if (!parentSt) {
        pushInvalid(
          'Concept',
          rawId,
          name,
          doc.sourceLabel,
          `Parent subtopic "${domPart}-${chPart}-${stPart}" was not declared via <Subtopic == ...>.`
        );
        continue;
      }

      const canonicalFullId = `${parentSt.fullId}-${conPart}`;
      const mapKey = normalizeKey(canonicalFullId);
      const displayName = name || FALLBACK_CONCEPT_NAMES[normalizeKey(conPart)] || conPart;

      const existing = conceptMap.get(mapKey);
      if (!existing) {
        conceptMap.set(mapKey, {
          id: `con-${canonicalFullId}`,
          code: displayName,
          fullId: canonicalFullId,
          shortCode: conPart,
          subtopicCode: parentSt.code,
          subtopicFullId: parentSt.fullId,
          chapterCode: parentSt.chapterCode,
          domainCode: parentSt.domainCode,
          sourceFile: doc.sourceLabel,
        });
      } else if (name && existing.code === existing.shortCode) {
        existing.code = name;
      }
    }
  }

  // PASS 3: Absorb and strictly validate all <MC == ...> tags against valid absorbed Concepts
  for (const doc of docsToScan) {
    const source = stripHtmlComments(doc.content);
    const mcRegex = /<MC\s*==\s*([^>]+)>([\s\S]*?)(?:<\/MC\s*>|$)/gi;
    let m: RegExpExecArray | null;
    while ((m = mcRegex.exec(source)) !== null) {
      const { id: rawId, name } = parseHierarchyTagHeader(m[1]);
      const innerBody = m[2] || '';
      if (!rawId) continue;
      const parts = rawId.split('-').map((p) => p.trim()).filter(Boolean);
      if (parts.length !== 5 || !parts.every(isValidSegmentToken)) {
        pushInvalid(
          'MicroConcept',
          rawId,
          name,
          doc.sourceLabel,
          `Expected 5-tier Base ID "<Domain>-<Chapter>-<Subtopic>-<Concept>-<MC#>" (e.g. QA-TnD-RL-SPD-MC1), got "${rawId}".`
        );
        continue;
      }
      const [domPart, chPart, stPart, conPart, mcPart] = parts;
      if (normalizeKey(mcPart) === 'TG') {
        pushInvalid(
          'MicroConcept',
          rawId,
          name,
          doc.sourceLabel,
          `TG is reserved globally for General Knowledge and must NOT have a cascading Base ID.`
        );
        continue;
      }
      if (!resolveRegisteredDomainChapter(domPart, chPart)) {
        pushInvalid(
          'MicroConcept',
          rawId,
          name,
          doc.sourceLabel,
          `Parent chapter "${domPart}-${chPart}" is not registered in Domain/Chapter Registry.`
        );
        continue;
      }
      const conceptKey = normalizeKey(`${domPart}-${chPart}-${stPart}-${conPart}`);
      const parentCon = conceptMap.get(conceptKey);
      if (!parentCon) {
        pushInvalid(
          'MicroConcept',
          rawId,
          name,
          doc.sourceLabel,
          `Parent concept "${domPart}-${chPart}-${stPart}-${conPart}" was not declared via <Concept == ...>.`
        );
        continue;
      }

      const canonicalBaseId = `${parentCon.fullId}-${mcPart}`;
      const baseKey = normalizeKey(canonicalBaseId);
      const description = name || inferMicroConceptLabel(innerBody, mcPart);

      if (!mcCandidateMap.has(baseKey)) {
        mcCandidateMap.set(baseKey, {
          baseId: canonicalBaseId,
          baseKey,
          mcShortSegment: mcPart,
          name: description,
          conceptFullId: parentCon.fullId || `${parentCon.domainCode}-${parentCon.chapterCode}-${parentCon.subtopicCode}-${parentCon.code}`,
          conceptCode: parentCon.shortCode || parentCon.code,
          subtopicCode: parentCon.subtopicCode,
          chapterCode: parentCon.chapterCode,
          domainCode: parentCon.domainCode,
          sourceFile: doc.sourceLabel,
        });
      }
    }
  }

  // PASS 4: Permanent Full Cascading Base IDs (no unstable Tn auto-numbering)
  // Every valid Micro Concept is permanently identified by its 5-tier Base ID (e.g. QA-TRG-BS-FR-MC1).
  const orderedCandidates = Array.from(mcCandidateMap.values());
  const orphanedOverrides: OrphanedStepOverride[] = [];

  const microConcepts: MicroConceptItem[] = orderedCandidates
    .map((cand) => ({
      id: `mc-${cand.baseId}`,
      baseId: cand.baseId,
      code: cand.name,
      shortCode: cand.baseId,
      conceptCode: cand.conceptCode,
      conceptFullId: cand.conceptFullId,
      subtopicCode: cand.subtopicCode,
      chapterCode: cand.chapterCode,
      domainCode: cand.domainCode,
      sourceFile: cand.sourceFile,
      isGlobalGeneral: false,
    }))
    .sort((a, b) => (a.baseId || '').localeCompare(b.baseId || '', undefined, { numeric: true }));

  // Append the single global TG entry (no Base ID!)
  microConcepts.push({
    id: 'mc-global-tg',
    baseId: '',
    code: 'General Substitution, Addition & Basic Arithmetic Knowledge',
    shortCode: 'TG',
    conceptCode: 'Global Foundation',
    conceptFullId: '',
    subtopicCode: 'Cross-Chapter',
    chapterCode: 'ALL',
    domainCode: 'ALL',
    sourceFile: 'System Global Constant',
    isGlobalGeneral: true,
  });

  return {
    subtopics: Array.from(subtopicMap.values()),
    concepts: Array.from(conceptMap.values()),
    microConcepts,
    invalidIds,
    orphanedOverrides,
    liveMkmlByChapter,
    unregisteredDiskFolders,
    scannedFileCount,
    linkedFolderByChapterCode,
  };
}
