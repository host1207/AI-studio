import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Play, SkipForward, Sparkles, X } from 'lucide-react';
import type {
  ChapterItem,
  ConceptItem,
  DomainItem,
  MicroConceptItem,
  SubtopicItem,
} from './ExamRegistryDashboard';
import { parseExplanationStepTags, splitStepIds } from '../utils/mkmlStorageScanner';
import {
  extractGivenAndAsked,
  type BoundaryRuleItem,
  type OperatorRuleItem,
  type SolverPathRuleItem,
  type SymbolAliasItem,
} from '../utils/givenAskedEngine';
import {
  formatNumClean,
  solveWithRegistry,
  type DiscoveryCandidate,
} from '../utils/solverEngine';

interface TrackerTesterTabProps {
  domains: DomainItem[];
  chapters: ChapterItem[];
  subtopics: SubtopicItem[];
  concepts: ConceptItem[];
  microConcepts: MicroConceptItem[];
  givenRules: BoundaryRuleItem[];
  askedRules: BoundaryRuleItem[];
  combineGivenFallback: boolean;
  combineAskedFallback: boolean;
  operatorRules: OperatorRuleItem[];
  solverPathRules: SolverPathRuleItem[];
  setSolverPathRules: React.Dispatch<React.SetStateAction<SolverPathRuleItem[]>>;
  symbolAliases: SymbolAliasItem[];
  setSymbolAliases: React.Dispatch<React.SetStateAction<SymbolAliasItem[]>>;
}

interface MkmlWindowApi {
  compileInline?: (src: string) => string;
  compileExplanation?: (src: string) => string;
  compile?: (src: string) => string;
  renderMath?: (root: HTMLElement | null) => void;
}

interface ParsedTesterQuestion {
  index: number;
  id: string;
  target: string;
  type: string;
  examInfo: string;
  text: string;
  options: { key: string; label: string }[];
  answer: string;
  steps: { stepNumber: number; text: string; stepId: string }[];
  chapterLabel: string;
  subtopicLabel: string;
  conceptLabel: string;
  microConceptLabels: string[];
}

const MkmlRenderedBlock: React.FC<{
  source: string;
  inline?: boolean;
  className?: string;
}> = ({ source, inline = false, className = '' }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const compiledHtml = useMemo(() => {
    const mkml = (window as unknown as { MKML?: MkmlWindowApi }).MKML;
    if (!mkml) return '';
    try {
      if (inline && typeof mkml.compileInline === 'function') {
        return mkml.compileInline(source);
      }
      if (typeof mkml.compileExplanation === 'function') {
        return mkml.compileExplanation(source);
      }
      if (typeof mkml.compile === 'function') {
        return mkml.compile(source);
      }
    } catch {
      return '';
    }
    return '';
  }, [source, inline]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const mkml = (window as unknown as { MKML?: MkmlWindowApi }).MKML;
    if (mkml && typeof mkml.renderMath === 'function') {
      mkml.renderMath(el);
    }
    el.querySelectorAll<HTMLElement>('.mkml-spoiler').forEach((node) => {
      node.onclick = () => node.classList.toggle('revealed');
    });
  }, [compiledHtml]);

  if (!compiledHtml) {
    return inline ? (
      <span className={className}>{source}</span>
    ) : (
      <div className={className}>{source}</div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`${inline ? 'inline' : 'block'} ${className}`}
      dangerouslySetInnerHTML={{ __html: compiledHtml }}
    />
  );
};

function extractSingleValueTag(raw: string, tagName: string): string {
  const re = new RegExp(`<${tagName}\\s*(?:==|=)\\s*([^>]+)>`, 'i');
  const m = raw.match(re);
  return m ? m[1].trim() : '';
}

function parseQuestionsBatch(
  input: string,
  domains: DomainItem[],
  chapters: ChapterItem[],
  subtopics: SubtopicItem[],
  concepts: ConceptItem[],
  microConcepts: MicroConceptItem[]
): ParsedTesterQuestion[] {
  const trimmed = input.trim();
  if (!trimmed) return [];

  const qnBlocks: string[] = [];
  const qnRegex = /<Qn\b[^>]*>([\s\S]*?)<\/Qn>/gi;
  let match: RegExpExecArray | null;
  while ((match = qnRegex.exec(trimmed)) !== null) {
    if (match[1].trim()) qnBlocks.push(match[1].trim());
  }

  if (qnBlocks.length === 0 && /<(?:text|id|target|Options|explanation)\b/i.test(trimmed)) {
    qnBlocks.push(trimmed);
  }

  return qnBlocks.map((rawBody, idx) => {
    const qId = extractSingleValueTag(rawBody, 'id') || `Q-${idx + 1}`;
    const targetRaw = extractSingleValueTag(rawBody, 'target') || extractSingleValueTag(rawBody, 'mid');
    const qType = extractSingleValueTag(rawBody, 'type');

    const xmlTextMatch = rawBody.match(/<Text>([\s\S]*?)<\/Text>/i);
    const anglesTextMatch = rawBody.match(
      /<text\s*=\s*([\s\S]*?)(?=<Options\s*>|<[A-D]\s*=|<(?:answer|ans)\s*=|<explanation(?:\s*=|\s*>)|<\/Qn\s*>|$)/i
    );
    const questionText = xmlTextMatch
      ? xmlTextMatch[1].trim()
      : anglesTextMatch
        ? anglesTextMatch[1].trim().replace(/>\s*$/, '').trim()
        : '';

    // Options
    const optionsMatch = rawBody.match(/<Options>([\s\S]*?)<\/Options>/i);
    const optionsRaw = optionsMatch ? optionsMatch[1].trim() : '';
    const parsedOptions: { key: string; label: string }[] = [];

    const optionBoundaries = [...optionsRaw.matchAll(/<([A-Da-d])(?:\s*=\s*|\s+)/g)];
    optionBoundaries.forEach((entry, oIdx) => {
      const start = (entry.index ?? 0) + entry[0].length;
      const nextBoundary =
        oIdx + 1 < optionBoundaries.length
          ? (optionBoundaries[oIdx + 1].index ?? optionsRaw.length)
          : optionsRaw.length;
      const rawLabel = optionsRaw
        .slice(start, nextBoundary)
        .trim()
        .replace(/>\s*$/, '')
        .trim();
      if (rawLabel) {
        parsedOptions.push({ key: entry[1].toUpperCase(), label: rawLabel });
      }
    });

    if (parsedOptions.length === 0 && optionsRaw) {
      const defaultKeys = ['A', 'B', 'C', 'D'];
      optionsRaw
        .split('|')
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((tok, oIdx) => {
          const m = tok.match(/^\(?([A-Da-d])\)?[\.\s:-]+([\s\S]+)$/);
          if (m) {
            parsedOptions.push({ key: m[1].toUpperCase(), label: m[2].trim() });
          } else {
            parsedOptions.push({ key: defaultKeys[oIdx] || String(oIdx + 1), label: tok });
          }
        });
    }

    const xmlAnswerMatch = rawBody.match(/<Answer>([\s\S]*?)<\/Answer>/i);
    const anglesAnswerMatch = rawBody.match(/<(?:answer|ans)\s*=\s*([^>]+)>/i);
    const answer = xmlAnswerMatch
      ? xmlAnswerMatch[1].trim().toUpperCase()
      : anglesAnswerMatch
        ? anglesAnswerMatch[1].trim().toUpperCase()
        : '';

    const steps = parseExplanationStepTags(rawBody);

    // Exam info from bracketed tag e.g. [SSC CGL 2023] + <type = ...>
    const bracketMatches = [...questionText.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1].trim());
    const examParts: string[] = [];
    if (bracketMatches.length > 0) examParts.push(bracketMatches.join(' · '));
    if (qType) examParts.push(qType);
    const examInfo = examParts.join(' · ') || '—';

    // Resolve cascading IDs from target or question ID
    const primaryTarget = (targetRaw.split(/[,/]+/)[0] || '').trim();
    const idTokens = (primaryTarget || qId).split('-').map((p) => p.trim()).filter(Boolean);
    const domCode = idTokens[0] || '';
    const chCode = idTokens[1] || '';
    const stCode = idTokens[2] || '';
    const conCode = idTokens[3] || '';

    const chMatch = chapters.find((c) => c.code.toUpperCase() === chCode.toUpperCase());
    const domMatch = domains.find(
      (d) =>
        d.code.toUpperCase() === (chMatch?.domainCode || domCode).toUpperCase()
    );
    const chapterLabel = chMatch
      ? `${chMatch.name} [${chMatch.code}]${domMatch ? ` · ${domMatch.name} (${domMatch.code})` : ''}`
      : chCode || '—';

    const stFull = idTokens.length >= 3 ? idTokens.slice(0, 3).join('-') : '';
    const stMatch = subtopics.find(
      (s) =>
        (s.fullId && s.fullId.toUpperCase() === stFull.toUpperCase()) ||
        (s.shortCode &&
          s.shortCode.toUpperCase() === stCode.toUpperCase() &&
          s.chapterCode.toUpperCase() === chCode.toUpperCase())
    );
    const subtopicLabel = stMatch
      ? `${stMatch.code} [${stMatch.fullId || stFull}]`
      : stFull || '—';

    const conFull = idTokens.length >= 4 ? idTokens.slice(0, 4).join('-') : primaryTarget;
    const conMatch = concepts.find(
      (c) =>
        (c.fullId && c.fullId.toUpperCase() === conFull.toUpperCase()) ||
        (c.shortCode &&
          c.shortCode.toUpperCase() === conCode.toUpperCase() &&
          c.chapterCode.toUpperCase() === chCode.toUpperCase())
    );
    const conceptLabel = conMatch
      ? `${conMatch.code} [${conMatch.fullId || conFull}]`
      : conFull || '—';

    // Collect unique microconcepts from steps
    const mcSeen = new Set<string>();
    const microConceptLabels: string[] = [];
    for (const st of steps) {
      for (const tok of splitStepIds(st.stepId)) {
        const key = tok.toUpperCase();
        if (mcSeen.has(key)) continue;
        mcSeen.add(key);
        if (key === 'TU') {
          microConceptLabels.push('Tu · Unmapped Step');
        } else if (key === 'TG') {
          microConceptLabels.push('TG · General Arithmetic / Substitution');
        } else {
          const mcMatch = microConcepts.find(
            (mc) =>
              (mc.baseId && mc.baseId.toUpperCase() === key) ||
              mc.shortCode.toUpperCase() === key
          );
          microConceptLabels.push(mcMatch ? `${tok} · ${mcMatch.code}` : tok);
        }
      }
    }

    return {
      index: idx + 1,
      id: qId,
      target: targetRaw,
      type: qType,
      examInfo,
      text: questionText,
      options: parsedOptions,
      answer,
      steps,
      chapterLabel,
      subtopicLabel,
      conceptLabel,
      microConceptLabels,
    };
  });
}

const SAMPLE_TESTER_BATCH = `<qn all>
  <Qn>
    <mid = QA.PL.C1>
    <type = Profit & Loss>
    <text = Given selling price = <math == 30> and cost price = <math == 20>, find Profit%.>
    <Options>
      <A = 40>
      <B = 50>
      <C = 25>
      <D = 60>
    </Options>
    <answer = B>
  </Qn>
  <Qn>
    <mid = QA.PL.C1>
    <type = Profit & Loss>
    <text = Given SP = <math == 30> and CP = <math == 40>, find L.>
    <Options>
      <A = 10>
      <B = 15>
      <C = 20>
      <D = 5>
    </Options>
    <answer = A>
  </Qn>
  <Qn>
    <mid = QA.PL.C2>
    <type = Discount Discovery>
    <text = Given MP = <math == 100> and D = <math == 15>, find Net Sale.>
    <Options>
      <A = 75>
      <B = 80>
      <C = 85>
      <D = 90>
    </Options>
    <answer = C>
  </Qn>
</qn all>`;

export const TrackerTesterTab: React.FC<TrackerTesterTabProps> = ({
  domains,
  chapters,
  subtopics,
  concepts,
  microConcepts,
  givenRules,
  askedRules,
  combineGivenFallback,
  combineAskedFallback,
  operatorRules,
  solverPathRules,
  setSolverPathRules,
  symbolAliases,
  setSymbolAliases,
}) => {
  const [rawInput, setRawInput] = useState<string>('');
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const tabBScrollRef = useRef<HTMLDivElement | null>(null);

  // Solver workspace inputs (auto-synced from active question's Given / Asked / Answer, also editable)
  const [solverGiven, setSolverGiven] = useState<string>('');
  const [solverAsked, setSolverAsked] = useState<string>('');
  const [solverExpected, setSolverExpected] = useState<string>('');
  const [candidateIdx, setCandidateIdx] = useState<number>(0);
  const [solverFeedback, setSolverFeedback] = useState<string | null>(null);

  const parsedQuestions = useMemo(
    () =>
      parseQuestionsBatch(rawInput, domains, chapters, subtopics, concepts, microConcepts),
    [rawInput, domains, chapters, subtopics, concepts, microConcepts]
  );

  const safeIndex =
    parsedQuestions.length > 0 ? Math.min(activeIndex, parsedQuestions.length - 1) : 0;
  const activeQuestion = parsedQuestions[safeIndex] || null;

  const extraction = useMemo(() => {
    if (!activeQuestion?.text) return null;
    return extractGivenAndAsked(
      activeQuestion.text,
      givenRules,
      askedRules,
      operatorRules,
      { combineGivenFallback, combineAskedFallback }
    );
  }, [
    activeQuestion?.text,
    givenRules,
    askedRules,
    operatorRules,
    combineGivenFallback,
    combineAskedFallback,
  ]);

  // Sync Solver inputs whenever active question or extracted Given/Asked changes
  const autoGiven = useMemo(
    () => (extraction ? extraction.given.items.join(', ') : ''),
    [extraction]
  );
  const autoAsked = useMemo(
    () => (extraction ? extraction.asked.items.join(', ') : ''),
    [extraction]
  );
  const autoExpected = useMemo(() => {
    if (!activeQuestion?.answer) return '';
    const opt = activeQuestion.options.find(
      (o) => o.key.toUpperCase() === activeQuestion.answer.toUpperCase()
    );
    return opt ? opt.label.replace(/<math\s*==\s*([^>]+)>/gi, '$1').trim() : '';
  }, [activeQuestion]);

  useEffect(() => {
    setSolverGiven(autoGiven);
    setSolverAsked(autoAsked);
    setSolverExpected(autoExpected);
    setCandidateIdx(0);
    setSolverFeedback(null);
  }, [autoGiven, autoAsked, autoExpected, safeIndex]);

  const solverReport = useMemo(() => {
    if (!solverGiven.trim() && !solverAsked.trim()) return null;
    return solveWithRegistry({
      givenInput: solverGiven,
      askedInput: solverAsked,
      expectedAnswerInput: solverExpected,
      topic: 'General',
      operatorRules,
      solverEntries: solverPathRules,
      symbolAliases,
    });
  }, [solverGiven, solverAsked, solverExpected, operatorRules, solverPathRules, symbolAliases]);

  const activeCandidate: DiscoveryCandidate | null =
    solverReport?.discoveryCandidates[candidateIdx] || null;

  const handleConfirmCandidate = (cand: DiscoveryCandidate, mergeAliasOnly: boolean) => {
    if (mergeAliasOnly && cand.matchingExistingRowId) {
      setSolverPathRules((prev) =>
        prev.map((r) =>
          r.id === cand.matchingExistingRowId
            ? {
                ...r,
                askedAliases: Array.from(new Set([...r.askedAliases, cand.askedLabel])),
                hitCount: r.hitCount + 1,
                writtenBy: 'Solver',
              }
            : r
        )
      );
      if (cand.matchingExistingAsked) {
        setSymbolAliases((prev) =>
          prev.map((sa) =>
            sa.aliases.some(
              (a) => a.toLowerCase() === cand.matchingExistingAsked!.toLowerCase()
            )
              ? {
                  ...sa,
                  aliases: Array.from(new Set([...sa.aliases, cand.askedLabel])),
                  writtenBy: 'Solver',
                }
              : sa
          )
        );
      }
      setSolverFeedback(
        `Appended alias "${cand.askedLabel}" under "${cand.matchingExistingAsked}" in Solver's Registry.`
      );
    } else {
      const existingRow = solverPathRules.find((r) =>
        r.askedAliases.some((a) => a.toLowerCase() === cand.askedLabel.toLowerCase())
      );
      const newBranch = {
        id: `br-${Date.now()}`,
        givenVars: cand.givenVars,
        breakdown: cand.breakdown,
      };
      if (existingRow) {
        setSolverPathRules((prev) =>
          prev.map((r) =>
            r.id === existingRow.id
              ? { ...r, branches: [...r.branches, newBranch], writtenBy: 'Solver' }
              : r
          )
        );
      } else {
        setSolverPathRules((prev) => [
          ...prev,
          {
            id: `sol-${Date.now()}`,
            askedAliases: [cand.askedLabel],
            branches: [newBranch],
            hitCount: 1,
            writtenBy: 'Solver',
          },
        ]);
      }
      setSolverFeedback(
        `Saved [${cand.askedLabel} = ${cand.breakdown}] to Solver's Registry.`
      );
    }
    setCandidateIdx(0);
  };

  const handleNextQuestion = () => {
    if (parsedQuestions.length <= 1) return;
    setActiveIndex((prev) => (prev + 1) % parsedQuestions.length);
    if (tabBScrollRef.current) {
      tabBScrollRef.current.scrollTop = 0;
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        e.stopPropagation();
        if (parsedQuestions.length > 1) {
          setActiveIndex((prev) => (prev + 1) % parsedQuestions.length);
          if (tabBScrollRef.current) {
            tabBScrollRef.current.scrollTop = 0;
          }
        }
      }
    };
    window.addEventListener('keydown', onKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', onKeyDown, { capture: true });
  }, [parsedQuestions.length]);

  useEffect(() => {
    if (tabBScrollRef.current) {
      tabBScrollRef.current.scrollTop = 0;
    }
  }, [safeIndex]);

  return (
    <div className="w-full h-[calc(100vh-188px)] min-h-[520px] grid grid-cols-1 lg:grid-cols-12 gap-2 font-sans text-[#111827] bg-[#F5F4EF]">
      {/* LEFT COLUMN: TAB A (TOP) + TAB B (BOTTOM BOOKLET) */}
      <div className="lg:col-span-5 flex flex-col gap-2 min-h-0 h-full">
        {/* TAB A: INDIVIDUAL INFINITE SCROLL QUESTION PASTE AREA */}
        <section className="h-[34%] min-h-[160px] flex flex-col bg-white border border-[#DFDDD4] rounded-lg shadow-2xs overflow-hidden">
          <div className="shrink-0 px-3 py-2 border-b border-[#E5E3DC] bg-[#F9F8F4] flex items-center justify-between gap-2">
            <span className="px-2 py-0.5 rounded bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] font-mono text-[11px] font-bold">
              Tab A
            </span>
            <span className="font-mono text-[11px] font-bold text-[#6B7280]">
              {parsedQuestions.length} Qs
            </span>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden bg-[#FBFBF7]">
            <textarea
              value={rawInput}
              onChange={(e) => {
                setRawInput(e.target.value);
                setActiveIndex(0);
              }}
              spellCheck={false}
              placeholder="Paste your questions here."
              className="w-full h-full overflow-y-auto p-3 bg-transparent font-mono text-xs text-[#111827] placeholder-[#6B7280] resize-none focus:outline-none leading-relaxed"
            />
          </div>
        </section>

        {/* TAB B: BOOKLET VIEW (1 QUESTION AT A TIME, INDIVIDUAL INFINITE SCROLL) */}
        <section className="flex-1 min-h-0 flex flex-col bg-white border border-[#DFDDD4] rounded-lg shadow-2xs overflow-hidden">
          <div className="shrink-0 px-3 py-2 border-b border-[#E5E3DC] bg-[#F9F8F4] flex items-center justify-between gap-2">
            <span className="px-2 py-0.5 rounded bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] font-mono text-[11px] font-bold">
              Tab B
            </span>
            <span className="font-mono text-[11px] font-bold text-[#111827]">
              {parsedQuestions.length > 0 ? `${safeIndex + 1} / ${parsedQuestions.length}` : '0 / 0'}
            </span>
          </div>

          <div
            ref={tabBScrollRef}
            className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3 text-xs select-text"
          >
            {!activeQuestion ? (
              <div className="h-full flex items-center justify-center font-mono text-xs text-[#6B7280]">
                No parsed question.
              </div>
            ) : (
              <div key={`${activeQuestion.id}-${safeIndex}`} className="space-y-3">
                {/* 1) question id */}
                <div className="border-b border-[#F0EFEA] pb-2">
                  <div className="font-mono text-[11px] font-bold text-[#6B7280]">
                    1) question id
                  </div>
                  <div className="mt-1 font-mono text-xs font-extrabold text-[#1D4ED8]">
                    {activeQuestion.id}
                  </div>
                </div>

                {/* 2) question - */}
                <div className="border-b border-[#F0EFEA] pb-2">
                  <div className="font-mono text-[11px] font-bold text-[#6B7280]">
                    2) question -
                  </div>
                  <div className="mt-1 text-sm font-medium text-[#111827] leading-relaxed">
                    {activeQuestion.text ? (
                      <MkmlRenderedBlock source={activeQuestion.text} inline />
                    ) : (
                      '—'
                    )}
                  </div>
                </div>

                {/* 3) options - */}
                <div className="border-b border-[#F0EFEA] pb-2">
                  <div className="font-mono text-[11px] font-bold text-[#6B7280]">
                    3) options -
                  </div>
                  {activeQuestion.options.length > 0 ? (
                    <div className="mt-1.5 space-y-1">
                      {activeQuestion.options.map((opt) => {
                        const isCorrect =
                          activeQuestion.answer &&
                          opt.key.toUpperCase() === activeQuestion.answer.toUpperCase();
                        return (
                          <div
                            key={opt.key}
                            className={`flex items-start gap-2 px-2.5 py-1.5 rounded border text-xs ${
                              isCorrect
                                ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D] font-bold'
                                : 'bg-[#F9F8F4] border-[#DFDDD4] text-[#111827]'
                            }`}
                          >
                            <span className="font-mono font-extrabold shrink-0">{opt.key}</span>
                            <div className="flex-1 min-w-0">
                              <MkmlRenderedBlock source={opt.label} inline />
                            </div>
                          </div>
                        );
                      })}
                      {activeQuestion.answer && (
                        <div className="pt-1 font-mono text-[11px] font-bold text-[#15803D]">
                          Answer: {activeQuestion.answer}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-1 font-mono text-xs text-[#6B7280]">—</div>
                  )}
                </div>

                {/* 4) explanation */}
                <div className="border-b border-[#F0EFEA] pb-2">
                  <div className="font-mono text-[11px] font-bold text-[#6B7280]">
                    4) explanation
                  </div>
                  {activeQuestion.steps.length > 0 ? (
                    <div className="mt-1.5 space-y-2">
                      {activeQuestion.steps.map((st) => (
                        <div
                          key={st.stepNumber}
                          className="p-2.5 rounded border border-[#DFDDD4] bg-[#FBFBF7] space-y-1"
                        >
                          <div className="font-mono text-[11px] font-bold text-[#1D4ED8]">
                            step - {st.stepNumber}
                          </div>
                          <div className="text-xs text-[#111827] leading-relaxed">
                            <MkmlRenderedBlock source={st.text} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-1 font-mono text-xs text-[#6B7280]">None</div>
                  )}
                </div>

                {/* 5) exam info */}
                <div className="border-b border-[#F0EFEA] pb-2">
                  <div className="font-mono text-[11px] font-bold text-[#6B7280]">
                    5) exam info
                  </div>
                  <div className="mt-1 text-xs font-semibold text-[#111827]">
                    {activeQuestion.examInfo}
                  </div>
                </div>

                {/* 6) chapter */}
                <div className="border-b border-[#F0EFEA] pb-2">
                  <div className="font-mono text-[11px] font-bold text-[#6B7280]">
                    6) chapter
                  </div>
                  <div className="mt-1 text-xs font-semibold text-[#111827]">
                    {activeQuestion.chapterLabel}
                  </div>
                </div>

                {/* 7) subtopic */}
                <div className="border-b border-[#F0EFEA] pb-2">
                  <div className="font-mono text-[11px] font-bold text-[#6B7280]">
                    7) subtopic
                  </div>
                  <div className="mt-1 text-xs font-semibold text-[#111827]">
                    {activeQuestion.subtopicLabel}
                  </div>
                </div>

                {/* 8) concept */}
                <div className="border-b border-[#F0EFEA] pb-2">
                  <div className="font-mono text-[11px] font-bold text-[#6B7280]">
                    8) concept
                  </div>
                  <div className="mt-1 text-xs font-semibold text-[#111827]">
                    {activeQuestion.conceptLabel}
                  </div>
                </div>

                {/* 9) microconcept */}
                <div className="pb-1">
                  <div className="font-mono text-[11px] font-bold text-[#6B7280]">
                    9) microconcept
                  </div>
                  {activeQuestion.microConceptLabels.length > 0 ? (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {activeQuestion.microConceptLabels.map((mcLabel) => (
                        <span
                          key={mcLabel}
                          className="px-2 py-0.5 rounded border border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8] font-mono text-[11px] font-bold"
                        >
                          {mcLabel}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-1 font-mono text-xs text-[#6B7280]">—</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-[#E5E3DC] bg-[#F9F8F4] px-3 py-2 flex items-center justify-end">
            <button
              type="button"
              onClick={handleNextQuestion}
              disabled={parsedQuestions.length <= 1}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-[#1D4ED8] bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:opacity-45 disabled:cursor-not-allowed text-white font-mono text-xs font-bold transition-colors cursor-pointer"
            >
              <span>next question</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/15 border border-white/25 text-[10px]">
                Alt + N
              </kbd>
            </button>
          </div>
        </section>
      </div>

      {/* RIGHT COLUMN: GIVEN/ASKED TOP BAR + INTENTIONALLY BLANK BOTTOM WORKSPACE */}
      <div className="lg:col-span-7 flex flex-col gap-2 min-h-0 h-full">
        {/* TOP BAR: GIVEN & ASKED */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 shrink-0 max-h-[34%]">
          <section className="bg-white border border-[#DFDDD4] rounded-lg p-3 shadow-2xs overflow-y-auto space-y-2">
            <div>
              <div className="font-mono text-[11px] font-bold text-[#15803D]">Given -</div>
              {extraction && extraction.given.items.length > 0 ? (
                <div className="mt-1.5 space-y-1.5">
                  {extraction.given.items.map((item, idx) => (
                    <div
                      key={`${activeQuestion?.id || 'q'}-giv-${idx}`}
                      className="px-2 py-1 rounded bg-[#F0FDF4] border border-[#BBF7D0] text-xs text-[#111827] leading-relaxed"
                    >
                      {extraction.given.items.length > 1 && (
                        <span className="font-mono text-[10px] font-bold text-[#15803D] mr-1.5">
                          {idx + 1})
                        </span>
                      )}
                      <MkmlRenderedBlock source={item} inline />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-1 font-mono text-xs text-[#111827]">—</div>
              )}
              {extraction && extraction.given.recognizedOperators.length > 0 && (
                <div className="mt-1.5 flex flex-wrap items-center gap-1">
                  <span className="font-mono text-[10px] font-bold text-[#6B7280]">Ops:</span>
                  {extraction.given.recognizedOperators.map((op) => (
                    <span
                      key={`giv-op-${op.id}`}
                      title={`${op.name} (${op.topic}) · ${op.egOutput}`}
                      className="px-1.5 py-0.5 rounded bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] font-mono text-[10px] font-bold"
                    >
                      {op.symbol}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t border-[#F0EFEA] pt-2">
              <div className="font-mono text-[11px] font-bold text-[#6B7280]">used rule no -</div>
              <div className="mt-0.5 font-mono text-xs font-semibold text-[#111827]">
                {extraction ? extraction.given.usedRulesText : '—'}
              </div>
            </div>
          </section>

          <section className="bg-white border border-[#DFDDD4] rounded-lg p-3 shadow-2xs overflow-y-auto space-y-2">
            <div>
              <div className="font-mono text-[11px] font-bold text-[#B45309]">Asked -</div>
              {extraction && extraction.asked.items.length > 0 ? (
                <div className="mt-1.5 space-y-1.5">
                  {extraction.asked.items.map((item, idx) => (
                    <div
                      key={`${activeQuestion?.id || 'q'}-ask-${idx}`}
                      className="px-2 py-1 rounded bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#111827] leading-relaxed"
                    >
                      {extraction.asked.items.length > 1 && (
                        <span className="font-mono text-[10px] font-bold text-[#B45309] mr-1.5">
                          {idx + 1})
                        </span>
                      )}
                      <MkmlRenderedBlock source={item} inline />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-1 font-mono text-xs text-[#111827]">—</div>
              )}
              {extraction && extraction.asked.recognizedOperators.length > 0 && (
                <div className="mt-1.5 flex flex-wrap items-center gap-1">
                  <span className="font-mono text-[10px] font-bold text-[#6B7280]">Ops:</span>
                  {extraction.asked.recognizedOperators.map((op) => (
                    <span
                      key={`ask-op-${op.id}`}
                      title={`${op.name} (${op.topic}) · ${op.egOutput}`}
                      className="px-1.5 py-0.5 rounded bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] font-mono text-[10px] font-bold"
                    >
                      {op.symbol}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t border-[#F0EFEA] pt-2">
              <div className="font-mono text-[11px] font-bold text-[#6B7280]">used rule no -</div>
              <div className="mt-0.5 font-mono text-xs font-semibold text-[#111827]">
                {extraction ? extraction.asked.usedRulesText : '—'}
              </div>
            </div>
          </section>
        </div>

        {/* LIVE AUTONOMOUS SOLVER WORKSPACE */}
        <section className="flex-1 min-h-0 flex flex-col bg-white border border-[#DFDDD4] rounded-lg shadow-2xs overflow-hidden">
          <div className="shrink-0 px-3 py-2 border-b border-[#E5E3DC] bg-[#F9F8F4] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] font-mono text-[11px] font-bold">
                Solver
              </span>
              {solverReport && (
                <span
                  className={`px-2 py-0.5 rounded border font-mono text-[10px] font-bold uppercase ${
                    solverReport.solved
                      ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]'
                      : solverReport.mode === 'discovery-needed'
                        ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#B45309]'
                        : 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]'
                  }`}
                >
                  {solverReport.mode}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {!rawInput.trim() && (
                <button
                  type="button"
                  onClick={() => {
                    setRawInput(SAMPLE_TESTER_BATCH);
                    setActiveIndex(0);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[#BFDBFE] bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] font-mono text-[10px] font-bold cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Load Sample Questions</span>
                </button>
              )}
              {activeQuestion && (
                <button
                  type="button"
                  onClick={() => {
                    setSolverGiven(autoGiven);
                    setSolverAsked(autoAsked);
                    setSolverExpected(autoExpected);
                    setCandidateIdx(0);
                    setSolverFeedback(null);
                  }}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded border border-[#DFDDD4] bg-white hover:bg-[#F3F2EE] text-[#374151] font-mono text-[10px] font-bold cursor-pointer"
                  title="Reset solver inputs to extracted Given / Asked"
                >
                  <Play className="w-3 h-3" />
                  <span>Sync Q</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3 text-xs select-text">
            {/* Compact Live Solver Input Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 font-mono text-[11px] bg-[#F9F8F4] border border-[#E5E3DC] rounded p-2">
              <div className="sm:col-span-5">
                <div className="text-[10px] font-bold text-[#15803D] mb-0.5">Given Input</div>
                <input
                  type="text"
                  value={solverGiven}
                  onChange={(e) => setSolverGiven(e.target.value)}
                  placeholder="e.g. selling price = 30, cost price = 20"
                  className="w-full px-2 py-1 bg-white border border-[#D1CFC7] rounded text-xs font-mono text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
                />
              </div>
              <div className="sm:col-span-4">
                <div className="text-[10px] font-bold text-[#B45309] mb-0.5">Asked Input</div>
                <input
                  type="text"
                  value={solverAsked}
                  onChange={(e) => setSolverAsked(e.target.value)}
                  placeholder="e.g. Profit% or L"
                  className="w-full px-2 py-1 bg-white border border-[#D1CFC7] rounded text-xs font-mono text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
                />
              </div>
              <div className="sm:col-span-3">
                <div className="text-[10px] font-bold text-[#6B7280] mb-0.5">Expected Ans</div>
                <input
                  type="text"
                  value={solverExpected}
                  onChange={(e) => setSolverExpected(e.target.value)}
                  placeholder="from <answer>"
                  className="w-full px-2 py-1 bg-white border border-[#D1CFC7] rounded text-xs font-mono text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
                />
              </div>
            </div>

            {solverFeedback && (
              <div className="px-2.5 py-1.5 rounded bg-[#F0FDF4] border border-[#BBF7D0] font-mono text-[11px] font-bold text-[#15803D]">
                {solverFeedback}
              </div>
            )}

            {!solverReport ? (
              <div className="py-8 text-center font-mono text-xs text-[#6B7280]">
                Paste a question into Tab A (or enter Given / Asked above) to run the Autonomous Solver.
              </div>
            ) : (
              <div className="space-y-3">
                {/* Summary Banner */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded border border-[#DFDDD4] bg-[#FBFBF7] font-mono">
                  <div>
                    <div className="text-[10px] uppercase text-[#6B7280]">Normalized Target &amp; Result</div>
                    <div className="text-sm font-extrabold text-[#111827] mt-0.5">
                      {solverReport.normalizedAsked || '—'} ={' '}
                      <span className={solverReport.solved ? 'text-[#15803D]' : 'text-[#B45309]'}>
                        {solverReport.derivedText}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-[#6B7280]">
                      Ops: {solverReport.opsUsed.length > 0 ? solverReport.opsUsed.join(' ') : '—'}
                    </div>
                    {solverReport.matchesExpected !== null && (
                      <div
                        className={`text-[11px] font-bold ${
                          solverReport.matchesExpected ? 'text-[#15803D]' : 'text-[#DC2626]'
                        }`}
                      >
                        {solverReport.matchesExpected
                          ? `Matches Expected (${formatNumClean(solverReport.expectedValue ?? 0)})`
                          : `Mismatch vs Expected (${formatNumClean(solverReport.expectedValue ?? 0)})`}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status message */}
                <div className="font-mono text-[11px] text-[#4B5563]">
                  {solverReport.statusMessage}
                </div>

                {/* Step-by-Step Solver Trace */}
                {solverReport.steps.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="font-mono text-[10px] uppercase font-bold text-[#6B7280]">
                      Derived Solution Steps
                    </div>
                    {solverReport.steps.map((st) => (
                      <div
                        key={`sol-step-${st.stepNo}`}
                        className="px-2.5 py-2 rounded border border-[#DFDDD4] bg-white font-mono text-[11px] flex flex-wrap items-center justify-between gap-2"
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-[#1D4ED8]">
                            Step {st.stepNo}{' '}
                            <span className="text-[10px] font-normal text-[#6B7280]">({st.kind})</span>
                          </div>
                          <div className="text-[#111827]">{st.description}</div>
                        </div>
                        <div className="px-2 py-0.5 rounded bg-[#F0FDF4] border border-[#BBF7D0] font-bold text-[#15803D]">
                          {st.resultText}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bounded Discovery Confirmation Card */}
                {activeCandidate && (
                  <div className="p-3 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] space-y-2 font-mono text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-[#92400E]">
                        Discovery Candidate ({candidateIdx + 1} / {solverReport.discoveryCandidates.length})
                      </span>
                      <span className="text-[10px] text-[#B45309]">
                        Confirm before writing to Solver&apos;s Registry
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 bg-white border border-[#FDE68A] rounded p-2 text-[11px]">
                      <div>
                        <div className="text-[10px] text-[#6B7280]">Asked</div>
                        <div className="font-bold text-[#B45309]">{activeCandidate.askedLabel}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[#6B7280]">Given</div>
                        <div className="font-bold text-[#15803D]">
                          {activeCandidate.givenVars.join(', ')}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[#6B7280]">Breakdown</div>
                        <div className="font-bold text-[#1D4ED8]">
                          {activeCandidate.breakdown} = {formatNumClean(activeCandidate.derivedValue)}
                        </div>
                      </div>
                    </div>

                    {activeCandidate.matchingExistingRowId && (
                      <div className="text-[11px] text-[#92400E]">
                        Matches existing formula under{' '}
                        <span className="font-bold">{activeCandidate.matchingExistingAsked}</span>.
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2">
                      {activeCandidate.matchingExistingRowId && (
                        <button
                          type="button"
                          onClick={() => handleConfirmCandidate(activeCandidate, true)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#B45309] hover:bg-[#92400E] text-white text-[11px] font-bold cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          <span>Confirm Alias ({activeCandidate.matchingExistingAsked})</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleConfirmCandidate(activeCandidate, false)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#15803D] hover:bg-[#166534] text-white text-[11px] font-bold cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                        <span>Confirm &amp; Append</span>
                      </button>
                      {candidateIdx + 1 < solverReport.discoveryCandidates.length && (
                        <button
                          type="button"
                          onClick={() => setCandidateIdx((i) => i + 1)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[#D1CFC7] bg-white hover:bg-[#F3F2EE] text-[#374151] text-[11px] font-bold cursor-pointer"
                        >
                          <SkipForward className="w-3 h-3" />
                          <span>Reject &amp; Next</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setSolverExpected('')}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded border border-[#FECACA] bg-white hover:bg-[#FEF2F2] text-[#DC2626] text-[11px] font-bold cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                        <span>Dismiss</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
