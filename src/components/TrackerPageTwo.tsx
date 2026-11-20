import React, { useState, useMemo } from 'react';
import {
  Activity,
  FileJson,
  FileCode,
  ArrowLeft,
  ArrowRight,
  Copy,
  Check,
  X,
} from 'lucide-react';
import type {
  ChapterLedger,
  AttemptStatus,
} from './TrackerPageOne';
import {
  scanChapterStorageAndMarks,
  computeScopeMetrics,
  computeMicroConceptDiagnostics,
  formatMarksTexFile,
  CHAPTER_MKML_STORAGE,
  type ExplanationStepItem,
  type ScannedQuestionItem,
} from '../utils/mkmlStorageScanner';
import {
  extractBoxWElements,
  extractLineDElements,
  compileAnglesMathTags,
} from '../utils/anglesCustomSyntaxPatch';
import type {
  DomainItem,
  ChapterItem,
  SubtopicItem,
  ConceptItem,
  MicroConceptItem,
} from './ExamRegistryDashboard';

interface Props {
  ledger: ChapterLedger;
  allLedgers: Record<string, ChapterLedger>;
  onSelectChapter: (chapterCode: string) => void;
  onSimulateAttemptInScope: (
    targetUniqueIds: string[],
    status: AttemptStatus,
    seconds: number,
    conceptKeyHint?: string
  ) => void;
  onBackToPartOne: () => void;
  onOpenQuestionIndex: () => void;
  onLaunchScopedQuestionsDirect: (
    questions: ScannedQuestionItem[],
    pathLabel: string,
    mode: 'study' | 'shallow'
  ) => void;
  domains: DomainItem[];
  chapters: ChapterItem[];
  subtopics: SubtopicItem[];
  concepts: ConceptItem[];
  microConcepts: MicroConceptItem[];
  stepsByQid: Record<string, ExplanationStepItem[]>;
}

function fmt(n: number, decimals = 2): string {
  if (Number.isInteger(n)) return n.toString();
  return Number(n.toFixed(decimals)).toString();
}

export const TrackerPageTwo: React.FC<Props> = ({
  ledger,
  allLedgers,
  onSelectChapter,
  onSimulateAttemptInScope,
  onBackToPartOne,
  onOpenQuestionIndex,
  onLaunchScopedQuestionsDirect,
  domains,
  chapters,
  subtopics,
  concepts,
  microConcepts,
  stepsByQid,
}) => {
  // Custom editable MKML override per chapter so users can test adding <Subtopic == ...> & <Concept == ...> tags live
  const [customMkmlByChapter, setCustomMkmlByChapter] = useState<Record<string, string>>({});
  const [showStorageModal, setShowStorageModal] = useState<'mkml' | 'marks' | 'json' | null>(null);
  const [copiedModal, setCopiedModal] = useState(false);
  const [applyToGraph, setApplyToGraph] = useState(true);
  const [microDiagnosticPoolMode, setMicroDiagnosticPoolMode] = useState<'SCOPE' | 'TOPIC'>('TOPIC');

  // Scan the chapter's MKML <Domain == ...>, <Chapter == ...>, <Subtopic == ...>, <Concept == ...>, <MC == ...> tags
  const scannedTree = useMemo(
    () =>
      scanChapterStorageAndMarks(
        ledger.chapterCode,
        ledger,
        domains,
        chapters,
        subtopics,
        concepts,
        microConcepts,
        customMkmlByChapter[ledger.chapterCode]
      ),
    [
      ledger,
      domains,
      chapters,
      subtopics,
      concepts,
      microConcepts,
      customMkmlByChapter,
    ]
  );

  // Default selected scope: first concept of first subtopic (e.g. QA-TD-BWR-V1 -> 1.1) V1)
  const defaultScopeId =
    scannedTree.subtopics[0]?.concepts[0]?.conceptId ||
    scannedTree.subtopics[0]?.subtopicId ||
    'OVERVIEW';

  const [selectedScopeId, setSelectedScopeId] = useState<string>(defaultScopeId);

  // Ensure selectedScopeId exists when switching chapters
  const effectiveScopeId = useMemo(() => {
    if (selectedScopeId === 'OVERVIEW') return 'OVERVIEW';
    for (const st of scannedTree.subtopics) {
      if (st.subtopicId === selectedScopeId) return selectedScopeId;
      for (const con of st.concepts) {
        if (con.conceptId === selectedScopeId) return selectedScopeId;
      }
    }
    return (
      scannedTree.subtopics[0]?.concepts[0]?.conceptId ||
      scannedTree.subtopics[0]?.subtopicId ||
      'OVERVIEW'
    );
  }, [selectedScopeId, scannedTree]);

  // Global Topic Metrics (Entire Chapter)
  const topicMetrics = useMemo(
    () =>
      computeScopeMetrics(
        scannedTree.allQuestions,
        ledger.timing,
        scannedTree.allQuestions.length,
        0
      ),
    [scannedTree, ledger.timing]
  );

  // Resolve current selected scope's questions, label, and short code
  const activeScopeInfo = useMemo(() => {
    if (effectiveScopeId === 'OVERVIEW') {
      return {
        scopeType: 'OVERVIEW' as const,
        titleLabel: `${scannedTree.chapterName.toUpperCase()} (ENTIRE TOPIC)`,
        shortScopeCode: scannedTree.chapterCode,
        conceptHint: Object.keys(ledger.concepts)[0] || 'C1',
        questions: scannedTree.allQuestions,
      };
    }

    for (const st of scannedTree.subtopics) {
      if (st.subtopicId === effectiveScopeId) {
        return {
          scopeType: 'SUBTOPIC' as const,
          titleLabel: `${st.subtopicName.toUpperCase()} (${st.subtopicCode})`,
          shortScopeCode: st.subtopicCode,
          conceptHint: st.concepts[0]?.conceptCode || 'C1',
          questions: st.questions,
        };
      }
      for (const con of st.concepts) {
        if (con.conceptId === effectiveScopeId) {
          return {
            scopeType: 'CONCEPT' as const,
            titleLabel: `${st.subtopicName.toUpperCase()} (${con.conceptCode})`,
            shortScopeCode: con.conceptCode,
            conceptHint: con.conceptCode,
            questions: con.questions,
          };
        }
      }
    }

    return {
      scopeType: 'OVERVIEW' as const,
      titleLabel: scannedTree.chapterName.toUpperCase(),
      shortScopeCode: scannedTree.chapterCode,
      conceptHint: 'C1',
      questions: scannedTree.allQuestions,
    };
  }, [effectiveScopeId, scannedTree, ledger.concepts]);

  // Isolated Scope Metrics (for selected Subtopic or Concept/Variant)
  const scopeMetrics = useMemo(
    () =>
      computeScopeMetrics(
        activeScopeInfo.questions,
        ledger.timing,
        topicMetrics.scopeQuestionsCount,
        topicMetrics.LTMS
      ),
    [activeScopeInfo.questions, ledger.timing, topicMetrics.scopeQuestionsCount, topicMetrics.LTMS]
  );

  // Compute Top Contributors (Subtopics Contribution & Variants/Concepts Contribution)
  const topContributors = useMemo(() => {
    const subtopicRows = scannedTree.subtopics
      .map((st) => {
        const m = computeScopeMetrics(
          st.questions,
          ledger.timing,
          topicMetrics.scopeQuestionsCount,
          topicMetrics.LTMS
        );
        return {
          id: st.subtopicId,
          name: st.subtopicName,
          code: st.subtopicCode,
          LTMS: m.LTMS,
          sharedContributionPct: m.sharedEffectiveContributionPct,
          completionPct: m.completionPct,
        };
      })
      .sort((a, b) => b.sharedContributionPct - a.sharedContributionPct);

    const variantRows: {
      id: string;
      label: string;
      isCurrent: boolean;
      LTMS: number;
      sharedContributionPct: number;
      completionPct: number;
    }[] = [];

    scannedTree.subtopics.forEach((st) => {
      st.concepts.forEach((con) => {
        const m = computeScopeMetrics(
          con.questions,
          ledger.timing,
          topicMetrics.scopeQuestionsCount,
          topicMetrics.LTMS
        );
        variantRows.push({
          id: con.conceptId,
          label: `${st.subtopicName} [${con.conceptCode}]`,
          isCurrent: con.conceptId === effectiveScopeId,
          LTMS: m.LTMS,
          sharedContributionPct: m.sharedEffectiveContributionPct,
          completionPct: m.completionPct,
        });
      });
    });

    variantRows.sort((a, b) => b.sharedContributionPct - a.sharedContributionPct);

    return {
      subtopicRows,
      variantRows,
      totalVariantsCount: variantRows.length,
    };
  }, [scannedTree, ledger.timing, topicMetrics, effectiveScopeId]);

  // Compute Micro Concept / Step-ID (T1, T2, T3) Accuracy & Weakness Diagnostics
  const microDiagnosticQuestions =
    microDiagnosticPoolMode === 'SCOPE'
      ? activeScopeInfo.questions
      : scannedTree.allQuestions;

  const microConceptDiagnostics = useMemo(
    () =>
      computeMicroConceptDiagnostics(
        microDiagnosticQuestions,
        microConcepts,
        scannedTree.chapterId,
        stepsByQid,
        'latest'
      ),
    [microDiagnosticQuestions, microConcepts, scannedTree.chapterId, stepsByQid]
  );

  const weakestMicroStep = useMemo(() => {
    const attemptedSteps = microConceptDiagnostics.filter((r) => r.attemptedQuestionsCount > 0);
    if (attemptedSteps.length === 0) return null;
    return [...attemptedSteps].sort(
      (a, b) => a.rawAccuracyPct - b.rawAccuracyPct || b.wrongCount - a.wrongCount
    )[0];
  }, [microConceptDiagnostics]);

  const marksTexContent = useMemo(
    () => formatMarksTexFile(scannedTree, ledger.timing),
    [scannedTree, ledger.timing]
  );

  const rawChapterMkml =
    customMkmlByChapter[ledger.chapterCode] ||
    CHAPTER_MKML_STORAGE[ledger.chapterCode] ||
    `<Domain == ${scannedTree.domainCode}>\n<Chapter == ${scannedTree.chapterId}>\n<!-- Add <Subtopic == ...> and <Concept == ...> tags here -->`;

  // Live extraction of new Angles syntax (<box w>, <line d>, <math == ...>) from rawChapterMkml
  const parsedCustomSyntax = useMemo(() => {
    const boxWResult = extractBoxWElements(rawChapterMkml, 14, 18, 16);
    const lineDResult = extractLineDElements(rawChapterMkml, 14, 18, 16);
    const mathSamples: { raw: string; compiled: string }[] = [];
    const mathRegex = /<math\s*==\s*([^>]+)>/gi;
    let m: RegExpExecArray | null;
    while ((m = mathRegex.exec(rawChapterMkml)) !== null) {
      mathSamples.push({
        raw: `<math == ${m[1].trim()}>`,
        compiled: compileAnglesMathTags(`<math == ${m[1].trim()}>`),
      });
    }
    return {
      boxWItems: boxWResult.items,
      lineDItems: lineDResult.items,
      mathSamples,
    };
  }, [rawChapterMkml]);

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedModal(true);
    setTimeout(() => setCopiedModal(false), 1800);
  };

  const { timing } = ledger;

  return (
    <div className="w-full space-y-2 font-sans select-none text-[#111827]">
      {/* SUB-HEADER BREADCRUMB BAR (ANGLES THEME) */}
      <div className="w-full bg-white border border-[#DFDDD4] rounded-lg px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono shadow-2xs">
        <div className="flex flex-wrap items-center gap-2 text-[#6B7280] uppercase tracking-wider">
          <span>ANGLES</span>
          <span>/</span>
          <span>TOPIC ANALYSIS</span>
          <span>/</span>
          <span className="text-[#1D4ED8] font-bold">PART 2: SUBTOPIC BREAKDOWN</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
          <span className="text-[#6B7280] uppercase">TARGET SCOPE:</span>
          <span className="px-2 py-0.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded text-[#1D4ED8] font-bold">
            {activeScopeInfo.titleLabel}
          </span>
          <span className="text-[#15803D] font-semibold">• ACTIVE EVALUATION</span>
        </div>
      </div>

      {/* TITLE BLOCK: DIAGNOSTIC MATRIX & CHAPTER SELECTOR */}
      <div className="w-full bg-white border border-[#DFDDD4] rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] rounded">
              DIAGNOSTIC MATRIX
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1D4ED8]">
              ANALYTICS &amp; WEIGHTAGE ENGINE
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 mt-1">
            <h1 className="text-xl font-bold text-[#111827] tracking-tight">Subtopic Analysis</h1>
            <select
              value={ledger.chapterCode}
              onChange={(e) => onSelectChapter(e.target.value)}
              className="px-2.5 py-1 text-xs font-mono font-bold bg-[#F9F8F4] text-[#111827] border border-[#DFDDD4] rounded hover:border-[#1D4ED8] focus:outline-none cursor-pointer"
            >
              {Object.values(allLedgers).map((l) => (
                <option key={l.chapterCode} value={l.chapterCode}>
                  {l.chapterName} [{l.chapterCode}]
                </option>
              ))}
            </select>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-[#EFF6FF] border border-[#BFDBFE] rounded text-[#1D4ED8] font-semibold">
              &lt;Domain == {scannedTree.domainCode}&gt; · &lt;Chapter == {scannedTree.chapterId}&gt;
            </span>
          </div>
        </div>

        {/* Right Metadata Columns */}
        <div className="flex flex-wrap items-center gap-5 text-xs font-mono">
          <div className="border-l border-[#E5E3DC] pl-4">
            <div className="text-[10px] uppercase tracking-wider text-[#6B7280]">
              CURRENT SCOPE
            </div>
            <div className="text-sm font-bold text-[#111827] mt-0.5">
              {activeScopeInfo.shortScopeCode}
            </div>
          </div>

          <div className="border-l border-[#E5E3DC] pl-4">
            <div className="text-[10px] uppercase tracking-wider text-[#6B7280]">
              EVALUATION DATE
            </div>
            <div className="text-sm font-bold text-[#111827] mt-0.5">{ledger.evaluationDate}</div>
          </div>

          <div className="border-l border-[#E5E3DC] pl-4">
            <div className="text-[10px] uppercase tracking-wider text-[#6B7280]">BANK SYNC</div>
            <div className="text-sm font-bold text-[#15803D] mt-0.5">MKML + MARKS.TEX</div>
          </div>
        </div>
      </div>

      {/* SCOPE POOL & SANDBOX ACTION BAR */}
      <div className="w-full bg-white border border-[#DFDDD4] rounded-lg px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-[#1D4ED8] font-bold">
            <Activity className="w-3.5 h-3.5" />
            <span>SCOPE POOL:</span>
          </span>

          <span className="px-2 py-0.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded text-[#1D4ED8] font-bold">
            Questions in Scope: {scopeMetrics.scopeQuestionsCount}
          </span>

          <span className="px-2 py-0.5 bg-[#F9F8F4] border border-[#DFDDD4] rounded text-[#111827]">
            Topic Total: <strong className="text-[#1D4ED8]">{topicMetrics.scopeQuestionsCount} Qs</strong>
          </span>

          <span className="px-2 py-0.5 bg-[#F9F8F4] border border-[#DFDDD4] rounded text-[#111827]">
            Topic LTM: <strong className="text-[#15803D]">{fmt(topicMetrics.LTMS)}m</strong>
          </span>
        </div>

        {/* Right Sandbox Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
          <button
            type="button"
            onClick={() => setShowStorageModal('marks')}
            className="px-2.5 py-1 bg-[#F9F8F4] hover:bg-[#EFECE6] text-[#111827] border border-[#DFDDD4] rounded font-semibold cursor-pointer"
          >
            • Live marks.tex ({scannedTree.allQuestions.length} IDs)
          </button>

          <button
            type="button"
            onClick={() =>
              onSimulateAttemptInScope(
                activeScopeInfo.questions.map((q) => q.uniqueId),
                'C',
                Math.max(10, timing.fastLimit - 18),
                activeScopeInfo.conceptHint
              )
            }
            className="px-2.5 py-1 bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0] rounded font-semibold cursor-pointer"
          >
            +Test Correct ({Math.max(10, timing.fastLimit - 18)}s)
          </button>

          <button
            type="button"
            onClick={() =>
              onSimulateAttemptInScope(
                activeScopeInfo.questions.map((q) => q.uniqueId),
                'W',
                timing.mediumLimit - 15,
                activeScopeInfo.conceptHint
              )
            }
            className="px-2.5 py-1 bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] rounded font-semibold cursor-pointer"
          >
            +Test Wrong ({timing.mediumLimit - 15}s)
          </button>

          <button
            type="button"
            onClick={() =>
              onSimulateAttemptInScope(
                activeScopeInfo.questions.map((q) => q.uniqueId),
                'S',
                30,
                activeScopeInfo.conceptHint
              )
            }
            className="px-2.5 py-1 bg-[#FFFBEB] hover:bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] rounded font-semibold cursor-pointer"
          >
            +Skip
          </button>

          <button
            type="button"
            onClick={() => setShowStorageModal('mkml')}
            className="px-2.5 py-1 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] rounded font-semibold flex items-center gap-1 cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>[MKML Tags]</span>
          </button>

          <button
            type="button"
            onClick={() => setShowStorageModal('json')}
            className="px-2.5 py-1 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] rounded font-semibold flex items-center gap-1 cursor-pointer"
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>[Ledger JSON]</span>
          </button>
        </div>
      </div>

      {/* MAIN 2-COLUMN GRID: LEFT SCOPE HIERARCHY TREE + RIGHT ISOLATED METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5">
        {/* LEFT SIDEBAR: SCOPE HIERARCHY (3 COLS) */}
        <div className="lg:col-span-3 bg-white border border-[#DFDDD4] rounded-lg p-3.5 flex flex-col justify-between space-y-4 shadow-2xs">
          <div className="space-y-3">
            {/* Apply Settings to Graph Checkbox */}
            <label className="flex items-center justify-between px-3 py-2 rounded bg-[#F9F8F4] border border-[#DFDDD4] text-xs cursor-pointer">
              <span className="font-sans font-semibold text-[#111827]">
                Apply Settings to Graph Too
              </span>
              <input
                type="checkbox"
                checked={applyToGraph}
                onChange={(e) => setApplyToGraph(e.target.checked)}
                className="w-4 h-4 accent-[#1D4ED8] rounded cursor-pointer"
              />
            </label>

            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#6B7280] px-1 pt-1 border-b border-[#E5E3DC] pb-2">
              <span>SCOPE HIERARCHY</span>
              <span>
                {scannedTree.subtopics.length} SUBTOPICS / {topContributors.totalVariantsCount} VAR
              </span>
            </div>

            {/* Parent Overview Node */}
            <button
              type="button"
              onClick={() => setSelectedScopeId('OVERVIEW')}
              className={`w-full px-3 py-2 rounded text-left text-xs font-mono flex items-center justify-between border transition-colors cursor-pointer ${
                effectiveScopeId === 'OVERVIEW'
                  ? 'bg-[#EFF6FF] border-[#1D4ED8] text-[#1D4ED8] font-bold'
                  : 'bg-[#F9F8F4] border-[#DFDDD4] text-[#374151] hover:bg-[#EFECE6]'
              }`}
            >
              <span>■ Overview (Entire Topic)</span>
              <span className="px-1.5 py-0.5 text-[9px] bg-white border border-[#DFDDD4] rounded text-[#6B7280]">
                PARENT
              </span>
            </button>

            {/* Scanned <Subtopic == ...> and <Concept == ...> Tree */}
            <div className="space-y-3 pt-1 font-mono">
              {scannedTree.subtopics.map((st, sIdx) => {
                const isSubtopicSelected = effectiveScopeId === st.subtopicId;
                return (
                  <div key={st.subtopicId} className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedScopeId(st.subtopicId)}
                      className={`w-full px-2.5 py-1.5 rounded text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        isSubtopicSelected
                          ? 'bg-[#EFF6FF] border border-[#1D4ED8] text-[#1D4ED8] font-bold'
                          : 'hover:bg-[#F9F8F4] text-[#111827]'
                      }`}
                    >
                      <span className="font-sans font-bold">
                        <span className="text-[#1D4ED8] font-mono mr-1.5">{sIdx + 1})</span>
                        {st.subtopicName}
                      </span>
                      <span className="text-[11px] text-[#6B7280]">{st.questions.length}Q</span>
                    </button>

                    {/* Children Concepts / Variants */}
                    <div className="pl-3 border-l-2 border-[#E5E3DC] space-y-1.5 ml-2">
                      {st.concepts.map((con, cIdx) => {
                        const isSelected = effectiveScopeId === con.conceptId;
                        const conMetrics = computeScopeMetrics(
                          con.questions,
                          ledger.timing,
                          topicMetrics.scopeQuestionsCount,
                          topicMetrics.LTMS
                        );
                        return (
                          <button
                            key={con.conceptId}
                            type="button"
                            onClick={() => setSelectedScopeId(con.conceptId)}
                            className={`w-full px-3 py-1.5 rounded text-left text-xs flex items-center justify-between border transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-[#EFF6FF] border-[#1D4ED8] text-[#1D4ED8] font-bold'
                                : 'bg-[#F9F8F4] border-[#E5E3DC] text-[#374151] hover:bg-[#EFECE6]'
                            }`}
                          >
                            <span>
                              <span className="text-[#1D4ED8] mr-1">•</span>
                              {sIdx + 1}.{cIdx + 1}) {con.conceptCode}
                            </span>
                            <span className="text-[10px]">
                              {con.questions.length}Q{' '}
                              {isSelected ? (
                                <span className="text-[#1D4ED8] font-bold ml-1">[SELECTED]</span>
                              ) : (
                                <span className="text-[#6B7280] ml-1">
                                  {Math.round(conMetrics.completionPct)}%
                                </span>
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-[#E5E3DC] text-[10px] text-[#6B7280] italic leading-relaxed">
            * Selection isolates accuracy marks (ARMNT) &amp; temporal speeds (NTMS) strictly to
            that subtopic or concept/variant via Chained Unique IDs.
          </div>
        </div>

        {/* RIGHT MAIN CONTENT: ISOLATED SCOPE METRICS (9 COLS) */}
        <div className="lg:col-span-9 space-y-2.5">
          {/* HERO CARD: PRIMARY SCOPE RATIO (Completion %) */}
          <div className="bg-white border border-[#DFDDD4] rounded-lg p-4 space-y-3 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[#4B5563] font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#1D4ED8]" />
                  <span>PRIMARY SCOPE RATIO</span>
                </div>
                <div className="flex flex-wrap items-baseline gap-2.5 mt-1 font-mono">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
                    Completion =
                  </span>
                  <span
                    className={`text-3xl sm:text-4xl font-extrabold ${
                      scopeMetrics.completionPct < 0 ? 'text-[#DC2626]' : 'text-[#1D4ED8]'
                    }`}
                  >
                    {scopeMetrics.completionPct.toFixed(2)} %
                  </span>
                </div>
              </div>

              <div className="px-3.5 py-2 rounded bg-[#F9F8F4] border border-[#DFDDD4] text-xs font-mono">
                <span className="text-[#6B7280]">Formula: </span>
                <span className="text-[#1D4ED8] font-bold">LTMS / MMS</span>
                <span className="text-[#111827] font-bold">
                  {' '}
                  = {fmt(scopeMetrics.LTMS)} / {scopeMetrics.MMS} × 100
                </span>
              </div>
            </div>

            <div className="pt-2.5 border-t border-[#E5E3DC] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
              <span className="text-[#4B5563]">
                Net Completion % • Lifetime Subtopic Marks ({fmt(scopeMetrics.LTMS)}) / Max Marks
                Subtopic ({scopeMetrics.MMS}) × 100
              </span>
              <span className="text-[#B45309] font-semibold">
                Notice: Represents solely the selected scope, not parent topic total.
              </span>
            </div>
          </div>

          {/* 3-CARD METRIC ROW: MMS, LTMS, AVAILABLE MARKS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {/* TOTAL MAX MARKS (MMS) */}
            <div className="bg-white border border-[#DFDDD4] rounded-lg px-4 py-3.5 shadow-2xs font-mono">
              <div className="text-[11px] uppercase tracking-wider text-[#4B5563] font-semibold">
                TOTAL MAX MARKS (MMS)
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-bold text-[#111827]">{scopeMetrics.MMS}</span>
                <span className="text-[10px] uppercase text-[#6B7280] bg-[#F5F4EF] px-1.5 py-0.5 rounded border border-[#DFDDD4]">
                  MAX CEILING
                </span>
              </div>
              <div className="text-[11px] text-[#6B7280] mt-1">
                {scopeMetrics.scopeQuestionsCount} questions × 3 marks
              </div>
            </div>

            {/* LIFETIME MARKS SUBTOPIC (LTMS) */}
            <div className="bg-white border border-[#BFDBFE] rounded-lg px-4 py-3.5 shadow-2xs font-mono">
              <div className="text-[11px] uppercase tracking-wider text-[#1D4ED8] font-semibold">
                LIFETIME MARKS SUBTOPIC (LTMS)
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-bold text-[#1D4ED8]">
                  {fmt(scopeMetrics.LTMS)}
                </span>
                <span className="text-[11px] font-bold text-[#1D4ED8] bg-[#EFF6FF] px-1.5 py-0.5 rounded border border-[#BFDBFE]">
                  {scopeMetrics.completionPct.toFixed(2)}% MMS
                </span>
              </div>
              <div className="text-[11px] text-[#6B7280] mt-1">Net earned (NTMS + ARMNT)</div>
            </div>

            {/* AVAILABLE MARKS */}
            <div className="bg-white border border-[#DFDDD4] rounded-lg px-4 py-3.5 shadow-2xs font-mono">
              <div className="text-[11px] uppercase tracking-wider text-[#4B5563] font-semibold">
                AVAILABLE MARKS
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-bold text-[#111827]">
                  {fmt(scopeMetrics.availableMarks)}
                </span>
                <span className="text-[10px] uppercase text-[#6B7280] bg-[#F5F4EF] px-1.5 py-0.5 rounded border border-[#DFDDD4]">
                  {scopeMetrics.MMS > 0
                    ? `${((scopeMetrics.availableMarks / scopeMetrics.MMS) * 100).toFixed(2)}% REMAIN`
                    : '0% REMAIN'}
                </span>
              </div>
              <div className="text-[11px] text-[#6B7280] mt-1">
                MMS ({scopeMetrics.MMS}) - LTMS ({fmt(scopeMetrics.LTMS)})
              </div>
            </div>
          </div>

          {/* 2-COLUMN BREAKDOWN: ACCURACY (ARMNT) & TIME LATENCY TIERS (NTMS) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 font-mono">
            {/* LEFT: ACCURACY & SCORE DEDUCTIONS */}
            <div className="bg-white border border-[#DFDDD4] rounded-lg p-4 flex flex-col justify-between space-y-3 shadow-2xs">
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-[#E5E3DC]">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#111827]">
                    <span className="w-2 h-2 bg-[#1D4ED8] rounded-full" />
                    <span>ACCURACY &amp; SCORE DEDUCTIONS</span>
                  </div>
                  <span className="text-[10px] text-[#1D4ED8] font-semibold uppercase">
                    ARMNT CALCULATION
                  </span>
                </div>

                <div className="divide-y divide-[#F0EFEA] text-xs mt-2">
                  <div className="py-2 flex items-center justify-between">
                    <span className="font-sans text-[#374151]">
                      No. of questions correct (accuracy):
                    </span>
                    <span>
                      <strong className="text-[#111827]">
                        {scopeMetrics.NQC} /{' '}
                        {scopeMetrics.attemptedCount || scopeMetrics.scopeQuestionsCount}
                      </strong>{' '}
                      = {scopeMetrics.accuracyPct.toFixed(2)}%
                    </span>
                  </div>

                  <div className="py-2 flex items-center justify-between">
                    <span className="font-sans text-[#374151]">Correctness Marks (N+1):</span>
                    <span>
                      {scopeMetrics.NQC} × 1{' '}
                      <strong className="text-[#15803D] ml-1">
                        +{fmt(scopeMetrics.correctMarks)} marks
                      </strong>
                    </span>
                  </div>

                  <div className="py-2 flex items-center justify-between">
                    <span className="font-sans text-[#374151]">
                      Wrong questions penalty (N-0.5):
                    </span>
                    <span>
                      {scopeMetrics.NQW} × 0.5{' '}
                      <strong className="text-[#DC2626] ml-1">
                        -{scopeMetrics.wrongPenalty.toFixed(2)} marks
                      </strong>
                    </span>
                  </div>

                  <div className="py-2 flex items-center justify-between">
                    <span className="font-sans text-[#374151]">
                      Skipped questions penalty (N-0.2):
                    </span>
                    <span>
                      {scopeMetrics.NQS} × 0.2{' '}
                      <strong className="text-[#D97706] ml-1">
                        -{scopeMetrics.skipPenalty.toFixed(2)} marks
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded bg-[#F9F8F4] border border-[#DFDDD4] flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase text-[#1D4ED8]">
                    ACCURACY REAL MARKS NET TOTAL (ARMNT)
                  </div>
                  <div className="text-[11px] text-[#6B7280]">
                    {fmt(scopeMetrics.correctMarks)} (Correct) - {fmt(scopeMetrics.wrongPenalty)}{' '}
                    (Wrong) - {fmt(scopeMetrics.skipPenalty)} (Skip)
                  </div>
                </div>
                <div className="text-sm font-bold text-[#1D4ED8]">
                  = {fmt(scopeMetrics.ARMNT)} marks
                </div>
              </div>
            </div>

            {/* RIGHT: TIME LATENCY TIERS & SPEED SCORES */}
            <div className="bg-white border border-[#DFDDD4] rounded-lg p-4 flex flex-col justify-between space-y-3 shadow-2xs">
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-[#E5E3DC]">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#111827]">
                    <span className="w-2 h-2 bg-[#1D4ED8] rounded-full" />
                    <span>TIME LATENCY TIERS &amp; SPEED SCORES</span>
                  </div>
                  <span className="text-[10px] text-[#1D4ED8] font-semibold uppercase">
                    NTMS CALCULATION
                  </span>
                </div>

                <div className="divide-y divide-[#F0EFEA] text-xs mt-2">
                  <div className="py-2 flex items-center justify-between">
                    <span className="font-sans text-[#374151]">
                      Questions under {timing.fastLimit}s (n{timing.fastLimit}):
                    </span>
                    <span>
                      {scopeMetrics.nFast} × 2{' '}
                      <strong className="text-[#1D4ED8] ml-1">
                        +{fmt(scopeMetrics.fastMarks)} marks
                      </strong>
                    </span>
                  </div>

                  <div className="py-2 flex items-center justify-between">
                    <span className="font-sans text-[#374151]">
                      Questions under {timing.fastLimit}s-{timing.mediumLimit}s (n
                      {timing.mediumLimit}):
                    </span>
                    <span>
                      {scopeMetrics.nMed} × 1{' '}
                      <strong className="text-[#1D4ED8] ml-1">
                        +{fmt(scopeMetrics.medMarks)} marks
                      </strong>
                    </span>
                  </div>

                  <div className="py-2 flex items-center justify-between">
                    <span className="font-sans text-[#374151]">
                      Questions under {timing.mediumLimit}s-{timing.slowLimit}s (n
                      {timing.slowLimit}):
                    </span>
                    <span>
                      {scopeMetrics.nSlow} × 0.5{' '}
                      <strong className="text-[#1D4ED8] ml-1">
                        +{scopeMetrics.slowMarks.toFixed(1)} marks
                      </strong>
                    </span>
                  </div>

                  <div className="py-2 flex items-center justify-between">
                    <span className="font-sans text-[#6B7280]">Questions with 0 marks (n0):</span>
                    <span className="text-[#6B7280]">
                      {scopeMetrics.nZeroTime} (skipped/wrong/&gt;{timing.slowLimit}s)
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded bg-[#F9F8F4] border border-[#DFDDD4] flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase text-[#1D4ED8]">
                    NET TIME MARKS SUBTOPIC (NTMS)
                  </div>
                  <div className="text-[11px] text-[#6B7280]">
                    {fmt(scopeMetrics.fastMarks)} (&lt;{timing.fastLimit}s) +{' '}
                    {fmt(scopeMetrics.medMarks)} ({timing.fastLimit}-{timing.mediumLimit}s) +{' '}
                    {scopeMetrics.slowMarks.toFixed(1)} ({timing.mediumLimit}-{timing.slowLimit}s)
                  </div>
                </div>
                <div className="text-sm font-bold text-[#1D4ED8]">
                  = {fmt(scopeMetrics.NTMS)} marks
                </div>
              </div>
            </div>
          </div>

          {/* SYNTHESIZED SCOPE TOTALS & CROSS-TOPIC RELATIONS (Completion %) */}
          <div className="bg-white border border-[#DFDDD4] rounded-lg p-4 space-y-3 shadow-2xs font-mono">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#E5E3DC]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#111827]">
                SYNTHESIZED SCOPE TOTALS &amp; CROSS-TOPIC RELATIONS
              </span>
              <span className="text-[10px] uppercase text-[#6B7280]">GLOBAL NORMALIZATION</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Left Column */}
              <div className="divide-y divide-[#F0EFEA]">
                <div className="py-2 flex items-center justify-between">
                  <span className="font-sans text-[#374151]">
                    Life time Marks Subtopic (LTMS):
                  </span>
                  <span>
                    <strong className="text-[#111827]">
                      {fmt(scopeMetrics.NTMS)} + {fmt(scopeMetrics.ARMNT)} =
                    </strong>{' '}
                    <strong className="text-[#1D4ED8]">{fmt(scopeMetrics.LTMS)} marks</strong>
                  </span>
                </div>

                <div className="py-2 flex items-center justify-between">
                  <span className="font-sans text-[#374151]">
                    Total Topic Lifetime Marks (LTM):
                  </span>
                  <strong className="text-[#111827]">{fmt(topicMetrics.LTMS)} marks</strong>
                </div>

                <div className="py-2 flex items-center justify-between">
                  <span className="font-sans text-[#374151]">
                    Questions in Scope / Topic Total:
                  </span>
                  <strong className="text-[#111827]">
                    {scopeMetrics.scopeQuestionsCount} / {topicMetrics.scopeQuestionsCount} items
                  </strong>
                </div>
              </div>

              {/* Right Column: Completion %, Shared Effective Contribution, Topic Weightage (W) */}
              <div className="divide-y divide-[#F0EFEA]">
                <div className="py-2 flex items-center justify-between">
                  <span className="font-sans text-[#374151]">Completion %:</span>
                  <span>
                    <strong className="text-[#111827]">
                      {fmt(scopeMetrics.LTMS)} / {scopeMetrics.MMS} × 100 =
                    </strong>{' '}
                    <strong className="text-[#1D4ED8]">
                      {scopeMetrics.completionPct.toFixed(2)}%
                    </strong>
                  </span>
                </div>

                <div className="py-2 flex items-center justify-between">
                  <span className="font-sans text-[#374151]">
                    Shared Effective Contribution:
                  </span>
                  <span>
                    <strong className="text-[#111827]">
                      {fmt(scopeMetrics.LTMS)} / {fmt(topicMetrics.LTMS)} × 100 =
                    </strong>{' '}
                    <strong className="text-[#15803D]">
                      {scopeMetrics.sharedEffectiveContributionPct.toFixed(2)}%
                    </strong>
                  </span>
                </div>

                <div className="py-2 flex items-center justify-between">
                  <span className="font-sans text-[#374151]">Topic Weightage (W):</span>
                  <span>
                    <strong className="text-[#111827]">
                      {scopeMetrics.scopeQuestionsCount} / {topicMetrics.scopeQuestionsCount} × 100
                      =
                    </strong>{' '}
                    <strong className="text-[#D97706]">
                      {scopeMetrics.topicWeightagePct.toFixed(2)}%
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TOP CONTRIBUTORS CARD (ANGLES THEME) */}
      <div className="w-full bg-white border border-[#DFDDD4] rounded-lg p-4 space-y-3.5 shadow-2xs font-mono">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#111827]">
              <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
              <span>TOP CONTRIBUTORS</span>
            </div>
            <div className="text-[11px] text-[#6B7280] mt-0.5">
              Shared Effective Contribution = Scope LTMS / Global Topic LTM (
              {fmt(topicMetrics.LTMS)}m) × 100
            </div>
          </div>
          <span className="text-[10px] uppercase text-[#6B7280]">
            DYNAMIC MKML + MARKS.TEX SYNC
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* 1. SUBTOPICS CONTRIBUTION */}
          <div className="bg-[#F9F8F4] border border-[#DFDDD4] rounded-lg p-3.5 space-y-3">
            <div className="flex items-center justify-between text-[11px] border-b border-[#E5E3DC] pb-2">
              <span className="font-bold text-[#111827]">1. SUBTOPICS CONTRIBUTION</span>
              <span className="text-[10px] text-[#6B7280]">PARENT SUBTOPIC NODES</span>
            </div>

            <div className="space-y-3">
              {topContributors.subtopicRows.map((row, idx) => (
                <div key={row.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-sans font-bold text-[#111827]">
                      <span className="font-mono text-[10px] px-1.5 py-0.5 bg-white border border-[#DFDDD4] rounded text-[#4B5563] mr-2">
                        #{idx + 1}
                      </span>
                      {row.name}
                    </span>
                    <span className="font-bold text-[#15803D]">
                      {row.sharedContributionPct.toFixed(2)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#E5E3DC] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#16A34A] rounded-full"
                      style={{
                        width: `${Math.min(100, Math.max(0, row.sharedContributionPct))}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. VARIANTS / CONCEPTS CONTRIBUTION */}
          <div className="bg-[#F9F8F4] border border-[#DFDDD4] rounded-lg p-3.5 space-y-3">
            <div className="flex items-center justify-between text-[11px] border-b border-[#E5E3DC] pb-2">
              <span className="font-bold text-[#111827]">2. VARIANTS CONTRIBUTION</span>
              <span className="text-[10px] text-[#6B7280]">DISAGGREGATED CONCEPTS / VARIANTS</span>
            </div>

            <div className="space-y-3">
              {topContributors.variantRows.map((row, idx) => (
                <div key={row.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`font-sans font-bold ${
                        row.isCurrent ? 'text-[#1D4ED8]' : 'text-[#111827]'
                      }`}
                    >
                      <span className="font-mono text-[10px] px-1.5 py-0.5 bg-white border border-[#DFDDD4] rounded text-[#4B5563] mr-2">
                        #{idx + 1}
                      </span>
                      {row.label} {row.isCurrent && '(Current)'}
                    </span>
                    <span className="font-bold text-[#1D4ED8]">
                      {row.sharedContributionPct.toFixed(2)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#E5E3DC] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        row.isCurrent ? 'bg-[#16A34A]' : 'bg-[#1D4ED8]'
                      }`}
                      style={{
                        width: `${Math.min(100, Math.max(0, row.sharedContributionPct))}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          MICRO CONCEPT / STEP-ID (T1, T2, T3) ACCURACY & WEAKNESS DIAGNOSTIC
          (REVERSE-INDEXED VIA UNIQUE QUESTION IDs TO SPOT WEAK STEPS)
          ==================================================================== */}
      <div className="w-full bg-white border border-[#DFDDD4] rounded-lg p-4 space-y-3.5 shadow-2xs font-mono">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E3DC] pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#111827]">
              <span className="w-2 h-2 rounded-full bg-[#1D4ED8]" />
              <span>
                MICRO CONCEPT / STEP-ID (T1, T2, T3) ACCURACY &amp; WEAKNESS DIAGNOSTIC
              </span>
              <span className="px-2 py-0.5 text-[10px] bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] rounded font-bold">
                UNIQUE ID → STEP-ID ROLLUP
              </span>
            </div>
            <div className="text-[11px] font-sans text-[#6B7280] mt-0.5">
              Tracks every Unique Question ID where each Step-ID (Micro Concept) is involved,
              computing exact Correct : Wrong ratios and step-level accuracy percentages to spot
              which reasoning step you are weak at.
            </div>
          </div>

          {/* Pool Selector: Selected Scope vs Entire Topic */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[10px] uppercase text-[#6B7280] font-bold">EVALUATE POOL:</span>
            <div className="inline-flex rounded border border-[#DFDDD4] bg-[#F9F8F4] p-0.5">
              <button
                type="button"
                onClick={() => setMicroDiagnosticPoolMode('SCOPE')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                  microDiagnosticPoolMode === 'SCOPE'
                    ? 'bg-[#1D4ED8] text-white'
                    : 'text-[#4B5563] hover:text-[#111827]'
                }`}
              >
                Selected Scope ({activeScopeInfo.shortScopeCode}: {activeScopeInfo.questions.length}{' '}
                Qs)
              </button>
              <button
                type="button"
                onClick={() => setMicroDiagnosticPoolMode('TOPIC')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                  microDiagnosticPoolMode === 'TOPIC'
                    ? 'bg-[#1D4ED8] text-white'
                    : 'text-[#4B5563] hover:text-[#111827]'
                }`}
              >
                Entire Chapter ({scannedTree.allQuestions.length} Qs)
              </button>
            </div>
          </div>
        </div>

        {/* WEAKEST STEP SPOTTED BANNER */}
        {weakestMicroStep && (
          <div
            className={`px-3.5 py-2.5 rounded-lg border flex flex-wrap items-center justify-between gap-2 text-xs ${
              weakestMicroStep.rawAccuracyPct < 60 || weakestMicroStep.wrongCount > 0
                ? 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
                : 'bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]'
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                  weakestMicroStep.rawAccuracyPct < 60 || weakestMicroStep.wrongCount > 0
                    ? 'bg-[#DC2626] text-white'
                    : 'bg-[#15803D] text-white'
                }`}
              >
                {weakestMicroStep.rawAccuracyPct < 60 || weakestMicroStep.wrongCount > 0
                  ? 'WEAKEST STEP SPOTTED'
                  : 'ALL STEPS STABLE'}
              </span>
              <span className="font-sans font-bold">
                Step <strong className="font-mono">{weakestMicroStep.stepCode}</strong> (
                {weakestMicroStep.stepName}) — Involved in{' '}
                <strong>{weakestMicroStep.involvedQuestionsCount} Qs</strong> (
                {weakestMicroStep.attemptedQuestionsCount} Attempted) · Ratio:{' '}
                <strong className="font-mono">
                  {weakestMicroStep.correctToWrongRatioLabel}
                </strong>
              </span>
            </div>

            <div className="font-extrabold">
              Step Accuracy: {weakestMicroStep.rawAccuracyPct.toFixed(2)}% (Error Rate:{' '}
              {weakestMicroStep.wrongRatePct.toFixed(2)}%)
            </div>
          </div>
        )}

        {/* MICRO CONCEPT / STEP-ID DIAGNOSTIC TABLE */}
        <div className="overflow-x-auto border border-[#DFDDD4] rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F9F8F4] border-b border-[#DFDDD4] text-[10px] uppercase tracking-wider text-[#6B7280]">
                <th className="py-2.5 px-3">STEP-ID / MICRO CONCEPT</th>
                <th className="py-2.5 px-3">INVOLVED UNIQUE QUESTION IDs</th>
                <th className="py-2.5 px-3 text-center">C / W / S / NA</th>
                <th className="py-2.5 px-3 text-center">CORRECT : WRONG RATIO</th>
                <th className="py-2.5 px-3 text-right">STEP ACCURACY %</th>
                <th className="py-2.5 px-3 text-right">NET VALUATION %</th>
                <th className="py-2.5 px-3 text-center">DIAGNOSTIC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EFEA]">
              {microConceptDiagnostics.map((row) => {
                const badgeClass =
                  row.diagnosticStatus === 'WEAK STEP'
                    ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
                    : row.diagnosticStatus === 'MODERATE'
                      ? 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]'
                      : row.diagnosticStatus === 'STRONG'
                        ? 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]'
                        : 'bg-[#F3F4F6] text-[#6B7280] border-[#D1D5DB]';

                return (
                  <tr key={row.stepCode} className="hover:bg-[#F9F8F4]/80">
                    <td className="py-3 px-3 align-top">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] font-extrabold text-xs">
                          {row.stepCode}
                        </span>
                        <span className="font-sans font-bold text-[#111827]">{row.stepName}</span>
                      </div>
                      <div className="text-[10px] text-[#6B7280] mt-1">
                        Registry ID: {row.microConceptId} · Involved in{' '}
                        <strong className="text-[#111827]">
                          {row.involvedQuestionsCount} Questions
                        </strong>
                      </div>
                    </td>

                    <td className="py-3 px-3 align-top">
                      <div className="flex flex-wrap gap-1.5">
                        {row.involvedQuestions.map((iq) => {
                          const chipColor =
                            iq.status === 'C'
                              ? 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]'
                              : iq.status === 'W'
                                ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
                                : iq.status === 'S'
                                  ? 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]'
                                  : 'bg-[#F9F8F4] text-[#6B7280] border-[#DFDDD4]';
                          return (
                            <span
                              key={`${row.stepCode}-${iq.uniqueId}`}
                              className={`px-2 py-0.5 rounded border text-[10px] font-bold ${chipColor}`}
                              title={`Path: ${iq.subtopicCode}-${iq.conceptCode} · Step Chain: ${iq.stepChainId} · Total Mark: ${iq.totalMark}`}
                            >
                              {iq.uniqueId} ({iq.status}) [{iq.stepChainId}]
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    <td className="py-3 px-3 align-top text-center font-bold">
                      <span className="text-[#15803D]">{row.correctCount}C</span>
                      {' / '}
                      <span className="text-[#DC2626]">{row.wrongCount}W</span>
                      {' / '}
                      <span className="text-[#D97706]">{row.skippedCount}S</span>
                      {' / '}
                      <span className="text-[#6B7280]">{row.unattemptedCount}NA</span>
                    </td>

                    <td className="py-3 px-3 align-top text-center font-extrabold text-[#111827]">
                      {row.correctToWrongRatioLabel}
                    </td>

                    <td className="py-3 px-3 align-top text-right">
                      <div
                        className={`font-extrabold text-sm ${
                          row.attemptedQuestionsCount === 0
                            ? 'text-[#6B7280]'
                            : row.rawAccuracyPct < 60
                              ? 'text-[#DC2626]'
                              : row.rawAccuracyPct < 80
                                ? 'text-[#D97706]'
                                : 'text-[#15803D]'
                        }`}
                      >
                        {row.rawAccuracyPct.toFixed(2)}%
                      </div>
                      <div className="text-[10px] text-[#6B7280]">
                        {row.correctCount} / {row.attemptedQuestionsCount} Attempted
                      </div>
                    </td>

                    <td className="py-3 px-3 align-top text-right">
                      <div
                        className={`font-extrabold ${
                          row.netAccuracyValuationPct < 50 ? 'text-[#DC2626]' : 'text-[#1D4ED8]'
                        }`}
                      >
                        {row.netAccuracyValuationPct.toFixed(2)}%
                      </div>
                      <div className="text-[10px] text-[#6B7280]">
                        +1C / -0.5W / -0.2S
                      </div>
                    </td>

                    <td className="py-3 px-3 align-top text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded border text-[10px] font-extrabold uppercase ${badgeClass}`}
                      >
                        {row.diagnosticStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {microConceptDiagnostics.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-xs text-[#6B7280]">
                    No Micro Concepts / Step-IDs found for this scope.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ====================================================================
          SPATIAL GRAPH SCOPED QUESTION PLACEHOLDERS & NEW CUSTOM SYNTAX
          (1. REPLACES INLINE GRAPH QUESTIONS WITH DIRECT STUDY / SHALLOW MODE REDIRECT
           2. LIVE RENDERER FOR <box w>, <line d>, AND <math == ...>)
          ==================================================================== */}
      <div className="w-full bg-white border border-[#DFDDD4] rounded-lg p-4 space-y-4 shadow-2xs font-mono">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E3DC] pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#111827]">
              <span className="w-2 h-2 rounded-full bg-[#15803D]" />
              <span>
                SPATIAL GRAPH QUESTION PLACEHOLDERS &amp; CUSTOM SYNTAX (&lt;box w&gt;, &lt;line
                d&gt;, &lt;math ==&gt;)
              </span>
            </div>
            <div className="text-[11px] font-sans text-[#6B7280] mt-0.5">
              Generic questions are removed from the graph canvas and replaced by Scoped Concept
              Placeholders below. Clicking <strong>Study Mode</strong> or{' '}
              <strong>Shallow Mode</strong> redirects directly into Question Cards pre-filtered
              strictly to that clicked Subtopic &amp; Concept.
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowStorageModal('mkml')}
            className="px-3 py-1.5 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] rounded text-xs font-bold cursor-pointer"
          >
            Edit &lt;box w&gt; / &lt;line d&gt; / &lt;math ==&gt; in [MKML Tags]
          </button>
        </div>

        {/* 1. SCOPED GRAPH QUESTION PLACEHOLDERS (REDIRECTS DIRECTLY TO STUDY MODE OR SHALLOW MODE FOR CLICKED SUBTOPIC/CONCEPT) */}
        <div className="space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#4B5563]">
            1. GRAPH QUESTION PLACEHOLDER NODES (CLICK TO REDIRECT DIRECTLY TO SCOPED STUDY OR
            SHALLOW MODE)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {scannedTree.subtopics.map((st, sIdx) =>
              st.concepts.map((con, cIdx) => {
                const isSelectedScope =
                  effectiveScopeId === con.conceptId || effectiveScopeId === st.subtopicId;
                const pathLabel = `S${sIdx + 1}-V${cIdx + 1}`;
                return (
                  <div
                    key={con.conceptId}
                    className={`p-3 rounded-lg border transition-colors flex flex-col justify-between gap-2.5 ${
                      isSelectedScope
                        ? 'bg-[#EFF6FF]/60 border-[#1D4ED8]'
                        : 'bg-[#F9F8F4] border-[#DFDDD4]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-extrabold bg-white border border-[#DFDDD4] rounded text-[#1D4ED8]">
                          &lt;Concept == {con.conceptId}&gt;
                        </span>
                        <span className="text-[11px] font-extrabold text-[#15803D]">
                          {con.questions.length} Qs
                        </span>
                      </div>
                      <div className="font-sans font-bold text-xs text-[#111827] mt-1.5">
                        {st.subtopicName} → {con.conceptName} ({pathLabel})
                      </div>
                      <div className="text-[10px] text-[#6B7280] mt-0.5">
                        Graph Placeholder Node (No raw questions dumped on canvas)
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-[#E5E3DC]">
                      <button
                        type="button"
                        onClick={() =>
                          onLaunchScopedQuestionsDirect(con.questions, pathLabel, 'study')
                        }
                        className="px-2.5 py-1.5 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] rounded text-[11px] font-bold text-center transition-colors cursor-pointer"
                      >
                        → Study Mode ({con.questions.length}Q)
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onLaunchScopedQuestionsDirect(con.questions, pathLabel, 'shallow')
                        }
                        className="px-2.5 py-1.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white border border-[#1D4ED8] rounded text-[11px] font-bold text-center transition-colors cursor-pointer"
                      >
                        → Shallow Mode ({con.questions.length}Q)
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 2. LIVE GEOMETRY RENDERER FOR <box w>, <line d>, AND <math == ...> */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 pt-2 border-t border-[#E5E3DC]">
          {/* Left 7 Cols: Visual Canvas Preview of <line d> (Top Z-Index + 4mm text above line) & <box w> (Invisible box + 25% bottom baseline) */}
          <div className="lg:col-span-7 bg-[#FBFBF7] border border-[#DFDDD4] rounded-lg p-3 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] uppercase tracking-wider text-[#4B5563] border-b border-[#E5E3DC] pb-1.5">
              <span className="font-bold text-[#111827]">
                2. LIVE DIAGRAM CANVAS: &lt;line d&gt; (4mm ABOVE LINE, TOP Z-INDEX) &amp; &lt;box
                w&gt; (25% BOTTOM BASELINE)
              </span>
              <span className="text-[#1D4ED8] font-bold">
                {parsedCustomSyntax.lineDItems.length} &lt;line d&gt; ·{' '}
                {parsedCustomSyntax.boxWItems.length} &lt;box w&gt;
              </span>
            </div>

            <div
              className="relative w-full h-56 rounded border border-[#E5E3DC] overflow-hidden"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #ECEAE2 1px, transparent 1px), linear-gradient(to bottom, #ECEAE2 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            >
              {/* Sample background <box> showing that <line d> and <box w> sit ON TOP OF <box> */}
              <div className="absolute left-6 top-4 right-6 bottom-4 bg-[#F1F5F9]/80 border border-[#94A3B8] rounded px-3 py-2 z-10">
                <div className="text-[10px] font-bold text-[#475569]">
                  Underlying &lt;box&gt; Layer (z-index: 20) — &lt;line d&gt; (z-index: 40) &amp;
                  &lt;box w&gt; (z-index: 35) render directly on top
                </div>
              </div>

              {/* SVG Layer at z-index 40 rendering <line d> with text 4mm (15px) above line midpoint and <box w> with 25%-from-bottom baseline */}
              <svg
                viewBox="0 0 520 210"
                className="absolute inset-0 w-full h-full z-40 pointer-events-none"
              >
                {/* Right Triangle drawn via <line d> */}
                {/* Vertical leg: oppo (O = 3) */}
                <line
                  x1="150"
                  y1="40"
                  x2="150"
                  y2="145"
                  stroke={parsedCustomSyntax.lineDItems[0]?.lineColor || '#1D4ED8'}
                  strokeWidth="2.5"
                />
                <text
                  x="135"
                  y="92"
                  fill={parsedCustomSyntax.lineDItems[0]?.textColor || '#1E3A8A'}
                  fontSize="11"
                  fontWeight="bold"
                  textAnchor="middle"
                  transform="rotate(-90 135 92)"
                >
                  {parsedCustomSyntax.lineDItems[0]?.labelText || 'oppo (O = 3) [4mm above line]'}
                </text>

                {/* Horizontal leg: Adj (M = 4) */}
                <line
                  x1="150"
                  y1="145"
                  x2="310"
                  y2="145"
                  stroke={parsedCustomSyntax.lineDItems[1]?.lineColor || '#15803D'}
                  strokeWidth="2.5"
                />
                <text
                  x="230"
                  y="130"
                  fill={parsedCustomSyntax.lineDItems[1]?.textColor || '#14532D'}
                  fontSize="11"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {parsedCustomSyntax.lineDItems[1]?.labelText || 'Adj (M = 4) [4mm above line]'}
                </text>

                {/* Hypotenuse: hypo (H = 5) */}
                <line
                  x1="150"
                  y1="40"
                  x2="310"
                  y2="145"
                  stroke={parsedCustomSyntax.lineDItems[2]?.lineColor || '#E11D48'}
                  strokeWidth="2.5"
                />
                <text
                  x="238"
                  y="80"
                  fill={parsedCustomSyntax.lineDItems[2]?.textColor || '#991B1B'}
                  fontSize="11"
                  fontWeight="bold"
                  textAnchor="middle"
                  transform="rotate(33.3 238 80)"
                >
                  {parsedCustomSyntax.lineDItems[2]?.labelText || 'hypo (H = 5) [4mm above line]'}
                </text>

                {/* <box w> rendering: invisible bg & border by default, internal parallel baseline at 25% height from bottom, text sitting directly on top of the middle of the line */}
                <g>
                  {/* Dashed preview of invisible <box w> boundary for clarity */}
                  <rect
                    x="115"
                    y="156"
                    width="240"
                    height="38"
                    fill={
                      parsedCustomSyntax.boxWItems[0]?.bgColor &&
                      parsedCustomSyntax.boxWItems[0]?.bgColor !== 'transparent'
                        ? parsedCustomSyntax.boxWItems[0].bgColor
                        : 'none'
                    }
                    stroke="#94A3B8"
                    strokeDasharray="3 3"
                    strokeWidth="0.75"
                  />
                  {/* Internal baseline at 25% height from bottom (y = 156 + 38 * 0.75 = 184.5) */}
                  <line
                    x1="125"
                    y1="184.5"
                    x2="345"
                    y2="184.5"
                    stroke={parsedCustomSyntax.boxWItems[0]?.textColor || '#000000'}
                    strokeWidth="1.75"
                  />
                  {/* Text sitting centered directly on top of the 25% baseline line */}
                  <text
                    x="235"
                    y="180"
                    fill={parsedCustomSyntax.boxWItems[0]?.textColor || '#000000'}
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {parsedCustomSyntax.boxWItems[0]?.rawText ||
                      'Right ΔABC (∠B = 90°, α at A, β at C)'}
                  </text>
                </g>
              </svg>
            </div>
          </div>

          {/* Right 5 Cols: Spec Reference & Live <math == ...> Compiled Expressions */}
          <div className="lg:col-span-5 bg-[#F9F8F4] border border-[#DFDDD4] rounded-lg p-3 space-y-2.5 text-xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#1D4ED8] border-b border-[#E5E3DC] pb-1.5">
              3. NEW CUSTOM SYNTAX &amp; &lt;math == ...&gt; COMPILER SPEC
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="p-2 bg-white border border-[#DFDDD4] rounded">
                <div className="font-bold text-[#111827]">
                  A) &lt;box w points = (x1,y1),(x2,y2),(x3,y3),(x4,y4)&gt;text&lt;/box w&gt;
                </div>
                <div className="font-sans text-[#4B5563] mt-0.5">
                  Default: <code>bg-color: transparent</code>, <code>border: transparent</code>,{' '}
                  <code>text-color: #000000</code>. Draws internal line parallel to bottom at{' '}
                  <strong>25% height</strong>; text sits centered directly on top of the line.
                </div>
              </div>

              <div className="p-2 bg-white border border-[#DFDDD4] rounded">
                <div className="font-bold text-[#111827]">
                  B) &lt;line d line-color=#hex text-color=#hex&gt;(x1,y1),(x2,y2) text&lt;/line
                  d&gt;
                </div>
                <div className="font-sans text-[#4B5563] mt-0.5">
                  Sits <strong>on top of &lt;box&gt;</strong> (<code>z-index: 40</code>). Inline
                  text sits centered directly on top of the line <strong>4 mm (~15px)</strong>{' '}
                  above the segment.
                </div>
              </div>

              <div className="p-2 bg-white border border-[#DFDDD4] rounded space-y-1">
                <div className="font-bold text-[#111827]">
                  C) Compiled &lt;math == ...&gt; Expressions in Current Chapter:
                </div>
                <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                  {parsedCustomSyntax.mathSamples.slice(0, 8).map((ms, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 text-[10px] bg-[#F9F8F4] px-2 py-0.5 rounded border border-[#E5E3DC]"
                    >
                      <code className="text-[#6B7280] truncate">{ms.raw}</code>
                      <span
                        className="font-bold text-[#1D4ED8] shrink-0"
                        dangerouslySetInnerHTML={{ __html: ms.compiled }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PAGE 2 FORMULA ARCHITECTURE GUIDE (WITH "1. Completion %") */}
      <div className="w-full bg-white border border-[#DFDDD4] rounded-lg p-4 space-y-3 shadow-2xs">
        <div className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280]">
          PAGE 2 FORMULA ARCHITECTURE GUIDE
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
          <div>
            <div className="font-bold text-[#1D4ED8]">1. Completion %</div>
            <div className="text-[#4B5563] text-[11px] mt-1 leading-relaxed">
              Net completion percentage within scope:{' '}
              <strong className="text-[#111827] font-mono">
                LTMS ({fmt(scopeMetrics.LTMS)}) / MMS ({scopeMetrics.MMS}) × 100 ={' '}
                {scopeMetrics.completionPct.toFixed(2)}%
              </strong>
            </div>
          </div>

          <div>
            <div className="font-bold text-[#15803D]">2. Shared Effective Contribution</div>
            <div className="text-[#4B5563] text-[11px] mt-1 leading-relaxed">
              Score contribution to overall topic performance:{' '}
              <strong className="text-[#111827] font-mono">
                LTMS ({fmt(scopeMetrics.LTMS)}) / Topic LTM ({fmt(topicMetrics.LTMS)}) × 100 ={' '}
                {scopeMetrics.sharedEffectiveContributionPct.toFixed(2)}%
              </strong>
            </div>
          </div>

          <div>
            <div className="font-bold text-[#D97706]">3. Topic Weightage (W)</div>
            <div className="text-[#4B5563] text-[11px] mt-1 leading-relaxed">
              Question bank representation:{' '}
              <strong className="text-[#111827] font-mono">
                Scope Qs ({scopeMetrics.scopeQuestionsCount}) / Topic Qs (
                {topicMetrics.scopeQuestionsCount}) × 100 ={' '}
                {scopeMetrics.topicWeightagePct.toFixed(2)}%
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM NAVIGATION BAR: RETURN TO PART 1 OR PROCEED TO SUB-PAGE QUESTION INDEX */}
      <div className="w-full bg-white border border-[#DFDDD4] rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <button
          type="button"
          onClick={onBackToPartOne}
          className="px-4 py-2 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] rounded-md text-xs font-mono font-bold flex items-center gap-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>← Part 1: Topic Overview</span>
        </button>

        <button
          type="button"
          onClick={onOpenQuestionIndex}
          className="px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white border border-[#1D4ED8] rounded-md text-xs font-mono font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
        >
          <span>Proceed to Question Index (Select &amp; Launch Test)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* MODAL: VIEW / EDIT EMBEDDED MKML TAGS, marks.tex, OR LEDGER JSON */}
      {showStorageModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#DFDDD4] rounded-xl max-w-3xl w-full overflow-hidden shadow-2xl text-[#111827] font-mono">
            <div className="flex items-center justify-between px-4 py-3 bg-[#F9F8F4] border-b border-[#DFDDD4]">
              <div className="flex items-center gap-2 text-xs font-bold">
                {showStorageModal === 'mkml' && (
                  <>
                    <FileCode className="w-4 h-4 text-[#1D4ED8]" />
                    <span>
                      Embedded MKML Identification Tags (&lt;Domain&gt;, &lt;Chapter&gt;,
                      &lt;Subtopic&gt;, &lt;Concept&gt;, &lt;MC&gt;) — {ledger.chapterCode}
                    </span>
                  </>
                )}
                {showStorageModal === 'marks' && (
                  <>
                    <Activity className="w-4 h-4 text-[#15803D]" />
                    <span>
                      Separate marks.tex Storage File (Keyed by Chained Unique Question ID) —{' '}
                      {ledger.chapterCode}
                    </span>
                  </>
                )}
                {showStorageModal === 'json' && (
                  <>
                    <FileJson className="w-4 h-4 text-[#1D4ED8]" />
                    <span>Topic Ledger JSON Tree ({ledger.chapterCode})</span>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowStorageModal(null)}
                className="p-1 text-[#6B7280] hover:text-[#111827] rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 max-h-[440px] overflow-y-auto bg-[#F5F4EF] text-xs">
              {showStorageModal === 'mkml' ? (
                <div className="space-y-2">
                  <div className="text-[11px] text-[#4B5563]">
                    Edit the MKML tags below (&lt;Subtopic == ...&gt;, &lt;Concept == ...&gt;,
                    &lt;Qn&gt;) — the Subtopic Hierarchy &amp; Question counts update live:
                  </div>
                  <textarea
                    value={rawChapterMkml}
                    onChange={(e) =>
                      setCustomMkmlByChapter((prev) => ({
                        ...prev,
                        [ledger.chapterCode]: e.target.value,
                      }))
                    }
                    className="w-full h-80 p-3 bg-white border border-[#DFDDD4] rounded text-xs text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
                    spellCheck={false}
                  />
                </div>
              ) : (
                <pre className="whitespace-pre-wrap break-all text-[#111827]">
                  {showStorageModal === 'marks'
                    ? marksTexContent
                    : JSON.stringify(ledger, null, 2)}
                </pre>
              )}
            </div>

            <div className="flex items-center justify-between px-4 py-2.5 bg-[#F9F8F4] border-t border-[#DFDDD4] text-[11px]">
              <span className="text-[#6B7280]">
                Unique ID Format: &lt;Domain-Chapter-Subtopic-Concept-x_n&gt; (e.g.{' '}
                {scannedTree.allQuestions[0]?.uniqueId || 'QA-TD-BWR-V1-1'})
              </span>
              <button
                type="button"
                onClick={() =>
                  handleCopyText(
                    showStorageModal === 'mkml'
                      ? rawChapterMkml
                      : showStorageModal === 'marks'
                        ? marksTexContent
                        : JSON.stringify(ledger, null, 2)
                  )
                }
                className="px-3 py-1 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white rounded font-bold flex items-center gap-1 cursor-pointer"
              >
                {copiedModal ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedModal ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
