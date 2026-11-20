import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Lock,
  Check,
} from 'lucide-react';
import type {
  ChapterLedger,
  AttemptStatus,
} from './TrackerPageOne';
import {
  type ScannedQuestionItem,
  type ExplanationStepItem,
  getQuestionExplanationSteps,
} from '../utils/mkmlStorageScanner';
import type {
  DomainItem,
  ChapterItem,
  SubtopicItem,
  ConceptItem,
  MicroConceptItem,
} from './ExamRegistryDashboard';

export interface QuestionCardPayloadItem {
  question: ScannedQuestionItem;
  pathLabel: string;
}

interface Props {
  ledger: ChapterLedger;
  selectedItems: QuestionCardPayloadItem[];
  executionModality: 'study' | 'shallow' | 'full';
  stepsByQid: Record<string, ExplanationStepItem[]>;
  setStepsByQid: React.Dispatch<React.SetStateAction<Record<string, ExplanationStepItem[]>>>;
  onRecordEvaluatedTest: (
    evaluations: {
      uniqueId: string;
      conceptKey: string;
      status: AttemptStatus;
      seconds: number;
      option: string;
    }[]
  ) => void;
  onBackToQuestionIndex: () => void;
  onOpenTestAnalysis: () => void;
  onGoToTrackerPageOne: () => void;
  domains: DomainItem[];
  chapters: ChapterItem[];
  subtopics: SubtopicItem[];
  concepts: ConceptItem[];
  microConcepts: MicroConceptItem[];
}

interface ParsedQnContent {
  text: string;
  options: { key: string; label: string }[];
  answer: string;
  defaultSteps: ExplanationStepItem[];
}

function parseQuestionCardData(raw: string, uniqueId: string): ParsedQnContent {
  const xmlTextMatch = raw.match(/<Text>([\s\S]*?)<\/Text>/i);
  const anglesTextMatch = raw.match(
    /<text\s*=\s*([\s\S]*?)(?=<Options\s*>|<[A-D]\s*=|<(?:answer|ans|explanation)\s*=|<\/Qn\s*>|$)/i
  );
  const extractedText = xmlTextMatch
    ? xmlTextMatch[1].trim()
    : anglesTextMatch
      ? anglesTextMatch[1].trim().replace(/>\s*$/, '').trim()
      : `Question ${uniqueId}`;

  const optionsMatch = raw.match(/<Options>([\s\S]*?)<\/Options>/i);
  const xmlAnswerMatch = raw.match(/<Answer>([\s\S]*?)<\/Answer>/i);
  const anglesAnswerMatch = raw.match(/<answer\s*=\s*([^>]+)>/i);
  const extractedAnswer = xmlAnswerMatch
    ? xmlAnswerMatch[1].trim().toUpperCase()
    : anglesAnswerMatch
      ? anglesAnswerMatch[1].trim().toUpperCase()
      : 'A';

  const optionsRaw = optionsMatch ? optionsMatch[1].trim() : '';
  const parsedOptions: { key: string; label: string }[] = [];

  // 1) Try Angles <A = ...> <B = ...> <C = ...> <D = ...> option tags first
  const anglesOptionRegex = /<([A-Da-d])\s*=\s*([^>]+)>/g;
  let aoMatch: RegExpExecArray | null;
  while ((aoMatch = anglesOptionRegex.exec(optionsRaw)) !== null) {
    parsedOptions.push({
      key: aoMatch[1].toUpperCase(),
      label: aoMatch[2].trim(),
    });
  }

  // 2) Fallback to pipe-separated <Options>A. ... | B. ...</Options>
  if (parsedOptions.length === 0 && optionsRaw) {
    const optionTokens = optionsRaw
      .split('|')
      .map((s) => s.trim())
      .filter(Boolean);
    const defaultKeys = ['A', 'B', 'C', 'D'];
    optionTokens.forEach((tok, idx) => {
      const m = tok.match(/^\(?([A-Da-d])\)?[\.\s:-]+([\s\S]+)$/);
      if (m) {
        parsedOptions.push({ key: m[1].toUpperCase(), label: m[2].trim() });
      } else {
        parsedOptions.push({ key: defaultKeys[idx] || String(idx + 1), label: tok });
      }
    });
  }

  const options =
    parsedOptions.length > 0
      ? parsedOptions
      : [
          { key: 'A', label: 'First option' },
          { key: 'B', label: 'Second option' },
          { key: 'C', label: 'Third option' },
          { key: 'D', label: 'Fourth option' },
        ];

  const defaultSteps = getQuestionExplanationSteps(uniqueId);

  return {
    text: extractedText,
    options,
    answer: extractedAnswer,
    defaultSteps,
  };
}

function computeCardScoring(
  chosenOption: string,
  correctOption: string,
  seconds: number,
  fastLimit: number,
  mediumLimit: number,
  slowLimit: number
): {
  status: AttemptStatus;
  accMark: number;
  timeMark: number;
  totalMark: number;
  tierLabel: string;
} {
  if (!chosenOption) {
    return {
      status: 'S',
      accMark: -0.2,
      timeMark: 0,
      totalMark: -0.2,
      tierLabel: 'Skipped (-0.2)',
    };
  }
  if (chosenOption !== correctOption) {
    return {
      status: 'W',
      accMark: -0.5,
      timeMark: 0,
      totalMark: -0.5,
      tierLabel: 'Wrong (-0.5)',
    };
  }

  let timeMark = 0;
  let tierLabel = `Over ${slowLimit}s (+0.0)`;
  if (seconds <= fastLimit) {
    timeMark = 2.0;
    tierLabel = `Fast ≤ ${fastLimit}s (+2.0)`;
  } else if (seconds <= mediumLimit) {
    timeMark = 1.0;
    tierLabel = `Med ≤ ${mediumLimit}s (+1.0)`;
  } else if (seconds <= slowLimit) {
    timeMark = 0.5;
    tierLabel = `Slow ≤ ${slowLimit}s (+0.5)`;
  }

  return {
    status: 'C',
    accMark: 1.0,
    timeMark,
    totalMark: Number((1.0 + timeMark).toFixed(2)),
    tierLabel,
  };
}

export const TrackerQuestionCards: React.FC<Props> = ({
  ledger,
  selectedItems,
  executionModality,
  stepsByQid,
  setStepsByQid,
  onRecordEvaluatedTest,
  onBackToQuestionIndex,
  onOpenTestAnalysis,
  onGoToTrackerPageOne,
  domains,
  chapters,
  subtopics,
  concepts,
  microConcepts,
}) => {
  // Strictly bounded to the N selected questions (zero blank pages)
  const totalCards = selectedItems.length;
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Selected option per question uniqueId
  const [pickedOptions, setPickedOptions] = useState<Record<string, string>>({});

  // Elapsed timer seconds per question uniqueId
  const [elapsedSecondsByQid, setElapsedSecondsByQid] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    selectedItems.forEach((item) => {
      init[item.question.uniqueId] = 0;
    });
    return init;
  });

  // In Test Mode ('full'), answers & explanations stay locked until Submit Test on the last card
  const [isTestSubmitted, setIsTestSubmitted] = useState<boolean>(false);

  const activeItem = selectedItems[currentIndex] || selectedItems[0];
  const activeQid = activeItem?.question.uniqueId || '';

  const parsedCard = useMemo(() => {
    if (!activeItem) {
      return {
        text: 'No questions selected',
        options: [],
        answer: 'A',
        defaultSteps: [],
      };
    }
    return parseQuestionCardData(activeItem.question.rawQnBody, activeItem.question.uniqueId);
  }, [activeItem]);

  const activePickedOption = pickedOptions[activeQid] || '';
  const activeElapsedSeconds = elapsedSecondsByQid[activeQid] || 0;
  const activeSteps = stepsByQid[activeQid] || parsedCard.defaultSteps;

  // Synthesized Structural Question ID from the Step-IDs (e.g. T1-T2) — distinct from Unique Question ID
  const structuralQuestionId = useMemo(() => {
    const ids = activeSteps.map((s) => s.stepId.trim()).filter(Boolean);
    return ids.length > 0 ? ids.join('-') : 'T1';
  }, [activeSteps]);

  // Determine whether the current card's answer & bottom explanations are revealed:
  // 1) Study mode ('study'): Always revealed immediately
  // 2) Casual mode ('shallow'): Revealed as soon as an option is clicked on this card
  // 3) Test mode ('full'): Revealed ONLY after clicking Submit Test at the last question card
  const isCurrentCardRevealed =
    executionModality === 'study' ||
    (executionModality === 'shallow' && Boolean(activePickedOption)) ||
    (executionModality === 'full' && isTestSubmitted);

  // Determine whether the live per-question timer should tick for the current card
  const isCurrentCardTimerRunning =
    Boolean(activeItem) &&
    ((executionModality === 'shallow' && !activePickedOption) ||
      (executionModality === 'full' && !isTestSubmitted));

  useEffect(() => {
    if (!isCurrentCardTimerRunning || !activeQid) return;
    const interval = window.setInterval(() => {
      setElapsedSecondsByQid((prev) => ({
        ...prev,
        [activeQid]: (prev[activeQid] || 0) + 1,
      }));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isCurrentCardTimerRunning, activeQid]);

  // Keyboard Left / Right arrow navigation across the N selected cards
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => Math.min(totalCards - 1, prev + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalCards]);

  // Lookup Domain, Chapter, Subtopic, Concept names from Registry
  const metadataNames = useMemo(() => {
    if (!activeItem) {
      return {
        domainName: 'Quantitative Aptitude',
        chapterName: ledger.chapterName,
        subtopicName: 'Core Concepts',
        conceptName: 'V1',
      };
    }
    const q = activeItem.question;
    const chMeta = chapters.find((c) => c.code === q.chapterCode);
    const domMeta = domains.find((d) => d.code === (chMeta?.domainCode || q.domainCode));
    const stMeta = subtopics.find(
      (s) =>
        s.chapterCode === q.chapterCode &&
        (s.code.toLowerCase().includes(q.subtopicShortCode.toLowerCase()) ||
          s.code
            .split(/\s+/)
            .map((w) => w[0]?.toUpperCase() || '')
            .join('') === q.subtopicShortCode.toUpperCase())
    );
    const conMeta = concepts.find(
      (c) =>
        c.chapterCode === q.chapterCode &&
        c.code.toLowerCase() === q.conceptShortCode.toLowerCase()
    );

    return {
      domainName: domMeta ? domMeta.name : q.domainCode,
      chapterName: chMeta ? chMeta.name : ledger.chapterName,
      subtopicName: stMeta ? stMeta.code : q.subtopicShortCode,
      conceptName: conMeta ? conMeta.code : q.conceptShortCode,
    };
  }, [activeItem, chapters, domains, subtopics, concepts, ledger.chapterName]);

  // Available Step-IDs from Micro Concept Registry Page 5 + standard T1..T5 & TG
  const availableStepIdOptions = useMemo(() => {
    const set = new Set<string>(['T1', 'T2', 'T3', 'TG', 'T4', 'T5']);
    microConcepts.forEach((mc) => {
      if (mc.shortCode) set.add(mc.shortCode);
    });
    return Array.from(set);
  }, [microConcepts]);

  const handleSelectOption = (optionKey: string) => {
    if (executionModality === 'study') return;
    if (executionModality === 'full' && isTestSubmitted) return;
    setPickedOptions((prev) => ({
      ...prev,
      [activeQid]: optionKey,
    }));
  };

  // Submit Test on the last question card (ONLY records data into marks.tex in Test Mode)
  const handleSubmitFullTest = () => {
    if (executionModality !== 'full' || isTestSubmitted) return;

    const evaluations = selectedItems.map((item) => {
      const qid = item.question.uniqueId;
      const parsed = parseQuestionCardData(item.question.rawQnBody, qid);
      const chosenOpt = pickedOptions[qid] || '';
      const spentSec = Math.max(1, elapsedSecondsByQid[qid] || 1);
      const scoring = computeCardScoring(
        chosenOpt,
        parsed.answer,
        spentSec,
        ledger.timing.fastLimit,
        ledger.timing.mediumLimit,
        ledger.timing.slowLimit
      );
      return {
        uniqueId: qid,
        conceptKey: item.pathLabel,
        status: scoring.status,
        seconds: spentSec,
        option: chosenOpt || '-',
      };
    });

    onRecordEvaluatedTest(evaluations);
    setIsTestSubmitted(true);
  };

  // Edit / Add / Delete explanation steps & right-side Step-IDs
  const handleUpdateStepText = (stepIdx: number, nextText: string) => {
    setStepsByQid((prev) => {
      const list = [...(prev[activeQid] || parsedCard.defaultSteps)];
      list[stepIdx] = { ...list[stepIdx], text: nextText };
      return { ...prev, [activeQid]: list };
    });
  };

  const handleUpdateStepId = (stepIdx: number, nextStepId: string) => {
    setStepsByQid((prev) => {
      const list = [...(prev[activeQid] || parsedCard.defaultSteps)];
      list[stepIdx] = { ...list[stepIdx], stepId: nextStepId };
      return { ...prev, [activeQid]: list };
    });
  };

  const handleAddExplanationStep = () => {
    setStepsByQid((prev) => {
      const list = [...(prev[activeQid] || parsedCard.defaultSteps)];
      const nextNum = list.length + 1;
      list.push({
        stepNumber: nextNum,
        text: `Step ${nextNum} explanation...`,
        stepId: `T${nextNum}`,
      });
      return { ...prev, [activeQid]: list };
    });
  };

  const handleDeleteExplanationStep = (stepIdx: number) => {
    setStepsByQid((prev) => {
      const list = (prev[activeQid] || parsedCard.defaultSteps)
        .filter((_, idx) => idx !== stepIdx)
        .map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
      return { ...prev, [activeQid]: list };
    });
  };

  const activeScoring = useMemo(
    () =>
      computeCardScoring(
        executionModality === 'study' ? parsedCard.answer : activePickedOption,
        parsedCard.answer,
        Math.max(1, activeElapsedSeconds),
        ledger.timing.fastLimit,
        ledger.timing.mediumLimit,
        ledger.timing.slowLimit
      ),
    [
      executionModality,
      parsedCard.answer,
      activePickedOption,
      activeElapsedSeconds,
      ledger.timing,
    ]
  );

  if (totalCards === 0) {
    return (
      <div className="w-full bg-white border border-[#DFDDD4] rounded-lg p-6 text-center space-y-3 font-mono">
        <div className="text-sm font-bold text-[#111827]">
          No questions selected in Question Index.
        </div>
        <button
          type="button"
          onClick={onBackToQuestionIndex}
          className="px-4 py-2 bg-[#1D4ED8] text-white rounded-md text-xs font-bold cursor-pointer"
        >
          ← Back to Question Index
        </button>
      </div>
    );
  }

  const isLastCard = currentIndex === totalCards - 1;

  return (
    <div className="w-full bg-[#F5F4EF] text-[#111827] space-y-3 font-sans select-none">
      {/* ====================================================================
          MAIN QUESTION CARD (FULL WIDTH · ZERO ORANGE-BOXED CLUTTER)
          ==================================================================== */}
      <div className="w-full bg-white border border-[#DFDDD4] rounded-xl shadow-2xs overflow-hidden">
        {/* CARD HEADER: Q.No, UNIQUE ID, STRUCTURAL QUESTION ID (FROM STEP-IDs), TIMER & ARROWS */}
        <div className="bg-[#F9F8F4] border-b border-[#DFDDD4] px-5 py-3 flex flex-wrap items-center justify-between gap-3 font-mono">
          {/* Left: Question Number + Unique ID + Step-Level Structural Question ID */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 bg-[#1D4ED8] text-white text-xs font-bold rounded-md">
              Q.No {currentIndex + 1} of {totalCards}
            </span>

            <span
              className="px-2.5 py-1 bg-white text-[#111827] border border-[#DFDDD4] text-xs font-bold rounded-md"
              title="Chained Unique Question ID in storage"
            >
              Unique ID: <span className="text-[#1D4ED8]">{activeQid}</span>
            </span>

            <span
              className="px-2.5 py-1 bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] text-xs font-bold rounded-md"
              title="Structural Question ID derived from the explanation Step-IDs (used for finding similarity)"
            >
              Question ID (Steps): {structuralQuestionId}
            </span>

            <span className="px-2 py-0.5 bg-[#F5F4EF] text-[#4B5563] border border-[#DFDDD4] text-[10px] font-bold uppercase rounded">
              {executionModality === 'study'
                ? '1) Studying Mode'
                : executionModality === 'shallow'
                  ? '2) Casual Mode'
                  : isTestSubmitted
                    ? '3) Test Mode (Submitted & Saved)'
                    : '3) Test Mode (Records Marks)'}
            </span>
          </div>

          {/* Right: Live Timer + Left/Right Arrow Navigation */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Per-Question Live Timer */}
            {executionModality !== 'study' && (
              <div
                className={`px-3 py-1 rounded-md border text-xs font-bold flex items-center gap-1.5 ${
                  activeElapsedSeconds <= ledger.timing.fastLimit
                    ? 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]'
                    : activeElapsedSeconds <= ledger.timing.mediumLimit
                      ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]'
                      : activeElapsedSeconds <= ledger.timing.slowLimit
                        ? 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'
                        : 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{activeElapsedSeconds}s</span>
                <span className="text-[10px] opacity-80">
                  (F≤{ledger.timing.fastLimit}s · M≤{ledger.timing.mediumLimit}s)
                </span>
              </div>
            )}

            {/* Left / Right Question Card Arrows */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="px-3 py-1 bg-white hover:bg-[#EFF6FF] disabled:opacity-40 text-[#111827] border border-[#DFDDD4] rounded-md text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer disabled:cursor-not-allowed"
                title="Previous Question Card (Left Arrow Key)"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#1D4ED8]" />
                <span>Prev</span>
              </button>

              {/* Direct Card Pills (1..N — Zero Blank Pages) */}
              <div className="hidden sm:flex items-center gap-1 px-1">
                {selectedItems.map((item, idx) => {
                  const qid = item.question.uniqueId;
                  const hasPick = Boolean(pickedOptions[qid]);
                  const isCurrent = idx === currentIndex;
                  return (
                    <button
                      key={qid}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-6 h-6 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-[#1D4ED8] text-white'
                          : hasPick
                            ? 'bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]'
                            : 'bg-white text-[#4B5563] border border-[#DFDDD4] hover:bg-[#EFECE6]'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={isLastCard}
                onClick={() => setCurrentIndex((prev) => Math.min(totalCards - 1, prev + 1))}
                className="px-3 py-1 bg-white hover:bg-[#EFF6FF] disabled:opacity-40 text-[#111827] border border-[#DFDDD4] rounded-md text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer disabled:cursor-not-allowed"
                title="Next Question Card (Right Arrow Key)"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#1D4ED8]" />
              </button>
            </div>
          </div>
        </div>

        {/* ==================================================================
            QUESTION STATEMENT & OPTIONS BLOCK (FULL WIDTH)
            ================================================================== */}
        <div className="p-6 space-y-5">
          {/* Question Statement */}
          <div className="flex items-start gap-3">
            <span className="px-2.5 py-1 bg-[#1D4ED8] text-white font-mono text-xs font-bold rounded shrink-0 mt-0.5">
              Q.No {currentIndex + 1}
            </span>
            <p className="text-base sm:text-lg font-semibold text-[#111827] leading-relaxed">
              {parsedCard.text}
            </p>
          </div>

          {/* OPTIONS Header + Correct Answer Status */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="uppercase tracking-wider text-[#6B7280] font-bold">OPTIONS</span>
              {isCurrentCardRevealed ? (
                <span className="px-2.5 py-0.5 rounded bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] font-bold">
                  CORRECT: Option {parsedCard.answer}
                </span>
              ) : (
                <span className="text-[#6B7280]">
                  {executionModality === 'shallow'
                    ? 'CORRECT: (Click Option to Reveal)'
                    : 'CORRECT: (Reveals After Submit on Last Card)'}
                </span>
              )}
            </div>

            {/* 4 Options List */}
            <div className="space-y-2">
              {parsedCard.options.map((opt) => {
                const isPicked = activePickedOption === opt.key;
                const isCorrect = parsedCard.answer === opt.key;

                let rowStyle =
                  'bg-[#F9F8F4] border-[#DFDDD4] text-[#111827] hover:bg-[#EFF6FF]/60 hover:border-[#BFDBFE]';
                let badgeStyle = 'bg-white border-[#D1CFC7] text-[#374151]';

                if (isCurrentCardRevealed) {
                  if (isCorrect) {
                    rowStyle = 'bg-[#F0FDF4] border-[#16A34A] text-[#15803D] font-bold';
                    badgeStyle = 'bg-[#16A34A] border-[#16A34A] text-white';
                  } else if (isPicked && !isCorrect) {
                    rowStyle = 'bg-[#FEF2F2] border-[#DC2626] text-[#DC2626] font-bold';
                    badgeStyle = 'bg-[#DC2626] border-[#DC2626] text-white';
                  }
                } else if (isPicked) {
                  rowStyle = 'bg-[#EFF6FF] border-[#1D4ED8] text-[#1D4ED8] font-bold';
                  badgeStyle = 'bg-[#1D4ED8] border-[#1D4ED8] text-white';
                }

                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleSelectOption(opt.key)}
                    className={`w-full px-4 py-3 rounded-lg border text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${rowStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-full border font-mono text-xs font-bold flex items-center justify-center shrink-0 ${badgeStyle}`}
                      >
                        {opt.key}
                      </span>
                      <span className="text-sm">{opt.label}</span>
                    </div>

                    {isCurrentCardRevealed && isCorrect && (
                      <span className="flex items-center gap-1 text-xs font-mono font-bold text-[#15803D]">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Correct</span>
                      </span>
                    )}
                    {isCurrentCardRevealed && isPicked && !isCorrect && (
                      <span className="flex items-center gap-1 text-xs font-mono font-bold text-[#DC2626]">
                        <XCircle className="w-4 h-4" />
                        <span>Your Choice</span>
                      </span>
                    )}
                    {!isCurrentCardRevealed && isPicked && (
                      <span className="text-xs font-mono font-bold text-[#1D4ED8]">
                        Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ================================================================
              KEPT METADATA ROW: TOPIC, EXAM INFO, SUBTOPIC, & MARK SCORING
              (DIFFICULTY, CUPRICATOR STRUCTURE, AND USER NOTES REMOVED)
              ================================================================ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-[#E5E3DC]">
            {/* TOPIC */}
            <div className="p-3 rounded-lg bg-[#F9F8F4] border border-[#DFDDD4]">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280]">
                TOPIC
              </div>
              <div className="text-sm font-bold text-[#111827] mt-0.5">
                {metadataNames.domainName}
              </div>
              <div className="text-xs font-mono text-[#1D4ED8]">
                {metadataNames.chapterName} [{ledger.chapterCode}]
              </div>
            </div>

            {/* EXAM INFO */}
            <div className="p-3 rounded-lg bg-[#F9F8F4] border border-[#DFDDD4]">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280]">
                EXAM INFO
              </div>
              <div className="text-sm font-bold text-[#111827] mt-0.5">Practice</div>
              <div className="text-xs font-mono text-[#6B7280]">
                Path: {activeItem?.pathLabel}
              </div>
            </div>

            {/* SUBTOPIC */}
            <div className="p-3 rounded-lg bg-[#F9F8F4] border border-[#DFDDD4]">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280]">
                SUBTOPIC
              </div>
              <div className="text-sm font-bold text-[#111827] mt-0.5">
                {metadataNames.subtopicName}
              </div>
              <div className="text-xs font-mono text-[#15803D]">
                Concept: {metadataNames.conceptName}
              </div>
            </div>

            {/* MARK SCORING */}
            <div
              className={`p-3 rounded-lg border ${
                isCurrentCardRevealed
                  ? activeScoring.totalMark > 0
                    ? 'bg-[#F0FDF4] border-[#BBF7D0]'
                    : 'bg-[#FEF2F2] border-[#FECACA]'
                  : 'bg-[#F9F8F4] border-[#DFDDD4]'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider">
                <span className="font-bold text-[#4B5563]">MARK SCORING</span>
                {isCurrentCardRevealed && (
                  <span className="text-[#111827]">
                    Time: {Math.max(1, activeElapsedSeconds)}s
                  </span>
                )}
              </div>

              {isCurrentCardRevealed ? (
                <>
                  <div
                    className={`text-lg font-mono font-extrabold mt-0.5 ${
                      activeScoring.totalMark > 0 ? 'text-[#15803D]' : 'text-[#DC2626]'
                    }`}
                  >
                    {activeScoring.totalMark > 0
                      ? `+${activeScoring.totalMark.toFixed(1)} Pts`
                      : `${activeScoring.totalMark.toFixed(1)} Pts`}
                  </div>
                  <div className="text-[11px] font-mono text-[#4B5563]">
                    Acc: {activeScoring.accMark > 0 ? '+1.0' : activeScoring.accMark.toFixed(1)} |
                    Speed Bonus: +{activeScoring.timeMark.toFixed(1)}
                  </div>
                </>
              ) : (
                <div className="text-xs font-mono text-[#6B7280] mt-1.5">
                  {executionModality === 'shallow'
                    ? 'Click an option to preview marks'
                    : 'Evaluated on Submit Test at last card'}
                </div>
              )}
            </div>
          </div>

          {/* ================================================================
              SUBMIT TEST BANNER ON THE LAST QUESTION CARD IN TEST MODE
              ================================================================ */}
          {executionModality === 'full' && (
            <div
              className={`p-4 rounded-lg border flex flex-wrap items-center justify-between gap-3 font-mono ${
                isTestSubmitted
                  ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]'
                  : isLastCard
                    ? 'bg-[#EFF6FF] border-[#1D4ED8] text-[#111827]'
                    : 'bg-[#F9F8F4] border-[#DFDDD4] text-[#4B5563]'
              }`}
            >
              <div className="text-xs">
                {isTestSubmitted ? (
                  <div className="font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                    <span>
                      Test Submitted! All {totalCards} question attempts &amp; timers have been
                      recorded into marks.tex and updated in Tracker Page 1.
                    </span>
                  </div>
                ) : isLastCard ? (
                  <div>
                    <strong className="text-[#1D4ED8]">
                      Last Question Card ({totalCards} of {totalCards}):
                    </strong>{' '}
                    Click <strong>Submit Test</strong> to reveal all answers, explanations, and
                    record your marks into Tracker Page 1.
                  </div>
                ) : (
                  <div>
                    Answered{' '}
                    <strong>
                      {Object.keys(pickedOptions).filter((k) => Boolean(pickedOptions[k])).length}{' '}
                      / {totalCards}
                    </strong>{' '}
                    cards · Navigate to the last card ({totalCards} of {totalCards}) using{' '}
                    <strong>Next →</strong> to submit test.
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!isTestSubmitted && isLastCard && (
                  <button
                    type="button"
                    onClick={handleSubmitFullTest}
                    className="px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Check className="w-4 h-4" />
                    <span>Submit Test ({totalCards} Qs)</span>
                  </button>
                )}

                {isTestSubmitted && (
                  <>
                    <button
                      type="button"
                      onClick={onOpenTestAnalysis}
                      className="px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <span>Open Test Analysis (Attempts &amp; Breakdown)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={onGoToTrackerPageOne}
                      className="px-3.5 py-2 bg-[#15803D] hover:bg-[#166534] text-white rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <span>View Tracker Page 1</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ================================================================
              BOTTOM EXPLANATIONS & STEP-LEVEL ID SECTION (NOTEBOOK PHOTO 3)
              Moved to the bottom with Step - 1, Step - 2 on left & Step-ID on right
              ================================================================ */}
          <div className="border border-[#DFDDD4] rounded-xl overflow-hidden bg-[#F9F8F4]">
            {/* Explanations Header */}
            <div className="px-4 py-3 bg-white border-b border-[#DFDDD4] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-bold text-[#111827]">Explanations</span>
                <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] rounded">
                  Question ID (Step Chain): {structuralQuestionId}
                </span>
                <span className="text-[11px] font-mono text-[#6B7280]">
                  (Distinct from Unique ID {activeQid})
                </span>
              </div>

              {isCurrentCardRevealed && (
                <button
                  type="button"
                  onClick={handleAddExplanationStep}
                  className="px-2.5 py-1 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] rounded text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Step</span>
                </button>
              )}
            </div>

            {/* Explanations Body: Locked or Revealed */}
            {!isCurrentCardRevealed ? (
              <div className="p-6 text-center space-y-1.5 font-mono">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#4B5563]">
                  <Lock className="w-4 h-4 text-[#D97706]" />
                  <span>
                    {executionModality === 'shallow'
                      ? 'Casual Mode: Click any option above to reveal Step-by-Step Explanations & Step-IDs'
                      : `Test Mode: Explanations & Step-IDs unlock after clicking Submit Test on Question ${totalCards} of ${totalCards}`}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {activeSteps.map((step, sIdx) => (
                  <div
                    key={`${activeQid}-step-${sIdx}`}
                    className="bg-white border border-[#DFDDD4] rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    {/* Left: Step - N and editable explanation */}
                    <div className="flex items-start gap-3 flex-1">
                      <span className="px-2.5 py-1 bg-[#F5F4EF] border border-[#DFDDD4] rounded font-mono text-xs font-bold text-[#111827] shrink-0">
                        Step - {sIdx + 1}
                      </span>
                      <input
                        type="text"
                        value={step.text}
                        onChange={(e) => handleUpdateStepText(sIdx, e.target.value)}
                        className="w-full px-2.5 py-1 text-sm bg-transparent border-b border-dashed border-[#D1CFC7] focus:outline-none focus:border-[#1D4ED8] text-[#111827]"
                        placeholder={`Write Step - ${sIdx + 1} explanation...`}
                      />
                    </div>

                    {/* Right: — Step - ID (e.g. T1, T2) */}
                    <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
                      <span className="text-[#6B7280] font-bold">— Step-ID:</span>
                      <select
                        value={step.stepId}
                        onChange={(e) => handleUpdateStepId(sIdx, e.target.value)}
                        className="px-2.5 py-1 bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] rounded font-bold focus:outline-none focus:border-[#15803D] cursor-pointer"
                      >
                        {availableStepIdOptions.map((code) => (
                          <option key={code} value={code}>
                            {code}
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        value={step.stepId}
                        onChange={(e) => handleUpdateStepId(sIdx, e.target.value.toUpperCase())}
                        className="w-16 px-2 py-1 text-center font-bold bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
                        title="Custom Step-ID (e.g. T1, T2)"
                      />

                      {activeSteps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteExplanationStep(sIdx)}
                          className="p-1 text-[#DC2626] hover:bg-[#FEF2F2] rounded cursor-pointer"
                          title="Delete step"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ====================================================================
          BOTTOM NAVIGATION BAR: RETURN TO QUESTION INDEX OR TRACKER PAGE 1
          ==================================================================== */}
      <div className="w-full bg-white border border-[#DFDDD4] rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs font-mono">
        <button
          type="button"
          onClick={onBackToQuestionIndex}
          className="px-4 py-2 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] rounded-md text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>← Back to Question Index</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            className="px-3 py-1.5 bg-[#F9F8F4] hover:bg-[#EFECE6] disabled:opacity-40 text-[#374151] border border-[#DFDDD4] rounded-md text-xs font-bold cursor-pointer disabled:cursor-not-allowed"
          >
            ← Card {Math.max(1, currentIndex)}
          </button>

          <button
            type="button"
            disabled={isLastCard}
            onClick={() => setCurrentIndex((prev) => Math.min(totalCards - 1, prev + 1))}
            className="px-3 py-1.5 bg-[#F9F8F4] hover:bg-[#EFECE6] disabled:opacity-40 text-[#374151] border border-[#DFDDD4] rounded-md text-xs font-bold cursor-pointer disabled:cursor-not-allowed"
          >
            Card {Math.min(totalCards, currentIndex + 2)} →
          </button>

          <button
            type="button"
            onClick={onOpenTestAnalysis}
            className="px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white border border-[#1D4ED8] rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <span>Proceed to Test Analysis (Sub-page)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
