import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { ChapterLedger } from './TrackerPageOne';
import type {
  DomainItem,
  ChapterItem,
  SubtopicItem,
  ConceptItem,
  MicroConceptItem,
} from './ExamRegistryDashboard';
import {
  scanChapterStorageAndMarks,
  computeMicroConceptDiagnostics,
  pickWeakestMicroStep,
  sortMicroConceptDiagnostics,
  type MicroDiagnosticSortMode,
  type ExplanationStepItem,
} from '../utils/mkmlStorageScanner';

interface TrackerQiqTabProps {
  ledger: ChapterLedger;
  allLedgers: Record<string, ChapterLedger>;
  onSelectChapter: (chapterCode: string) => void;
  domains: DomainItem[];
  chapters: ChapterItem[];
  subtopics: SubtopicItem[];
  concepts: ConceptItem[];
  microConcepts: MicroConceptItem[];
  stepsByQid: Record<string, ExplanationStepItem[]>;
  liveChapterMkml?: string;
}

export const TrackerQiqTab: React.FC<TrackerQiqTabProps> = ({
  ledger,
  allLedgers,
  onSelectChapter,
  domains,
  chapters,
  subtopics,
  concepts,
  microConcepts,
  stepsByQid,
  liveChapterMkml,
}) => {
  const [selectedScopeId, setSelectedScopeId] = useState<string>('ALL');
  const [microSortMode, setMicroSortMode] = useState<MicroDiagnosticSortMode>('weakness');
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

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

  const scopeOptions = useMemo(() => {
    const opts: { id: string; label: string; count: number }[] = [
      {
        id: 'ALL',
        label: `Entire Chapter (${scannedTree.allQuestions.length} Qs)`,
        count: scannedTree.allQuestions.length,
      },
    ];
    scannedTree.subtopics.forEach((st) => {
      opts.push({
        id: st.subtopicId,
        label: `Subtopic: ${st.subtopicName} [${st.subtopicCode}] (${st.questions.length} Qs)`,
        count: st.questions.length,
      });
      st.concepts.forEach((con) => {
        opts.push({
          id: con.conceptId,
          label: `↳ ${st.subtopicCode} · ${con.conceptName} [${con.conceptCode}] (${con.questions.length} Qs)`,
          count: con.questions.length,
        });
      });
    });
    return opts;
  }, [scannedTree]);

  const effectiveScopeId = useMemo(() => {
    if (selectedScopeId === 'ALL') return 'ALL';
    if (scopeOptions.some((o) => o.id === selectedScopeId)) return selectedScopeId;
    return 'ALL';
  }, [selectedScopeId, scopeOptions]);

  const scopedQuestions = useMemo(() => {
    if (effectiveScopeId === 'ALL') return scannedTree.allQuestions;
    for (const st of scannedTree.subtopics) {
      if (st.subtopicId === effectiveScopeId) return st.questions;
      for (const con of st.concepts) {
        if (con.conceptId === effectiveScopeId) return con.questions;
      }
    }
    return scannedTree.allQuestions;
  }, [effectiveScopeId, scannedTree]);

  const microConceptDiagnostics = useMemo(
    () =>
      sortMicroConceptDiagnostics(
        computeMicroConceptDiagnostics(
          scopedQuestions,
          microConcepts,
          scannedTree.chapterId,
          stepsByQid,
          'latest'
        ),
        microSortMode
      ),
    [scopedQuestions, microConcepts, scannedTree.chapterId, stepsByQid, microSortMode]
  );

  const weakestMicroStep = useMemo(
    () => pickWeakestMicroStep(microConceptDiagnostics),
    [microConceptDiagnostics]
  );

  const toggleRowExpanded = (stepCode: string) => {
    setExpandedRows((prev) => ({ ...prev, [stepCode]: !prev[stepCode] }));
  };

  return (
    <div className="w-full space-y-2 font-sans select-none text-[#111827]">
      {/* BREADCRUMB HEADER */}
      <div className="w-full bg-white border border-[#DFDDD4] rounded-lg px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono shadow-2xs">
        <div className="flex flex-wrap items-center gap-2 text-[#6B7280] uppercase tracking-wider">
          <span>ANGLES</span>
          <span>/</span>
          <span className="text-[#1D4ED8] font-bold">11 QIQ · STEP-ID DIAGNOSTICS</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[#6B7280]">
          <span>
            CHAPTER POOL: <strong className="text-[#111827]">{scannedTree.allQuestions.length} Qs</strong>
          </span>
          <span>·</span>
          <span>
            TRACKED STEPS: <strong className="text-[#1D4ED8]">{microConceptDiagnostics.length}</strong>
          </span>
        </div>
      </div>

      {/* TITLE & CHAPTER / SCOPE SELECTOR */}
      <div className="w-full bg-white border border-[#DFDDD4] rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] rounded">
              QIQ · STEP TABLE
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6B7280]">
              MICRO CONCEPT WEAKNESS ROLLUP
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-1.5">
            <h1 className="text-2xl font-extrabold tracking-tight text-[#111827]">
              Question in Question (QIQ)
            </h1>
            <select
              value={ledger.chapterCode}
              onChange={(e) => {
                setSelectedScopeId('ALL');
                setExpandedRows({});
                onSelectChapter(e.target.value);
              }}
              className="px-2.5 py-1 text-xs font-mono font-bold bg-[#F9F8F4] border border-[#DFDDD4] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8] cursor-pointer"
            >
              {Object.values(allLedgers).map((l) => (
                <option key={l.chapterCode} value={l.chapterCode}>
                  {l.chapterName} [{l.chapterCode}]
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase text-[#6B7280] font-bold">SCOPE:</span>
            <select
              value={effectiveScopeId}
              onChange={(e) => setSelectedScopeId(e.target.value)}
              className="px-2.5 py-1 text-xs font-mono font-bold bg-[#F9F8F4] border border-[#DFDDD4] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8] cursor-pointer"
            >
              {scopeOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* MICRO CONCEPT / STEP-ID ACCURACY & WEAKNESS DIAGNOSTIC */}
      <div className="w-full bg-white border border-[#DFDDD4] rounded-lg p-4 space-y-3.5 shadow-2xs font-mono">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E3DC] pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#111827]">
              <span className="w-2 h-2 rounded-full bg-[#1D4ED8]" />
              <span>
                MICRO CONCEPT / STEP-ID (BASE IDs, TG, Tu) ACCURACY &amp; WEAKNESS DIAGNOSTIC
              </span>
              <span className="px-2 py-0.5 text-[10px] bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] rounded font-bold">
                UNIQUE ID → STEP-ID ROLLUP
              </span>
            </div>
            <div className="text-[11px] font-sans text-[#6B7280] mt-0.5">
              Ranks every Micro Concept using percentage-checked <strong>Weakness Index</strong>{' '}
              <code>Fail% × n/(n+1)</code> so low-frequency 100%-failed concepts outrank noisy 50%
              concepts while guarding against 1-question blips.
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase text-[#6B7280] font-bold">RANK BY:</span>
              <div className="inline-flex rounded border border-[#DFDDD4] bg-[#F9F8F4] p-0.5">
                {(
                  [
                    ['weakness', 'Weakness Index'],
                    ['failure-pct', 'Fail %'],
                    ['wrong-count', 'Wrong Count'],
                    ['step-id', 'Step ID'],
                  ] as const
                ).map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setMicroSortMode(mode)}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                      microSortMode === mode
                        ? 'bg-[#1D4ED8] text-white'
                        : 'text-[#4B5563] hover:text-[#111827]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* WEAKEST STEP SPOTTED BANNER */}
        {weakestMicroStep && (() => {
          const isWeak =
            weakestMicroStep.diagnosticStatus === 'CRITICAL WEAK' ||
            weakestMicroStep.diagnosticStatus === 'WEAK STEP';
          const isModerate = weakestMicroStep.diagnosticStatus === 'MODERATE';
          const bannerClasses = isWeak
            ? 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
            : isModerate
              ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]'
              : 'bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]';
          const pillClasses = isWeak
            ? 'bg-[#DC2626] text-white'
            : isModerate
              ? 'bg-[#D97706] text-white'
              : 'bg-[#15803D] text-white';
          const pillText =
            weakestMicroStep.diagnosticStatus === 'CRITICAL WEAK'
              ? 'CRITICAL WEAK STEP'
              : weakestMicroStep.diagnosticStatus === 'WEAK STEP'
                ? 'WEAKEST STEP SPOTTED'
                : isModerate
                  ? 'WATCH STEP'
                  : 'ALL STEPS STRONG';

          return (
            <div
              className={`px-3.5 py-2.5 rounded-lg border flex flex-wrap items-center justify-between gap-2 text-xs ${bannerClasses}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${pillClasses}`}
                >
                  {pillText}
                </span>
                <span className="font-sans font-bold">
                  Step <strong className="font-mono">{weakestMicroStep.stepCode}</strong> (
                  {weakestMicroStep.stepName}) —{' '}
                  <strong>{weakestMicroStep.attemptedQuestionsCount}</strong> /{' '}
                  {weakestMicroStep.involvedQuestionsCount} Attempted · Ratio:{' '}
                  <strong className="font-mono">
                    {weakestMicroStep.correctToWrongRatioLabel}
                  </strong>
                </span>
                {weakestMicroStep.sampleConfidence === 'LOW' && (
                  <span className="px-1.5 py-0.5 rounded bg-white/80 border border-current/25 text-[10px] font-mono font-bold">
                    LOW SAMPLE (n={weakestMicroStep.attemptedQuestionsCount})
                  </span>
                )}
              </div>

              <div className="font-extrabold">
                Weakness Index: {weakestMicroStep.weaknessIndex.toFixed(1)} · Fail Rate:{' '}
                {weakestMicroStep.failureRatePct.toFixed(1)}% · Accuracy:{' '}
                {weakestMicroStep.rawAccuracyPct.toFixed(1)}%
              </div>
            </div>
          );
        })()}

        {/* COMPACT MICRO CONCEPT / STEP-ID DIAGNOSTIC TABLE */}
        <div className="overflow-x-auto border border-[#DFDDD4] rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F9F8F4] border-b border-[#DFDDD4] text-[10px] uppercase tracking-wider text-[#6B7280]">
                <th className="py-2.5 px-3">STEP-ID / MICRO CONCEPT</th>
                <th className="py-2.5 px-3 whitespace-nowrap">INVOLVED QUESTIONS</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">C / W / S / NA</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">C : W RATIO</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">WEAKNESS INDEX</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">STEP ACCURACY %</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">NET VALUATION %</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">DIAGNOSTIC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EFEA]">
              {microConceptDiagnostics.map((row) => {
                const isExpanded = Boolean(expandedRows[row.stepCode]);
                const badgeClass =
                  row.diagnosticStatus === 'CRITICAL WEAK'
                    ? 'bg-[#DC2626] text-white border-[#B91C1C]'
                    : row.diagnosticStatus === 'WEAK STEP'
                      ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
                      : row.diagnosticStatus === 'MODERATE'
                        ? 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]'
                        : row.diagnosticStatus === 'STRONG'
                          ? 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]'
                          : 'bg-[#F3F4F6] text-[#6B7280] border-[#D1D5DB]';

                return (
                  <React.Fragment key={row.stepCode}>
                    <tr className="hover:bg-[#F9F8F4]/80">
                      <td className="py-3 px-3 align-top">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] font-extrabold text-xs whitespace-nowrap">
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

                      <td className="py-3 px-3 align-top whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => toggleRowExpanded(row.stepCode)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[#DFDDD4] bg-[#F9F8F4] hover:bg-[#EFF6FF] hover:border-[#BFDBFE] text-[#1D4ED8] text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {row.involvedQuestionsCount} Qs · {isExpanded ? 'Hide' : 'View'}
                          </span>
                        </button>
                      </td>

                      <td className="py-3 px-3 align-top text-center font-bold whitespace-nowrap">
                        <span className="text-[#15803D]">{row.correctCount}C</span>
                        {' / '}
                        <span className="text-[#DC2626]">{row.wrongCount}W</span>
                        {' / '}
                        <span className="text-[#D97706]">{row.skippedCount}S</span>
                        {' / '}
                        <span className="text-[#6B7280]">{row.unattemptedCount}NA</span>
                      </td>

                      <td className="py-3 px-3 align-top text-center font-extrabold text-[#111827] whitespace-nowrap">
                        {row.correctToWrongRatioLabel}
                      </td>

                      <td className="py-3 px-3 align-top text-right whitespace-nowrap">
                        <div
                          className={`font-extrabold text-sm ${
                            row.attemptedQuestionsCount === 0
                              ? 'text-[#6B7280]'
                              : row.weaknessIndex >= 55
                                ? 'text-[#991B1B]'
                                : row.weaknessIndex >= 35
                                  ? 'text-[#DC2626]'
                                  : row.weaknessIndex >= 15
                                    ? 'text-[#D97706]'
                                    : 'text-[#15803D]'
                          }`}
                        >
                          {row.attemptedQuestionsCount === 0
                            ? '—'
                            : `${row.weaknessIndex.toFixed(1)}`}
                        </div>
                        <div className="text-[10px] text-[#6B7280]">
                          Fail {row.failureRatePct.toFixed(1)}% · n={row.attemptedQuestionsCount}
                        </div>
                        {row.sampleConfidence === 'LOW' && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] text-[9px] font-bold">
                            LOW SAMPLE
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 align-top text-right whitespace-nowrap">
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

                      <td className="py-3 px-3 align-top text-right whitespace-nowrap">
                        <div
                          className={`font-extrabold ${
                            row.netAccuracyValuationPct < 50 ? 'text-[#DC2626]' : 'text-[#1D4ED8]'
                          }`}
                        >
                          {row.netAccuracyValuationPct.toFixed(2)}%
                        </div>
                        <div className="text-[10px] text-[#6B7280]">+1C / -0.5W / -0.2S</div>
                      </td>

                      <td className="py-3 px-3 align-top text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded border text-[10px] font-extrabold uppercase ${badgeClass}`}
                        >
                          {row.diagnosticStatus}
                        </span>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-[#FBFBF7]">
                        <td colSpan={8} className="px-4 py-3 border-t border-[#E5E3DC]">
                          <div className="text-[10px] uppercase tracking-wider text-[#6B7280] font-bold mb-2">
                            INVOLVED UNIQUE QUESTION IDs ({row.involvedQuestionsCount}) —{' '}
                            {row.stepCode}
                          </div>
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
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {microConceptDiagnostics.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-xs text-[#6B7280]">
                    No Micro Concepts / Step-IDs found for this chapter or scope.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
