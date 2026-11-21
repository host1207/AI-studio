import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
} from 'lucide-react';
import type {
  ChapterLedger,
  AttemptTuple,
} from './TrackerPageOne';
import {
  scanChapterStorageAndMarks,
  computeMicroConceptDiagnostics,
  getQuestionExplanationSteps,
  getStructuralQuestionIdFromSteps,
  type ExplanationStepItem,
} from '../utils/mkmlStorageScanner';
import type {
  DomainItem,
  ChapterItem,
  SubtopicItem,
  ConceptItem,
  MicroConceptItem,
} from './ExamRegistryDashboard';

export interface TestSessionRecord {
  id: string;
  label: string; // e.g. "test id(1)", "test id(2)", "test id(3)"
  chapterCode: string;
  questionUniqueIds: string[];
  createdAt: string;
}

interface Props {
  ledger: ChapterLedger;
  testSessions: TestSessionRecord[];
  activeTestSessionId: string;
  onSelectTestSession: (id: string) => void;
  onBackToQuestionCards: () => void;
  onGoToTrackerPageOne: () => void;
  domains: DomainItem[];
  chapters: ChapterItem[];
  subtopics: SubtopicItem[];
  concepts: ConceptItem[];
  microConcepts: MicroConceptItem[];
  stepsByQid: Record<string, ExplanationStepItem[]>;
  liveChapterMkml?: string;
}

interface AttemptTupleBreakdown {
  exists: boolean;
  TM: number;
  A: number;
  T: number;
  seconds: number;
  status: 'C' | 'W' | 'S' | 'NA';
}

function evaluateAttemptTuple(
  tuple: AttemptTuple | undefined,
  fastLimit: number,
  mediumLimit: number,
  slowLimit: number
): AttemptTupleBreakdown {
  if (!tuple) {
    return {
      exists: false,
      TM: 0,
      A: 0,
      T: 0,
      seconds: 0,
      status: 'NA',
    };
  }
  const [status, seconds] = tuple;
  if (status === 'W') {
    return {
      exists: true,
      TM: -0.5,
      A: -0.5,
      T: 0,
      seconds,
      status: 'W',
    };
  }
  if (status === 'S') {
    return {
      exists: true,
      TM: -0.2,
      A: -0.2,
      T: 0,
      seconds,
      status: 'S',
    };
  }

  let T = 0;
  if (seconds <= fastLimit) T = 2.0;
  else if (seconds <= mediumLimit) T = 1.0;
  else if (seconds <= slowLimit) T = 0.5;

  const A = 1.0;
  const TM = Number((A + T).toFixed(2));
  return {
    exists: true,
    TM,
    A,
    T,
    seconds,
    status: 'C',
  };
}

function fmtNum(n: number, maxDecimals = 2): string {
  if (Number.isInteger(n)) return n.toString();
  return Number(n.toFixed(maxDecimals)).toString();
}

export const TrackerTestAnalysis: React.FC<Props> = ({
  ledger,
  testSessions,
  activeTestSessionId,
  onSelectTestSession,
  onBackToQuestionCards,
  onGoToTrackerPageOne,
  domains,
  chapters,
  subtopics,
  concepts,
  microConcepts,
  stepsByQid,
  liveChapterMkml,
}) => {
  // Filter test sessions for the current chapter (or fallback to all)
  const chapterSessions = useMemo(() => {
    const matching = testSessions.filter((s) => s.chapterCode === ledger.chapterCode);
    return matching.length > 0 ? matching : testSessions;
  }, [testSessions, ledger.chapterCode]);

  const currentSession = useMemo(
    () =>
      chapterSessions.find((s) => s.id === activeTestSessionId) ||
      chapterSessions[chapterSessions.length - 1] ||
      null,
    [chapterSessions, activeTestSessionId]
  );

  // Scan the chapter's MKML storage and marks.tex ledger
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
        liveChapterMkml
      ),
    [ledger, domains, chapters, subtopics, concepts, microConcepts, liveChapterMkml]
  );

  // Filter Bar State:
  // Speed = A1 / An / Avg
  const [speedMode, setSpeedMode] = useState<'A1' | 'An' | 'Avg'>('An');
  // S = S1 / S2 / All
  const [selectedSubtopicFilter, setSelectedSubtopicFilter] = useState<string>('ALL');
  // V = V1 / V2 / All
  const [selectedVariantFilter, setSelectedVariantFilter] = useState<string>('ALL');
  // SELECTION = Highest marks to lowest marks / Lowest marks to highest marks
  const [sortHighestFirst, setSortHighestFirst] = useState<boolean>(true);

  // Subtopic filter options (S1, S2, ... + All)
  const subtopicFilterOptions = useMemo(() => {
    return scannedTree.subtopics.map((st, idx) => ({
      key: st.subtopicId,
      shortLabel: `S${idx + 1}`,
      fullName: st.subtopicName,
      code: st.subtopicCode,
    }));
  }, [scannedTree]);

  // Variant (Concept) filter options (V1, V2, ... + All)
  const variantFilterOptions = useMemo(() => {
    const seen = new Set<string>();
    const list: { code: string; name: string }[] = [];
    scannedTree.subtopics.forEach((st) => {
      st.concepts.forEach((con) => {
        if (!seen.has(con.conceptCode)) {
          seen.add(con.conceptCode);
          list.push({ code: con.conceptCode, name: con.conceptName });
        }
      });
    });
    return list;
  }, [scannedTree]);

  // Questions belonging to the active Test Session (fetched by Unique Question ID from storage)
  const testQuestions = useMemo(() => {
    if (!currentSession || currentSession.questionUniqueIds.length === 0) {
      return scannedTree.allQuestions;
    }
    const idSet = new Set(currentSession.questionUniqueIds);
    const filtered = scannedTree.allQuestions.filter((q) => idSet.has(q.uniqueId));
    return filtered.length > 0 ? filtered : scannedTree.allQuestions;
  }, [currentSession, scannedTree]);

  // Enrich each test question with its Subtopic Name, Variant Name, and Attempt Tuples (A1, A2, ..., An)
  const enrichedRows = useMemo(() => {
    const { fastLimit, mediumLimit, slowLimit } = ledger.timing;

    return testQuestions.map((q) => {
      const parentSt = scannedTree.subtopics.find((s) => s.subtopicId === q.subtopicId);
      const parentCon = parentSt?.concepts.find((c) => c.conceptId === q.conceptId);

      const attemptBreakdowns = q.attempts.map((tuple) =>
        evaluateAttemptTuple(tuple, fastLimit, mediumLimit, slowLimit)
      );

      const a1 =
        attemptBreakdowns[0] ||
        evaluateAttemptTuple(undefined, fastLimit, mediumLimit, slowLimit);
      const an =
        attemptBreakdowns[attemptBreakdowns.length - 1] ||
        evaluateAttemptTuple(undefined, fastLimit, mediumLimit, slowLimit);

      let activeTM = an.TM;
      let activeA = an.A;
      let activeT = an.T;
      let activeSeconds = an.seconds;
      let activeStatus = an.status;

      if (speedMode === 'A1') {
        activeTM = a1.TM;
        activeA = a1.A;
        activeT = a1.T;
        activeSeconds = a1.seconds;
        activeStatus = a1.status;
      } else if (speedMode === 'Avg' && attemptBreakdowns.length > 0) {
        const sumTM = attemptBreakdowns.reduce((acc, x) => acc + x.TM, 0);
        const sumA = attemptBreakdowns.reduce((acc, x) => acc + x.A, 0);
        const sumT = attemptBreakdowns.reduce((acc, x) => acc + x.T, 0);
        const sumSec = attemptBreakdowns.reduce((acc, x) => acc + x.seconds, 0);
        const count = attemptBreakdowns.length;
        activeTM = Number((sumTM / count).toFixed(2));
        activeA = Number((sumA / count).toFixed(2));
        activeT = Number((sumT / count).toFixed(2));
        activeSeconds = Math.round(sumSec / count);
      }

      const qSteps = getQuestionExplanationSteps(q.uniqueId, stepsByQid, q.rawQnBody);
      const stepChainId = getStructuralQuestionIdFromSteps(qSteps);

      return {
        question: q,
        subtopicName: parentSt ? parentSt.subtopicName : q.subtopicShortCode,
        variantLabel: parentCon
          ? `${parentCon.conceptName} (${parentCon.conceptCode})`
          : q.conceptShortCode,
        stepChainId,
        attemptBreakdowns,
        activeTM,
        activeA,
        activeT,
        activeSeconds,
        activeStatus,
      };
    });
  }, [testQuestions, scannedTree, ledger.timing, speedMode, stepsByQid]);

  // Apply S (Subtopic), V (Variant), and SELECTION sort to rows
  const displayedRows = useMemo(() => {
    const filtered = enrichedRows.filter((row) => {
      if (
        selectedSubtopicFilter !== 'ALL' &&
        row.question.subtopicId !== selectedSubtopicFilter
      ) {
        return false;
      }
      if (
        selectedVariantFilter !== 'ALL' &&
        row.question.conceptShortCode !== selectedVariantFilter
      ) {
        return false;
      }
      return true;
    });

    filtered.sort((a, b) => {
      if (sortHighestFirst) {
        return b.activeTM - a.activeTM;
      }
      return a.activeTM - b.activeTM;
    });

    return filtered;
  }, [enrichedRows, selectedSubtopicFilter, selectedVariantFilter, sortHighestFirst]);

  // Determine how many ATTEMPT columns to show (minimum 2: ATTEMPT 1 and ATTEMPT 2)
  const maxAttemptsCount = useMemo(() => {
    let max = 2;
    displayedRows.forEach((r) => {
      if (r.attemptBreakdowns.length > max) {
        max = r.attemptBreakdowns.length;
      }
    });
    return max;
  }, [displayedRows]);

  // Top 6-Metric Summary computed across the displayed rows
  const topSummary = useMemo(() => {
    const { fastLimit, mediumLimit, slowLimit } = ledger.timing;
    const totalItems = displayedRows.length;
    const maxMarks = totalItems * 3;
    const maxAccuracyMarks = totalItems * 1;
    const maxTimeMarks = totalItems * 2;

    let totalTM = 0;
    let totalA = 0;
    let totalT = 0;

    let fastCount = 0;
    let slowMedCount = 0;
    let ultraSlowCount = 0;

    displayedRows.forEach((row) => {
      totalTM += row.activeTM;
      totalA += row.activeA;
      totalT += row.activeT;

      if (row.activeStatus === 'C') {
        if (row.activeSeconds <= fastLimit) fastCount += 1;
        else if (row.activeSeconds <= mediumLimit) slowMedCount += 1;
        else if (row.activeSeconds <= slowLimit) ultraSlowCount += 1;
      }
    });

    totalTM = Number(totalTM.toFixed(2));
    totalA = Number(totalA.toFixed(2));
    totalT = Number(totalT.toFixed(2));

    const marksPct = maxMarks > 0 ? (totalTM / maxMarks) * 100 : 0;
    const accPct = maxAccuracyMarks > 0 ? (totalA / maxAccuracyMarks) * 100 : 0;
    const timePct = maxTimeMarks > 0 ? (totalT / maxTimeMarks) * 100 : 0;

    return {
      totalItems,
      maxMarks,
      maxAccuracyMarks,
      maxTimeMarks,
      totalTM,
      totalA,
      totalT,
      marksPct,
      accPct,
      timePct,
      fastCount,
      fastMarks: fastCount * 2,
      slowMedCount,
      slowMedMarks: slowMedCount * 1,
      ultraSlowCount,
      ultraSlowMarks: Number((ultraSlowCount * 0.5).toFixed(2)),
    };
  }, [displayedRows, ledger.timing]);

  // Micro Concept / Step-ID (T1, T2, T3) Accuracy & Weakness Breakdown for displayed test questions
  const testMicroDiagnostics = useMemo(
    () =>
      computeMicroConceptDiagnostics(
        displayedRows.map((r) => r.question),
        microConcepts,
        scannedTree.chapterId,
        stepsByQid,
        speedMode === 'A1' ? 'first' : 'latest'
      ),
    [displayedRows, microConcepts, scannedTree.chapterId, stepsByQid, speedMode]
  );

  const weakestTestStep = useMemo(() => {
    const attempted = testMicroDiagnostics.filter((r) => r.attemptedQuestionsCount > 0);
    if (attempted.length === 0) return null;
    return [...attempted].sort(
      (a, b) => a.rawAccuracyPct - b.rawAccuracyPct || b.wrongCount - a.wrongCount
    )[0];
  }, [testMicroDiagnostics]);

  return (
    <div className="w-full bg-[#F5F4EF] text-[#111827] space-y-3 font-mono select-none">
      {/* ====================================================================
          MAIN TEST ANALYSIS CARD (ANGLES THEME · NO TOP RETURN BUTTON · NO TELEMETRY BAR)
          ==================================================================== */}
      <div className="w-full bg-white border border-[#DFDDD4] rounded-xl shadow-2xs overflow-hidden">
        {/* TOP HEADER ROW: TEST ANALYSIS — [test id selector] & ACTIVE TOPIC */}
        <div className="bg-[#F9F8F4] border-b border-[#DFDDD4] px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-sans font-extrabold tracking-tight text-[#111827]">
              Test Analysis —
            </h1>

            <select
              value={currentSession?.id || ''}
              onChange={(e) => onSelectTestSession(e.target.value)}
              className="px-3 py-1.5 text-sm font-mono font-bold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] rounded-md focus:outline-none focus:border-[#1D4ED8] cursor-pointer"
            >
              {chapterSessions.map((sess) => (
                <option key={sess.id} value={sess.id}>
                  {sess.label} ({sess.questionUniqueIds.length} Qs)
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs font-mono text-[#6B7280]">
            Active Topic:{' '}
            <strong className="text-[#111827]">
              {ledger.chapterName} [{ledger.chapterCode}]
            </strong>
          </div>
        </div>

        {/* ==================================================================
            6-COLUMN TEST RESULTS SUMMARY STRIP
            ================================================================== */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-[#DFDDD4] border-b border-[#DFDDD4] bg-white">
          {/* 1. MARKS */}
          <div className="p-4 text-center space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
              MARKS
            </div>
            <div className="text-sm sm:text-base font-extrabold text-[#111827]">
              {fmtNum(topSummary.totalTM)}/{topSummary.maxMarks} ={' '}
              <span className="text-[#1D4ED8]">{topSummary.marksPct.toFixed(2)}%</span>
            </div>
            <div className="text-[10px] font-sans text-[#6B7280]">Total Score Index</div>
          </div>

          {/* 2. ACCURACY */}
          <div className="p-4 text-center space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
              ACCURACY
            </div>
            <div className="text-sm sm:text-base font-extrabold text-[#15803D]">
              {fmtNum(topSummary.totalA)}/{topSummary.maxAccuracyMarks} ={' '}
              {topSummary.accPct.toFixed(0)}%
            </div>
            <div className="text-[10px] font-sans text-[#6B7280]">Valid / Total Items</div>
          </div>

          {/* 3. TIME MARKS */}
          <div className="p-4 text-center space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
              TIME MARKS
            </div>
            <div className="text-sm sm:text-base font-extrabold text-[#111827]">
              = {fmtNum(topSummary.totalT)}/{topSummary.maxTimeMarks} ={' '}
              <span className="text-[#1D4ED8]">{topSummary.timePct.toFixed(0)}%</span>
            </div>
            <div className="text-[10px] font-sans text-[#6B7280]">Temporal Factor</div>
          </div>

          {/* 4. FAST TIME MARKS */}
          <div className="p-4 text-center space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#15803D]">
              FAST TIME MARKS
            </div>
            <div className="text-sm sm:text-base font-extrabold text-[#15803D]">
              {topSummary.fastCount}×2 = {topSummary.fastMarks} marks
            </div>
            <div className="text-[10px] font-sans text-[#6B7280]">
              &lt; {ledger.timing.fastLimit}s threshold
            </div>
          </div>

          {/* 5. SLOW TIME MARKS (MEDIUM WINDOW) */}
          <div className="p-4 text-center space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
              SLOW TIME MARKS
            </div>
            <div className="text-sm sm:text-base font-extrabold text-[#111827]">
              {topSummary.slowMedCount}×1 = {topSummary.slowMedMarks} marks
            </div>
            <div className="text-[10px] font-sans text-[#6B7280]">
              {ledger.timing.fastLimit}s - {ledger.timing.mediumLimit}s window
            </div>
          </div>

          {/* 6. ULTRA SLOW MARKS (SLOW WINDOW) */}
          <div className="p-4 text-center space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
              ULTRA SLOW MARKS
            </div>
            <div className="text-sm sm:text-base font-extrabold text-[#111827]">
              {topSummary.ultraSlowCount}×0.5 = {fmtNum(topSummary.ultraSlowMarks)} marks
            </div>
            <div className="text-[10px] font-sans text-[#6B7280]">
              {ledger.timing.mediumLimit}s - {ledger.timing.slowLimit}s window
            </div>
          </div>
        </div>

        {/* ==================================================================
            MIDDLE IN-DEPTH ANALYSIS FILTER & SORT BAR
            ================================================================== */}
        <div className="bg-[#F9F8F4] border-b border-[#DFDDD4] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Left: In-Depth Analysis + Speed = A1/An/Avg */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 font-bold text-[#1D4ED8]">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>In-Depth Analysis</span>
            </div>

            {/* Speed = A1/An/Avg */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#4B5563] font-bold">Speed = A1/An/Avg</span>
              <div className="inline-flex rounded border border-[#DFDDD4] bg-white p-0.5">
                {(['A1', 'An', 'Avg'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setSpeedMode(mode)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                      speedMode === mode
                        ? 'bg-[#15803D] text-white'
                        : 'text-[#4B5563] hover:text-[#111827]'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* S = S1/S2/All */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#4B5563] font-bold">
                S = {subtopicFilterOptions.map((s) => s.shortLabel).join('/')}/All
              </span>
              <div className="inline-flex rounded border border-[#DFDDD4] bg-white p-0.5">
                {subtopicFilterOptions.map((stOpt) => (
                  <button
                    key={stOpt.key}
                    type="button"
                    onClick={() => setSelectedSubtopicFilter(stOpt.key)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                      selectedSubtopicFilter === stOpt.key
                        ? 'bg-[#1D4ED8] text-white'
                        : 'text-[#4B5563] hover:text-[#111827]'
                    }`}
                    title={stOpt.fullName}
                  >
                    {stOpt.shortLabel}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSelectedSubtopicFilter('ALL')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                    selectedSubtopicFilter === 'ALL'
                      ? 'bg-[#1D4ED8] text-white'
                      : 'text-[#4B5563] hover:text-[#111827]'
                  }`}
                >
                  All
                </button>
              </div>
            </div>

            {/* V = V1/V2/All */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#4B5563] font-bold">
                V = {variantFilterOptions.map((v) => v.code).join('/')}/All
              </span>
              <div className="inline-flex rounded border border-[#DFDDD4] bg-white p-0.5">
                {variantFilterOptions.map((vOpt) => (
                  <button
                    key={vOpt.code}
                    type="button"
                    onClick={() => setSelectedVariantFilter(vOpt.code)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                      selectedVariantFilter === vOpt.code
                        ? 'bg-[#1D4ED8] text-white'
                        : 'text-[#4B5563] hover:text-[#111827]'
                    }`}
                  >
                    {vOpt.code}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSelectedVariantFilter('ALL')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                    selectedVariantFilter === 'ALL'
                      ? 'bg-[#1D4ED8] text-white'
                      : 'text-[#4B5563] hover:text-[#111827]'
                  }`}
                >
                  All
                </button>
              </div>
            </div>
          </div>

          {/* Right: SELECTION = Highest marks to lowest marks */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#4B5563] font-bold">SELECTION =</span>
            <button
              type="button"
              onClick={() => setSortHighestFirst((prev) => !prev)}
              className="px-2.5 py-1 rounded bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] text-[11px] font-bold transition-colors cursor-pointer"
            >
              {sortHighestFirst
                ? 'Highest marks to lowest marks'
                : 'Lowest marks to highest marks'}
            </button>
          </div>
        </div>

        {/* ==================================================================
            BOTTOM MULTI-ATTEMPT COMPARISON TABLE
            (USES THE EXACT SAME QUESTION UNIQUE IDs TO FETCH ATTEMPTS FROM STORAGE)
            ================================================================== */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F9F8F4] border-b border-[#DFDDD4] text-[10px] uppercase tracking-wider text-[#6B7280]">
                <th className="py-3 px-4 w-16">Q.NO</th>
                <th className="py-3 px-4">UNIQUE ID</th>
                <th className="py-3 px-4">STEP-ID CHAIN</th>
                <th className="py-3 px-4">SUBTOPIC</th>
                <th className="py-3 px-4">VARIANT</th>
                {Array.from({ length: maxAttemptsCount }).map((_, aIdx) => (
                  <th key={`attempt-col-${aIdx}`} className="py-3 px-4 text-center">
                    ATTEMPT {aIdx + 1} ( TM , A , T )
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EFEA]">
              {displayedRows.map((row, rIdx) => (
                <tr key={row.question.uniqueId} className="hover:bg-[#F9F8F4]/70">
                  <td className="py-3 px-4 font-bold text-[#6B7280]">{rIdx + 1})</td>
                  <td className="py-3 px-4 font-bold text-[#1D4ED8]">
                    {row.question.uniqueId}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] text-[11px] font-extrabold">
                      {row.stepChainId}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-sans font-semibold text-[#111827]">
                    {row.subtopicName}
                  </td>
                  <td className="py-3 px-4 font-sans text-[#374151]">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                      <span>{row.variantLabel}</span>
                    </span>
                  </td>

                  {Array.from({ length: maxAttemptsCount }).map((_, aIdx) => {
                    const attempt = row.attemptBreakdowns[aIdx];
                    if (!attempt || !attempt.exists) {
                      return (
                        <td
                          key={`${row.question.uniqueId}-att-${aIdx}`}
                          className="py-3 px-4 text-center font-bold text-[#9CA3AF]"
                        >
                          (0, 0, 0)
                        </td>
                      );
                    }

                    const colorClass =
                      attempt.TM >= 2.5
                        ? 'text-[#15803D]'
                        : attempt.TM > 0
                          ? 'text-[#1D4ED8]'
                          : 'text-[#DC2626]';

                    return (
                      <td
                        key={`${row.question.uniqueId}-att-${aIdx}`}
                        className={`py-3 px-4 text-center font-extrabold ${colorClass}`}
                      >
                        ({fmtNum(attempt.TM)}, {fmtNum(attempt.A)}, {fmtNum(attempt.T)})
                      </td>
                    );
                  })}
                </tr>
              ))}

              {displayedRows.length === 0 && (
                <tr>
                  <td
                    colSpan={5 + maxAttemptsCount}
                    className="py-8 text-center text-xs text-[#6B7280]"
                  >
                    No questions match the selected Subtopic (S) or Variant (V) filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ====================================================================
          MICRO CONCEPT / STEP-ID (T1, T2, T3) ACCURACY & WEAKNESS BREAKDOWN
          (COMPUTED FROM THE SAME UNIQUE QUESTION IDs IN THIS TEST)
          ==================================================================== */}
      <div className="w-full bg-white border border-[#DFDDD4] rounded-xl p-4 space-y-3.5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E3DC] pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#111827]">
              <span className="w-2 h-2 rounded-full bg-[#1D4ED8]" />
              <span>
                STEP-ID / MICRO CONCEPT (BASE IDs, TG, Tu) ACCURACY &amp; WEAKNESS BREAKDOWN
              </span>
              <span className="px-2 py-0.5 text-[10px] bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] rounded font-bold">
                EVALUATED ATTEMPT: {speedMode === 'A1' ? 'A1 (FIRST)' : 'An (LATEST)'}
              </span>
            </div>
            <div className="text-[11px] font-sans text-[#6B7280] mt-0.5">
              Aggregates how many test questions involve each Step-ID (Micro Concept), the exact
              Correct : Wrong ratio, and accuracy percentage up to the micro-ID level to pinpoint
              your weakest solving step.
            </div>
          </div>

          {weakestTestStep && (
            <div
              className={`px-3 py-1.5 rounded-md border text-xs font-bold flex items-center gap-2 ${
                weakestTestStep.rawAccuracyPct < 60 || weakestTestStep.wrongCount > 0
                  ? 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]'
                  : 'bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]'
              }`}
            >
              <span>
                Weakest Step:{' '}
                <strong className="underline">{weakestTestStep.stepCode}</strong> (
                {weakestTestStep.stepName})
              </span>
              <span>·</span>
              <span>{weakestTestStep.correctToWrongRatioLabel}</span>
              <span>·</span>
              <span>{weakestTestStep.rawAccuracyPct.toFixed(2)}% Accuracy</span>
            </div>
          )}
        </div>

        <div className="overflow-x-auto border border-[#DFDDD4] rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F9F8F4] border-b border-[#DFDDD4] text-[10px] uppercase tracking-wider text-[#6B7280]">
                <th className="py-2.5 px-3">STEP-ID</th>
                <th className="py-2.5 px-3">MICRO CONCEPT NAME</th>
                <th className="py-2.5 px-3">INVOLVED UNIQUE QUESTION IDs</th>
                <th className="py-2.5 px-3 text-center">INVOLVED Qs</th>
                <th className="py-2.5 px-3 text-center">CORRECT : WRONG RATIO</th>
                <th className="py-2.5 px-3 text-right">STEP ACCURACY %</th>
                <th className="py-2.5 px-3 text-right">NET VALUATION %</th>
                <th className="py-2.5 px-3 text-center">STEP STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EFEA]">
              {testMicroDiagnostics.map((row) => {
                const statusBadge =
                  row.diagnosticStatus === 'WEAK STEP'
                    ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
                    : row.diagnosticStatus === 'MODERATE'
                      ? 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]'
                      : row.diagnosticStatus === 'STRONG'
                        ? 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]'
                        : 'bg-[#F3F4F6] text-[#6B7280] border-[#D1D5DB]';

                return (
                  <tr key={row.stepCode} className="hover:bg-[#F9F8F4]/70">
                    <td className="py-3 px-3 font-extrabold text-[#1D4ED8]">
                      <span className="px-2 py-0.5 rounded bg-[#EFF6FF] border border-[#BFDBFE]">
                        {row.stepCode}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans font-bold text-[#111827]">
                      {row.stepName}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {row.involvedQuestions.map((iq) => {
                          const chipStyle =
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
                              className={`px-2 py-0.5 rounded border text-[10px] font-bold ${chipStyle}`}
                            >
                              {iq.uniqueId} ({iq.status})
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-[#111827]">
                      {row.involvedQuestionsCount} Qs ({row.attemptedQuestionsCount} Att)
                    </td>
                    <td className="py-3 px-3 text-center font-extrabold text-[#111827]">
                      {row.correctToWrongRatioLabel}
                      {row.skippedCount > 0 && (
                        <span className="text-[10px] text-[#D97706] ml-1">
                          ({row.skippedCount}S)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span
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
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-[#1D4ED8]">
                      {row.netAccuracyValuationPct.toFixed(2)}%
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded border text-[10px] font-extrabold uppercase ${statusBadge}`}
                      >
                        {row.diagnosticStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ====================================================================
          BOTTOM NAVIGATION BAR: RETURN TO QUESTION CARDS OR TRACKER PAGE 1
          ==================================================================== */}
      <div className="w-full bg-white border border-[#DFDDD4] rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <button
          type="button"
          onClick={onBackToQuestionCards}
          className="px-4 py-2 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] rounded-md text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>← Back to Question Cards</span>
        </button>

        <button
          type="button"
          onClick={onGoToTrackerPageOne}
          className="px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white border border-[#1D4ED8] rounded-md text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
        >
          <span>View Updated Marks in Chapter Tracker (Page 1)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
