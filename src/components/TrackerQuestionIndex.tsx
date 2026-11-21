import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  Check,
  Sliders,
  Zap,
} from 'lucide-react';
import type {
  ChapterLedger,
  AttemptStatus,
  AttemptTuple,
} from './TrackerPageOne';
import {
  scanChapterStorageAndMarks,
} from '../utils/mkmlStorageScanner';
import type {
  DomainItem,
  ChapterItem,
  SubtopicItem,
  ConceptItem,
  MicroConceptItem,
} from './ExamRegistryDashboard';
import type { QuestionCardPayloadItem } from './TrackerQuestionCards';

interface Props {
  ledger: ChapterLedger;
  allLedgers: Record<string, ChapterLedger>;
  onSelectChapter: (chapterCode: string) => void;
  onLaunchQuestionCards: (
    selectedItems: QuestionCardPayloadItem[],
    modality: 'study' | 'shallow' | 'full'
  ) => void;
  onBackToPartTwo: () => void;
  onGoToTrackerPageOne: () => void;
  domains: DomainItem[];
  chapters: ChapterItem[];
  subtopics: SubtopicItem[];
  concepts: ConceptItem[];
  microConcepts: MicroConceptItem[];
  liveChapterMkml?: string;
}

function getLatestAttemptSummary(
  attempts: AttemptTuple[],
  fastLimit: number,
  mediumLimit: number,
  slowLimit: number
): {
  isAttempted: boolean;
  status: AttemptStatus | null;
  accMark: number;
  timeMark: number;
  totalMark: number;
} {
  if (!attempts || attempts.length === 0) {
    return {
      isAttempted: false,
      status: null,
      accMark: 0,
      timeMark: 0,
      totalMark: 0,
    };
  }
  const latest = attempts[attempts.length - 1];
  const [status, seconds] = latest;
  if (status === 'W') {
    return {
      isAttempted: true,
      status: 'W',
      accMark: -0.5,
      timeMark: 0,
      totalMark: -0.5,
    };
  }
  if (status === 'S') {
    return {
      isAttempted: true,
      status: 'S',
      accMark: -0.2,
      timeMark: 0,
      totalMark: -0.2,
    };
  }
  let timeMark = 0;
  if (seconds <= fastLimit) timeMark = 2.0;
  else if (seconds <= mediumLimit) timeMark = 1.0;
  else if (seconds <= slowLimit) timeMark = 0.5;

  return {
    isAttempted: true,
    status: 'C',
    accMark: 1.0,
    timeMark,
    totalMark: Number((1.0 + timeMark).toFixed(2)),
  };
}

function formatSignedMark(val: number, decimals = 1): string {
  if (val > 0) return `+${val.toFixed(decimals)}`;
  if (val < 0) return val.toFixed(decimals);
  return '0';
}

export const TrackerQuestionIndex: React.FC<Props> = ({
  ledger,
  allLedgers,
  onSelectChapter,
  onLaunchQuestionCards,
  onBackToPartTwo,
  onGoToTrackerPageOne,
  domains,
  chapters,
  subtopics,
  concepts,
  microConcepts,
  liveChapterMkml,
}) => {
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

  // All concept IDs in this chapter
  const allConceptIds = useMemo(() => {
    const ids: string[] = [];
    scannedTree.subtopics.forEach((st) => {
      st.concepts.forEach((con) => {
        ids.push(con.conceptId);
      });
    });
    return ids;
  }, [scannedTree]);

  // Selected Concept IDs state (defaults to all active)
  const [deselectedConceptIds, setDeselectedConceptIds] = useState<Record<string, boolean>>({});
  const [sortOrder, setSortOrder] = useState<'high-to-low' | 'low-to-high'>('high-to-low');
  const [poolPreference, setPoolPreference] = useState<'attempted' | 'full'>('full');
  const [executionModality, setExecutionModality] = useState<'study' | 'shallow' | 'full'>(
    'shallow'
  );
  const [copiedPaths, setCopiedPaths] = useState(false);

  const activeConceptIdSet = useMemo(() => {
    const set = new Set<string>();
    allConceptIds.forEach((id) => {
      if (!deselectedConceptIds[id]) {
        set.add(id);
      }
    });
    return set;
  }, [allConceptIds, deselectedConceptIds]);

  const areAllSelected = activeConceptIdSet.size === allConceptIds.length && allConceptIds.length > 0;

  const handleToggleAllConcepts = () => {
    if (areAllSelected) {
      const next: Record<string, boolean> = {};
      allConceptIds.forEach((id) => {
        next[id] = true;
      });
      setDeselectedConceptIds(next);
    } else {
      setDeselectedConceptIds({});
    }
  };

  const handleToggleConcept = (conceptId: string) => {
    setDeselectedConceptIds((prev) => ({
      ...prev,
      [conceptId]: !prev[conceptId],
    }));
  };

  const handleToggleSubtopic = (conceptIdsInSubtopic: string[]) => {
    const allActive = conceptIdsInSubtopic.every((id) => !deselectedConceptIds[id]);
    setDeselectedConceptIds((prev) => {
      const next = { ...prev };
      conceptIdsInSubtopic.forEach((id) => {
        next[id] = allActive;
      });
      return next;
    });
  };

  // Build selected path labels (SubtopicCode-ConceptCode, e.g. BWR-V1, BWR-V2, RST-V1)
  const selectedPathsList = useMemo(() => {
    const list: string[] = [];
    scannedTree.subtopics.forEach((st) => {
      st.concepts.forEach((con) => {
        if (activeConceptIdSet.has(con.conceptId)) {
          list.push(`${st.subtopicCode}-${con.conceptCode}`);
        }
      });
    });
    return list;
  }, [scannedTree, activeConceptIdSet]);

  const formattedPathsString = `[${selectedPathsList.join(', ')}]`;

  // Questions matching the selected Subtopic Matrix + Pool Preference
  const filteredAndSortedQuestions = useMemo(() => {
    const { fastLimit, mediumLimit, slowLimit } = ledger.timing;

    const matching = scannedTree.allQuestions
      .filter((q) => activeConceptIdSet.has(q.conceptId))
      .map((q) => {
        const pathLabel = `${q.subtopicShortCode}-${q.conceptShortCode}`;
        const summary = getLatestAttemptSummary(
          q.attempts,
          fastLimit,
          mediumLimit,
          slowLimit
        );
        return {
          question: q,
          pathLabel,
          ...summary,
        };
      })
      .filter((item) => {
        if (poolPreference === 'attempted') {
          return item.isAttempted;
        }
        return true;
      });

    matching.sort((a, b) => {
      // Unattempted questions always sit at the bottom
      if (a.isAttempted && !b.isAttempted) return -1;
      if (!a.isAttempted && b.isAttempted) return 1;
      if (!a.isAttempted && !b.isAttempted) {
        return a.question.uniqueId.localeCompare(b.question.uniqueId);
      }
      if (sortOrder === 'high-to-low') {
        return b.totalMark - a.totalMark;
      }
      return a.totalMark - b.totalMark;
    });

    return matching;
  }, [scannedTree, activeConceptIdSet, poolPreference, sortOrder, ledger.timing]);

  const maxQuestionLimit = filteredAndSortedQuestions.length;
  const [questionLimitOverride, setQuestionLimitOverride] = useState<number | null>(null);

  const effectiveQuestionCount = useMemo(() => {
    if (maxQuestionLimit === 0) return 0;
    if (questionLimitOverride === null || questionLimitOverride > maxQuestionLimit) {
      return maxQuestionLimit;
    }
    return Math.max(1, questionLimitOverride);
  }, [maxQuestionLimit, questionLimitOverride]);

  const displayedQuestions = useMemo(
    () => filteredAndSortedQuestions.slice(0, effectiveQuestionCount),
    [filteredAndSortedQuestions, effectiveQuestionCount]
  );

  const handleCopyPaths = () => {
    navigator.clipboard.writeText(formattedPathsString);
    setCopiedPaths(true);
    setTimeout(() => setCopiedPaths(false), 1600);
  };

  const handleConfirmAndProceed = () => {
    if (displayedQuestions.length === 0) return;
    onLaunchQuestionCards(
      displayedQuestions.map((item) => ({
        question: item.question,
        pathLabel: item.pathLabel,
      })),
      executionModality
    );
  };

  return (
    <div className="w-full bg-[#F5F4EF] text-[#111827] space-y-2.5 font-mono select-none">
      {/* ====================================================================
          HEADER CARD: QUESTION INDEX TITLE + TOTAL POOL & SELECTED COUNTERS
          (ALL UNWANTED PROTOCOL BARS & SUBTITLES REMOVED)
          ==================================================================== */}
      <div className="w-full bg-white border border-[#DFDDD4] rounded-lg px-5 py-4 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-sans font-extrabold tracking-tight text-[#111827]">
            Question Index
          </h1>

          <select
            value={ledger.chapterCode}
            onChange={(e) => {
              onSelectChapter(e.target.value);
              setDeselectedConceptIds({});
              setQuestionLimitOverride(null);
            }}
            className="px-3 py-1 text-xs font-sans font-semibold bg-[#F9F8F4] text-[#374151] border border-[#DFDDD4] rounded-md focus:outline-none focus:border-[#1D4ED8] cursor-pointer"
          >
            {Object.values(allLedgers).map((l) => (
              <option key={l.chapterCode} value={l.chapterCode}>
                {l.chapterName} [{l.chapterCode}]
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2.5">
          {/* TOTAL POOL */}
          <div className="px-4 py-2 rounded-lg bg-[#F9F8F4] border border-[#DFDDD4] text-center min-w-[96px]">
            <div className="text-[10px] uppercase tracking-wider text-[#6B7280]">TOTAL POOL</div>
            <div className="text-xl font-extrabold text-[#111827] mt-0.5">
              {scannedTree.allQuestions.length} <span className="text-[#1D4ED8]">Q</span>
            </div>
          </div>

          {/* SELECTED */}
          <div className="px-4 py-2 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] text-center min-w-[96px]">
            <div className="text-[10px] uppercase tracking-wider text-[#15803D] font-bold">
              SELECTED
            </div>
            <div className="text-xl font-extrabold text-[#15803D] mt-0.5">
              {displayedQuestions.length} Q
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          MAIN 3-COLUMN GRID:
          1) SUBTOPIC MATRIX
          2) QUESTION INDEX (CENTER TABLE)
          3) QUESTION CARD ENTRY FORM
          ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch">
        {/* COLUMN 1: SUBTOPIC MATRIX (HIERARCHICAL SELECTION — NO UNWANTED FOOTER) */}
        <div className="lg:col-span-3 bg-white border border-[#DFDDD4] rounded-lg p-4 flex flex-col justify-between shadow-2xs">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#E5E3DC]">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#111827]">
                  SUBTOPIC MATRIX
                </div>
                <div className="text-[10px] uppercase tracking-wider text-[#6B7280] mt-0.5">
                  HIERARCHICAL SELECTION
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleAllConcepts}
                className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-[#F9F8F4] hover:bg-[#EFECE6] text-[#374151] border border-[#DFDDD4] rounded transition-colors cursor-pointer"
              >
                {areAllSelected ? 'DESELECT ALL' : 'SELECT ALL'}
              </button>
            </div>

            {/* Subtopics & Child Concepts Checkbox Tree */}
            <div className="space-y-4">
              {scannedTree.subtopics.map((st, sIdx) => {
                const subtopicConceptIds = st.concepts.map((c) => c.conceptId);
                const isSubtopicChecked =
                  subtopicConceptIds.length > 0 &&
                  subtopicConceptIds.some((id) => activeConceptIdSet.has(id));

                return (
                  <div key={st.subtopicId} className="space-y-2">
                    {/* Subtopic Row */}
                    <label className="flex items-center justify-between gap-2 cursor-pointer group">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isSubtopicChecked}
                          onChange={() => handleToggleSubtopic(subtopicConceptIds)}
                          className="w-4 h-4 accent-[#1D4ED8] rounded cursor-pointer"
                        />
                        <span className="text-xs font-sans font-bold text-[#111827] group-hover:text-[#1D4ED8]">
                          {sIdx + 1}) {st.subtopicName}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#6B7280]">
                        ({st.questions.length} q)
                      </span>
                    </label>

                    {/* Child Concept Rows */}
                    <div className="pl-6 space-y-1.5">
                      {st.concepts.map((con, cIdx) => {
                        const isChecked = activeConceptIdSet.has(con.conceptId);
                        const letter = String.fromCharCode(97 + cIdx); // a, b, c...
                        return (
                          <label
                            key={con.conceptId}
                            className="flex items-center justify-between gap-2 cursor-pointer py-0.5"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleConcept(con.conceptId)}
                                className="w-3.5 h-3.5 accent-[#1D4ED8] rounded cursor-pointer"
                              />
                              <span className="text-xs text-[#374151]">
                                {sIdx + 1}
                                {letter}) <strong className="text-[#111827]">{con.conceptCode}</strong>
                              </span>
                              <span className="text-[11px] text-[#6B7280]">
                                ({con.questions.length} q)
                              </span>
                            </div>

                            <span
                              className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded border ${
                                isChecked
                                  ? 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]'
                                  : 'bg-[#F9F8F4] text-[#9CA3AF] border-[#E5E3DC]'
                              }`}
                            >
                              {isChecked ? 'ACTIVE' : 'OFF'}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* COLUMN 2: CENTER QUESTION INDEX TABLE */}
        <div className="lg:col-span-5 bg-white border border-[#DFDDD4] rounded-lg p-4 flex flex-col justify-between shadow-2xs">
          <div className="space-y-3">
            {/* Header & Order Sort Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E5E3DC]">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#111827]">
                  QUESTION INDEX
                </div>
                <div className="text-[10px] uppercase tracking-wider text-[#6B7280] mt-0.5">
                  POOL VIEW: {displayedQuestions.length} ITEMS LOADED
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="text-[#6B7280] uppercase">ORDER:</span>
                <div className="inline-flex rounded-md border border-[#DFDDD4] bg-[#F9F8F4] p-0.5">
                  <button
                    type="button"
                    onClick={() => setSortOrder('high-to-low')}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                      sortOrder === 'high-to-low'
                        ? 'bg-[#1D4ED8] text-white'
                        : 'text-[#4B5563] hover:text-[#111827]'
                    }`}
                  >
                    HIGH → LOW
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortOrder('low-to-high')}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                      sortOrder === 'low-to-high'
                        ? 'bg-[#1D4ED8] text-white'
                        : 'text-[#4B5563] hover:text-[#111827]'
                    }`}
                  >
                    LOW → HIGH
                  </button>
                </div>
              </div>
            </div>

            {/* Formula Legend Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#6B7280] pb-1">
              <span>A = Accuracy • T = Time/Speed • Total = A + T</span>
              <span className="font-bold text-[#1D4ED8]">
                SORT: {sortOrder === 'high-to-low' ? 'HIGH → LOW' : 'LOW → HIGH'}
              </span>
            </div>

            {/* Question Index Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E5E3DC] text-[10px] uppercase tracking-wider text-[#6B7280]">
                    <th className="py-2 pr-2">S.NO</th>
                    <th className="py-2 px-2">UNIQUE ID</th>
                    <th className="py-2 px-2">PATH</th>
                    <th className="py-2 pl-2 text-right">MARKS (A, T) &amp; TOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EFEA]">
                  {displayedQuestions.map((item, idx) => (
                    <tr key={item.question.uniqueId} className="hover:bg-[#F9F8F4]/70">
                      <td className="py-2.5 pr-2 text-[#6B7280]">{idx + 1}</td>
                      <td className="py-2.5 px-2 font-bold text-[#1D4ED8]">
                        {item.question.uniqueId}
                      </td>
                      <td className="py-2.5 px-2">
                        <span className="px-2 py-0.5 text-[10px] bg-[#F9F8F4] text-[#374151] border border-[#DFDDD4] rounded">
                          {item.pathLabel}
                        </span>
                      </td>
                      <td className="py-2.5 pl-2 text-right">
                        {!item.isAttempted ? (
                          <span className="px-2 py-0.5 text-[10px] bg-[#F9F8F4] text-[#6B7280] border border-[#DFDDD4] rounded">
                            NIL (UNATTEMPTED)
                          </span>
                        ) : (
                          <div className="inline-flex items-center gap-1">
                            {/* Accuracy Badge */}
                            <span
                              className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${
                                item.accMark > 0
                                  ? 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]'
                                  : 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
                              }`}
                            >
                              A: {formatSignedMark(item.accMark)}
                            </span>

                            {/* Time Badge */}
                            <span
                              className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${
                                item.timeMark > 0
                                  ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]'
                                  : 'bg-[#F9F8F4] text-[#6B7280] border-[#DFDDD4]'
                              }`}
                            >
                              T: {item.timeMark > 0 ? `+${item.timeMark.toFixed(1)}` : '0'}
                            </span>

                            {/* Total Badge */}
                            <span
                              className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${
                                item.totalMark > 0
                                  ? 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]'
                                  : 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
                              }`}
                            >
                              {formatSignedMark(item.totalMark)}
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}

                  {displayedQuestions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-xs text-[#6B7280]">
                        No questions match the selected Subtopic Matrix / Pool filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Footer */}
          <div className="pt-3 mt-4 border-t border-[#E5E3DC] flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#6B7280]">
            <span>
              DISPLAYING {displayedQuestions.length > 0 ? 1 : 0} - {displayedQuestions.length} OF{' '}
              {filteredAndSortedQuestions.length} UNIQUE POOL NODES
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled
                className="px-2 py-1 rounded border border-[#DFDDD4] bg-[#F9F8F4] text-[#9CA3AF] cursor-not-allowed"
              >
                &lt; PREV
              </button>
              <span className="px-2.5 py-1 rounded border border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8] font-bold">
                01 / 01
              </span>
              <button
                type="button"
                disabled
                className="px-2 py-1 rounded border border-[#DFDDD4] bg-[#F9F8F4] text-[#9CA3AF] cursor-not-allowed"
              >
                NEXT &gt;
              </button>
            </div>
          </div>
        </div>

        {/* COLUMN 3: QUESTION CARD ENTRY FORM (EXECUTION PARAMETERS + CONFIRM AND PROCEED) */}
        <div className="lg:col-span-4 bg-white border border-[#DFDDD4] rounded-lg p-4 flex flex-col justify-between shadow-2xs">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#E5E3DC]">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#111827]">
                  QUESTION CARD ENTRY FORM
                </div>
                <div className="text-[10px] uppercase tracking-wider text-[#6B7280] mt-0.5">
                  EXECUTION PARAMETERS
                </div>
              </div>
              <Sliders className="w-4 h-4 text-[#1D4ED8]" />
            </div>

            {/* 1. INPUT PATHS / COPY SELECTED SUBTOPIC MATRIX */}
            <div className="space-y-1.5">
              <div className="text-[10px] uppercase tracking-wider text-[#6B7280] font-bold">
                INPUT PATHS / COPY SELECTED SUBTOPIC MATRIX
              </div>
              <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-[#F9F8F4] border border-[#DFDDD4]">
                <span className="text-xs font-bold text-[#15803D] truncate">
                  {formattedPathsString}
                </span>
                <button
                  type="button"
                  onClick={handleCopyPaths}
                  className="p-1.5 rounded bg-white hover:bg-[#EFF6FF] text-[#374151] hover:text-[#1D4ED8] border border-[#DFDDD4] transition-colors cursor-pointer shrink-0"
                  title="Copy selected subtopic-concept paths"
                >
                  {copiedPaths ? (
                    <Check className="w-3.5 h-3.5 text-[#15803D]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* 2. INPUT QUESTION RANGE / COUNT */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider">
                <span className="text-[#6B7280] font-bold">INPUT QUESTION RANGE / COUNT</span>
                <span className="text-[#1D4ED8] font-bold">
                  {effectiveQuestionCount} QUESTIONS
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
                <span>
                  Range: {effectiveQuestionCount > 0 ? '01' : '00'} - {effectiveQuestionCount}
                </span>
                <span>Limit: {maxQuestionLimit} Max</span>
              </div>
              <input
                type="range"
                min={maxQuestionLimit > 0 ? 1 : 0}
                max={maxQuestionLimit}
                value={effectiveQuestionCount}
                disabled={maxQuestionLimit === 0}
                onChange={(e) => setQuestionLimitOverride(parseInt(e.target.value, 10))}
                className="w-full accent-[#1D4ED8] cursor-pointer"
              />
            </div>

            {/* 3. QUESTION POOL PREFERENCE */}
            <div className="space-y-1.5">
              <div className="text-[10px] uppercase tracking-wider text-[#6B7280] font-bold">
                QUESTION POOL PREFERENCE
              </div>
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-md bg-[#F9F8F4] border border-[#DFDDD4]">
                <button
                  type="button"
                  onClick={() => setPoolPreference('attempted')}
                  className={`py-2 px-2 rounded text-xs font-sans font-semibold transition-colors cursor-pointer ${
                    poolPreference === 'attempted'
                      ? 'bg-[#1D4ED8] text-white shadow-2xs'
                      : 'text-[#374151] hover:bg-white'
                  }`}
                >
                  Attempted Questions
                </button>
                <button
                  type="button"
                  onClick={() => setPoolPreference('full')}
                  className={`py-2 px-2 rounded text-xs font-sans font-semibold transition-colors cursor-pointer ${
                    poolPreference === 'full'
                      ? 'bg-[#1D4ED8] text-white shadow-2xs'
                      : 'text-[#374151] hover:bg-white'
                  }`}
                >
                  Full Question Pool
                </button>
              </div>
              <div className="text-[11px] font-sans text-[#6B7280]">
                {poolPreference === 'full'
                  ? 'Prefers unattempted & high-entropy questions from full pool.'
                  : 'Filters exclusively to previously attempted questions in storage.'}
              </div>
            </div>

            {/* 4. EXECUTION MODALITY */}
            <div className="space-y-1.5">
              <div className="text-[10px] uppercase tracking-wider text-[#6B7280] font-bold">
                EXECUTION MODALITY
              </div>
              <div className="grid grid-cols-3 gap-1 p-1 rounded-md bg-[#F9F8F4] border border-[#DFDDD4]">
                <button
                  type="button"
                  onClick={() => setExecutionModality('study')}
                  className={`py-1.5 px-2 rounded text-xs font-sans font-semibold transition-colors cursor-pointer ${
                    executionModality === 'study'
                      ? 'bg-[#1D4ED8] text-white shadow-2xs'
                      : 'text-[#374151] hover:bg-white'
                  }`}
                >
                  Study Mode
                </button>
                <button
                  type="button"
                  onClick={() => setExecutionModality('shallow')}
                  className={`py-1.5 px-2 rounded text-xs font-sans font-semibold transition-colors cursor-pointer ${
                    executionModality === 'shallow'
                      ? 'bg-[#1D4ED8] text-white shadow-2xs'
                      : 'text-[#374151] hover:bg-white'
                  }`}
                >
                  Shallow Test
                </button>
                <button
                  type="button"
                  onClick={() => setExecutionModality('full')}
                  className={`py-1.5 px-2 rounded text-xs font-sans font-semibold transition-colors cursor-pointer ${
                    executionModality === 'full'
                      ? 'bg-[#1D4ED8] text-white shadow-2xs'
                      : 'text-[#374151] hover:bg-white'
                  }`}
                >
                  Full Test
                </button>
              </div>

              <div className="p-2.5 rounded-md bg-[#F9F8F4] border border-[#DFDDD4] text-[11px] font-sans text-[#4B5563] flex items-start gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#D97706] shrink-0 mt-0.5" />
                <span>
                  {executionModality === 'shallow' && (
                    <>
                      <strong className="text-[#111827]">Shallow Test:</strong> Answers &amp;
                      explanation reveal upon clicking an option. Does not alter attempts.
                    </>
                  )}
                  {executionModality === 'study' && (
                    <>
                      <strong className="text-[#111827]">Study Mode:</strong> Shows full question
                      cards with correct answers revealed for direct review.
                    </>
                  )}
                  {executionModality === 'full' && (
                    <>
                      <strong className="text-[#111827]">Full Test:</strong> Evaluates selected
                      questions on submit and updates marks in Chapter Tracker Page 1.
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* CLEAN "CONFIRM AND PROCEED" BUTTON (NO GITHUB / NO CHECKSUM TELEMETRY) */}
          <div className="pt-4 mt-4 border-t border-[#E5E3DC]">
            <button
              type="button"
              disabled={displayedQuestions.length === 0}
              onClick={handleConfirmAndProceed}
              className="w-full py-2.5 px-4 bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:bg-[#9CA3AF] text-white rounded-md text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:cursor-not-allowed shadow-2xs"
            >
              <span>CONFIRM AND PROCEED</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ====================================================================
          BOTTOM NAVIGATION BAR: RETURN TO PART 2 (PARENT SUB-PAGE) OR PART 1
          ==================================================================== */}
      <div className="w-full bg-white border border-[#DFDDD4] rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <button
          type="button"
          onClick={onBackToPartTwo}
          className="px-4 py-2 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] rounded-md text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>← Back to Part 2: Subtopic Breakdown</span>
        </button>

        <button
          type="button"
          onClick={onGoToTrackerPageOne}
          className="px-3.5 py-1.5 bg-[#F9F8F4] hover:bg-[#EFECE6] text-[#374151] border border-[#DFDDD4] rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>View Chapter Tracker (Page 1)</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#1D4ED8]" />
        </button>
      </div>
    </div>
  );
};
