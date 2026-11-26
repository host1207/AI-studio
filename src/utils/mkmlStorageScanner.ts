import type {
  AttemptTuple,
  AttemptStatus,
  ChapterLedger,
  ChapterTimingConfig,
} from '../components/TrackerPageOne';
import type {
  DomainItem,
  ChapterItem,
  SubtopicItem,
  ConceptItem,
  MicroConceptItem,
} from '../components/ExamRegistryDashboard';
import { parseHierarchyTagHeader } from './registryAbsorber';

// ============================================================================
// 1. DATA STRUCTURES FOR SCANNED MKML STORAGE & UNIQUE QUESTION IDs
// ============================================================================

export interface ScannedQuestionItem {
  /** Chained Unique ID: <DomainCode-ChapterCode-SubtopicCode-ConceptCode-x_n> e.g. QA-TD-BWR-V1-1 */
  uniqueId: string;
  questionIndex: number;
  domainCode: string;
  chapterCode: string;
  subtopicId: string; // e.g. QA-TD-BWR
  subtopicShortCode: string; // e.g. BWR
  conceptId: string; // e.g. QA-TD-BWR-V1
  conceptShortCode: string; // e.g. V1
  microConceptIds: string[]; // e.g. ['QA-TRG-ANG-ASTC-MC1']
  rawQnBody: string;
  attempts: AttemptTuple[];
}

export interface ScannedConceptNode {
  /** Full Concept tag ID e.g. QA-TD-BWR-V1 */
  conceptId: string;
  /** Short Concept code e.g. V1 or ASTC */
  conceptCode: string;
  /** Human-readable name from Concept Registry */
  conceptName: string;
  subtopicId: string;
  microConceptIds: string[];
  questions: ScannedQuestionItem[];
}

export interface ScannedSubtopicNode {
  /** Full Subtopic tag ID e.g. QA-TD-BWR */
  subtopicId: string;
  /** Short Subtopic code e.g. BWR or ANG */
  subtopicCode: string;
  /** Human-readable name from Subtopic Registry e.g. Basic Work Rates */
  subtopicName: string;
  concepts: ScannedConceptNode[];
  questions: ScannedQuestionItem[];
}

export interface ScannedChapterTree {
  domainCode: string;
  domainName: string;
  chapterId: string; // e.g. QA-TD
  chapterCode: string; // e.g. TD
  chapterName: string;
  subtopics: ScannedSubtopicNode[];
  allQuestions: ScannedQuestionItem[];
}

// ============================================================================
// 2. LIVE MKML STORAGE (NO PLACEHOLDER CHAPTERS — ABSORBED LIVE FROM DISK)
// ============================================================================

export const CHAPTER_MKML_STORAGE: Record<string, string> = {};

// ============================================================================
// 3. 4-STEP MKML SCANNER PIPELINE (PAGES 1 TO 6 OF NOTEBOOK)
// ============================================================================

export function scanChapterStorageAndMarks(
  chapterCode: string,
  ledger: ChapterLedger,
  domains: DomainItem[],
  chapters: ChapterItem[],
  subtopics: SubtopicItem[],
  concepts: ConceptItem[],
  _microConcepts: MicroConceptItem[],
  customMkml?: string
): ScannedChapterTree {
  // STEP 1: Look up Chapter in Registry to identify its Domain
  const chMeta = chapters.find((c) => c.code.toUpperCase() === chapterCode.toUpperCase());
  const domainCode = chMeta ? chMeta.domainCode : chapterCode === 'PN' ? 'Eng' : 'QA';
  const domMeta = domains.find((d) => d.code.toUpperCase() === domainCode.toUpperCase());
  const domainName = domMeta ? domMeta.name : domainCode;
  const chapterName = chMeta ? chMeta.name : ledger.chapterName || chapterCode;
  const chapterId = `${domainCode}-${chapterCode}`;

  const rawMkml = customMkml || CHAPTER_MKML_STORAGE[chapterCode] || '';

  // Flatten all attempts stored in ledger by question ID or positional index so marks.tex stays synced
  const attemptsByUniqueId: Record<string, AttemptTuple[]> = {};
  const orderedLedgerAttempts: AttemptTuple[][] = [];

  Object.entries(ledger.concepts).forEach(([_cKey, qMap]) => {
    Object.entries(qMap).forEach(([qKey, history]) => {
      attemptsByUniqueId[qKey] = history;
      orderedLedgerAttempts.push(history);
    });
  });

  const scannedSubtopics: ScannedSubtopicNode[] = [];
  const allQuestions: ScannedQuestionItem[] = [];

  const seenQuestionIds = new Set<string>();
  const conceptNodeByKey = new Map<
    string,
    { stNode: ScannedSubtopicNode; conNode: ScannedConceptNode }
  >();

  // STEP 2: Scan for all <Subtopic == ...> ... </Subtopic> blocks first
  const subtopicRegex = /<Subtopic\s*==\s*([^>]+)>([\s\S]*?)<\/Subtopic>/gi;
  let stMatch: RegExpExecArray | null;
  let globalQCursor = 0;

  while ((stMatch = subtopicRegex.exec(rawMkml)) !== null) {
    const parsedSt = parseHierarchyTagHeader(stMatch[1]);
    const rawSubtopicId = parsedSt.id; // e.g. QA-TD-BWR
    const stBody = stMatch[2];

    const stParts = rawSubtopicId.split('-');
    const subtopicShortCode = stParts[stParts.length - 1] || rawSubtopicId;

    // Fetch Subtopic Name from live Subtopic Registry or inline tag `name = ...`
    const regSubtopic = subtopics.find(
      (s) =>
        (s.fullId && s.fullId.toUpperCase() === rawSubtopicId.toUpperCase()) ||
        s.code.toUpperCase() === rawSubtopicId.toUpperCase() ||
        (s.shortCode && s.shortCode.toUpperCase() === subtopicShortCode.toUpperCase() && s.chapterCode.toUpperCase() === chapterCode.toUpperCase()) ||
        s.code.toUpperCase() === subtopicShortCode.toUpperCase()
    );

    const subtopicName =
      parsedSt.name ||
      (regSubtopic ? regSubtopic.code : '') ||
      subtopicShortCode;

    const scannedConcepts: ScannedConceptNode[] = [];
    const subtopicQuestions: ScannedQuestionItem[] = [];

    const stNode: ScannedSubtopicNode = {
      subtopicId: rawSubtopicId,
      subtopicCode: subtopicShortCode,
      subtopicName,
      concepts: scannedConcepts,
      questions: subtopicQuestions,
    };

    // STEP 3: Inside each <Subtopic>, scan for <Concept == ...> ... </Concept>
    const conceptRegex = /<Concept\s*==\s*([^>]+)>([\s\S]*?)<\/Concept>/gi;
    let conMatch: RegExpExecArray | null;

    while ((conMatch = conceptRegex.exec(stBody)) !== null) {
      const parsedCon = parseHierarchyTagHeader(conMatch[1]);
      const rawConceptId = parsedCon.id; // e.g. QA-TD-BWR-V1
      const conBody = conMatch[2];

      const conParts = rawConceptId.split('-');
      const conceptShortCode = conParts[conParts.length - 1] || rawConceptId;

      // Scan <MC == ...> step tags inside this Concept
      const mcIds: string[] = [];
      const mcRegex = /<MC\s*==\s*([^>]+)>/gi;
      let mcMatch: RegExpExecArray | null;
      while ((mcMatch = mcRegex.exec(conBody)) !== null) {
        mcIds.push(parseHierarchyTagHeader(mcMatch[1]).id);
      }

      // Fetch Concept Name from live Concept Registry or inline `name = ...`
      const regConcept = concepts.find(
        (c) =>
          (c.fullId && c.fullId.toUpperCase() === rawConceptId.toUpperCase()) ||
          c.code.toUpperCase() === rawConceptId.toUpperCase() ||
          (c.shortCode && c.shortCode.toUpperCase() === conceptShortCode.toUpperCase() && c.chapterCode.toUpperCase() === chapterCode.toUpperCase()) ||
          c.code.toUpperCase() === conceptShortCode.toUpperCase()
      );
      const conceptName = parsedCon.name || (regConcept ? regConcept.code : conceptShortCode);

      // STEP 4: Scan any inline <Qn> ... </Qn> inside <Concept == ...>
      const qnRegex = /<Qn>([\s\S]*?)<\/Qn>/gi;
      let qnMatch: RegExpExecArray | null;
      let qIdxInConcept = 0;
      const conceptQuestions: ScannedQuestionItem[] = [];

      while ((qnMatch = qnRegex.exec(conBody)) !== null) {
        qIdxInConcept++;
        const qnBody = qnMatch[1];

        // Construct or extract Chained Unique Question ID:
        // <DomainCode-ChapterCode-SubtopicCode-ConceptCode-x_n>
        const explicitIdMatch = qnBody.match(/<id\s*==\s*([^>]+)>/i);
        const chainedUniqueId = explicitIdMatch
          ? explicitIdMatch[1].trim()
          : `${domainCode}-${chapterCode}-${subtopicShortCode}-${conceptShortCode}-${qIdxInConcept}`;

        const idKey = chainedUniqueId.toUpperCase();
        if (seenQuestionIds.has(idKey)) continue;
        seenQuestionIds.add(idKey);

        const attempts =
          attemptsByUniqueId[chainedUniqueId] ||
          orderedLedgerAttempts[globalQCursor] ||
          [];
        globalQCursor++;

        const qItem: ScannedQuestionItem = {
          uniqueId: chainedUniqueId,
          questionIndex: qIdxInConcept,
          domainCode,
          chapterCode,
          subtopicId: rawSubtopicId,
          subtopicShortCode,
          conceptId: rawConceptId,
          conceptShortCode,
          microConceptIds: mcIds,
          rawQnBody: qnBody.trim(),
          attempts,
        };

        conceptQuestions.push(qItem);
        subtopicQuestions.push(qItem);
        allQuestions.push(qItem);
      }

      const conNode: ScannedConceptNode = {
        conceptId: rawConceptId,
        conceptCode: conceptShortCode,
        conceptName,
        subtopicId: rawSubtopicId,
        microConceptIds: mcIds,
        questions: conceptQuestions,
      };
      scannedConcepts.push(conNode);
      conceptNodeByKey.set(rawConceptId.toUpperCase(), { stNode, conNode });
    }

    scannedSubtopics.push(stNode);
  }

  // STEP 4B: Scan decoupled <Qn>...</Qn> blocks (e.g. from chapter questions.html)
  // and route them into their matching <Concept> node via <target == ...>, <id == ...> 4-tier prefix,
  // or inferred 4-tier concept prefix from 5-tier <step N - DOMAIN-CH-ST-CON-MC#> tags.
  if (conceptNodeByKey.size > 0 && rawMkml) {
    const standaloneQnRegex = /<Qn>([\s\S]*?)<\/Qn>/gi;
    let sqMatch: RegExpExecArray | null;
    while ((sqMatch = standaloneQnRegex.exec(rawMkml)) !== null) {
      const qnBody = sqMatch[1];
      const explicitIdMatch = qnBody.match(/<id\s*==\s*([^>]+)>/i);
      const explicitId = explicitIdMatch ? explicitIdMatch[1].trim() : '';

      // Resolve target concept ID(s)
      const targetMatch = qnBody.match(/<target\s*==?\s*([^>]+)>/i);
      const candidateTargets: string[] = [];
      if (targetMatch) {
        targetMatch[1]
          .split(/[,/]+/)
          .map((t) => t.trim())
          .filter(Boolean)
          .forEach((t) => candidateTargets.push(t));
      }
      if (candidateTargets.length === 0 && explicitId) {
        const idParts = explicitId.split('-').map((p) => p.trim()).filter(Boolean);
        if (idParts.length >= 4) {
          candidateTargets.push(idParts.slice(0, 4).join('-'));
        }
      }
      if (candidateTargets.length === 0) {
        const parsedSteps = parseExplanationStepTags(qnBody);
        for (const st of parsedSteps) {
          for (const tok of splitStepIds(st.stepId)) {
            const parts = tok.split('-').filter(Boolean);
            if (parts.length === 5) {
              candidateTargets.push(parts.slice(0, 4).join('-'));
              break;
            }
          }
          if (candidateTargets.length > 0) break;
        }
      }

      const matchedTarget = candidateTargets
        .map((t) => conceptNodeByKey.get(t.toUpperCase()))
        .find(Boolean);
      if (!matchedTarget) continue;

      const { stNode, conNode } = matchedTarget;
      const nextIdx = conNode.questions.length + 1;
      const chainedUniqueId = explicitId || `${conNode.conceptId}-${nextIdx}`;
      const idKey = chainedUniqueId.toUpperCase();
      if (seenQuestionIds.has(idKey)) continue;
      seenQuestionIds.add(idKey);

      const attempts =
        attemptsByUniqueId[chainedUniqueId] ||
        orderedLedgerAttempts[globalQCursor] ||
        [];
      globalQCursor++;

      const qItem: ScannedQuestionItem = {
        uniqueId: chainedUniqueId,
        questionIndex: nextIdx,
        domainCode,
        chapterCode,
        subtopicId: stNode.subtopicId,
        subtopicShortCode: stNode.subtopicCode,
        conceptId: conNode.conceptId,
        conceptShortCode: conNode.conceptCode,
        microConceptIds: conNode.microConceptIds,
        rawQnBody: qnBody.trim(),
        attempts,
      };

      conNode.questions.push(qItem);
      stNode.questions.push(qItem);
      allQuestions.push(qItem);
    }
  }

  // Only derive fallback nodes when ledger actually has recorded concept questions;
  // chapters with no <Subtopic == ...> tags and no marks remain cleanly empty.
  if (scannedSubtopics.length === 0 && Object.keys(ledger.concepts || {}).length > 0) {
    const chSubtopics = subtopics.filter(
      (s) => s.chapterCode.toUpperCase() === chapterCode.toUpperCase()
    );
    const defaultSubtopicCode = chSubtopics[0]?.code || 'ST1';
    const defaultSubtopicId = `${domainCode}-${chapterCode}-${defaultSubtopicCode.replace(/\s+/g, '')}`;

    const conceptNodes: ScannedConceptNode[] = [];
    const stQuestions: ScannedQuestionItem[] = [];

    Object.entries(ledger.concepts).forEach(([cMid, qMap]) => {
      const cId = `${defaultSubtopicId}-${cMid}`;
      const cQuestions: ScannedQuestionItem[] = [];
      let idx = 0;

      Object.entries(qMap).forEach(([_oldQid, history]) => {
        idx++;
        const uniqueId = `${domainCode}-${chapterCode}-${defaultSubtopicCode.replace(/\s+/g, '')}-${cMid}-${idx}`;
        const item: ScannedQuestionItem = {
          uniqueId,
          questionIndex: idx,
          domainCode,
          chapterCode,
          subtopicId: defaultSubtopicId,
          subtopicShortCode: defaultSubtopicCode,
          conceptId: cId,
          conceptShortCode: cMid,
          microConceptIds: [],
          rawQnBody: `<id == ${uniqueId}>`,
          attempts: history,
        };
        cQuestions.push(item);
        stQuestions.push(item);
        allQuestions.push(item);
      });

      conceptNodes.push({
        conceptId: cId,
        conceptCode: cMid,
        conceptName: cMid,
        subtopicId: defaultSubtopicId,
        microConceptIds: [],
        questions: cQuestions,
      });
    });

    if (conceptNodes.length > 0) {
      scannedSubtopics.push({
        subtopicId: defaultSubtopicId,
        subtopicCode: defaultSubtopicCode,
        subtopicName: defaultSubtopicCode,
        concepts: conceptNodes,
        questions: stQuestions,
      });
    }
  }

  return {
    domainCode,
    domainName,
    chapterId,
    chapterCode,
    chapterName,
    subtopics: scannedSubtopics,
    allQuestions,
  };
}

// ============================================================================
// 4. FORMATTER FOR SEPARATE marks.tex STORAGE FILE (PAGE 6 OF NOTEBOOK)
// ============================================================================

export function formatMarksTexFile(tree: ScannedChapterTree, timing: ChapterTimingConfig): string {
  const lines: string[] = [
    `# marks.tex — Separate Marks & Attempt Storage for <Chapter == ${tree.chapterId}>`,
    `# Pace Thresholds: Fast <= ${timing.fastLimit}s (+2) | Med <= ${timing.mediumLimit}s (+1) | Slow <= ${timing.slowLimit}s (+0.5)`,
    '',
  ];

  tree.allQuestions.forEach((q) => {
    lines.push('{');
    lines.push(`  unique ID : <${q.uniqueId}>`);
    if (q.attempts.length === 0) {
      lines.push('  # Status: Not Asked Yet (Pending)');
    } else {
      q.attempts.forEach((att, idx) => {
        const [status, seconds, accMark, timeMark] = att;
        const isCorrectStr =
          status === 'C'
            ? `Yes - +${accMark}`
            : status === 'W'
              ? `Wrong - ${accMark}`
              : `Skipped - ${accMark}`;
        const timeStr =
          status === 'C' ? `${seconds}s - +${timeMark}` : `Nil (${seconds}s) - 0`;
        lines.push('  {');
        lines.push(`    A${idx + 1} :`);
        lines.push(`      Is correct - ${isCorrectStr}`);
        lines.push(`      Time       - ${timeStr}`);
        lines.push('  }');
      });
    }
    lines.push('}');
    lines.push('');
  });

  return lines.join('\n');
}

// ============================================================================
// 5. SCOPE METRICS CALCULATOR (DRIVES BOTH TRACKER PAGE 1 & TRACKER PAGE 2)
// ============================================================================

export interface ScopeMetricsResult {
  scopeQuestionsCount: number;
  MMS: number; // Max Marks in Scope = Scope Qs * 3
  LTMS: number; // Lifetime Marks in Scope = ARMNT + NTMS
  availableMarks: number; // MMS - LTMS
  completionPct: number; // Completion % = (LTMS / MMS) * 100
  sharedEffectiveContributionPct: number; // (LTMS / Topic LTM) * 100
  topicWeightagePct: number; // (Scope Qs / Topic Qs) * 100
  NQC: number;
  NQW: number;
  NQS: number;
  NQNA: number;
  attemptedCount: number;
  accuracyPct: number;
  correctMarks: number;
  wrongPenalty: number;
  skipPenalty: number;
  ARMNT: number;
  nFast: number;
  nMed: number;
  nSlow: number;
  nZeroTime: number;
  fastMarks: number;
  medMarks: number;
  slowMarks: number;
  NTMS: number;
}

export function computeScopeMetrics(
  questions: ScannedQuestionItem[],
  timing: ChapterTimingConfig,
  topicTotalQs: number,
  topicTotalLTM: number
): ScopeMetricsResult {
  const scopeQuestionsCount = questions.length;
  let NQC = 0;
  let NQW = 0;
  let NQS = 0;
  let NQNA = 0;

  let nFast = 0;
  let nMed = 0;
  let nSlow = 0;
  let nOverTimeCorrect = 0;

  questions.forEach((q) => {
    if (!q.attempts || q.attempts.length === 0) {
      NQNA++;
      return;
    }
    const latest = q.attempts[q.attempts.length - 1];
    const [status, seconds] = latest;
    if (status === 'C') {
      NQC++;
      if (seconds <= timing.fastLimit) nFast++;
      else if (seconds <= timing.mediumLimit) nMed++;
      else if (seconds <= timing.slowLimit) nSlow++;
      else nOverTimeCorrect++;
    } else if (status === 'W') {
      NQW++;
    } else if (status === 'S') {
      NQS++;
    }
  });

  const attemptedCount = NQC + NQW + NQS;
  const MMS = scopeQuestionsCount * 3;

  const correctMarks = NQC * 1.0;
  const wrongPenalty = NQW * 0.5;
  const skipPenalty = NQS * 0.2;
  const ARMNT = Number((correctMarks - wrongPenalty - skipPenalty).toFixed(2));

  const fastMarks = nFast * 2.0;
  const medMarks = nMed * 1.0;
  const slowMarks = nSlow * 0.5;
  const NTMS = Number((fastMarks + medMarks + slowMarks).toFixed(2));

  const LTMS = Number((ARMNT + NTMS).toFixed(2));
  const availableMarks = Number((MMS - LTMS).toFixed(2));

  const completionPct = MMS > 0 ? (LTMS / MMS) * 100 : 0;
  const sharedEffectiveContributionPct =
    topicTotalLTM > 0 ? (LTMS / topicTotalLTM) * 100 : 0;
  const topicWeightagePct =
    topicTotalQs > 0 ? (scopeQuestionsCount / topicTotalQs) * 100 : 0;

  const accuracyDenominator = attemptedCount > 0 ? attemptedCount : scopeQuestionsCount;
  const accuracyPct = accuracyDenominator > 0 ? (NQC / accuracyDenominator) * 100 : 0;

  // Questions with 0 time marks: skipped + wrong + >slowLimit
  const nZeroTime = NQW + NQS + nOverTimeCorrect;

  return {
    scopeQuestionsCount,
    MMS,
    LTMS,
    availableMarks,
    completionPct,
    sharedEffectiveContributionPct,
    topicWeightagePct,
    NQC,
    NQW,
    NQS,
    NQNA,
    attemptedCount,
    accuracyPct,
    correctMarks,
    wrongPenalty,
    skipPenalty,
    ARMNT,
    nFast,
    nMed,
    nSlow,
    nZeroTime,
    fastMarks,
    medMarks,
    slowMarks,
    NTMS,
  };
}

// ============================================================================
// 6. MICRO CONCEPT / PERMANENT BASE-ID DIAGNOSTIC & ACCURACY ROLLUP ENGINE
// ============================================================================

export interface ExplanationStepItem {
  stepNumber: number;
  text: string;
  stepId: string; // Permanent 5-tier Base ID (e.g. QA-TRG-BS-FR-MC1), TG, or Tu
}

export const DEFAULT_STEPS_BY_UNIQUE_ID: Record<string, ExplanationStepItem[]> = {
  'QA-TRG-BS-FR-1': [
    { stepNumber: 1, text: 'tan A = 4/3 => oppo = 4, Adj = 3.', stepId: 'QA-TRG-BS-FR-MC1' },
    { stepNumber: 2, text: '3 is odd: 3² / 2 = 9/2 = 4.5 -> 4 (oppo) and 5 (hypo) match triplet (3, 4, 5).', stepId: 'QA-TRG-BS-FR-MC2' },
    { stepNumber: 3, text: 'sin A = oppo / hypo = 4 / 5.', stepId: 'QA-TRG-BS-FR-MC1' },
  ],
  'QA-TRG-BS-FR-2': [
    { stepNumber: 1, text: 'sin θ = 9/41 => 9 (oppo) is odd: 9² = 81 -> 81/2 = 40.5 -> 40 (adj), 41 (hypo).', stepId: 'QA-TRG-BS-FR-MC2' },
    { stepNumber: 2, text: 'cot θ = adj / oppo = 40 / 9.', stepId: 'QA-TRG-BS-FR-MC1' },
  ],
  'QA-TRG-BS-FR-3': [
    { stepNumber: 1, text: 'tan A = 2/5 => oppo = 2, Adj = 5.', stepId: 'QA-TRG-BS-FR-MC1' },
    { stepNumber: 2, text: 'hypo = √(2² + 5²) = √29.', stepId: 'TG' },
    { stepNumber: 3, text: 'sec²A = (hypo / Adj)² = 29 / 25.', stepId: 'QA-TRG-BS-FR-MC1' },
    { stepNumber: 4, text: 'cosec²A = (hypo / oppo)² = 29 / 4.', stepId: 'QA-TRG-BS-FR-MC1' },
    { stepNumber: 5, text: 'sec²A / cosec²A = (29 / 25) × (4 / 29) = 4 / 25.', stepId: 'TG' },
  ],
  'QA-TRG-BS-FR-4': [
    { stepNumber: 1, text: 'sin β = 1/3 => oppo = 1, hypo = 3.', stepId: 'QA-TRG-BS-FR-MC1' },
    { stepNumber: 2, text: 'Adj = √(3² - 1²) = √8.', stepId: 'QA-TRG-BS-FR-MC2' },
    { stepNumber: 3, text: '(sec β - tan β)³ = (3/√8 - 1/√8)³ = (2/√8)³ = 8 / (8√8) = 1 / √8.', stepId: 'TG' },
  ],
  'QA-TRG-BS-FR-5': [
    { stepNumber: 1, text: 'cos θ = √3 / 2 => adj = √3, hypo = 2 => oppo = 1.', stepId: 'QA-TRG-BS-FR-MC1' },
    { stepNumber: 2, text: 'tan²θ × cos²θ = (1/√3)² × (√3/2)² = (1/3) × (3/4) = 1/4.', stepId: 'QA-TRG-BS-FR-MC1' },
  ],
  'QA-TRG-BS-FR-6': [
    { stepNumber: 1, text: '5 sin θ - 4 cos θ = 0 => sin θ / cos θ = 4 / 5 (take sin θ = 4, cos θ = 5).', stepId: 'TG' },
    { stepNumber: 2, text: '[5(4) + 2(5)] / [5(4) + 3(5)] = 30 / 35 = 6 / 7.', stepId: 'TG' },
  ],
  'QA-TRG-BS-FR-7': [
    { stepNumber: 1, text: 'tan θ = 3/4 => oppo = 3, adj = 4, hypo = 5.', stepId: 'QA-TRG-BS-FR-MC1' },
    { stepNumber: 2, text: '(1 + sin θ) / (1 - sin θ) = (1 + 3/5) / (1 - 3/5) = (8/5) × (5/2) = 8/2 = 4.', stepId: 'QA-TRG-BS-FR-MC1' },
  ],
  'QA-TRG-BS-FR-8': [
    { stepNumber: 1, text: '5 cot θ = 3 => 5(cos θ / sin θ) = 3 => cos θ = 3, sin θ = 5.', stepId: 'QA-TRG-BS-FR-MC1' },
    { stepNumber: 2, text: '[6(5) - 3(3)] / [7(5) + 3(3)] = (30 - 9) / (35 + 9) = 21 / 44.', stepId: 'TG' },
  ],
  'QA-TRG-BS-FR-9': [
    { stepNumber: 1, text: 'sin A = 2/5 => oppo = 2, hypo = 5 => adj = √21.', stepId: 'QA-TRG-BS-FR-MC1' },
    { stepNumber: 2, text: 'cos A = √21 / 5 => sec A = 5 / √21, cosec A = 5 / 2.', stepId: 'QA-TRG-BS-FR-MC1' },
    { stepNumber: 3, text: '[5(2/5) + 2(5/2)] / [√21 × (5/√21)] = (2 + 5) / 5 = 7 / 5.', stepId: 'TG' },
  ],
  'QA-TRG-BS-FR-10': [
    { stepNumber: 1, text: 'sec A = 17/8 => cos A = 8/17, sin A = 15/17 (8-15-17 triplet).', stepId: 'QA-TRG-BS-FR-MC1' },
    { stepNumber: 2, text: 'tan A = 15/8, cot A = 8/15.', stepId: 'QA-TRG-BS-FR-MC1' },
    { stepNumber: 3, text: '[34(15/17) + 15(8/15)] / [68(8/17) - 16(15/8)] = (30 + 8) / (32 - 30) = 38 / 2 = 19.', stepId: 'TG' },
  ],
  'QA-TRG-BS-FR-11': [
    { stepNumber: 1, text: '(3 sin θ - cos θ) / (cos θ + sin θ) = 1 => 3 sin θ - cos θ = cos θ + sin θ => sin θ = 1, cos θ = 1 => tan θ = 1.', stepId: 'TG' },
    { stepNumber: 2, text: 'cot θ = 1 / tan θ = 1.', stepId: 'QA-TRG-BS-FR-MC1' },
  ],
  'QA-TRG-BS-FR-12': [
    { stepNumber: 1, text: '(sin θ - cos θ) / (sin θ + cos θ) = 4/5 => sin θ = 9, cos θ = 1 => tan θ = 9.', stepId: 'QA-TRG-BS-FR-MC1' },
    { stepNumber: 2, text: 'hypo = √(9² + 1²) = √82 => cosec²θ = 82 / 81.', stepId: 'QA-TRG-BS-FR-MC2' },
    { stepNumber: 3, text: '(82/81) / (2 - 82/81) = (82/81) × (81/80) = 41 / 40.', stepId: 'TG' },
  ],
  'QA-TRG-BS-FR-13': [
    { stepNumber: 1, text: 'sec θ = a/b => hypo = a, adj = b.', stepId: 'QA-TRG-BS-FR-MC1' },
    { stepNumber: 2, text: 'oppo = √(a² - b²).', stepId: 'QA-TRG-BS-FR-MC1' },
    { stepNumber: 3, text: 'Substitute tan²θ = (a² - b²)/b² and sin²θ = (a² - b²)/a² into [1 - (a² - b²)/b²] / [2 - (a² - b²)/a²].', stepId: 'QA-TRG-BS-FR-MC1' },
    { stepNumber: 4, text: 'Simplify numerator and denominator: [(2b² - a²) / b²] × [a² / (a² + b²)].', stepId: 'TG' },
    { stepNumber: 5, text: 'Final expression = a²(2b² - a²) / [b²(a² + b²)].', stepId: 'TG' },
  ],
  'QA-TRG-BS-FR-14': [
    { stepNumber: 1, text: 'sin²θ / (tan²θ - sin²θ) = 5 => 6 sin²θ = 5(sin²θ / cos²θ) => cos²θ = 5/6.', stepId: 'TG' },
    { stepNumber: 2, text: 'cos θ = √5 / √6 => adj = √5, hypo = √6, oppo = 1.', stepId: 'QA-TRG-BS-FR-MC1' },
    { stepNumber: 3, text: '[24(1/6) - 15(6/5)] / [6(6/1) - 7(5/1)] = (4 - 18) / (36 - 35).', stepId: 'TG' },
    { stepNumber: 4, text: '-14 / 1 = -14.', stepId: 'TG' },
  ],
  'QA-TRG-BS-FR-15': [
    { stepNumber: 1, text: '(sec θ - tan θ) / (sec θ + tan θ) = 1/7 => 6 sec θ = 8 tan θ => 3(1/cos θ) = 4(sin θ / cos θ).', stepId: 'TG' },
    { stepNumber: 2, text: 'sin θ = 3/4 => oppo = 3, hypo = 4.', stepId: 'QA-TRG-BS-FR-MC1' },
    { stepNumber: 3, text: 'Adj = √(4² - 3²) = √7 => cosec θ = 4/3, cot²θ = 7/9.', stepId: 'QA-TRG-BS-FR-MC1' },
    { stepNumber: 4, text: '(4/3 + 7/9) / (4/3 - 7/9) = (19/9) × (9/5).', stepId: 'TG' },
    { stepNumber: 5, text: 'Final value = 19 / 5.', stepId: 'TG' },
  ],
  'QA-TRG-BS-FR-16': [
    { stepNumber: 1, text: 'tan A = 1 / √3 => oppo = 1, Adj = √3, hypo = 2.', stepId: 'QA-TRG-BS-FR-MC1' },
    { stepNumber: 2, text: 'sin A = 1/2, cos A = √3/2; from vertex C: cos C = 1/2, sin C = √3/2.', stepId: 'QA-TRG-BS-FR-MC1' },
    { stepNumber: 3, text: 'sin A cos C + cos A sin C = (1/2)(1/2) + (√3/2)(√3/2) = 1/4 + 3/4 = 1.', stepId: 'TG' },
  ],
  'QA-TRG-BS-FR-17': [
    { stepNumber: 1, text: 'tan A = 1/2 => oppo = 1, adj = 2 => hypo = √5.', stepId: 'QA-TRG-BS-FR-MC1' },
    { stepNumber: 2, text: 'sin A = 1/√5, cos A = 2/√5; switching to vertex C: sin C = 2/√5, cos C = 1/√5.', stepId: 'QA-TRG-BS-FR-MC3' },
    { stepNumber: 3, text: '[(1/√5)(1/√5 + 2/√5)] / [(1/√5)(2/√5 - 1/√5)] = (3/5) × (5/1) = 3.', stepId: 'TG' },
  ],
  'QA-TRG-BS-FR-18': [
    { stepNumber: 1, text: 'In ΔABC (∠B = 90°), AB = 1, BC = 2 => hypo AC = √5 => cos A = 1/√5.', stepId: 'QA-TRG-BS-FR-MC1' },
    { stepNumber: 2, text: 'From vertex C, opposite = AB = 1, adjacent = BC = 2 => tan C = 1/2.', stepId: 'QA-TRG-BS-FR-MC3' },
    { stepNumber: 3, text: 'cos A + tan C = 1/√5 + 1/2 = (2 + √5) / (2√5).', stepId: 'TG' },
  ],
  'QA-TRG-BS-FR-19': [
    { stepNumber: 1, text: 'sin A = 5/13 => oppo = 5, hypo = 13, Adj = 12; 7 cot B = 24 => cot B = 24/7 (7-24-25 triangle).', stepId: 'QA-TRG-BS-FR-MC1' },
    { stepNumber: 2, text: 'Extract ratios for distinct angles A and B: sec A = 13/12, cos B = 24/25, cosec B = 25/7, tan A = 5/12.', stepId: 'QA-TRG-BS-FR-MC3' },
    { stepNumber: 3, text: '(13/12 × 24/25) × (25/7 × 5/12) = (13/6) × (5/7) = 65 / 42.', stepId: 'TG' },
  ],
  'QA-TRG-BS-FR-20': [
    { stepNumber: 1, text: 'sin 23° = a/b => oppo = a, hypo = b, adj = √(b² - a²) => sec 23° = b / √(b² - a²).', stepId: 'QA-TRG-BS-FR-MC1' },
    { stepNumber: 2, text: 'From complementary angle 67° (= 90° - 23°), sin 67° = √(b² - a²) / b.', stepId: 'QA-TRG-BS-FR-MC3' },
    { stepNumber: 3, text: 'sec 23° - sin 67° = [b² - (b² - a²)] / [b √(b² - a²)] = a² / [b √(b² - a²)].', stepId: 'TG' },
  ],
  'QA-TRG-BS-FR-21': [
    { stepNumber: 1, text: 'sec 31° = x => hypo = x, adj = 1, oppo = √(x² - 1) in right triangle with angles 31° and 59°.', stepId: 'QA-TRG-BS-FR-MC1' },
    { stepNumber: 2, text: 'From complementary vertex 59°, sin 59° = 1 / x.', stepId: 'QA-TRG-BS-FR-MC3' },
    { stepNumber: 3, text: 'sin² 59° = 1 / x².', stepId: 'QA-TRG-BS-FR-MC1' },
    { stepNumber: 4, text: '1 / sec² 31° = cos² 31° = 1 / x².', stepId: 'QA-TRG-BS-FR-MC1' },
    { stepNumber: 5, text: '1 / (sin² 59° cosec² 59°) = cosec² 59° / cosec² 59° = 1.', stepId: 'QA-TRG-BS-FR-MC1' },
    { stepNumber: 6, text: '1/x² + 1/x² - 1 = 2/x² - 1 = (2 - x²) / x².', stepId: 'TG' },
  ],
  'QA-TRG-BS-FR-22': [
    { stepNumber: 1, text: 'tan B = 5/3 => oppo = 5, Adj = 3 => hypo = √34.', stepId: 'QA-TRG-BS-FR-MC1' },
    { stepNumber: 2, text: 'Substitute ratios: (√34/5 + 5/√34) / (3/√34 - √34/3).', stepId: 'TG' },
    { stepNumber: 3, text: '[59 / (5√34)] × [3√34 / (-25)] = -177 / 125.', stepId: 'TG' },
  ],
  'QA-TRG-BS-FR-23': [
    { stepNumber: 1, text: 'cos θ = 12/13 => Adj = 12, hypo = 13, oppo = 5.', stepId: 'QA-TRG-BS-FR-MC1' },
    { stepNumber: 2, text: 'sin θ = 5/13, tan θ = 5/12, cosec θ = 13/5.', stepId: 'QA-TRG-BS-FR-MC1' },
    { stepNumber: 3, text: '[(5/13)(1 - 5/12)] / [(5/12)(1 + 13/5)] = [(5/13)(7/12)] / [(5/12)(18/5)] = (5/13) × (7/12) × (12/18) = 35 / 234.', stepId: 'TG' },
  ],
};

export function splitStepIds(rawStepId: string): string[] {
  const cleaned = String(rawStepId || '').replace(/\/\/[\s\S]*$/, '').trim();
  if (!cleaned) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of cleaned.split(/[,/]+/)) {
    const upper = part.trim().toUpperCase();
    const code = upper === 'TU' ? 'Tu' : upper;
    if (code && !seen.has(upper)) {
      seen.add(upper);
      out.push(code);
    }
  }
  return out;
}

export function parseExplanationStepTags(rawQnBody?: string): ExplanationStepItem[] {
  if (!rawQnBody) return [];
  const expMatch = rawQnBody.match(/<explanation\s*>([\s\S]*?)<\/explanation\s*>/i);
  const searchArea = expMatch ? expMatch[1] : rawQnBody;
  const stepRegex = /<step\s+(\d+)\s*-\s*([^>]+)>([\s\S]*?)<\/step(?:\s+\1)?\s*>/gi;
  const parsed: ExplanationStepItem[] = [];
  let m: RegExpExecArray | null;
  while ((m = stepRegex.exec(searchArea)) !== null) {
    const ids = splitStepIds(m[2]);
    parsed.push({
      stepNumber: Number(m[1]),
      text: m[3].trim(),
      stepId: ids.join(', ') || 'TG',
    });
  }
  return parsed;
}

export function getQuestionExplanationSteps(
  uniqueId: string,
  customStepsByQid?: Record<string, ExplanationStepItem[]>,
  rawQnBody?: string
): ExplanationStepItem[] {
  if (customStepsByQid && customStepsByQid[uniqueId] && customStepsByQid[uniqueId].length > 0) {
    return customStepsByQid[uniqueId];
  }
  const authoredSteps = parseExplanationStepTags(rawQnBody);
  if (authoredSteps.length > 0) {
    return authoredSteps;
  }
  if (DEFAULT_STEPS_BY_UNIQUE_ID[uniqueId]) {
    return DEFAULT_STEPS_BY_UNIQUE_ID[uniqueId];
  }
  return [
    {
      stepNumber: 1,
      text: 'Apply primary domain relation to isolate target variable.',
      stepId: 'Tu',
    },
    {
      stepNumber: 2,
      text: 'Substitute given values and simplify to final answer.',
      stepId: 'TG',
    },
  ];
}

export function getStructuralQuestionIdFromSteps(
  stepsOrUniqueId: ExplanationStepItem[] | string,
  customStepsByQid?: Record<string, ExplanationStepItem[]>,
  rawQnBody?: string
): string {
  const steps = Array.isArray(stepsOrUniqueId)
    ? stepsOrUniqueId
    : getQuestionExplanationSteps(stepsOrUniqueId, customStepsByQid, rawQnBody);
  const tokens = steps
    .map((s) => {
      const ids = splitStepIds(s.stepId);
      if (ids.length === 0) return '';
      return ids.length === 1 ? ids[0] : `(${ids.join('+')})`;
    })
    .filter(Boolean);
  return tokens.length > 0 ? tokens.join('-') : 'TG';
}

export interface MicroConceptInvolvedQuestion {
  uniqueId: string;
  subtopicCode: string;
  conceptCode: string;
  status: 'C' | 'W' | 'S' | 'NA';
  totalMark: number;
  stepChainId: string;
}

export type MicroDiagnosticStatus =
  | 'CRITICAL WEAK'
  | 'WEAK STEP'
  | 'MODERATE'
  | 'STRONG'
  | 'UNATTEMPTED';

export type MicroDiagnosticSortMode = 'weakness' | 'failure-pct' | 'wrong-count' | 'step-id';

export interface MicroConceptDiagnosticRow {
  microConceptId: string; // e.g. QA-TD-T4
  stepCode: string; // e.g. T1, T2, T3, T4, TG
  stepName: string; // From Micro Concept Registry Page 5
  involvedQuestions: MicroConceptInvolvedQuestion[];
  involvedQuestionsCount: number;
  attemptedQuestionsCount: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  unattemptedCount: number;
  correctToWrongRatioLabel: string;
  rawAccuracyPct: number; // (C / Attempted) * 100
  wrongRatePct: number; // (W / Attempted) * 100
  /** Percentage failure severity counting Wrong = 1.0 and Skip = 0.5: ((W + 0.5*S) / Attempted) * 100 */
  failureRatePct: number;
  /**
   * Confidence-adjusted percentage weakness score (0–100):
   * failureRatePct * (n / (n + 1)) == ((W + 0.5*S) / (n + 1)) * 100.
   * Prevents high-frequency 50% MCs (5C:5W -> 45.5) from overshadowing 100%-broken MCs (0C:2W -> 66.7),
   * while still keeping proven high-volume failures (1C:9W -> 81.8) above single-question noise (0C:1W -> 50.0).
   */
  weaknessIndex: number;
  sampleConfidence: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  netAccuracyMarks: number; // C*1.0 - W*0.5 - S*0.2
  netAccuracyValuationPct: number; // (netAccuracyMarks / Attempted) * 100
  diagnosticStatus: MicroDiagnosticStatus;
}

export function sortMicroConceptDiagnostics(
  rows: MicroConceptDiagnosticRow[],
  mode: MicroDiagnosticSortMode = 'weakness'
): MicroConceptDiagnosticRow[] {
  const copy = [...rows];
  if (mode === 'step-id') {
    return copy.sort((a, b) =>
      a.stepCode.localeCompare(b.stepCode, undefined, { numeric: true })
    );
  }
  return copy.sort((a, b) => {
    const aAtt = a.attemptedQuestionsCount > 0 ? 1 : 0;
    const bAtt = b.attemptedQuestionsCount > 0 ? 1 : 0;
    if (aAtt !== bAtt) return bAtt - aAtt;
    if (mode === 'failure-pct') {
      return (
        b.failureRatePct - a.failureRatePct ||
        b.attemptedQuestionsCount - a.attemptedQuestionsCount ||
        b.wrongCount - a.wrongCount ||
        a.stepCode.localeCompare(b.stepCode, undefined, { numeric: true })
      );
    }
    if (mode === 'wrong-count') {
      return (
        b.wrongCount - a.wrongCount ||
        b.failureRatePct - a.failureRatePct ||
        b.skippedCount - a.skippedCount ||
        a.stepCode.localeCompare(b.stepCode, undefined, { numeric: true })
      );
    }
    return (
      b.weaknessIndex - a.weaknessIndex ||
      b.failureRatePct - a.failureRatePct ||
      b.wrongCount - a.wrongCount ||
      b.attemptedQuestionsCount - a.attemptedQuestionsCount ||
      a.stepCode.localeCompare(b.stepCode, undefined, { numeric: true })
    );
  });
}

export function pickWeakestMicroStep(
  rows: MicroConceptDiagnosticRow[]
): MicroConceptDiagnosticRow | null {
  const attempted = rows.filter((r) => r.attemptedQuestionsCount > 0);
  if (attempted.length === 0) return null;
  return sortMicroConceptDiagnostics(attempted, 'weakness')[0] || null;
}

export function computeMicroConceptDiagnostics(
  questions: ScannedQuestionItem[],
  microConcepts: MicroConceptItem[],
  chapterCode: string,
  customStepsByQid?: Record<string, ExplanationStepItem[]>,
  attemptSelector: 'latest' | 'first' = 'latest'
): MicroConceptDiagnosticRow[] {
  const stepMap = new Map<string, MicroConceptInvolvedQuestion[]>();

  questions.forEach((q) => {
    const steps = getQuestionExplanationSteps(q.uniqueId, customStepsByQid, q.rawQnBody);
    const stepChainId = getStructuralQuestionIdFromSteps(steps);

    // Deduplicate stepIds within the same question (expanding multi-ID steps like "T1, T2")
    const uniqueStepIdsInQuestion = Array.from(
      new Set(steps.flatMap((s) => splitStepIds(s.stepId)))
    );

    let status: 'C' | 'W' | 'S' | 'NA' = 'NA';
    let totalMark = 0;
    if (q.attempts && q.attempts.length > 0) {
      const tuple =
        attemptSelector === 'first' ? q.attempts[0] : q.attempts[q.attempts.length - 1];
      status = tuple[0];
      totalMark = Number(((tuple[2] || 0) + (tuple[3] || 0)).toFixed(2));
    }

    uniqueStepIdsInQuestion.forEach((stepCode) => {
      const list = stepMap.get(stepCode) || [];
      list.push({
        uniqueId: q.uniqueId,
        subtopicCode: q.subtopicShortCode,
        conceptCode: q.conceptShortCode,
        status,
        totalMark,
        stepChainId,
      });
      stepMap.set(stepCode, list);
    });
  });

  const rows: MicroConceptDiagnosticRow[] = [];

  stepMap.forEach((involvedQuestions, stepCode) => {
    const involvedQuestionsCount = involvedQuestions.length;
    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;
    let unattemptedCount = 0;

    involvedQuestions.forEach((iq) => {
      if (iq.status === 'C') correctCount++;
      else if (iq.status === 'W') wrongCount++;
      else if (iq.status === 'S') skippedCount++;
      else unattemptedCount++;
    });

    const attemptedQuestionsCount = correctCount + wrongCount + skippedCount;
    const rawAccuracyPct =
      attemptedQuestionsCount > 0 ? (correctCount / attemptedQuestionsCount) * 100 : 0;
    const wrongRatePct =
      attemptedQuestionsCount > 0 ? (wrongCount / attemptedQuestionsCount) * 100 : 0;
    const effectiveFailures = wrongCount + skippedCount * 0.5;
    const failureRatePct =
      attemptedQuestionsCount > 0 ? (effectiveFailures / attemptedQuestionsCount) * 100 : 0;
    // Bayesian / Laplace confidence-adjusted percentage weakness (0-100):
    // failureRatePct * (n / (n + 1)) == ((W + 0.5*S) / (n + 1)) * 100
    const weaknessIndex =
      attemptedQuestionsCount > 0
        ? Number(((effectiveFailures / (attemptedQuestionsCount + 1)) * 100).toFixed(1))
        : 0;
    const sampleConfidence: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' =
      attemptedQuestionsCount === 0
        ? 'NONE'
        : attemptedQuestionsCount <= 2
          ? 'LOW'
          : attemptedQuestionsCount <= 5
            ? 'MEDIUM'
            : 'HIGH';
    const netAccuracyMarks = Number(
      (correctCount * 1.0 - wrongCount * 0.5 - skippedCount * 0.2).toFixed(2)
    );
    const netAccuracyValuationPct =
      attemptedQuestionsCount > 0 ? (netAccuracyMarks / attemptedQuestionsCount) * 100 : 0;

    // Lookup description & permanent cascading Base ID from live Micro Concept Registry
    // Supports permanent Full Base IDs (QA-TRG-BS-FR-MC1), TG, or Tu
    const upperStep = stepCode.toUpperCase();
    const isTu = upperStep === 'TU';
    const isTg = upperStep === 'TG';
    const regMatch = !isTu
      ? microConcepts.find((mc) => mc.baseId && mc.baseId.toLowerCase() === stepCode.toLowerCase()) ||
        microConcepts.find((mc) => mc.shortCode.toLowerCase() === stepCode.toLowerCase())
      : undefined;

    const resolvedStepCode = isTu
      ? 'Tu'
      : isTg
        ? 'TG'
        : regMatch
          ? regMatch.baseId || regMatch.shortCode
          : stepCode;
    const stepName = isTu
      ? 'Unmapped Step (Missing Micro Concept)'
      : regMatch
        ? regMatch.code
        : `Unregistered Step (${stepCode})`;
    const microConceptId = isTu
      ? 'UNMAPPED · Tu (No Micro Concept)'
      : isTg || (regMatch && (regMatch.isGlobalGeneral || !regMatch.baseId))
        ? 'GLOBAL · TG (No Base ID)'
        : regMatch
          ? regMatch.baseId || resolvedStepCode
          : `UNREGISTERED · ${chapterCode}-${stepCode}`;

    let diagnosticStatus: MicroDiagnosticStatus = 'UNATTEMPTED';
    if (attemptedQuestionsCount > 0) {
      if (weaknessIndex >= 55 || (failureRatePct >= 60 && attemptedQuestionsCount >= 2)) {
        diagnosticStatus = 'CRITICAL WEAK';
      } else if (weaknessIndex >= 35 || (failureRatePct >= 40 && attemptedQuestionsCount >= 2)) {
        diagnosticStatus = 'WEAK STEP';
      } else if (weaknessIndex >= 15 || rawAccuracyPct < 85) {
        diagnosticStatus = 'MODERATE';
      } else {
        diagnosticStatus = 'STRONG';
      }
    }

    rows.push({
      microConceptId,
      stepCode: resolvedStepCode,
      stepName,
      involvedQuestions,
      involvedQuestionsCount,
      attemptedQuestionsCount,
      correctCount,
      wrongCount,
      skippedCount,
      unattemptedCount,
      correctToWrongRatioLabel: `${correctCount} C : ${wrongCount} W`,
      rawAccuracyPct,
      wrongRatePct,
      failureRatePct,
      weaknessIndex,
      sampleConfidence,
      netAccuracyMarks,
      netAccuracyValuationPct,
      diagnosticStatus,
    });
  });

  return sortMicroConceptDiagnostics(rows, 'weakness');
}


