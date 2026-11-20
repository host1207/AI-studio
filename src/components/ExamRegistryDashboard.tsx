import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  BarChart3,
  FolderTree,
  ArrowUpRight,
  Calculator,
  Check,
  ArrowUp,
  ArrowDown,
  Edit3,
  Sliders,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import type { ChapterLedger, AttemptTuple } from './TrackerPageOne';

// ============================================================================
// 1. DATA MODELS FOR THE 5-TIER REGISTRY & SELF-CONTAINED EXAM METADATA
// ============================================================================

export interface DomainItem {
  id: string;
  name: string;
  code: string;
}

export interface ChapterItem {
  id: string;
  name: string;
  code: string; // Chapter ID e.g. PN, TRG, TD, TW
  domainCode: string;
}

export interface SubtopicItem {
  id: string;
  code: string; // Subtopic Name / Code e.g. Relative Pronouns, Degree
  chapterCode: string;
  domainCode: string;
}

export interface ConceptItem {
  id: string;
  code: string; // Concept Name / Code e.g. ASTC
  subtopicCode: string;
  chapterCode: string;
  domainCode: string;
}

export interface MicroConceptItem {
  id: string;
  code: string; // e.g. MC1, MC2
  shortCode: string; // Unique Step Short Form e.g. T1, T2
  conceptCode: string;
  subtopicCode: string;
  chapterCode: string;
  domainCode: string;
}

export interface ExamChapterWeight {
  chapterCode: string;
  percentage: number; // CnPn (must sum to 100% / 1.00 per domain)
}

export interface ExamDomainWeight {
  domainCode: string;
  percentage: number; // DnPn (must sum to 100% per exam)
  chapters: ExamChapterWeight[];
}

export interface ExamProfile {
  id: string;
  name: string;
  domains: ExamDomainWeight[];
}

// Helper to compute live TCR (Total Completion Ratio) from a ChapterLedger
// Used ONLY in Exam Info Page 1 (Results Dashboard), never in Registry
export function computeChapterTCR(ledger?: ChapterLedger): {
  TQ: number;
  MM: number;
  LTM: number;
  TCR: number;
} {
  if (!ledger) {
    return { TQ: 0, MM: 0, LTM: 0, TCR: 0 };
  }

  const { timing, concepts } = ledger;
  const allQuestions: AttemptTuple[][] = [];

  Object.values(concepts).forEach((qMap) => {
    Object.values(qMap).forEach((history) => {
      allQuestions.push(history);
    });
  });

  const TQ = allQuestions.length;
  let NQC = 0;
  let NQW = 0;
  let NQS = 0;
  let NQF = 0;
  let NQM = 0;
  let NQSl = 0;

  allQuestions.forEach((history) => {
    if (!history || history.length === 0) return;
    const latest = history[history.length - 1];
    const [status, seconds] = latest;
    if (status === 'C') {
      NQC += 1;
      if (seconds <= timing.fastLimit) NQF += 1;
      else if (seconds <= timing.mediumLimit) NQM += 1;
      else if (seconds <= timing.slowLimit) NQSl += 1;
    } else if (status === 'W') {
      NQW += 1;
    } else if (status === 'S') {
      NQS += 1;
    }
  });

  const MM = TQ * 3;
  const ARMNT = NQC * 1.0 - NQW * 0.5 - NQS * 0.2;
  const NTM = NQF * 2.0 + NQM * 1.0 + NQSl * 0.5;
  const LTM = Number((ARMNT + NTM).toFixed(2));
  const TCR = MM > 0 ? (LTM / MM) * 100 : 0;

  return { TQ, MM, LTM, TCR };
}

// ============================================================================
// 2. INITIAL PRE-BUILT REGISTRIES & SSC CHSL SAMPLE EXAM
// ============================================================================

export const INITIAL_DOMAINS: DomainItem[] = [
  { id: 'dom-1', name: 'Quantitative Aptitude', code: 'QA' },
  { id: 'dom-2', name: 'English Language', code: 'Eng' },
  { id: 'dom-3', name: 'General Intelligence & Reasoning', code: 'GI' },
  { id: 'dom-4', name: 'General Studies', code: 'GS' },
];

export const INITIAL_CHAPTERS: ChapterItem[] = [
  // Notebook examples first: Pronouns (Eng), Time and Work (QA)
  { id: 'ch-7', name: 'Pronouns', code: 'PN', domainCode: 'Eng' },
  { id: 'ch-6', name: 'Time and Work', code: 'TW', domainCode: 'QA' },
  // Remaining QA Chapters
  { id: 'ch-1', name: 'Time and Distance', code: 'TD', domainCode: 'QA' },
  { id: 'ch-2', name: 'Trigonometry', code: 'TRG', domainCode: 'QA' },
  { id: 'ch-3', name: 'Profit and Loss', code: 'PL', domainCode: 'QA' },
  { id: 'ch-4', name: 'Algebra', code: 'ALG', domainCode: 'QA' },
  { id: 'ch-5', name: 'Geometry', code: 'GEO', domainCode: 'QA' },
  // Remaining Eng Chapters
  { id: 'ch-8', name: 'Verbs & Tenses', code: 'VB', domainCode: 'Eng' },
  { id: 'ch-9', name: 'Adjectives', code: 'ADJ', domainCode: 'Eng' },
  { id: 'ch-10', name: 'Vocabulary & Cloze', code: 'VOC', domainCode: 'Eng' },
  // GI Chapters
  { id: 'ch-11', name: 'Number & Letter Series', code: 'SER', domainCode: 'GI' },
  { id: 'ch-12', name: 'Analogy & Classification', code: 'ANA', domainCode: 'GI' },
  { id: 'ch-13', name: 'Coding-Decoding', code: 'COD', domainCode: 'GI' },
  // GS Chapters
  { id: 'ch-14', name: 'Indian Polity', code: 'POL', domainCode: 'GS' },
  { id: 'ch-15', name: 'History & Culture', code: 'HIS', domainCode: 'GS' },
  { id: 'ch-16', name: 'General Science', code: 'SCI', domainCode: 'GS' },
];

export const INITIAL_SUBTOPICS: SubtopicItem[] = [
  { id: 'st-trg-bs', code: 'Basics', chapterCode: 'TRG', domainCode: 'QA' },
  { id: 'st-4', code: 'Degree', chapterCode: 'TRG', domainCode: 'QA' },
  { id: 'st-1', code: 'Relative Pronouns', chapterCode: 'PN', domainCode: 'Eng' },
  { id: 'st-2', code: 'Personal Pronouns', chapterCode: 'PN', domainCode: 'Eng' },
  { id: 'st-3', code: 'Reciprocal Pronouns', chapterCode: 'PN', domainCode: 'Eng' },
  { id: 'st-5', code: 'Dishonest Dealer', chapterCode: 'PL', domainCode: 'QA' },
  { id: 'st-6', code: 'Basic Work Rates', chapterCode: 'TD', domainCode: 'QA' },
  { id: 'st-7', code: 'Relative Speed & Trains', chapterCode: 'TD', domainCode: 'QA' },
];

export const INITIAL_CONCEPTS: ConceptItem[] = [
  {
    id: 'con-trg-fr',
    code: 'FR',
    subtopicCode: 'Basics',
    chapterCode: 'TRG',
    domainCode: 'QA',
  },
  {
    id: 'con-1',
    code: 'ASTC',
    subtopicCode: 'Degree',
    chapterCode: 'TRG',
    domainCode: 'QA',
  },
  {
    id: 'con-2',
    code: 'Subjective Finite Verb Lock',
    subtopicCode: 'Relative Pronouns',
    chapterCode: 'PN',
    domainCode: 'Eng',
  },
  {
    id: 'con-3',
    code: 'Profit & Loss Core Formulas',
    subtopicCode: 'Dishonest Dealer',
    chapterCode: 'PL',
    domainCode: 'QA',
  },
  {
    id: 'con-4',
    code: 'V1',
    subtopicCode: 'Basic Work Rates',
    chapterCode: 'TD',
    domainCode: 'QA',
  },
  {
    id: 'con-5',
    code: 'V2',
    subtopicCode: 'Basic Work Rates',
    chapterCode: 'TD',
    domainCode: 'QA',
  },
  {
    id: 'con-6',
    code: 'V1',
    subtopicCode: 'Relative Speed & Trains',
    chapterCode: 'TD',
    domainCode: 'QA',
  },
];

export const INITIAL_MICRO_CONCEPTS: MicroConceptItem[] = [
  {
    id: 'mc-trg-1',
    code: 'MC1 (Fundamental Right-Triangle Ratios: oppo / adj / hypo)',
    shortCode: 'T1',
    conceptCode: 'FR',
    subtopicCode: 'Basics',
    chapterCode: 'TRG',
    domainCode: 'QA',
  },
  {
    id: 'mc-trg-2',
    code: 'MC2 (Pythagorean Triplets Generator: Odd & Even Rules)',
    shortCode: 'T2',
    conceptCode: 'FR',
    subtopicCode: 'Basics',
    chapterCode: 'TRG',
    domainCode: 'QA',
  },
  {
    id: 'mc-trg-3',
    code: 'MC3 (Dual-Vertex / Complementary Angle Switch: A vs C & θ vs 90°-θ)',
    shortCode: 'T3',
    conceptCode: 'FR',
    subtopicCode: 'Basics',
    chapterCode: 'TRG',
    domainCode: 'QA',
  },
  {
    id: 'mc-trg-tg',
    code: 'TG (Target Algebraic Substitution & Fraction Simplification)',
    shortCode: 'TG',
    conceptCode: 'FR',
    subtopicCode: 'Basics',
    chapterCode: 'TRG',
    domainCode: 'QA',
  },
  {
    id: 'mc-td-1',
    code: 'Speed = Distance / Time (Direct Ratio)',
    shortCode: 'T1',
    conceptCode: 'V1',
    subtopicCode: 'Basic Work Rates',
    chapterCode: 'TD',
    domainCode: 'QA',
  },
  {
    id: 'mc-td-2',
    code: 'Unit Conversion (km/h × 5/18) & Harmonic Mean',
    shortCode: 'T2',
    conceptCode: 'V2',
    subtopicCode: 'Basic Work Rates',
    chapterCode: 'TD',
    domainCode: 'QA',
  },
  {
    id: 'mc-td-3',
    code: 'Inverse Speed-Time Ratio & Meet-Time Proportionality',
    shortCode: 'T3',
    conceptCode: 'V1',
    subtopicCode: 'Relative Speed & Trains',
    chapterCode: 'TD',
    domainCode: 'QA',
  },
  {
    id: 'mc-4',
    code: 'PL.C2 (Markup Over Cost Price)',
    shortCode: 'PL-T1',
    conceptCode: 'Profit & Loss Core Formulas',
    subtopicCode: 'Dishonest Dealer',
    chapterCode: 'PL',
    domainCode: 'QA',
  },
  {
    id: 'mc-5',
    code: 'PL.C3 (False Weight Ratio Multiplier)',
    shortCode: 'PL-T2',
    conceptCode: 'Profit & Loss Core Formulas',
    subtopicCode: 'Dishonest Dealer',
    chapterCode: 'PL',
    domainCode: 'QA',
  },
];

export const INITIAL_EXAMS: ExamProfile[] = [
  {
    id: 'exam-ssc-chsl',
    name: 'SSC CHSL',
    domains: [
      {
        domainCode: 'QA',
        percentage: 25,
        chapters: [
          { chapterCode: 'TD', percentage: 15 },
          { chapterCode: 'TRG', percentage: 25 },
          { chapterCode: 'PL', percentage: 20 },
          { chapterCode: 'ALG', percentage: 20 },
          { chapterCode: 'GEO', percentage: 20 },
        ],
      },
      {
        domainCode: 'Eng',
        percentage: 25,
        chapters: [
          { chapterCode: 'PN', percentage: 20 },
          { chapterCode: 'VB', percentage: 30 },
          { chapterCode: 'ADJ', percentage: 20 },
          { chapterCode: 'VOC', percentage: 30 },
        ],
      },
      {
        domainCode: 'GI',
        percentage: 25,
        chapters: [
          { chapterCode: 'SER', percentage: 40 },
          { chapterCode: 'ANA', percentage: 30 },
          { chapterCode: 'COD', percentage: 30 },
        ],
      },
      {
        domainCode: 'GS',
        percentage: 25,
        chapters: [
          { chapterCode: 'POL', percentage: 30 },
          { chapterCode: 'HIS', percentage: 30 },
          { chapterCode: 'SCI', percentage: 40 },
        ],
      },
    ],
  },
];

// ============================================================================
// 3. COMPONENT IMPLEMENTATION
// ============================================================================

export type DashboardSectionMode = 'registry' | 'exam-page-1' | 'exam-page-2';

interface Props {
  ledgers: Record<string, ChapterLedger>;
  activeMode: DashboardSectionMode;
  onSwitchMode: (mode: DashboardSectionMode) => void;
  onJumpToChapterLedger: (chapterCode: string) => void;
  onRegisterNewChapterLedger: (chapterCode: string, chapterName: string) => void;
  domains: DomainItem[];
  setDomains: React.Dispatch<React.SetStateAction<DomainItem[]>>;
  chapters: ChapterItem[];
  setChapters: React.Dispatch<React.SetStateAction<ChapterItem[]>>;
  subtopics: SubtopicItem[];
  setSubtopics: React.Dispatch<React.SetStateAction<SubtopicItem[]>>;
  concepts: ConceptItem[];
  setConcepts: React.Dispatch<React.SetStateAction<ConceptItem[]>>;
  microConcepts: MicroConceptItem[];
  setMicroConcepts: React.Dispatch<React.SetStateAction<MicroConceptItem[]>>;
  exams: ExamProfile[];
  setExams: React.Dispatch<React.SetStateAction<ExamProfile[]>>;
  selectedExamId: string;
  setSelectedExamId: React.Dispatch<React.SetStateAction<string>>;
}

export const ExamRegistryDashboard: React.FC<Props> = ({
  ledgers,
  activeMode,
  onSwitchMode,
  onJumpToChapterLedger,
  onRegisterNewChapterLedger,
  domains,
  setDomains,
  chapters,
  setChapters,
  subtopics,
  setSubtopics,
  concepts,
  setConcepts,
  microConcepts,
  setMicroConcepts,
  exams,
  setExams,
  selectedExamId,
  setSelectedExamId,
}) => {
  // 5 Separate Pages inside Registry
  const [registryPage, setRegistryPage] = useState<
    'domain' | 'chapter' | 'subtopic' | 'concept' | 'micro'
  >('domain');

  // 1a) Domain Creation Form State
  const [domNameInput, setDomNameInput] = useState('');
  const [domCodeInput, setDomCodeInput] = useState('');

  // 2a) Chapter Creation Form State
  const [chDomainSelect, setChDomainSelect] = useState('QA');
  const [chNameInput, setChNameInput] = useState('');
  const [chIdInput, setChIdInput] = useState('');

  // 3a) Subtopic Creation Form State
  const [stChapterSelect, setStChapterSelect] = useState('PN');
  const [stCodeInput, setStCodeInput] = useState('');

  // 4a) Concept Creation Form State
  const [conSubtopicSelect, setConSubtopicSelect] = useState('Degree');
  const [conCodeInput, setConCodeInput] = useState('');

  // 5a) Micro Concept Creation Form State
  const [mcConceptSelect, setMcConceptSelect] = useState('ASTC');
  const [mcCodeInput, setMcCodeInput] = useState('');
  const [mcShortCodeInput, setMcShortCodeInput] = useState('');

  // Exam Info Page 2 (Configuration & Creation) State:
  // Can either edit an existing exam (editingExamId !== 'NEW') or create a new exam ('NEW')
  const initialConfigExam = exams.find((e) => e.id === selectedExamId) || exams[0] || INITIAL_EXAMS[0];
  const [configTargetId, setConfigTargetId] = useState<string>(initialConfigExam.id);
  const [draftExamName, setDraftExamName] = useState<string>(initialConfigExam.name);
  const [draftDomains, setDraftDomains] = useState<ExamDomainWeight[]>(
    JSON.parse(JSON.stringify(initialConfigExam.domains))
  );
  const [examSaveMessage, setExamSaveMessage] = useState<string | null>(null);

  // Switch between editing an existing exam vs creating a new exam in Exam Info Page 2
  const handleSelectConfigTarget = (targetId: string) => {
    setConfigTargetId(targetId);
    setExamSaveMessage(null);
    if (targetId === 'NEW') {
      setDraftExamName('');
      const defaultDom = domains[0]?.code || 'QA';
      const defaultCh = chapters.find((c) => c.domainCode === defaultDom)?.code || 'TD';
      setDraftDomains([
        {
          domainCode: defaultDom,
          percentage: 100,
          chapters: [{ chapterCode: defaultCh, percentage: 100 }],
        },
      ]);
    } else {
      const found = exams.find((x) => x.id === targetId);
      if (found) {
        setDraftExamName(found.name);
        setDraftDomains(JSON.parse(JSON.stringify(found.domains)));
      }
    }
  };

  // ============================================================================
  // HANDLERS FOR 5 SEPARATE REGISTRY PAGES (1a..5a)
  // ============================================================================

  const handleCreateDomain = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = domNameInput.trim();
    const cleanCode = domCodeInput.trim();
    if (!cleanName || !cleanCode) return;
    if (domains.some((d) => d.code.toLowerCase() === cleanCode.toLowerCase())) return;

    setDomains((prev) => [
      ...prev,
      { id: `dom-${Date.now()}`, name: cleanName, code: cleanCode },
    ]);
    setDomNameInput('');
    setDomCodeInput('');
  };

  const handleCreateChapter = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = chNameInput.trim();
    const cleanId = chIdInput.trim().toUpperCase();
    if (!cleanName || !cleanId || !chDomainSelect) return;
    if (chapters.some((c) => c.code.toLowerCase() === cleanId.toLowerCase())) return;

    setChapters((prev) => [
      ...prev,
      {
        id: `ch-${Date.now()}`,
        name: cleanName,
        code: cleanId,
        domainCode: chDomainSelect,
      },
    ]);
    onRegisterNewChapterLedger(cleanId, cleanName);
    setChNameInput('');
    setChIdInput('');
  };

  const handleCreateSubtopic = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = stCodeInput.trim();
    if (!cleanCode || !stChapterSelect) return;
    const parentCh = chapters.find((c) => c.code === stChapterSelect);
    const domainCode = parentCh ? parentCh.domainCode : 'QA';

    setSubtopics((prev) => [
      ...prev,
      {
        id: `st-${Date.now()}`,
        code: cleanCode,
        chapterCode: stChapterSelect,
        domainCode,
      },
    ]);
    setStCodeInput('');
  };

  const handleCreateConcept = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = conCodeInput.trim();
    if (!cleanCode || !conSubtopicSelect) return;
    const parentSt = subtopics.find((s) => s.code === conSubtopicSelect);

    setConcepts((prev) => [
      ...prev,
      {
        id: `con-${Date.now()}`,
        code: cleanCode,
        subtopicCode: conSubtopicSelect,
        chapterCode: parentSt ? parentSt.chapterCode : 'TRG',
        domainCode: parentSt ? parentSt.domainCode : 'QA',
      },
    ]);
    setConCodeInput('');
  };

  const handleCreateMicroConcept = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = mcCodeInput.trim();
    const cleanShort = mcShortCodeInput.trim();
    if (!cleanCode || !cleanShort || !mcConceptSelect) return;
    const parentCon = concepts.find((c) => c.code === mcConceptSelect);

    setMicroConcepts((prev) => [
      ...prev,
      {
        id: `mc-${Date.now()}`,
        code: cleanCode,
        shortCode: cleanShort,
        conceptCode: mcConceptSelect,
        subtopicCode: parentCon ? parentCon.subtopicCode : 'Degree',
        chapterCode: parentCon ? parentCon.chapterCode : 'TRG',
        domainCode: parentCon ? parentCon.domainCode : 'QA',
      },
    ]);
    setMcCodeInput('');
    setMcShortCodeInput('');
  };

  // ============================================================================
  // HANDLERS & VALIDATION FOR EXAM INFO PAGE 2 (CONFIGURATION & CREATION)
  // ============================================================================

  const totalDomainPct = useMemo(
    () => draftDomains.reduce((acc, d) => acc + (Number(d.percentage) || 0), 0),
    [draftDomains]
  );

  const isDomainSumValid = Math.abs(totalDomainPct - 100) < 0.001;

  const domainChapterValidity = useMemo(() => {
    return draftDomains.map((d) => {
      const sum = d.chapters.reduce((acc, c) => acc + (Number(c.percentage) || 0), 0);
      const normalized = sum / 100;
      const isValid = d.chapters.length > 0 && Math.abs(sum - 100) < 0.001;
      return { domainCode: d.domainCode, sum, normalized, isValid };
    });
  }, [draftDomains]);

  const areAllChaptersValid = domainChapterValidity.every((v) => v.isValid);
  const canSaveExam =
    draftExamName.trim().length > 0 &&
    draftDomains.length > 0 &&
    isDomainSumValid &&
    areAllChaptersValid;

  const handleAddDraftDomainRow = () => {
    const unusedDomain =
      domains.find((d) => !draftDomains.some((dd) => dd.domainCode === d.code)) || domains[0];
    if (!unusedDomain) return;
    const firstCh = chapters.find((c) => c.domainCode === unusedDomain.code);

    setDraftDomains((prev) => [
      ...prev,
      {
        domainCode: unusedDomain.code,
        percentage: 0,
        chapters: firstCh ? [{ chapterCode: firstCh.code, percentage: 100 }] : [],
      },
    ]);
  };

  const handleRemoveDraftDomainRow = (idx: number) => {
    setDraftDomains((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleMoveDraftDomainRow = (idx: number, direction: -1 | 1) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= draftDomains.length) return;
    setDraftDomains((prev) => {
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  };

  const handleUpdateDraftDomainCode = (idx: number, nextDomainCode: string) => {
    const firstCh = chapters.find((c) => c.domainCode === nextDomainCode);
    setDraftDomains((prev) =>
      prev.map((item, i) =>
        i === idx
          ? {
              ...item,
              domainCode: nextDomainCode,
              chapters: firstCh ? [{ chapterCode: firstCh.code, percentage: 100 }] : [],
            }
          : item
      )
    );
  };

  const handleUpdateDraftDomainPct = (idx: number, pct: number) => {
    setDraftDomains((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, percentage: pct } : item))
    );
  };

  const handleAddDraftChapterRow = (domIdx: number) => {
    const targetDomCode = draftDomains[domIdx].domainCode;
    const domChapters = chapters.filter((c) => c.domainCode === targetDomCode);
    const unusedCh =
      domChapters.find(
        (c) => !draftDomains[domIdx].chapters.some((dc) => dc.chapterCode === c.code)
      ) || domChapters[0];
    if (!unusedCh) return;

    setDraftDomains((prev) =>
      prev.map((dom, i) =>
        i === domIdx
          ? {
              ...dom,
              chapters: [...dom.chapters, { chapterCode: unusedCh.code, percentage: 0 }],
            }
          : dom
      )
    );
  };

  const handleRemoveDraftChapterRow = (domIdx: number, chIdx: number) => {
    setDraftDomains((prev) =>
      prev.map((dom, i) =>
        i === domIdx
          ? {
              ...dom,
              chapters: dom.chapters.filter((_, j) => j !== chIdx),
            }
          : dom
      )
    );
  };

  const handleMoveDraftChapterRow = (domIdx: number, chIdx: number, direction: -1 | 1) => {
    setDraftDomains((prev) =>
      prev.map((dom, i) => {
        if (i !== domIdx) return dom;
        const targetIdx = chIdx + direction;
        if (targetIdx < 0 || targetIdx >= dom.chapters.length) return dom;
        const nextChapters = [...dom.chapters];
        const temp = nextChapters[chIdx];
        nextChapters[chIdx] = nextChapters[targetIdx];
        nextChapters[targetIdx] = temp;
        return { ...dom, chapters: nextChapters };
      })
    );
  };

  const handleUpdateDraftChapter = (
    domIdx: number,
    chIdx: number,
    field: 'chapterCode' | 'percentage',
    value: string | number
  ) => {
    setDraftDomains((prev) =>
      prev.map((dom, i) =>
        i === domIdx
          ? {
              ...dom,
              chapters: dom.chapters.map((ch, j) =>
                j === chIdx ? { ...ch, [field]: value } : ch
              ),
            }
          : dom
      )
    );
  };

  const handleSaveExamProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSaveExam) return;

    const cleanDomains: ExamDomainWeight[] = draftDomains.map((d) => ({
      domainCode: d.domainCode,
      percentage: Number(d.percentage),
      chapters: d.chapters.map((c) => ({
        chapterCode: c.chapterCode,
        percentage: Number(c.percentage),
      })),
    }));

    if (configTargetId === 'NEW') {
      const newId = `exam-${Date.now()}`;
      const created: ExamProfile = {
        id: newId,
        name: draftExamName.trim(),
        domains: cleanDomains,
      };
      setExams((prev) => [...prev, created]);
      setSelectedExamId(newId);
      setConfigTargetId(newId);
      setExamSaveMessage(
        `Created new exam "${created.name}" with all calculation metadata! Selected in Page 1.`
      );
    } else {
      setExams((prev) =>
        prev.map((ex) =>
          ex.id === configTargetId
            ? { ...ex, name: draftExamName.trim(), domains: cleanDomains }
            : ex
        )
      );
      setSelectedExamId(configTargetId);
      setExamSaveMessage(
        `Updated exam "${draftExamName.trim()}" metadata! Changes are live in Exam Info Page 1.`
      );
    }
    setTimeout(() => setExamSaveMessage(null), 4000);
  };

  // ============================================================================
  // LIVE CALCULATION ENGINE FOR EXAM INFO PAGE 1 (RESULTS VIEWER ONLY)
  // ============================================================================

  const selectedExam = useMemo(
    () => exams.find((x) => x.id === selectedExamId) || exams[0],
    [exams, selectedExamId]
  );

  const examReadinessReport = useMemo(() => {
    if (!selectedExam) return null;

    const domainBreakdowns = selectedExam.domains.map((domWeight, dIdx) => {
      const domMeta = domains.find((d) => d.code === domWeight.domainCode);
      const DnPn = domWeight.percentage;
      const DnPnNorm = DnPn / 100;

      const chapterBreakdowns = domWeight.chapters.map((chWeight, cIdx) => {
        const chMeta = chapters.find((c) => c.code === chWeight.chapterCode);
        const ledger = ledgers[chWeight.chapterCode];
        const { TQ, MM, LTM, TCR } = computeChapterTCR(ledger);

        const CnPn = chWeight.percentage;
        const CnPnNorm = CnPn / 100;
        // Formula: CLRP_k = TCR_k * (CkPk / 100)
        const CLRP = TCR * CnPnNorm;

        return {
          index: cIdx + 1,
          chapterCode: chWeight.chapterCode,
          chapterName: chMeta ? chMeta.name : ledger?.chapterName || chWeight.chapterCode,
          TQ,
          MM,
          LTM,
          TCR,
          CnPn,
          CnPnNorm,
          CLRP,
        };
      });

      // Formula: DRP = CLRP_1 + ... + CLRP_n
      const DRP = chapterBreakdowns.reduce((acc, ch) => acc + ch.CLRP, 0);
      // Contribution of this Domain to overall ERP: DRP_i * (DiPi / 100)
      const erpContribution = DRP * DnPnNorm;

      return {
        index: dIdx + 1,
        domainCode: domWeight.domainCode,
        domainName: domMeta ? domMeta.name : domWeight.domainCode,
        DnPn,
        DnPnNorm,
        DRP,
        erpContribution,
        chapters: chapterBreakdowns,
      };
    });

    // Formula: ERP = DRP_1*(D1P1/100) + ... + DRP_n*(DnPn/100)
    const ERP = domainBreakdowns.reduce((acc, d) => acc + d.erpContribution, 0);

    return {
      examName: selectedExam.name,
      ERP,
      domains: domainBreakdowns,
    };
  }, [selectedExam, domains, chapters, ledgers]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="w-full space-y-3 font-sans">
      {/* ====================================================================
          SECTION 1: REGISTRY (5 SEPARATE PAGES — ZERO PERCENTAGES)
          ==================================================================== */}
      {activeMode === 'registry' && (
        <div className="bg-white border border-[#DFDDD4] rounded-lg shadow-2xs overflow-hidden">
          {/* Registry Header */}
          <div className="bg-[#F9F8F4] border-b border-[#DFDDD4] px-4 py-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-[#1D4ED8]" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#111827]">
                REGISTRY — 5 SEPARATE PAGES (NO PERCENTAGES · PURE SYLLABUS &amp; STEP IDs)
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#6B7280]">
              Page {registryPage === 'domain' ? '1/5' : registryPage === 'chapter' ? '2/5' : registryPage === 'subtopic' ? '3/5' : registryPage === 'concept' ? '4/5' : '5/5'}
            </span>
          </div>

          {/* Top 5-Box Bar Matching Notebook Spread 1 */}
          <div className="grid grid-cols-2 sm:grid-cols-5 border-b border-[#DFDDD4] bg-[#F5F4EF] text-xs font-mono">
            <button
              type="button"
              onClick={() => setRegistryPage('domain')}
              className={`py-3 px-3 text-left sm:text-center border-r border-b sm:border-b-0 border-[#DFDDD4] transition-colors cursor-pointer ${
                registryPage === 'domain'
                  ? 'bg-white text-[#1D4ED8] font-bold border-t-2 border-t-[#1D4ED8]'
                  : 'text-[#4B5563] hover:bg-white/60'
              }`}
            >
              <div>Domain Registry</div>
              <div className="text-[10px] text-[#6B7280] mt-0.5">Page 1 ({domains.length})</div>
            </button>

            <button
              type="button"
              onClick={() => setRegistryPage('chapter')}
              className={`py-3 px-3 text-left sm:text-center border-r border-b sm:border-b-0 border-[#DFDDD4] transition-colors cursor-pointer ${
                registryPage === 'chapter'
                  ? 'bg-white text-[#1D4ED8] font-bold border-t-2 border-t-[#1D4ED8]'
                  : 'text-[#4B5563] hover:bg-white/60'
              }`}
            >
              <div>Chapter Registry</div>
              <div className="text-[10px] text-[#6B7280] mt-0.5">Page 2 ({chapters.length})</div>
            </button>

            <button
              type="button"
              onClick={() => setRegistryPage('subtopic')}
              className={`py-3 px-3 text-left sm:text-center border-r border-b sm:border-b-0 border-[#DFDDD4] transition-colors cursor-pointer ${
                registryPage === 'subtopic'
                  ? 'bg-white text-[#1D4ED8] font-bold border-t-2 border-t-[#1D4ED8]'
                  : 'text-[#4B5563] hover:bg-white/60'
              }`}
            >
              <div>Subtopic Registry</div>
              <div className="text-[10px] text-[#6B7280] mt-0.5">Page 3 ({subtopics.length})</div>
            </button>

            <button
              type="button"
              onClick={() => setRegistryPage('concept')}
              className={`py-3 px-3 text-left sm:text-center border-r border-[#DFDDD4] transition-colors cursor-pointer ${
                registryPage === 'concept'
                  ? 'bg-white text-[#1D4ED8] font-bold border-t-2 border-t-[#1D4ED8]'
                  : 'text-[#4B5563] hover:bg-white/60'
              }`}
            >
              <div>Concept Registry</div>
              <div className="text-[10px] text-[#6B7280] mt-0.5">Page 4 ({concepts.length})</div>
            </button>

            <button
              type="button"
              onClick={() => setRegistryPage('micro')}
              className={`py-3 px-3 text-left sm:text-center col-span-2 sm:col-span-1 transition-colors cursor-pointer ${
                registryPage === 'micro'
                  ? 'bg-white text-[#1D4ED8] font-bold border-t-2 border-t-[#1D4ED8]'
                  : 'text-[#4B5563] hover:bg-white/60'
              }`}
            >
              <div>Micro Concept Registry</div>
              <div className="text-[10px] text-[#6B7280] mt-0.5">
                Page 5 ({microConcepts.length})
              </div>
            </button>
          </div>

          {/* ================================================================
              REGISTRY PAGE 1: DOMAIN REGISTRY & 1a) DOMAIN CREATION FORM
              ================================================================ */}
          {registryPage === 'domain' && (
            <div className="p-5 space-y-5">
              <div>
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#111827] mb-3">
                  1) Domain Registry
                </div>
                <div className="border border-[#DFDDD4] rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse font-mono text-xs">
                    <thead>
                      <tr className="bg-[#F9F8F4] border-b border-[#DFDDD4] text-[10px] uppercase text-[#6B7280]">
                        <th className="py-2.5 px-4 w-16">S.No</th>
                        <th className="py-2.5 px-4">Domain Name</th>
                        <th className="py-2.5 px-4 text-right">Domain Code</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0EFEA]">
                      {domains.map((d, idx) => (
                        <tr key={d.id} className="hover:bg-[#F9F8F4]/60">
                          <td className="py-2.5 px-4 text-[#6B7280]">{idx + 1})</td>
                          <td className="py-2.5 px-4 font-sans font-semibold text-[#111827]">
                            {d.name}
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <span className="px-2.5 py-0.5 bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] rounded font-bold">
                              {d.code}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <form
                onSubmit={handleCreateDomain}
                className="p-4 rounded-lg bg-[#F9F8F4] border border-[#DFDDD4] space-y-3"
              >
                <div className="text-xs font-mono font-bold text-[#1D4ED8]">
                  1a) Domain creation form
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    placeholder="Enter name"
                    value={domNameInput}
                    onChange={(e) => setDomNameInput(e.target.value)}
                    className="flex-1 min-w-[220px] px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
                  />
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={domCodeInput}
                    onChange={(e) => setDomCodeInput(e.target.value)}
                    className="w-48 px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-mono font-semibold rounded flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Domain</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================================================================
              REGISTRY PAGE 2: CHAPTER REGISTRY & 2a) CHAPTER CREATION FORM
              (ZERO PERCENTAGES — ONLY CHAPTER NAME, ID, AND DOMAIN)
              ================================================================ */}
          {registryPage === 'chapter' && (
            <div className="p-5 space-y-5">
              <div>
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#111827] mb-3">
                  2) Chapter Registry
                </div>
                <div className="border border-[#DFDDD4] rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse font-mono text-xs">
                    <thead>
                      <tr className="bg-[#F9F8F4] border-b border-[#DFDDD4] text-[10px] uppercase text-[#6B7280]">
                        <th className="py-2.5 px-4 w-16">S.No</th>
                        <th className="py-2.5 px-4">Chapter Name</th>
                        <th className="py-2.5 px-4">Chapter ID</th>
                        <th className="py-2.5 px-4 text-right">Domain</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0EFEA]">
                      {chapters.map((c, idx) => (
                        <tr key={c.id} className="hover:bg-[#F9F8F4]/60">
                          <td className="py-2.5 px-4 text-[#6B7280]">{idx + 1})</td>
                          <td className="py-2.5 px-4 font-sans font-semibold text-[#111827]">
                            {c.name}
                          </td>
                          <td className="py-2.5 px-4 font-bold text-[#374151]">{c.code}</td>
                          <td className="py-2.5 px-4 text-right">
                            <span className="px-2.5 py-0.5 bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] rounded font-bold">
                              {c.domainCode}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <form
                onSubmit={handleCreateChapter}
                className="p-4 rounded-lg bg-[#F9F8F4] border border-[#DFDDD4] space-y-3"
              >
                <div className="text-xs font-mono font-bold text-[#1D4ED8]">
                  2a) Chapter creation form
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={chDomainSelect}
                    onChange={(e) => setChDomainSelect(e.target.value)}
                    className="px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
                  >
                    {domains.map((d) => (
                      <option key={d.id} value={d.code}>
                        Select Domain: {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Enter chapter name"
                    value={chNameInput}
                    onChange={(e) => setChNameInput(e.target.value)}
                    className="flex-1 min-w-[200px] px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
                  />
                  <input
                    type="text"
                    placeholder="Enter ID"
                    value={chIdInput}
                    onChange={(e) => setChIdInput(e.target.value)}
                    className="w-40 px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-mono font-semibold rounded flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Chapter</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================================================================
              REGISTRY PAGE 3: SUBTOPIC REGISTRY & 3a) SUBTOPIC CREATION FORM
              ================================================================ */}
          {registryPage === 'subtopic' && (
            <div className="p-5 space-y-5">
              <div>
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#111827] mb-3">
                  3) Subtopic Registry
                </div>
                <div className="border border-[#DFDDD4] rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse font-mono text-xs">
                    <thead>
                      <tr className="bg-[#F9F8F4] border-b border-[#DFDDD4] text-[10px] uppercase text-[#6B7280]">
                        <th className="py-2.5 px-4 w-16">S.No</th>
                        <th className="py-2.5 px-4">Subtopic Name / Code</th>
                        <th className="py-2.5 px-4">Domain</th>
                        <th className="py-2.5 px-4 text-right">Chapter</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0EFEA]">
                      {subtopics.map((st, idx) => (
                        <tr key={st.id} className="hover:bg-[#F9F8F4]/60">
                          <td className="py-2.5 px-4 text-[#6B7280]">{idx + 1})</td>
                          <td className="py-2.5 px-4 font-sans font-semibold text-[#111827]">
                            {st.code}
                          </td>
                          <td className="py-2.5 px-4 text-[#374151]">{st.domainCode}</td>
                          <td className="py-2.5 px-4 text-right">
                            <span className="px-2.5 py-0.5 bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] rounded font-bold">
                              {st.chapterCode}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <form
                onSubmit={handleCreateSubtopic}
                className="p-4 rounded-lg bg-[#F9F8F4] border border-[#DFDDD4] space-y-3"
              >
                <div className="text-xs font-mono font-bold text-[#1D4ED8]">
                  3a) Subtopic creation form
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={stChapterSelect}
                    onChange={(e) => setStChapterSelect(e.target.value)}
                    className="px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
                  >
                    {chapters.map((c) => (
                      <option key={c.id} value={c.code}>
                        Select chapter: {c.name} ({c.code} · {c.domainCode})
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={stCodeInput}
                    onChange={(e) => setStCodeInput(e.target.value)}
                    className="flex-1 min-w-[220px] px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-mono font-semibold rounded flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Subtopic</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================================================================
              REGISTRY PAGE 4: CONCEPT REGISTRY & 4a) CONCEPT CREATION FORM
              ================================================================ */}
          {registryPage === 'concept' && (
            <div className="p-5 space-y-5">
              <div>
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#111827] mb-3">
                  4) Concept Registry
                </div>
                <div className="border border-[#DFDDD4] rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse font-mono text-xs">
                    <thead>
                      <tr className="bg-[#F9F8F4] border-b border-[#DFDDD4] text-[10px] uppercase text-[#6B7280]">
                        <th className="py-2.5 px-4 w-16">S.No</th>
                        <th className="py-2.5 px-4">Concept Name</th>
                        <th className="py-2.5 px-4">ST (Subtopic)</th>
                        <th className="py-2.5 px-4">Chapter</th>
                        <th className="py-2.5 px-4 text-right">Domain</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0EFEA]">
                      {concepts.map((con, idx) => {
                        const chObj = chapters.find((c) => c.code === con.chapterCode);
                        return (
                          <tr key={con.id} className="hover:bg-[#F9F8F4]/60">
                            <td className="py-2.5 px-4 text-[#6B7280]">{idx + 1})</td>
                            <td className="py-2.5 px-4 font-sans font-semibold text-[#111827]">
                              {con.code}
                            </td>
                            <td className="py-2.5 px-4 text-[#374151]">{con.subtopicCode}</td>
                            <td className="py-2.5 px-4 text-[#374151]">
                              {chObj ? `${chObj.name} (${con.chapterCode})` : con.chapterCode}
                            </td>
                            <td className="py-2.5 px-4 text-right">
                              <span className="px-2.5 py-0.5 bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] rounded font-bold">
                                {con.domainCode}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <form
                onSubmit={handleCreateConcept}
                className="p-4 rounded-lg bg-[#F9F8F4] border border-[#DFDDD4] space-y-3"
              >
                <div className="text-xs font-mono font-bold text-[#1D4ED8]">
                  4a) Concept creation form
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={conSubtopicSelect}
                    onChange={(e) => setConSubtopicSelect(e.target.value)}
                    className="px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
                  >
                    {subtopics.map((st) => (
                      <option key={st.id} value={st.code}>
                        Select subtopic: {st.code} ({st.chapterCode} · {st.domainCode})
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={conCodeInput}
                    onChange={(e) => setConCodeInput(e.target.value)}
                    className="flex-1 min-w-[200px] px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-mono font-semibold rounded flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Concept</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================================================================
              REGISTRY PAGE 5: MICRO CONCEPT REGISTRY & 5a) CREATION FORM
              (PREPARED FOR STEP-LEVEL QUESTION DECOMPOSITION e.g. [T1, T2])
              ================================================================ */}
          {registryPage === 'micro' && (
            <div className="p-5 space-y-5">
              <div>
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#111827] mb-3">
                  5) Micro Concept Registry (Step-Level IDs &amp; Short Form)
                </div>
                <div className="border border-[#DFDDD4] rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse font-mono text-xs">
                    <thead>
                      <tr className="bg-[#F9F8F4] border-b border-[#DFDDD4] text-[10px] uppercase text-[#6B7280]">
                        <th className="py-2.5 px-4 w-16">S.No</th>
                        <th className="py-2.5 px-4">Micro Concept (Chapter, Domain)</th>
                        <th className="py-2.5 px-4">Parent Concept / ST</th>
                        <th className="py-2.5 px-4 text-right">Short form</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0EFEA]">
                      {microConcepts.map((mc, idx) => (
                        <tr key={mc.id} className="hover:bg-[#F9F8F4]/60">
                          <td className="py-2.5 px-4 text-[#6B7280]">{idx + 1})</td>
                          <td className="py-2.5 px-4 font-sans font-semibold text-[#111827]">
                            {mc.code}{' '}
                            <span className="font-mono text-[#6B7280]">
                              ({mc.chapterCode}, {mc.domainCode})
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-[#374151]">
                            {mc.conceptCode} · {mc.subtopicCode}
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <span className="px-2.5 py-0.5 bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] rounded font-bold">
                              {mc.shortCode}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <form
                onSubmit={handleCreateMicroConcept}
                className="p-4 rounded-lg bg-[#F9F8F4] border border-[#DFDDD4] space-y-3"
              >
                <div className="text-xs font-mono font-bold text-[#1D4ED8]">
                  5a) Micro Concept creation form
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={mcConceptSelect}
                    onChange={(e) => setMcConceptSelect(e.target.value)}
                    className="px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
                  >
                    {concepts.map((con) => (
                      <option key={con.id} value={con.code}>
                        Select concept: {con.code} ({con.chapterCode} · {con.domainCode})
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Enter code (e.g. MC2)"
                    value={mcCodeInput}
                    onChange={(e) => setMcCodeInput(e.target.value)}
                    className="flex-1 min-w-[160px] px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
                  />
                  <input
                    type="text"
                    placeholder="Enter unique short code (e.g. T1)"
                    value={mcShortCodeInput}
                    onChange={(e) => setMcShortCodeInput(e.target.value)}
                    className="w-56 px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-mono font-semibold rounded flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Micro Concept</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
          SECTION 2: EXAM INFO — PAGE 1 (RESULTS DASHBOARD — VIEWING ONLY)
          ==================================================================== */}
      {activeMode === 'exam-page-1' && examReadinessReport && (
        <div className="space-y-4">
          {/* TOP BAR: SELECT CREATED EXAM TO CARRY FORWARD ITS METADATA */}
          <div className="bg-white border border-[#DFDDD4] rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#6B7280]">
                  EXAM INFO — PAGE 1 (RESULTS VIEWER · SELECT EXAM TO LOAD METADATA)
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {exams.map((ex, idx) => {
                    const isSelected = ex.id === selectedExamId;
                    return (
                      <button
                        key={ex.id}
                        type="button"
                        onClick={() => setSelectedExamId(ex.id)}
                        className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#1D4ED8] text-white shadow-2xs'
                            : 'bg-[#F9F8F4] text-[#374151] border border-[#DFDDD4] hover:bg-[#EFECE6]'
                        }`}
                      >
                        {idx + 1}) {ex.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="text-[11px] font-mono text-[#6B7280]">
              Exam Editor is located at the bottom of this page
            </div>
          </div>

          {/* TIER 1 HERO CARD: EXAM READINESS PERCENTAGE (ERP) */}
          <div className="bg-white border-2 border-[#1D4ED8] rounded-lg p-5 shadow-2xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#1D4ED8]">
                  <Calculator className="w-4 h-4" />
                  <span>EXAM READINESS PERCENTAGE (ERP) — {examReadinessReport.examName}</span>
                </div>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-4xl font-mono font-extrabold text-[#111827]">
                    {examReadinessReport.ERP.toFixed(3)}%
                  </span>
                  <span className="text-xs font-mono text-[#6B7280]">
                    (Weighted Roll-Up Across {examReadinessReport.domains.length} Configured
                    Domains)
                  </span>
                </div>
              </div>

              {/* ERP Progress Bar */}
              <div className="w-full md:w-96 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#4B5563]">Overall Exam Readiness</span>
                  <span className="font-bold text-[#1D4ED8]">
                    {examReadinessReport.ERP.toFixed(2)}% / 100%
                  </span>
                </div>
                <div className="w-full h-3 bg-[#EFECE6] rounded-full overflow-hidden border border-[#DFDDD4]">
                  <div
                    className="h-full bg-gradient-to-r from-[#1D4ED8] to-[#16A34A] rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, Math.max(0, examReadinessReport.ERP))}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Exact Notebook Formula Trace */}
            <div className="p-3 rounded bg-[#F9F8F4] border border-[#DFDDD4] font-mono text-xs space-y-1">
              <div className="text-[#4B5563] font-bold">
                Formula: ERP = DRP₁(D₁P₁ / 100) + ... + DRPₙ(DₙPₙ / 100)
              </div>
              <div className="text-[#111827] break-words">
                ERP ={' '}
                {examReadinessReport.domains.map((d, i) => (
                  <span key={d.domainCode}>
                    {i > 0 && ' + '}
                    <span>
                      {d.DRP.toFixed(3)}% × ({d.DnPn}/100)
                    </span>
                  </span>
                ))}
              </div>
              <div className="text-[#1D4ED8] font-bold">
                ERP ={' '}
                {examReadinessReport.domains
                  .map((d) => `${d.erpContribution.toFixed(3)}%`)
                  .join(' + ')}{' '}
                = {examReadinessReport.ERP.toFixed(3)}%
              </div>
            </div>
          </div>

          {/* TIER 2 & TIER 3: DOMAIN READINESS (DRP) & CHAPTER LEVEL READINESS (CLRP) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {examReadinessReport.domains.map((dom) => (
              <div
                key={dom.domainCode}
                className="bg-white border border-[#DFDDD4] rounded-lg p-4 shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Domain Header & DRP Score */}
                  <div className="flex flex-wrap items-start justify-between gap-2 pb-2.5 border-b border-[#E5E3DC]">
                    <div>
                      <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#1D4ED8]">
                        DOMAIN {dom.index}: {dom.domainName} [{dom.domainCode}]
                      </div>
                      <div className="text-xs font-mono text-[#6B7280] mt-0.5">
                        Exam Weight (D{dom.index}P{dom.index}): <strong>{dom.DnPn}%</strong> (
                        {dom.DnPnNorm.toFixed(2)}) · ERP Contribution:{' '}
                        <strong className="text-[#15803D]">
                          +{dom.erpContribution.toFixed(3)}%
                        </strong>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] font-mono uppercase text-[#6B7280]">
                        DOMAIN READINESS (DRP_{dom.index})
                      </div>
                      <div className="text-2xl font-mono font-extrabold text-[#111827]">
                        {dom.DRP.toFixed(3)}%
                      </div>
                    </div>
                  </div>

                  {/* DRP Formula Box */}
                  <div className="px-3 py-2 rounded bg-[#F9F8F4] border border-[#E5E3DC] font-mono text-[11px] space-y-0.5">
                    <div className="text-[#4B5563] font-semibold">
                      DRP_{dom.index} = CLRP₁ + ... + CLRPₙ
                    </div>
                    <div className="text-[#1D4ED8] font-bold">
                      DRP_{dom.index} ={' '}
                      {dom.chapters.map((c) => `${c.CLRP.toFixed(3)}%`).join(' + ')} ={' '}
                      {dom.DRP.toFixed(3)}%
                    </div>
                  </div>

                  {/* Tier 3: Chapter Level Readiness Percentage (CLRP) List */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#374151]">
                      CHAPTER LEVEL READINESS PERCENTAGE (CLRP = TCRₖ × CₖPₖ/100):
                    </div>

                    {dom.chapters.map((ch) => (
                      <div
                        key={ch.chapterCode}
                        className="p-2.5 rounded border border-[#E5E3DC] bg-[#F9F8F4] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-sans font-bold text-[#111827]">
                              {ch.index}. {ch.chapterName} [{ch.chapterCode}]
                            </span>
                            <button
                              type="button"
                              onClick={() => onJumpToChapterLedger(ch.chapterCode)}
                              className="px-1.5 py-0.5 text-[10px] bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] rounded flex items-center gap-0.5 cursor-pointer"
                              title="Inspect this chapter's question pool ledger"
                            >
                              <span>TCR Ledger</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="text-[11px] text-[#6B7280]">
                            TCR_{ch.index}:{' '}
                            <strong className="text-[#111827]">{ch.TCR.toFixed(3)}%</strong> (LTM /
                            MM = {ch.LTM} / {ch.MM}) · Weight C{ch.index}P{ch.index}:{' '}
                            <strong>{ch.CnPn}%</strong> ({ch.CnPnNorm.toFixed(2)})
                          </div>
                        </div>

                        <div className="sm:text-right bg-white px-2.5 py-1.5 rounded border border-[#DFDDD4] shrink-0">
                          <div className="text-[10px] text-[#6B7280]">
                            CLRP_{ch.index} = {ch.TCR.toFixed(2)}% × {ch.CnPnNorm.toFixed(2)}
                          </div>
                          <div className="text-sm font-bold text-[#15803D]">
                            = {ch.CLRP.toFixed(3)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* EXCLUSIVE SUB-PAGE ENTRY AT THE VERY BOTTOM OF EXAM INFO PAGE 1 */}
          <div className="w-full bg-white border border-[#DFDDD4] rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="text-xs font-mono text-[#6B7280]">
              Exam Info Sub-Page · Configure Domain &amp; Chapter Percentages or Create New Exams
            </div>
            <button
              type="button"
              onClick={() => {
                handleSelectConfigTarget(selectedExamId);
                onSwitchMode('exam-page-2');
              }}
              className="px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white border border-[#1D4ED8] rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Open Exam Editor (Configure &amp; Create Exams)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ====================================================================
          SECTION 3: EXAM INFO — PAGE 2 (EXAM EDITOR SUB-PAGE)
          (EDIT EXISTING EXAMS OR CREATE NEW EXAMS + ORDER DOMAINS/CHAPTERS)
          ==================================================================== */}
      {activeMode === 'exam-page-2' && (
        <div className="space-y-3">
          <div className="bg-white border border-[#DFDDD4] rounded-lg p-4 shadow-2xs space-y-4">
            {/* Header & Selector: Edit Existing Exam vs Create New Exam */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E5E3DC]">
              <div className="space-y-1.5">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#111827]">
                  EXAM EDITOR — SUB-PAGE OF EXAM INFO (CREATION &amp; CONFIGURATION ENGINE)
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  <span className="text-[#6B7280]">Select Exam to Edit or Create New:</span>
                  {exams.map((ex, i) => (
                    <button
                      key={ex.id}
                      type="button"
                      onClick={() => handleSelectConfigTarget(ex.id)}
                      className={`px-2.5 py-1 rounded border flex items-center gap-1 cursor-pointer transition-colors ${
                        configTargetId === ex.id
                          ? 'bg-[#1D4ED8] text-white border-[#1D4ED8] font-bold'
                          : 'bg-[#F9F8F4] text-[#374151] border-[#DFDDD4] hover:bg-[#EFECE6]'
                      }`}
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>
                        {i + 1}) {ex.name}
                      </span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleSelectConfigTarget('NEW')}
                    className={`px-3 py-1 rounded border flex items-center gap-1 cursor-pointer transition-colors ${
                      configTargetId === 'NEW'
                        ? 'bg-[#15803D] text-white border-[#15803D] font-bold'
                        : 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0] hover:bg-[#DCFCE7] font-semibold'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Create New Exam</span>
                  </button>
                </div>
              </div>
            </div>

          <form onSubmit={handleSaveExamProfile} className="space-y-4">
            {/* Exam Name */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F9F8F4] p-3 rounded-lg border border-[#DFDDD4]">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <label className="text-xs font-mono font-bold text-[#374151]">
                  {configTargetId === 'NEW' ? 'NEW EXAM NAME:' : 'EDITING EXAM NAME:'}
                </label>
                <input
                  type="text"
                  value={draftExamName}
                  onChange={(e) => setDraftExamName(e.target.value)}
                  placeholder="Enter Exam Name (e.g. SSC CGL Tier 1)"
                  className="px-3 py-1.5 text-sm font-mono font-bold bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8] min-w-[260px]"
                />
              </div>
              <span className="text-[11px] font-mono text-[#6B7280]">
                {configTargetId === 'NEW'
                  ? 'Mode: Creating brand new exam metadata profile'
                  : 'Mode: Editing existing exam metadata profile'}
              </span>
            </div>

            {/* STEP 1: ORDER & ALLOCATE DOMAIN WEIGHTS (DnPn) */}
            <div className="p-3.5 rounded-lg bg-[#F9F8F4] border border-[#DFDDD4] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-mono font-bold text-[#111827]">
                  STEP 1: SELECT, ORDER &amp; INPUT DOMAIN PERCENTAGES (DnPn)
                </div>
                <button
                  type="button"
                  onClick={handleAddDraftDomainRow}
                  className="px-2.5 py-1 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] rounded text-xs font-mono font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Domain</span>
                </button>
              </div>

              <div className="space-y-2">
                {draftDomains.map((domRow, dIdx) => (
                  <div
                    key={`${domRow.domainCode}-${dIdx}`}
                    className="flex flex-wrap items-center gap-2 bg-white p-2 rounded border border-[#E5E3DC]"
                  >
                    {/* Order Controls */}
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        disabled={dIdx === 0}
                        onClick={() => handleMoveDraftDomainRow(dIdx, -1)}
                        className="p-1 text-[#4B5563] hover:bg-[#F3F2EE] disabled:opacity-30 rounded cursor-pointer"
                        title="Move Domain Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={dIdx === draftDomains.length - 1}
                        onClick={() => handleMoveDraftDomainRow(dIdx, 1)}
                        className="p-1 text-[#4B5563] hover:bg-[#F3F2EE] disabled:opacity-30 rounded cursor-pointer"
                        title="Move Domain Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-xs font-mono font-bold text-[#1D4ED8] w-14">
                      D{dIdx + 1}P{dIdx + 1}:
                    </span>

                    <select
                      value={domRow.domainCode}
                      onChange={(e) => handleUpdateDraftDomainCode(dIdx, e.target.value)}
                      className="flex-1 min-w-[180px] px-2.5 py-1 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827]"
                    >
                      {domains.map((d) => (
                        <option key={d.id} value={d.code}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step="any"
                        value={domRow.percentage}
                        onChange={(e) =>
                          handleUpdateDraftDomainPct(dIdx, parseFloat(e.target.value) || 0)
                        }
                        className="w-24 px-2.5 py-1 text-right text-xs font-mono font-bold bg-white border border-[#D1CFC7] rounded text-[#111827]"
                      />
                      <span className="text-xs font-mono text-[#4B5563]">%</span>
                    </div>

                    {draftDomains.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDraftDomainRow(dIdx)}
                        className="p-1 text-[#DC2626] hover:bg-[#FEF2F2] rounded cursor-pointer"
                        title="Remove domain"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* WARNING RULE 1 BANNER */}
              <div
                className={`p-2.5 rounded border flex flex-wrap items-center justify-between gap-2 text-xs font-mono ${
                  isDomainSumValid
                    ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]'
                    : 'bg-[#FFFBEB] border-[#FDE68A] text-[#B45309]'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isDomainSumValid ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16A34A]" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0 text-[#D97706]" />
                  )}
                  <span>
                    <strong>RULE 1:</strong> All percentage summation must be{' '}
                    <strong>exactly 100%</strong> for any given exam (Σ DnPn = 100%).
                  </span>
                </div>
                <span className="font-bold">
                  Current Sum: {totalDomainPct.toFixed(1)}% / 100%{' '}
                  {isDomainSumValid ? '✓' : '✗'}
                </span>
              </div>
            </div>

            {/* STEP 2: ORDER & ALLOCATE CHAPTER WEIGHTS PER DOMAIN (CnPn) */}
            <div className="p-3.5 rounded-lg bg-[#F9F8F4] border border-[#DFDDD4] space-y-3">
              <div className="text-xs font-mono font-bold text-[#111827]">
                STEP 2: SELECT, ORDER &amp; INPUT CHAPTER PERCENTAGES PER DOMAIN (CnPn)
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {draftDomains.map((domRow, dIdx) => {
                  const domChapters = chapters.filter(
                    (c) => c.domainCode === domRow.domainCode
                  );
                  const validity = domainChapterValidity[dIdx];

                  return (
                    <div
                      key={`ch-group-${domRow.domainCode}-${dIdx}`}
                      className="bg-white border border-[#DFDDD4] rounded-lg p-3 space-y-2.5"
                    >
                      <div className="flex items-center justify-between border-b border-[#E5E3DC] pb-2">
                        <span className="text-xs font-mono font-bold text-[#1D4ED8]">
                          Domain {dIdx + 1}: {domRow.domainCode} (D{dIdx + 1}P{dIdx + 1} ={' '}
                          {domRow.percentage}%)
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddDraftChapterRow(dIdx)}
                          className="px-2 py-0.5 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] rounded text-[11px] font-mono font-semibold cursor-pointer"
                        >
                          + Add Chapter
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {domRow.chapters.map((chRow, cIdx) => (
                          <div
                            key={`${chRow.chapterCode}-${cIdx}`}
                            className="flex items-center gap-1 text-xs font-mono"
                          >
                            {/* Chapter Order Up/Down */}
                            <div className="flex items-center">
                              <button
                                type="button"
                                disabled={cIdx === 0}
                                onClick={() => handleMoveDraftChapterRow(dIdx, cIdx, -1)}
                                className="p-0.5 text-[#4B5563] hover:bg-[#F3F2EE] disabled:opacity-30 rounded cursor-pointer"
                                title="Move Chapter Up"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={cIdx === domRow.chapters.length - 1}
                                onClick={() => handleMoveDraftChapterRow(dIdx, cIdx, 1)}
                                className="p-0.5 text-[#4B5563] hover:bg-[#F3F2EE] disabled:opacity-30 rounded cursor-pointer"
                                title="Move Chapter Down"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>

                            <span className="text-[11px] font-bold text-[#6B7280] w-11">
                              C{cIdx + 1}P{cIdx + 1}:
                            </span>

                            <select
                              value={chRow.chapterCode}
                              onChange={(e) =>
                                handleUpdateDraftChapter(
                                  dIdx,
                                  cIdx,
                                  'chapterCode',
                                  e.target.value
                                )
                              }
                              className="flex-1 px-2 py-1 bg-white border border-[#D1CFC7] rounded text-[#111827]"
                            >
                              {domChapters.map((c) => (
                                <option key={c.id} value={c.code}>
                                  {c.name} [{c.code}]
                                </option>
                              ))}
                            </select>

                            <input
                              type="number"
                              min={0}
                              max={100}
                              step="any"
                              value={chRow.percentage}
                              onChange={(e) =>
                                handleUpdateDraftChapter(
                                  dIdx,
                                  cIdx,
                                  'percentage',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-18 px-2 py-1 text-right font-bold bg-white border border-[#D1CFC7] rounded text-[#111827]"
                            />
                            <span className="text-[#6B7280]">%</span>

                            {domRow.chapters.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveDraftChapterRow(dIdx, cIdx)}
                                className="p-1 text-[#DC2626] hover:bg-[#FEF2F2] rounded cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Per-Domain Sum Status */}
                      <div
                        className={`px-2.5 py-1.5 rounded text-[11px] font-mono flex items-center justify-between ${
                          validity?.isValid
                            ? 'bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]'
                            : 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
                        }`}
                      >
                        <span>Normalized Sum (Σ CnPn/100):</span>
                        <strong>
                          {validity?.normalized.toFixed(2)} ({validity?.sum.toFixed(1)}%)
                          {validity?.isValid ? ' = 1.00 ✓' : ' ≠ 1.00 ✗'}
                        </strong>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* WARNING RULE 2 BANNER */}
              <div
                className={`p-2.5 rounded border flex flex-wrap items-center justify-between gap-2 text-xs font-mono ${
                  areAllChaptersValid
                    ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]'
                    : 'bg-[#FFFBEB] border-[#FDE68A] text-[#B45309]'
                }`}
              >
                <div className="flex items-center gap-2">
                  {areAllChaptersValid ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16A34A]" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0 text-[#D97706]" />
                  )}
                  <span>
                    <strong>RULE 2:</strong> For every domain, sum of all its chapters&apos;
                    percentage must also equal <strong>1 (100%)</strong>.
                  </span>
                </div>
                <span className="font-bold">
                  {areAllChaptersValid
                    ? 'All Domains Equal 1.00 (100%) ✓'
                    : 'Fix Chapter Sums to Equal 100%'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                type="submit"
                disabled={!canSaveExam}
                className="px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:bg-[#9CA3AF] text-white text-xs font-mono font-bold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                <span>
                  {configTargetId === 'NEW'
                    ? 'Create & Save New Exam Profile'
                    : `Save Changes to "${draftExamName}"`}
                </span>
              </button>

              {examSaveMessage && (
                <span className="text-xs font-mono font-bold text-[#15803D]">
                  {examSaveMessage}
                </span>
              )}
            </div>
            </form>
          </div>

          {/* BOTTOM RETURN BUTTON FROM EXAM EDITOR SUB-PAGE BACK TO EXAM INFO PAGE 1 */}
          <div className="w-full bg-white border border-[#DFDDD4] rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <button
              type="button"
              onClick={() => onSwitchMode('exam-page-1')}
              className="px-3.5 py-1.5 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] rounded-md text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Back to Exam Info (Results Dashboard)</span>
            </button>
            <span className="text-[11px] font-mono text-[#6B7280]">
              Exam Editor · Sub-page of Exam Info
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
