'use strict';

const {
  splitStepIdTokens,
  extractStepsFromQn,
  calculatePastedBatchCompletion
} = require('./public/question-batch');

function parseHierarchyHeader(raw) {
  const trimmed = String(raw || '').trim();
  const match = trimmed.match(/^([^,]+?)\s*,\s*name\s*=\s*([\s\S]+)$/i);
  if (match) {
    return {
      id: match[1].trim(),
      name: match[2].trim().replace(/^["']|["']$/g, '')
    };
  }
  return { id: trimmed, name: '' };
}

function readField(block, name, stop = /<(?:qn\s+type|Options|answer|ans|explanation|gap|text|type|id|target)\s*(?:={1,2}|>)/i) {
  const match = new RegExp(`<${name}\\s*={1,2}\\s*`, 'i').exec(block);
  if (!match) return '';
  const start = match.index + match[0].length;
  const tail = block.slice(start);
  const end = stop.exec(tail);
  return tail.slice(0, end ? end.index : tail.length).trim().replace(/>\s*$/, '').trim();
}

function parseTargetList(rawTarget) {
  return [...new Set(
    String(rawTarget || '')
      .split(/[,/]+/)
      .map((item) => item.trim())
      .filter(Boolean)
  )];
}

function inferConceptTargetFromStepIds(stepIds, explicitId = '') {
  for (const id of stepIds || []) {
    const parts = String(id || '').trim().split('-').filter(Boolean);
    if (parts.length >= 5) {
      return parts.slice(0, 4).join('-');
    }
  }
  const idParts = String(explicitId || '').trim().split('-').filter(Boolean);
  if (idParts.length >= 5) {
    return idParts.slice(0, 4).join('-');
  }
  return '';
}

function extractOptionsMap(body) {
  const optionsMatch = /<Options\s*>([\s\S]*?)<\/Options\s*>/i.exec(body);
  const scope = optionsMatch ? optionsMatch[1] : body;
  const result = {};
  const marker = /<([A-D])(?:\s*=\s*|\s+)/gi;
  const boundaries = [...scope.matchAll(marker)];
  boundaries.forEach((entry, index) => {
    const letter = entry[1].toUpperCase();
    const start = entry.index + entry[0].length;
    const nextBoundary = index + 1 < boundaries.length ? boundaries[index + 1].index : scope.length;
    const structural = /<(?:answer|ans|explanation)\s*(?:=|>)|<\/Options\s*>|<\/Qn\s*>|<\/qn\s+all\s*>/i.exec(scope.slice(start, nextBoundary));
    const end = structural ? start + structural.index : nextBoundary;
    result[letter] = scope.slice(start, end).trim().replace(/>\s*$/, '').trim();
  });
  return result;
}

function extractExplanationBody(body) {
  const paired = /<explanation\s*>([\s\S]*?)<\/explanation\s*>/i.exec(body);
  if (paired) return paired[1].trim();
  return readField(body, 'explanation', /<\/Qn\s*>|<\/qn\s+all\s*>/i);
}

function parseQuestionBlocks(source) {
  const blocks = [...String(source || '').matchAll(/<Qn\b[^>]*>([\s\S]*?)<\/Qn\s*>/gi)];
  return blocks.map((match, index) => {
    const body = match[1];
    const id = readField(body, 'id');
    const rawTarget = readField(body, 'target');
    const rawType = readField(body, 'type') || (/<qn\s+type\s*=\s*([^>]+)>/i.exec(body)?.[1] || '');
    const type = normalizeQuestionType(rawType);
    const gap = readField(body, 'gap');
    const text = readField(body, 'text', /<(?:Options|answer|ans|explanation|gap|target)\s*(?:={1,2}|>)/i);
    const options = /<Options\s*>([\s\S]*?)<\/Options\s*>/i.exec(body);
    const optionsMap = extractOptionsMap(body);
    const answer = /<(?:answer|ans)\s*=\s*([A-D])\s*>/i.exec(body)?.[1]?.toUpperCase() || '';
    const explanation = extractExplanationBody(body);
    const steps = extractStepsFromQn(body);
    const stepIds = [...new Set(steps.flatMap((step) => step.stepIds))];
    const targets = parseTargetList(rawTarget);
    const inferredTarget = targets[0] || inferConceptTargetFromStepIds(stepIds, id);
    const tuSteps = steps.filter((step) => step.hasTu);
    const hasTu = tuSteps.length > 0;

    return {
      index: index + 1,
      id,
      target: targets[0] || '',
      targets,
      inferredTarget,
      block: match[0],
      start: match.index,
      end: match.index + match[0].length,
      type,
      rawType,
      gap,
      text,
      optionsMap,
      explanation,
      steps,
      stepIds,
      tuSteps,
      hasTu,
      isCovered: steps.length > 0 && !hasTu,
      hasOptions: Boolean(options && /<[A-D](?:\s*=|\s+)/i.test(options[1])),
      answer
    };
  });
}

function normalizeQuestionType(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').toUpperCase();
}

function normalizeQuestionText(value) {
  return String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().toLocaleLowerCase();
}

function uniqueQuestionsByText(questions) {
  const seen = new Set();
  return questions.filter((question) => {
    const key = normalizeQuestionText(question.text);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Scans 5-tier hierarchy declarations (<Domain>, <Chapter>, <Subtopic>, <Concept>, <MC>)
 * from an HTML note file without requiring any MID tags.
 */
function scanHierarchyBlocks(content) {
  const raw = String(content || '');
  const domainMatch = /<Domain\s*==\s*([^>]+)>/i.exec(raw);
  const chapterMatch = /<Chapter\s*==\s*([^>]+)>/i.exec(raw);
  const domain = domainMatch ? parseHierarchyHeader(domainMatch[1]) : null;
  const chapter = chapterMatch ? parseHierarchyHeader(chapterMatch[1]) : null;

  const subtopics = [];
  for (const m of raw.matchAll(/<Subtopic\s*==\s*([^>]+)>/gi)) {
    subtopics.push(parseHierarchyHeader(m[1]));
  }
  const concepts = [];
  for (const m of raw.matchAll(/<Concept\s*==\s*([^>]+)>([\s\S]*?)<\/Concept\s*>/gi)) {
    const header = parseHierarchyHeader(m[1]);
    concepts.push({
      conceptId: header.id,
      title: header.name || header.id,
      start: m.index,
      end: m.index + m[0].length,
      body: m[2]
    });
  }
  const microConcepts = [];
  for (const m of raw.matchAll(/<MC\s*==\s*([^>]+)>/gi)) {
    const header = parseHierarchyHeader(m[1]);
    microConcepts.push({
      baseId: header.id,
      name: header.name || header.id
    });
  }
  return { domain, chapter, subtopics, concepts, microConcepts };
}

function validateQuestion(q) {
  const issues = [];
  if (!q.text) issues.push('Missing <text = ...>');
  if (!q.hasOptions) issues.push('Missing <Options> or options');
  if (!q.answer) issues.push('Missing <answer = ...>');
  if (!q.steps || !q.steps.length) {
    issues.push('Missing <step N - ID> tags inside <explanation>...</explanation>');
  }
  return issues;
}

function calculateStepCoverage(covered, uncovered) {
  const total = covered + uncovered;
  if (total === 0) {
    return { label: 'N/A (0 Questions)', percent: null, covered: 0, uncovered: 0, total: 0 };
  }
  const percent = (covered / total) * 100;
  return {
    label: `${Number(percent.toFixed(1))}%`,
    percent,
    covered,
    uncovered,
    total
  };
}

function tuGapsByFrequency(questions) {
  const counts = new Map();
  questions.forEach((question) => {
    if (!question.hasTu) return;
    const explicitGap = String(question.gap || '').trim();
    if (explicitGap) {
      counts.set(explicitGap, (counts.get(explicitGap) || 0) + 1);
      return;
    }
    const tuSteps = question.tuSteps || [];
    if (tuSteps.length) {
      tuSteps.forEach((step) => {
        const snippet = String(step.body || '')
          .replace(/<math\s*==\s*([^>]+)>/gi, '$1')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 100);
        const label = snippet || 'Unmapped Step (Tu)';
        counts.set(label, (counts.get(label) || 0) + 1);
      });
    } else {
      counts.set('Unmapped Step (Tu)', (counts.get('Unmapped Step (Tu)') || 0) + 1);
    }
  });
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

module.exports = {
  splitStepIdTokens,
  parseTargetList,
  inferConceptTargetFromStepIds,
  extractStepsFromQn,
  parseHierarchyHeader,
  readField,
  extractOptionsMap,
  parseQuestionBlocks,
  normalizeQuestionType,
  normalizeQuestionText,
  uniqueQuestionsByText,
  scanHierarchyBlocks,
  validateQuestion,
  calculateStepCoverage,
  calculatePastedBatchCompletion,
  tuGapsByFrequency
};
