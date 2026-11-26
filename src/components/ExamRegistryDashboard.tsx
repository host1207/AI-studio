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
  RefreshCw,
  Copy,
  FolderGit2,
  ShieldAlert,
} from 'lucide-react';
import type { ChapterLedger, AttemptTuple } from './TrackerPageOne';
import type {
  DiskChapterFolder,
  InvalidRegistryTag,
  OrphanedStepOverride,
} from '../utils/registryAbsorber';
import type {
  BoundaryRuleItem,
  OperatorRuleItem,
  SolverPathRuleItem,
  SymbolAliasItem,
} from '../utils/givenAskedEngine';
import {
  BoundaryRegistrySection,
  OperatorRegistrySection,
  SolverRegistrySection,
} from './RegistrySolverSections';

// ============================================================================
// 1. DATA MODELS FOR THE 5-TIER REGISTRY & SELF-CONTAINED EXAM METADATA
// ============================================================================

export interface DomainItem {
  id: string;
  name: string;
  code: string;
  /** Special placeholder/sandbox domain used only to hold or create test chapters — hidden everywhere outside Registry Page 1 & 2 */
  isTesting?: boolean;
}

export function isTestingDomain(domain?: DomainItem | null): boolean {
  if (!domain) return false;
  const codeUpper = domain.code.trim().toUpperCase();
  const nameLower = domain.name.trim().toLowerCase();
  return (
    Boolean(domain.isTesting) ||
    codeUpper === 'TST' ||
    codeUpper === 'TEST' ||
    codeUpper === 'DUMMY' ||
    nameLower === 'testing' ||
    nameLower.includes('dummy')
  );
}

export interface ChapterItem {
  id: string;
  name: string;
  code: string; // Local Chapter code e.g. TRG, PN, VB -> Full Cascading ID = `${domainCode}-${code}`
  domainCode: string;
  folderName?: string; // Connected disk folder in Angles-ultimate/data/*
}

export interface SubtopicItem {
  id: string;
  code: string; // Human-readable Subtopic Name e.g. Basics, Relative Speed
  fullId?: string; // Strict cascading ID e.g. QA-TRG-BS
  shortCode?: string; // Local segment e.g. BS
  chapterCode: string;
  chapterFullId?: string; // e.g. QA-TRG
  domainCode: string;
  sourceFile?: string;
}

export interface ConceptItem {
  id: string;
  code: string; // Human-readable Concept Name e.g. Fundamental Ratios
  fullId?: string; // Strict cascading ID e.g. QA-TRG-BS-FR
  shortCode?: string; // Local segment e.g. FR
  subtopicCode: string;
  subtopicFullId?: string; // e.g. QA-TRG-BS
  chapterCode: string;
  domainCode: string;
  sourceFile?: string;
}

export interface MicroConceptItem {
  id: string;
  baseId?: string; // Full 5-tier cascading Base ID e.g. QA-TRG-BS-FR-MC1 (empty ONLY for global TG)
  code: string; // Human-readable Micro Concept description
  shortCode: string; // Strictly 1-to-1 auto-assigned Step Short Form e.g. T1, T2, ..., TG
  conceptCode: string;
  conceptFullId?: string; // e.g. QA-TRG-BS-FR
  subtopicCode: string;
  chapterCode: string;
  domainCode: string;
  sourceFile?: string;
  isGlobalGeneral?: boolean;
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
  examId?: number;
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
  { id: 'dom-qa', name: 'Quantitative Aptitude', code: 'QA' },
  { id: 'dom-eng', name: 'English Language', code: 'Eng' },
  { id: 'dom-tst', name: 'Testing', code: 'TST', isTesting: true },
];

export const INITIAL_CHAPTERS: ChapterItem[] = [
  // Quantitative Aptitude (QA) — Trigonometry uses the new 5-tier hierarchy syntax
  { id: 'ch-trg', name: 'Trigonometry', code: 'TRG', domainCode: 'QA', folderName: 'Trigonometry' },
  // English Language (Eng) — real disk chapters mapped directly (no subtopic tags or marks yet)
  { id: 'ch-pc', name: 'Phrases and Clauses', code: 'PC', domainCode: 'Eng', folderName: 'Phrases and clauses' },
  { id: 'ch-te', name: 'Tenses', code: 'TE', domainCode: 'Eng', folderName: 'Tenses' },
  { id: 'ch-vb', name: 'Verb', code: 'VB', domainCode: 'Eng', folderName: 'Verb' },
  { id: 'ch-pn', name: 'Pronoun New', code: 'PN', domainCode: 'Eng', folderName: 'Pronoun new' },
  { id: 'ch-sva', name: 'Subject-Verb Agreement', code: 'SVA', domainCode: 'Eng', folderName: 'Subject-Verb Agreement' },
  // Testing (TST) — special sandbox domain (hidden from Exam Info, Tracker, Analytics)
  { id: 'ch-bs', name: 'Basics', code: 'BS', domainCode: 'TST', folderName: 'Basics' },
  { id: 'ch-bc', name: 'Basic', code: 'BC', domainCode: 'TST', folderName: 'Basic' },
  { id: 'ch-pn-old', name: 'Pronoun (Legacy)', code: 'PN_OLD', domainCode: 'TST', folderName: 'Pronoun' },
];

// Tiers 3-5 are live-absorbed from disk chapter files — zero hardcoded placeholders
export const INITIAL_SUBTOPICS: SubtopicItem[] = [];
export const INITIAL_CONCEPTS: ConceptItem[] = [];
export const INITIAL_MICRO_CONCEPTS: MicroConceptItem[] = [];

export function getNextGlobalStepId(microConcepts: MicroConceptItem[]): string {
  let maxNum = 0;
  for (const mc of microConcepts) {
    const m = /^T(\d+)$/i.exec((mc.shortCode || '').trim());
    if (m) {
      const n = Number(m[1]);
      if (Number.isFinite(n) && n > maxNum) maxNum = n;
    }
  }
  return `T${maxNum + 1}`;
}

export const INITIAL_EXAMS: ExamProfile[] = [
  {
    id: 'exam-ssc-chsl',
    name: 'SSC CHSL',
    domains: [
      {
        domainCode: 'QA',
        percentage: 50,
        chapters: [{ chapterCode: 'TRG', percentage: 100 }],
      },
      {
        domainCode: 'Eng',
        percentage: 50,
        chapters: [
          { chapterCode: 'PC', percentage: 20 },
          { chapterCode: 'TE', percentage: 20 },
          { chapterCode: 'VB', percentage: 20 },
          { chapterCode: 'PN', percentage: 20 },
          { chapterCode: 'SVA', percentage: 20 },
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
  onDeleteChapterData: (chapterCode: string, folderName?: string) => void;
  onMoveChapterDomain: (
    chapterCode: string,
    oldDomainCode: string,
    newDomainCode: string,
    folderName?: string
  ) => Promise<void>;
  domains: DomainItem[];
  setDomains: React.Dispatch<React.SetStateAction<DomainItem[]>>;
  chapters: ChapterItem[];
  setChapters: React.Dispatch<React.SetStateAction<ChapterItem[]>>;
  subtopics: SubtopicItem[];
  concepts: ConceptItem[];
  microConcepts: MicroConceptItem[];
  stepIdOverrides: Record<string, string>;
  setStepIdOverrides: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  invalidRegistryIds: InvalidRegistryTag[];
  orphanedStepOverrides: OrphanedStepOverride[];
  unregisteredDiskFolders: DiskChapterFolder[];
  linkedFolderByChapterCode: Record<string, string>;
  scannedFileCount: number;
  diskSyncStatus: 'loading' | 'synced' | 'offline';
  onRescanDiskFiles: () => void;
  exams: ExamProfile[];
  setExams: React.Dispatch<React.SetStateAction<ExamProfile[]>>;
  selectedExamId: string;
  setSelectedExamId: React.Dispatch<React.SetStateAction<string>>;
  askedRules: BoundaryRuleItem[];
  setAskedRules: React.Dispatch<React.SetStateAction<BoundaryRuleItem[]>>;
  givenRules: BoundaryRuleItem[];
  setGivenRules: React.Dispatch<React.SetStateAction<BoundaryRuleItem[]>>;
  combineAskedFallback: boolean;
  setCombineAskedFallback: React.Dispatch<React.SetStateAction<boolean>>;
  combineGivenFallback: boolean;
  setCombineGivenFallback: React.Dispatch<React.SetStateAction<boolean>>;
  operatorRules: OperatorRuleItem[];
  setOperatorRules: React.Dispatch<React.SetStateAction<OperatorRuleItem[]>>;
  solverPathRules: SolverPathRuleItem[];
  setSolverPathRules: React.Dispatch<React.SetStateAction<SolverPathRuleItem[]>>;
  symbolAliases: SymbolAliasItem[];
  setSymbolAliases: React.Dispatch<React.SetStateAction<SymbolAliasItem[]>>;
}

export const ExamRegistryDashboard: React.FC<Props> = ({
  ledgers,
  activeMode,
  onSwitchMode,
  onJumpToChapterLedger,
  onRegisterNewChapterLedger,
  onDeleteChapterData,
  onMoveChapterDomain,
  domains,
  setDomains,
  chapters,
  setChapters,
  subtopics,
  concepts,
  microConcepts,
  stepIdOverrides,
  setStepIdOverrides,
  invalidRegistryIds,
  orphanedStepOverrides,
  unregisteredDiskFolders,
  linkedFolderByChapterCode,
  scannedFileCount,
  diskSyncStatus,
  onRescanDiskFiles,
  exams,
  setExams,
  selectedExamId,
  setSelectedExamId,
  askedRules,
  setAskedRules,
  givenRules,
  setGivenRules,
  combineAskedFallback,
  setCombineAskedFallback,
  combineGivenFallback,
  setCombineGivenFallback,
  operatorRules,
  setOperatorRules,
  solverPathRules,
  setSolverPathRules,
  symbolAliases,
  setSymbolAliases,
}) => {
  // 9 Separate Pages inside Registry (1-5 Tier + 6-9 Solver Engine Registries)
  const [registryPage, setRegistryPage] = useState<
    | 'domain'
    | 'chapter'
    | 'subtopic'
    | 'concept'
    | 'micro'
    | 'asked'
    | 'given'
    | 'operator'
    | 'solver'
  >('domain');

  // 1a) Domain Creation Form State
  const [domNameInput, setDomNameInput] = useState('');
  const [domCodeInput, setDomCodeInput] = useState('');
  const [domError, setDomError] = useState<string | null>(null);

  // 2a) Chapter Creation Form State (inherits Domain code -> QA-TnD)
  const [chDomainSelect, setChDomainSelect] = useState(domains[0]?.code || 'QA');
  const [chNameInput, setChNameInput] = useState('');
  const [chIdInput, setChIdInput] = useState('');
  const [chFolderSelect, setChFolderSelect] = useState('');
  const [chError, setChError] = useState<string | null>(null);
  const [absorbDomainByFolder, setAbsorbDomainByFolder] = useState<Record<string, string>>({});

  // Inline Delete & Move state for Domain, Chapter & Exam Registry
  const [pendingDeleteDomainId, setPendingDeleteDomainId] = useState<string | null>(null);
  const [pendingDeleteChapterId, setPendingDeleteChapterId] = useState<string | null>(null);
  const [pendingDeleteExamId, setPendingDeleteExamId] = useState<string | null>(null);
  const [deleteFeedback, setDeleteFeedback] = useState<string | null>(null);
  const [isDeletingDomain, setIsDeletingDomain] = useState(false);
  const [isDeletingChapter, setIsDeletingChapter] = useState(false);
  const [movingChapterId, setMovingChapterId] = useState<string | null>(null);

  const handleConfirmDeleteDomain = async (dom: DomainItem) => {
    if (isTestingDomain(dom)) return;
    setIsDeletingDomain(true);
    try {
      // Ensure Dummy/Sandbox domain exists so chapters are preserved safely instead of lost
      const existingDummy = domains.find((d) => isTestingDomain(d));
      const dummyDomain: DomainItem = existingDummy || {
        id: 'dom-tst',
        name: 'Testing (Dummy)',
        code: 'TST',
        isTesting: true,
      };

      const affectedChapters = chapters.filter(
        (ch) => ch.domainCode.toUpperCase() === dom.code.toUpperCase()
      );
      const affectedExams = exams.filter((ex) =>
        ex.domains.some((ed) => ed.domainCode.toUpperCase() === dom.code.toUpperCase())
      );

      setDomains((prev) => {
        const withoutDeleted = prev.filter((item) => item.id !== dom.id);
        return existingDummy ? withoutDeleted : [...withoutDeleted, dummyDomain];
      });

      setChapters((prev) =>
        prev.map((ch) =>
          ch.domainCode.toUpperCase() === dom.code.toUpperCase()
            ? { ...ch, domainCode: dummyDomain.code }
            : ch
        )
      );

      for (const ch of affectedChapters) {
        const linkedFolder = linkedFolderByChapterCode[ch.code] || ch.folderName;
        await onMoveChapterDomain(ch.code, dom.code, dummyDomain.code, linkedFolder);
      }

      if (chDomainSelect.toUpperCase() === dom.code.toUpperCase()) {
        const remaining = domains.find((item) => item.id !== dom.id);
        setChDomainSelect(remaining?.code || dummyDomain.code);
      }

      setPendingDeleteDomainId(null);
      const movedText =
        affectedChapters.length > 0
          ? `Moved ${affectedChapters.length} chapter${affectedChapters.length === 1 ? '' : 's'} to Dummy domain (${dummyDomain.code}).`
          : 'No chapters needed migration.';
      const examText =
        affectedExams.length > 0
          ? ` ${affectedExams.length} exam${affectedExams.length === 1 ? '' : 's'} (${affectedExams.map((e) => e.name).join(', ')}) now show a weightage error in 09 Exam Info until reallocated.`
          : '';
      setDeleteFeedback(`Deleted domain "${dom.name} (${dom.code})". ${movedText}${examText}`);
      setTimeout(() => setDeleteFeedback(null), 7000);
    } finally {
      setIsDeletingDomain(false);
    }
  };

  const handleMoveChapterDomainRow = async (ch: ChapterItem, nextDomainCode: string) => {
    if (!nextDomainCode || nextDomainCode.toUpperCase() === ch.domainCode.toUpperCase()) return;
    const duplicateInTarget = chapters.some(
      (other) =>
        other.id !== ch.id &&
        other.domainCode.toUpperCase() === nextDomainCode.toUpperCase() &&
        other.code.toUpperCase() === ch.code.toUpperCase()
    );
    if (duplicateInTarget) {
      setChError(
        `Cannot move "${ch.name}": chapter code "${ch.code}" already exists inside domain "${nextDomainCode}".`
      );
      return;
    }

    setMovingChapterId(ch.id);
    setChError(null);
    const oldDomainCode = ch.domainCode;
    const linkedFolder = linkedFolderByChapterCode[ch.code] || ch.folderName;
    try {
      setChapters((prev) =>
        prev.map((item) => (item.id === ch.id ? { ...item, domainCode: nextDomainCode } : item))
      );
      await onMoveChapterDomain(ch.code, oldDomainCode, nextDomainCode, linkedFolder);

      const affectedExams = exams.filter((ex) =>
        ex.domains.some(
          (ed) =>
            ed.domainCode.toUpperCase() === oldDomainCode.toUpperCase() &&
            ed.chapters.some((ec) => ec.chapterCode.toUpperCase() === ch.code.toUpperCase())
        )
      );
      const targetDom = domains.find((d) => d.code.toUpperCase() === nextDomainCode.toUpperCase());
      const targetLabel =
        targetDom && isTestingDomain(targetDom)
          ? `${nextDomainCode} (Dummy / Inactive)`
          : nextDomainCode;
      const examWarning =
        affectedExams.length > 0
          ? ` ${affectedExams.length} exam${affectedExams.length === 1 ? '' : 's'} (${affectedExams.map((e) => e.name).join(', ')}) now require weightage reallocation in 09 Exam Info.`
          : '';
      setDeleteFeedback(
        `Moved "${ch.name}" from ${oldDomainCode}-${ch.code} → ${targetLabel}-${ch.code} (disk tags & marks history synced).${examWarning}`
      );
      setTimeout(() => setDeleteFeedback(null), 6500);
    } finally {
      setMovingChapterId(null);
    }
  };

  const handleConfirmDeleteChapter = async (ch: ChapterItem) => {
    setIsDeletingChapter(true);
    const linkedFolder = linkedFolderByChapterCode[ch.code] || ch.folderName;
    const affectedExams = exams.filter((ex) =>
      ex.domains.some((ed) =>
        ed.chapters.some((ec) => ec.chapterCode.toUpperCase() === ch.code.toUpperCase())
      )
    );
    let diskNote = 'no disk folder present';
    try {
      if (linkedFolder) {
        const res = await fetch(`/api/chapters/${encodeURIComponent(linkedFolder)}`, {
          method: 'DELETE',
        });
        const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
        // Ignore 404 if folder was already absent on disk; fail loudly on real errors (e.g. Global Unmapped protection)
        if (!res.ok && res.status !== 404) {
          setChError(data.error || `Failed to delete disk folder "${linkedFolder}".`);
          setIsDeletingChapter(false);
          return;
        }
        diskNote =
          res.status === 404
            ? `folder /${linkedFolder}/ already absent`
            : `deleted /${linkedFolder}/ (code, questions & marks JSON)`;
      }

      setChapters((prev) => prev.filter((item) => item.id !== ch.id));
      onDeleteChapterData(ch.code, linkedFolder);
      setPendingDeleteChapterId(null);
      setChError(null);

      const examWarning =
        affectedExams.length > 0
          ? ` ${affectedExams.length} exam${affectedExams.length === 1 ? '' : 's'} (${affectedExams.map((e) => e.name).join(', ')}) now show a missing-weightage error in 09 Exam Info.`
          : '';
      setDeleteFeedback(
        `Permanently deleted "${ch.name} (${ch.domainCode}-${ch.code})" — ${diskNote}.${examWarning}`
      );
      setTimeout(() => setDeleteFeedback(null), 7000);

      onRescanDiskFiles();
      const refreshQI = (window as unknown as { refreshQuestionIndex?: () => void })
        .refreshQuestionIndex;
      if (typeof refreshQI === 'function') refreshQI();
      window.dispatchEvent(
        new CustomEvent('angles:chapters-updated', {
          detail: { deletedFolder: linkedFolder, deletedChapterCode: ch.code },
        })
      );
    } catch (err) {
      setChError(err instanceof Error ? err.message : 'Could not delete chapter.');
    } finally {
      setIsDeletingChapter(false);
    }
  };

  // 3a) Subtopic Authoring Tag Builder State (live-absorbed from study materials)
  const [stChapterSelect, setStChapterSelect] = useState(chapters[0]?.code || 'TRG');
  const [stCodeInput, setStCodeInput] = useState('');
  const [stNameInput, setStNameInput] = useState('');

  // 4a) Concept Authoring Tag Builder State (live-absorbed from study materials)
  const [conSubtopicSelect, setConSubtopicSelect] = useState(subtopics[0]?.fullId || '');
  const [conCodeInput, setConCodeInput] = useState('');
  const [conNameInput, setConNameInput] = useState('');

  // 5a) Micro Concept Authoring Tag Builder
  const [mcConceptSelect, setMcConceptSelect] = useState(concepts[0]?.fullId || '');
  const [mcSegInput, setMcSegInput] = useState('MC4');
  const [mcNameInput, setMcNameInput] = useState('');
  const [copiedTagKey, setCopiedTagKey] = useState<string | null>(null);

  const copyTagSnippet = (key: string, snippet: string) => {
    try {
      navigator.clipboard.writeText(snippet);
      setCopiedTagKey(key);
      setTimeout(() => setCopiedTagKey(null), 1800);
    } catch {
      // ignore clipboard errors
    }
  };

  const testingDomainCodes = useMemo(
    () => new Set(domains.filter((d) => isTestingDomain(d)).map((d) => d.code.toUpperCase())),
    [domains]
  );
  const activeNonTestingDomains = useMemo(
    () => domains.filter((d) => !isTestingDomain(d)),
    [domains]
  );
  const activeNonTestingChapters = useMemo(
    () => chapters.filter((c) => !testingDomainCodes.has(c.domainCode.toUpperCase())),
    [chapters, testingDomainCodes]
  );

  // Exam Info Page 2 (Configuration & Creation) State:
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
    setPendingDeleteExamId(null);
    setExamSaveMessage(null);
    if (targetId === 'NEW') {
      setDraftExamName('');
      const defaultDom = activeNonTestingDomains[0]?.code || '';
      const defaultCh = defaultDom
        ? activeNonTestingChapters.find((c) => c.domainCode === defaultDom)?.code || ''
        : '';
      setDraftDomains(
        defaultDom
          ? [
              {
                domainCode: defaultDom,
                percentage: 100,
                chapters: defaultCh ? [{ chapterCode: defaultCh, percentage: 100 }] : [],
              },
            ]
          : []
      );
    } else {
      const found = exams.find((x) => x.id === targetId);
      if (found) {
        setDraftExamName(found.name);
        // Preserve ALL configured domains (including broken/deleted ones) so the editor flags them for reallocation
        setDraftDomains(JSON.parse(JSON.stringify(found.domains)));
      }
    }
  };

  const handleDeleteExamProfile = (examId: string) => {
    if (exams.length <= 1) return;
    const remaining = exams.filter((e) => e.id !== examId);
    setExams(remaining);
    const nextExam = remaining[0];
    if (nextExam) {
      setSelectedExamId(nextExam.id);
      setConfigTargetId(nextExam.id);
      setDraftExamName(nextExam.name);
      setDraftDomains(JSON.parse(JSON.stringify(nextExam.domains)));
    }
    setPendingDeleteExamId(null);
    setExamSaveMessage('Deleted exam profile.');
    setTimeout(() => setExamSaveMessage(null), 3500);
  };

  // ============================================================================
  // HANDLERS FOR PERMANENT REGISTRIES (DOMAIN + CHAPTER) & 1-TO-1 STEP ID SWAP
  // ============================================================================

  const handleCreateDomain = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = domNameInput.trim();
    const cleanCode = domCodeInput.trim();
    if (!cleanName || !cleanCode) {
      setDomError('Enter both Domain Name and a unique Domain short code (e.g. QA).');
      return;
    }
    if (!/^[A-Za-z0-9_]+$/.test(cleanCode)) {
      setDomError('Domain code must contain only letters, digits, or underscores (no hyphens).');
      return;
    }
    if (domains.some((d) => d.code.toLowerCase() === cleanCode.toLowerCase())) {
      setDomError(`Domain code "${cleanCode}" already exists in Domain Registry.`);
      return;
    }

    setDomains((prev) => [
      ...prev,
      { id: `dom-${Date.now()}`, name: cleanName, code: cleanCode },
    ]);
    setDomNameInput('');
    setDomCodeInput('');
    setDomError(null);
  };

  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = chNameInput.trim();
    const cleanCode = chIdInput.trim();
    if (!cleanName || !cleanCode || !chDomainSelect) {
      setChError('Select a Domain and enter both Chapter Name and Chapter short code (e.g. TnD).');
      return;
    }
    if (!/^[A-Za-z0-9_]+$/.test(cleanCode)) {
      setChError('Chapter short code must contain only letters, digits, or underscores (Domain prefix is added automatically).');
      return;
    }
    if (!domains.some((d) => d.code === chDomainSelect)) {
      setChError(`Selected Domain "${chDomainSelect}" does not exist in Domain Registry.`);
      return;
    }
    if (
      chapters.some(
        (c) =>
          c.code.toLowerCase() === cleanCode.toLowerCase() &&
          c.domainCode.toLowerCase() === chDomainSelect.toLowerCase()
      )
    ) {
      setChError(`Chapter "${chDomainSelect}-${cleanCode}" is already registered.`);
      return;
    }

    let resolvedFolderName = chFolderSelect || undefined;
    if (!resolvedFolderName) {
      try {
        const res = await fetch('/api/chapters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: cleanName }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.folder) resolvedFolderName = String(data.folder);
        }
      } catch {
        // Offline / existing folder fallback
      }
    }

    setChapters((prev) => [
      ...prev,
      {
        id: `ch-${Date.now()}`,
        name: cleanName,
        code: cleanCode,
        domainCode: chDomainSelect,
        folderName: resolvedFolderName,
      },
    ]);
    if (!testingDomainCodes.has(chDomainSelect.toUpperCase())) {
      onRegisterNewChapterLedger(cleanCode, cleanName);
    }
    setChNameInput('');
    setChIdInput('');
    setChFolderSelect('');
    setChError(null);
    onRescanDiskFiles();
  };

  const handleAbsorbDiskFolder = (folder: DiskChapterFolder) => {
    const selectedDom = absorbDomainByFolder[folder.folder] || domains[0]?.code || 'Eng';
    const rawCode =
      folder.rootMid ||
      folder.folder
        .replace(/[^A-Za-z0-9]+/g, '')
        .slice(0, 4)
        .toUpperCase() ||
      'CH';
    let candidateCode = rawCode;
    let suffix = 2;
    while (
      chapters.some(
        (c) =>
          c.code.toLowerCase() === candidateCode.toLowerCase() &&
          c.domainCode.toLowerCase() === selectedDom.toLowerCase()
      )
    ) {
      candidateCode = `${rawCode}${suffix++}`;
    }

    setChapters((prev) => [
      ...prev,
      {
        id: `ch-disk-${Date.now()}-${candidateCode}`,
        name: folder.name,
        code: candidateCode,
        domainCode: selectedDom,
        folderName: folder.folder,
      },
    ]);
    if (!testingDomainCodes.has(selectedDom.toUpperCase())) {
      onRegisterNewChapterLedger(candidateCode, folder.name);
    }
  };

  const selectedStChapter = useMemo(
    () =>
      activeNonTestingChapters.find((c) => c.code === stChapterSelect) ||
      activeNonTestingChapters[0] ||
      chapters[0],
    [activeNonTestingChapters, chapters, stChapterSelect]
  );
  const selectedConSubtopic = useMemo(
    () =>
      subtopics.find((s) => (s.fullId || s.id) === conSubtopicSelect) || subtopics[0] || null,
    [subtopics, conSubtopicSelect]
  );
  const selectedMcConcept = useMemo(
    () =>
      concepts.find((c) => (c.fullId || c.id) === mcConceptSelect) || concepts[0] || null,
    [concepts, mcConceptSelect]
  );

  const generatedSubtopicTag = useMemo(() => {
    const chFull = selectedStChapter
      ? `${selectedStChapter.domainCode}-${selectedStChapter.code}`
      : 'QA-TRG';
    const seg = stCodeInput.trim().replace(/[^A-Za-z0-9_]/g, '') || 'BS';
    const label = stNameInput.trim() || 'Basics';
    return `<Subtopic == ${chFull}-${seg}, name = ${label}>\n  <!-- Concept blocks go inside here -->\n</Subtopic>`;
  }, [selectedStChapter, stCodeInput, stNameInput]);

  const generatedConceptTag = useMemo(() => {
    const stFull = selectedConSubtopic?.fullId || 'QA-TRG-BS';
    const seg = conCodeInput.trim().replace(/[^A-Za-z0-9_]/g, '') || 'FR';
    const label = conNameInput.trim() || 'Fundamental Ratios';
    return `<Concept == ${stFull}-${seg}, name = ${label}>\n  <!-- Micro-Concept & <qn all> blocks go inside here -->\n</Concept>`;
  }, [selectedConSubtopic, conCodeInput, conNameInput]);

  const generatedMcTag = useMemo(() => {
    const conFull = selectedMcConcept?.fullId || 'QA-TRG-BS-FR';
    const seg = mcSegInput.trim().replace(/[^A-Za-z0-9_]/g, '') || 'MC4';
    const label = mcNameInput.trim() || 'New Micro Concept Rule';
    return `<MC == ${conFull}-${seg}, name = ${label}>\n  <!-- Micro-concept note content -->\n</MC>`;
  }, [selectedMcConcept, mcSegInput, mcNameInput]);

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

  const draftIntegrity = useMemo(() => {
    const activeDomSet = new Set(activeNonTestingDomains.map((d) => d.code.toUpperCase()));
    const seenDomains = new Set<string>();
    const brokenDomainIndices = new Set<number>();
    const duplicateDomainIndices = new Set<number>();
    const brokenChapterKeys = new Set<string>();
    const duplicateChapterKeys = new Set<string>();

    draftDomains.forEach((domRow, dIdx) => {
      const domUpper = (domRow.domainCode || '').toUpperCase();
      if (!domUpper || !activeDomSet.has(domUpper)) {
        brokenDomainIndices.add(dIdx);
      }
      if (domUpper && seenDomains.has(domUpper)) {
        duplicateDomainIndices.add(dIdx);
      }
      seenDomains.add(domUpper);

      const validChSet = new Set(
        chapters
          .filter((c) => c.domainCode.toUpperCase() === domUpper && !testingDomainCodes.has(domUpper))
          .map((c) => c.code.toUpperCase())
      );
      const seenChapters = new Set<string>();
      domRow.chapters.forEach((chRow, cIdx) => {
        const chUpper = (chRow.chapterCode || '').toUpperCase();
        const key = `${dIdx}:${cIdx}`;
        if (!chUpper || !validChSet.has(chUpper)) {
          brokenChapterKeys.add(key);
        }
        if (chUpper && seenChapters.has(chUpper)) {
          duplicateChapterKeys.add(key);
        }
        seenChapters.add(chUpper);
      });
    });

    const hasNoBrokenRefs = brokenDomainIndices.size === 0 && brokenChapterKeys.size === 0;
    const hasNoDuplicates = duplicateDomainIndices.size === 0 && duplicateChapterKeys.size === 0;
    return {
      brokenDomainIndices,
      duplicateDomainIndices,
      brokenChapterKeys,
      duplicateChapterKeys,
      hasNoBrokenRefs,
      hasNoDuplicates,
    };
  }, [draftDomains, activeNonTestingDomains, chapters, testingDomainCodes]);

  const handleAutoCleanBrokenDraftRows = () => {
    const activeDomSet = new Set(activeNonTestingDomains.map((d) => d.code.toUpperCase()));
    setDraftDomains((prev) =>
      prev
        .filter((d) => activeDomSet.has((d.domainCode || '').toUpperCase()))
        .map((d) => {
          const domUpper = d.domainCode.toUpperCase();
          const validChSet = new Set(
            chapters
              .filter((c) => c.domainCode.toUpperCase() === domUpper)
              .map((c) => c.code.toUpperCase())
          );
          return {
            ...d,
            chapters: d.chapters.filter((c) => validChSet.has((c.chapterCode || '').toUpperCase())),
          };
        })
    );
  };

  const areAllChaptersValid = domainChapterValidity.every((v) => v.isValid);
  const canSaveExam =
    draftExamName.trim().length > 0 &&
    draftDomains.length > 0 &&
    isDomainSumValid &&
    areAllChaptersValid &&
    draftIntegrity.hasNoBrokenRefs &&
    draftIntegrity.hasNoDuplicates;

  const handleAddDraftDomainRow = () => {
    const unusedDomain =
      activeNonTestingDomains.find(
        (d) => !draftDomains.some((dd) => dd.domainCode === d.code)
      ) || activeNonTestingDomains[0];
    if (!unusedDomain) return;
    const firstCh = activeNonTestingChapters.find((c) => c.domainCode === unusedDomain.code);

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
  // LIVE EXAM INTEGRITY VALIDATOR & CALCULATION ENGINE FOR EXAM INFO PAGE 1
  // ============================================================================

  const examIntegrityById = useMemo(() => {
    const map: Record<
      string,
      {
        isValid: boolean;
        validDomainSum: number;
        issues: {
          type: 'missing-domain' | 'domain-sum' | 'missing-chapter' | 'chapter-sum' | 'empty-exam';
          domainCode?: string;
          chapterCode?: string;
          message: string;
        }[];
        brokenDomainCodes: Set<string>;
        brokenChapterKeys: Set<string>;
      }
    > = {};

    for (const ex of exams) {
      const issues: {
        type: 'missing-domain' | 'domain-sum' | 'missing-chapter' | 'chapter-sum' | 'empty-exam';
        domainCode?: string;
        chapterCode?: string;
        message: string;
      }[] = [];
      const brokenDomainCodes = new Set<string>();
      const brokenChapterKeys = new Set<string>();
      let validDomainSum = 0;

      if (!ex.domains || ex.domains.length === 0) {
        issues.push({
          type: 'empty-exam',
          message: 'Exam has no configured domains. Add domains summing to 100% in Exam Editor.',
        });
      }

      for (const domWeight of ex.domains || []) {
        const domUpper = domWeight.domainCode.toUpperCase();
        const domMeta = domains.find((d) => d.code.toUpperCase() === domUpper);
        if (!domMeta) {
          brokenDomainCodes.add(domUpper);
          issues.push({
            type: 'missing-domain',
            domainCode: domWeight.domainCode,
            message: `Domain "${domWeight.domainCode}" was deleted from Registry (orphaned ${domWeight.percentage}% weightage — its chapters moved to Dummy). Reallocate this ${domWeight.percentage}% across active domains.`,
          });
          continue;
        }
        if (isTestingDomain(domMeta)) {
          brokenDomainCodes.add(domUpper);
          issues.push({
            type: 'missing-domain',
            domainCode: domWeight.domainCode,
            message: `Domain "${domWeight.domainCode}" is a Dummy/Sandbox domain (${domWeight.percentage}% weightage). Remove or replace it in Exam Editor.`,
          });
          continue;
        }

        validDomainSum += Number(domWeight.percentage) || 0;
        let validChapterSum = 0;

        for (const chWeight of domWeight.chapters || []) {
          const chUpper = chWeight.chapterCode.toUpperCase();
          const chMeta = chapters.find((c) => c.code.toUpperCase() === chUpper);
          const chKey = `${domUpper}:${chUpper}`;
          if (!chMeta) {
            brokenChapterKeys.add(chKey);
            issues.push({
              type: 'missing-chapter',
              domainCode: domWeight.domainCode,
              chapterCode: chWeight.chapterCode,
              message: `Chapter "${chWeight.chapterCode}" in domain ${domWeight.domainCode} was deleted (orphaned ${chWeight.percentage}%). Reallocate inside ${domWeight.domainCode}.`,
            });
          } else if (testingDomainCodes.has(chMeta.domainCode.toUpperCase())) {
            brokenChapterKeys.add(chKey);
            issues.push({
              type: 'missing-chapter',
              domainCode: domWeight.domainCode,
              chapterCode: chWeight.chapterCode,
              message: `Chapter "${chMeta.name} [${chWeight.chapterCode}]" is inactive in Dummy domain (${chMeta.domainCode}) — orphaned ${chWeight.percentage}% inside ${domWeight.domainCode}.`,
            });
          } else if (chMeta.domainCode.toUpperCase() !== domUpper) {
            brokenChapterKeys.add(chKey);
            issues.push({
              type: 'missing-chapter',
              domainCode: domWeight.domainCode,
              chapterCode: chWeight.chapterCode,
              message: `Chapter "${chMeta.name} [${chWeight.chapterCode}]" moved from ${domWeight.domainCode} to ${chMeta.domainCode} — orphaned ${chWeight.percentage}% inside ${domWeight.domainCode}.`,
            });
          } else {
            validChapterSum += Number(chWeight.percentage) || 0;
          }
        }

        if ((domWeight.chapters || []).length === 0 || Math.abs(validChapterSum - 100) >= 0.001) {
          const diff = 100 - validChapterSum;
          issues.push({
            type: 'chapter-sum',
            domainCode: domWeight.domainCode,
            message: `Domain "${domMeta.name} (${domWeight.domainCode})" active chapter weights sum to ${validChapterSum.toFixed(1)}% instead of 100% (${Math.abs(diff).toFixed(1)}% ${diff > 0 ? 'missing/unallocated' : 'excess'}).`,
          });
        }
      }

      if ((ex.domains || []).length > 0 && Math.abs(validDomainSum - 100) >= 0.001) {
        const diff = 100 - validDomainSum;
        issues.push({
          type: 'domain-sum',
          message: `Active domain weights sum to ${validDomainSum.toFixed(1)}% instead of 100% (${Math.abs(diff).toFixed(1)}% ${diff > 0 ? 'missing/unallocated' : 'excess'}).`,
        });
      }

      map[ex.id] = {
        isValid: issues.length === 0,
        validDomainSum,
        issues,
        brokenDomainCodes,
        brokenChapterKeys,
      };
    }

    return map;
  }, [exams, domains, chapters, testingDomainCodes]);

  const selectedExam = useMemo(
    () => exams.find((x) => x.id === selectedExamId) || exams[0],
    [exams, selectedExamId]
  );

  const selectedExamIntegrity = selectedExam ? examIntegrityById[selectedExam.id] : null;

  const examReadinessReport = useMemo(() => {
    if (!selectedExam) return null;

    const domainBreakdowns = selectedExam.domains.map((domWeight, dIdx) => {
      const domUpper = domWeight.domainCode.toUpperCase();
      const domMeta = domains.find((d) => d.code.toUpperCase() === domUpper);
      const isMissingDomain = !domMeta || isTestingDomain(domMeta);
      const domainStatusNote = !domMeta
        ? `Deleted Domain — Reallocate ${domWeight.percentage}%`
        : isTestingDomain(domMeta)
          ? `Dummy Domain — Remove or Reallocate ${domWeight.percentage}%`
          : undefined;

      const DnPn = domWeight.percentage;
      const DnPnNorm = DnPn / 100;

      const chapterBreakdowns = domWeight.chapters.map((chWeight, cIdx) => {
        const chUpper = chWeight.chapterCode.toUpperCase();
        const chMeta = chapters.find((c) => c.code.toUpperCase() === chUpper);
        const isDeletedChapter = !chMeta;
        const isInDummy = Boolean(chMeta && testingDomainCodes.has(chMeta.domainCode.toUpperCase()));
        const isMovedOtherDomain = Boolean(
          chMeta && !isInDummy && chMeta.domainCode.toUpperCase() !== domUpper
        );
        const isMissingChapter = isMissingDomain || isDeletedChapter || isInDummy || isMovedOtherDomain;
        const chapterStatusNote = isDeletedChapter
          ? `Deleted Chapter — Reallocate ${chWeight.percentage}%`
          : isInDummy
            ? `Moved to Dummy (${chMeta?.domainCode}) — Reallocate ${chWeight.percentage}%`
            : isMovedOtherDomain
              ? `Moved to ${chMeta?.domainCode} — Reallocate ${chWeight.percentage}%`
              : isMissingDomain
                ? `Parent Domain Deleted`
                : undefined;

        const ledger = !isMissingChapter ? ledgers[chWeight.chapterCode] : undefined;
        const { TQ, MM, LTM, TCR } = computeChapterTCR(ledger);

        const CnPn = chWeight.percentage;
        const CnPnNorm = CnPn / 100;
        // Formula: CLRP_k = TCR_k * (CkPk / 100) (broken chapters contribute 0 until reallocated)
        const CLRP = isMissingChapter ? 0 : TCR * CnPnNorm;

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
          isMissingChapter,
          chapterStatusNote,
        };
      });

      // Formula: DRP = CLRP_1 + ... + CLRP_n
      const DRP = isMissingDomain ? 0 : chapterBreakdowns.reduce((acc, ch) => acc + ch.CLRP, 0);
      // Contribution of this Domain to overall ERP: DRP_i * (DiPi / 100)
      const erpContribution = isMissingDomain ? 0 : DRP * DnPnNorm;

      return {
        index: dIdx + 1,
        domainCode: domWeight.domainCode,
        domainName: domMeta ? domMeta.name : domWeight.domainCode,
        DnPn,
        DnPnNorm,
        DRP,
        erpContribution,
        isMissingDomain,
        domainStatusNote,
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
  }, [selectedExam, domains, chapters, ledgers, testingDomainCodes]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="w-full space-y-3 font-sans">
      {/* ====================================================================
          SECTION 1: REGISTRY (LIVE DISK-ABSORBING, STRICTLY CASCADING 5-TIER)
          ==================================================================== */}
      {activeMode === 'registry' && (
        <div className="bg-white border border-[#DFDDD4] rounded-lg shadow-2xs overflow-hidden">
          {/* Registry Header + Live Disk Rescan Bar */}
          <div className="bg-[#F9F8F4] border-b border-[#DFDDD4] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-[#1D4ED8]" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#111827]">
                LIVE CASCADING REGISTRY · DOMAINS &amp; CHAPTERS PERMANENT · SUBTOPICS / CONCEPTS / MCs LIVE-ABSORBED
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
              <span
                className={`px-2 py-0.5 rounded border font-semibold ${
                  diskSyncStatus === 'synced'
                    ? 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]'
                    : diskSyncStatus === 'loading'
                      ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]'
                      : 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]'
                }`}
              >
                {diskSyncStatus === 'synced'
                  ? `Disk Synced · ${scannedFileCount} ${scannedFileCount === 1 ? 'file' : 'files'} absorbed`
                  : diskSyncStatus === 'loading'
                    ? 'Scanning chapter files...'
                    : 'Offline fallback mode'}
              </span>
              {invalidRegistryIds.length > 0 && (
                <span className="px-2 py-0.5 rounded bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] font-bold flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  <span>{invalidRegistryIds.length} Invalid Rejected</span>
                </span>
              )}
              <button
                type="button"
                onClick={onRescanDiskFiles}
                className="px-2.5 py-1 bg-white hover:bg-[#F3F2EE] text-[#111827] border border-[#D1CFC7] rounded font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${diskSyncStatus === 'loading' ? 'animate-spin' : ''}`} />
                <span>Rescan Disk Files</span>
              </button>
              <span className="text-[#6B7280]">
                Page{' '}
                {registryPage === 'domain'
                  ? '1/9'
                  : registryPage === 'chapter'
                    ? '2/9'
                    : registryPage === 'subtopic'
                      ? '3/9'
                      : registryPage === 'concept'
                        ? '4/9'
                        : registryPage === 'micro'
                          ? '5/9'
                          : registryPage === 'asked'
                            ? '6/9'
                            : registryPage === 'given'
                              ? '7/9'
                              : registryPage === 'operator'
                                ? '8/9'
                                : '9/9'}
              </span>
            </div>
          </div>

          {/* Global Cascading Validation Alert Banner (Shows Rejected Invalid IDs Immediately) */}
          {(invalidRegistryIds.length > 0 || orphanedStepOverrides.length > 0) && (
            <div className="bg-[#FEF2F2] border-b border-[#FECACA] px-4 py-3 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#991B1B]">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>
                    STRICT CASCADING GUARD: {invalidRegistryIds.length} Invalid Tag
                    {invalidRegistryIds.length === 1 ? '' : 's'} Rejected
                    {orphanedStepOverrides.length > 0
                      ? ` · ${orphanedStepOverrides.length} Orphaned Step Override${orphanedStepOverrides.length === 1 ? '' : 's'}`
                      : ''}
                  </span>
                </div>
                {orphanedStepOverrides.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const orphanedSet = new Set(
                        orphanedStepOverrides.map((o) => o.baseId.toUpperCase())
                      );
                      setStepIdOverrides((prev) => {
                        const cleaned: Record<string, string> = {};
                        for (const [k, v] of Object.entries(prev)) {
                          if (!orphanedSet.has(k.toUpperCase())) cleaned[k] = v;
                        }
                        return cleaned;
                      });
                    }}
                    className="px-2 py-0.5 text-[11px] font-mono font-semibold bg-white text-[#991B1B] border border-[#FCA5A5] rounded hover:bg-[#FEE2E2] cursor-pointer"
                  >
                    Clean Orphaned Overrides
                  </button>
                )}
              </div>
              {invalidRegistryIds.length > 0 && (
                <div className="bg-white border border-[#FECACA] rounded overflow-x-auto">
                  <table className="w-full text-left border-collapse font-mono text-[11px]">
                    <thead>
                      <tr className="bg-[#FFF5F5] border-b border-[#FECACA] text-[10px] uppercase text-[#991B1B]">
                        <th className="py-1.5 px-3">Tier</th>
                        <th className="py-1.5 px-3">Rejected ID</th>
                        <th className="py-1.5 px-3">Source File</th>
                        <th className="py-1.5 px-3">Cascading Rejection Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#FEE2E2]">
                      {invalidRegistryIds.map((inv) => (
                        <tr key={inv.id}>
                          <td className="py-1.5 px-3 font-bold text-[#991B1B]">{inv.tier}</td>
                          <td className="py-1.5 px-3 font-bold text-[#DC2626]">{inv.rawId}</td>
                          <td className="py-1.5 px-3 text-[#6B7280]">{inv.source}</td>
                          <td className="py-1.5 px-3 font-sans text-[#7F1D1D]">{inv.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Top 9-Box Bar: 5-Tier Cascading Hierarchy + 4 Solver Engine Registries */}
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 border-b border-[#DFDDD4] bg-[#F5F4EF] text-xs font-mono">
            <button
              type="button"
              onClick={() => setRegistryPage('domain')}
              className={`py-2.5 px-2.5 text-left sm:text-center border-r border-b lg:border-b-0 border-[#DFDDD4] transition-colors cursor-pointer ${
                registryPage === 'domain'
                  ? 'bg-white text-[#1D4ED8] font-bold border-t-2 border-t-[#1D4ED8]'
                  : 'text-[#4B5563] hover:bg-white/60'
              }`}
            >
              <div>Domain</div>
              <div className="text-[10px] text-[#6B7280] mt-0.5">
                P1 · Perm ({domains.length})
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRegistryPage('chapter')}
              className={`py-2.5 px-2.5 text-left sm:text-center border-r border-b lg:border-b-0 border-[#DFDDD4] transition-colors cursor-pointer ${
                registryPage === 'chapter'
                  ? 'bg-white text-[#1D4ED8] font-bold border-t-2 border-t-[#1D4ED8]'
                  : 'text-[#4B5563] hover:bg-white/60'
              }`}
            >
              <div>Chapter</div>
              <div className="text-[10px] text-[#6B7280] mt-0.5">
                P2 · Perm ({chapters.length})
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRegistryPage('subtopic')}
              className={`py-2.5 px-2.5 text-left sm:text-center border-r border-b lg:border-b-0 border-[#DFDDD4] transition-colors cursor-pointer ${
                registryPage === 'subtopic'
                  ? 'bg-white text-[#1D4ED8] font-bold border-t-2 border-t-[#1D4ED8]'
                  : 'text-[#4B5563] hover:bg-white/60'
              }`}
            >
              <div>Subtopic</div>
              <div className="text-[10px] text-[#15803D] mt-0.5">
                P3 · Live ({subtopics.length})
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRegistryPage('concept')}
              className={`py-2.5 px-2.5 text-left sm:text-center border-r border-b lg:border-b-0 border-[#DFDDD4] transition-colors cursor-pointer ${
                registryPage === 'concept'
                  ? 'bg-white text-[#1D4ED8] font-bold border-t-2 border-t-[#1D4ED8]'
                  : 'text-[#4B5563] hover:bg-white/60'
              }`}
            >
              <div>Concept</div>
              <div className="text-[10px] text-[#15803D] mt-0.5">
                P4 · Live ({concepts.length})
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRegistryPage('micro')}
              className={`py-2.5 px-2.5 text-left sm:text-center border-r border-b lg:border-b-0 border-[#DFDDD4] transition-colors cursor-pointer ${
                registryPage === 'micro'
                  ? 'bg-white text-[#1D4ED8] font-bold border-t-2 border-t-[#1D4ED8]'
                  : 'text-[#4B5563] hover:bg-white/60'
              }`}
            >
              <div>Micro Concept</div>
              <div className="text-[10px] text-[#15803D] mt-0.5">
                P5 · Base IDs ({microConcepts.length})
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRegistryPage('asked')}
              className={`py-2.5 px-2.5 text-left sm:text-center border-r border-b lg:border-b-0 border-[#DFDDD4] transition-colors cursor-pointer ${
                registryPage === 'asked'
                  ? 'bg-white text-[#B45309] font-bold border-t-2 border-t-[#B45309]'
                  : 'text-[#4B5563] hover:bg-white/60'
              }`}
            >
              <div>Asked Registry</div>
              <div className="text-[10px] text-[#B45309] mt-0.5">
                P6 · Rules ({askedRules.length})
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRegistryPage('given')}
              className={`py-2.5 px-2.5 text-left sm:text-center border-r border-b lg:border-b-0 border-[#DFDDD4] transition-colors cursor-pointer ${
                registryPage === 'given'
                  ? 'bg-white text-[#15803D] font-bold border-t-2 border-t-[#15803D]'
                  : 'text-[#4B5563] hover:bg-white/60'
              }`}
            >
              <div>Given Registry</div>
              <div className="text-[10px] text-[#15803D] mt-0.5">
                P7 · Rules ({givenRules.length})
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRegistryPage('operator')}
              className={`py-2.5 px-2.5 text-left sm:text-center border-r border-b lg:border-b-0 border-[#DFDDD4] transition-colors cursor-pointer ${
                registryPage === 'operator'
                  ? 'bg-white text-[#1D4ED8] font-bold border-t-2 border-t-[#1D4ED8]'
                  : 'text-[#4B5563] hover:bg-white/60'
              }`}
            >
              <div>Operator Registry</div>
              <div className="text-[10px] text-[#1D4ED8] mt-0.5">
                P8 · MKML ({operatorRules.length})
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRegistryPage('solver')}
              className={`py-2.5 px-2.5 text-left sm:text-center transition-colors cursor-pointer ${
                registryPage === 'solver'
                  ? 'bg-white text-[#1D4ED8] font-bold border-t-2 border-t-[#1D4ED8]'
                  : 'text-[#4B5563] hover:bg-white/60'
              }`}
            >
              <div>Solver&apos;s Registry</div>
              <div className="text-[10px] text-[#6B7280] mt-0.5">
                P9 · Solver ({solverPathRules.length})
              </div>
            </button>
          </div>

          {/* ================================================================
              REGISTRY PAGE 1: DOMAIN REGISTRY (PERMANENT TIER 1)
              ================================================================ */}
          {registryPage === 'domain' && (
            <div className="p-5 space-y-5">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#111827]">
                    1) Domain Registry (Tier 1 · Root Prefix Code)
                  </div>
                  <span className="text-[11px] font-mono text-[#6B7280]">
                    Every Chapter automatically inherits its selected Domain code (e.g. QA → QA-TnD)
                  </span>
                </div>
                <div className="border border-[#DFDDD4] rounded-lg overflow-x-auto">
                  <table className="w-full text-left border-collapse font-mono text-xs">
                    <thead>
                      <tr className="bg-[#F9F8F4] border-b border-[#DFDDD4] text-[10px] uppercase text-[#6B7280]">
                        <th className="py-2.5 px-4 w-16">S.No</th>
                        <th className="py-2.5 px-4">Domain Name</th>
                        <th className="py-2.5 px-4 text-right">Unique Domain Code</th>
                        <th className="py-2.5 px-4 text-right w-28">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0EFEA]">
                      {domains.map((d, idx) => {
                        const isSandbox = isTestingDomain(d);
                        const linkedChaptersCount = chapters.filter(
                          (c) => c.domainCode.toUpperCase() === d.code.toUpperCase()
                        ).length;
                        const isPendingDelete = pendingDeleteDomainId === d.id;
                        return (
                          <React.Fragment key={d.id}>
                            <tr
                              className={isSandbox ? 'bg-[#FAF9F5] hover:bg-[#F5F4EF]' : 'hover:bg-[#F9F8F4]/60'}
                            >
                              <td className="py-2.5 px-4 text-[#6B7280]">{idx + 1})</td>
                              <td className="py-2.5 px-4 font-sans font-semibold text-[#111827]">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span>{d.name}</span>
                                  {isSandbox && (
                                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] rounded">
                                      Testing Sandbox · Hidden from Tracker &amp; Exam Info
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-2.5 px-4 text-right">
                                <span
                                  className={`px-2.5 py-0.5 border rounded font-bold ${
                                    isSandbox
                                      ? 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'
                                      : 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]'
                                  }`}
                                >
                                  {d.code}
                                </span>
                              </td>
                              <td className="py-2.5 px-4 text-right">
                                {isSandbox ? (
                                  <span className="text-[10px] text-[#9CA3AF]">Protected</span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setPendingDeleteDomainId(isPendingDelete ? null : d.id)
                                    }
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded border border-[#FECACA] bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] text-[11px] font-semibold cursor-pointer"
                                    title={`Delete domain ${d.name}`}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Delete</span>
                                  </button>
                                )}
                              </td>
                            </tr>
                            {isPendingDelete && (
                              <tr className="bg-[#FEF2F2]">
                                <td colSpan={4} className="px-4 py-2.5">
                                  {(() => {
                                    const dependentExams = exams.filter((ex) =>
                                      ex.domains.some(
                                        (ed) =>
                                          ed.domainCode.toUpperCase() === d.code.toUpperCase()
                                      )
                                    );
                                    const dummyCode =
                                      domains.find((domItem) => isTestingDomain(domItem))?.code ||
                                      'TST';
                                    return (
                                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#991B1B]">
                                        <div className="space-y-1">
                                          <div>
                                            Delete domain <strong>{d.name} ({d.code})</strong>?
                                            {linkedChaptersCount > 0
                                              ? ` Its ${linkedChaptersCount} chapter${linkedChaptersCount === 1 ? '' : 's'} will automatically move to Dummy domain (${dummyCode}) — no notes or disk folders are lost.`
                                              : ' No chapters inside this domain.'}
                                          </div>
                                          {dependentExams.length > 0 && (
                                            <div className="text-[11px] font-semibold text-[#7F1D1D]">
                                              ⚠ Dependent Exam{dependentExams.length === 1 ? '' : 's'}:{' '}
                                              {dependentExams.map((e) => e.name).join(', ')} — will show a missing-weightage error in 09 Exam Info until reallocated to 100%.
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <button
                                            type="button"
                                            disabled={isDeletingDomain}
                                            onClick={() => setPendingDeleteDomainId(null)}
                                            className="px-2.5 py-1 bg-white border border-[#D1CFC7] text-[#374151] rounded text-[11px] font-semibold cursor-pointer"
                                          >
                                            Cancel
                                          </button>
                                          <button
                                            type="button"
                                            disabled={isDeletingDomain}
                                            onClick={() => void handleConfirmDeleteDomain(d)}
                                            className="px-2.5 py-1 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-50 text-white rounded text-[11px] font-semibold cursor-pointer"
                                          >
                                            {isDeletingDomain
                                              ? 'Moving Chapters...'
                                              : linkedChaptersCount > 0
                                                ? `Delete & Move Chapters to ${dummyCode}`
                                                : 'Confirm Delete'}
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {deleteFeedback && (
                  <div className="mt-2 px-3 py-2 rounded bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D] text-xs font-mono">
                    {deleteFeedback}
                  </div>
                )}
              </div>

              <form
                onSubmit={handleCreateDomain}
                className="p-4 rounded-lg bg-[#F9F8F4] border border-[#DFDDD4] space-y-3"
              >
                <div className="text-xs font-mono font-bold text-[#1D4ED8]">
                  1a) Domain Creation Form (Permanent)
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    placeholder="Enter Domain name (e.g. Quantitative Aptitude)"
                    value={domNameInput}
                    onChange={(e) => {
                      setDomNameInput(e.target.value);
                      if (domError) setDomError(null);
                    }}
                    className="flex-1 min-w-[220px] px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
                  />
                  <input
                    type="text"
                    placeholder="Unique short code (e.g. QA)"
                    value={domCodeInput}
                    onChange={(e) => {
                      setDomCodeInput(e.target.value);
                      if (domError) setDomError(null);
                    }}
                    className="w-52 px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-mono font-semibold rounded flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Domain</span>
                  </button>
                </div>
                {domError && (
                  <div className="px-3 py-2 rounded bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-xs font-mono flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{domError}</span>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* ================================================================
              REGISTRY PAGE 2: CHAPTER REGISTRY (PERMANENT TIER 2 · DISK CONNECTED)
              ================================================================ */}
          {registryPage === 'chapter' && (
            <div className="p-5 space-y-5">
              {/* Unregistered Disk Folders Quick-Absorb Panel */}
              {unregisteredDiskFolders.length > 0 && (
                <div className="p-4 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#1E40AF]">
                    <FolderGit2 className="w-4 h-4 shrink-0" />
                    <span>
                      {unregisteredDiskFolders.length} Unregistered Disk Topic Folder
                      {unregisteredDiskFolders.length === 1 ? '' : 's'} Detected — Absorb into Chapter Registry
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {unregisteredDiskFolders.map((folder) => {
                      const chosenDom = absorbDomainByFolder[folder.folder] || domains[0]?.code || 'Eng';
                      const suggestedCode =
                        folder.rootMid ||
                        folder.folder.replace(/[^A-Za-z0-9]+/g, '').slice(0, 4).toUpperCase();
                      return (
                        <div
                          key={folder.folder}
                          className="flex items-center gap-2 bg-white border border-[#BFDBFE] rounded px-3 py-1.5 text-xs font-mono"
                        >
                          <span className="font-sans font-semibold text-[#111827]">
                            {folder.folder}
                          </span>
                          <span className="text-[10px] text-[#6B7280]">
                            ({folder.files.length} html{folder.rootMid ? ` · MID ${folder.rootMid}` : ''})
                          </span>
                          <select
                            value={chosenDom}
                            onChange={(e) =>
                              setAbsorbDomainByFolder((prev) => ({
                                ...prev,
                                [folder.folder]: e.target.value,
                              }))
                            }
                            className="px-1.5 py-0.5 text-[11px] font-mono bg-[#F9F8F4] border border-[#D1CFC7] rounded"
                          >
                            {domains.map((d) => (
                              <option key={d.id} value={d.code}>
                                {d.code}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => handleAbsorbDiskFolder(folder)}
                            className="px-2.5 py-1 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white rounded text-[11px] font-semibold cursor-pointer"
                          >
                            Absorb as {chosenDom}-{suggestedCode}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#111827]">
                    2) Chapter Registry (Tier 2 · Inherits Domain Code → Live Disk Fetch)
                  </div>
                  <span className="text-[11px] font-mono text-[#6B7280]">
                    Only chapters registered here can authorize Subtopic / Concept / MC tags in files
                  </span>
                </div>
                <div className="border border-[#DFDDD4] rounded-lg overflow-x-auto">
                  <table className="w-full text-left border-collapse font-mono text-xs">
                    <thead>
                      <tr className="bg-[#F9F8F4] border-b border-[#DFDDD4] text-[10px] uppercase text-[#6B7280]">
                        <th className="py-2.5 px-4 w-16">S.No</th>
                        <th className="py-2.5 px-4">Chapter Name</th>
                        <th className="py-2.5 px-4">Cascading Chapter ID</th>
                        <th className="py-2.5 px-4">Connected Disk Topic</th>
                        <th className="py-2.5 px-4 text-right">Domain</th>
                        <th className="py-2.5 px-4 text-right w-28">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0EFEA]">
                      {chapters.map((c, idx) => {
                        const linkedFolder = linkedFolderByChapterCode[c.code] || c.folderName;
                        const fullChapterId = `${c.domainCode}-${c.code}`;
                        const isSandbox = testingDomainCodes.has(c.domainCode.toUpperCase());
                        const isPendingDelete = pendingDeleteChapterId === c.id;
                        return (
                          <React.Fragment key={c.id}>
                            <tr
                              className={isSandbox ? 'bg-[#FAF9F5] hover:bg-[#F5F4EF]' : 'hover:bg-[#F9F8F4]/60'}
                            >
                              <td className="py-2.5 px-4 text-[#6B7280]">{idx + 1})</td>
                              <td className="py-2.5 px-4 font-sans font-semibold text-[#111827]">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span>{c.name}</span>
                                  {isSandbox && (
                                    <span className="px-1.5 py-0.5 text-[10px] font-mono bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] rounded">
                                      Sandbox Only
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-2.5 px-4">
                                <span className="px-2 py-0.5 bg-[#F5F4EF] border border-[#D1CFC7] rounded font-bold text-[#111827]">
                                  {fullChapterId}
                                </span>
                              </td>
                              <td className="py-2.5 px-4 text-[11px]">
                                {linkedFolder ? (
                                  <span className="px-2 py-0.5 bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] rounded font-semibold">
                                    disk: {linkedFolder}/
                                  </span>
                                ) : (
                                  <span className="text-[#9CA3AF]">No disk folder yet</span>
                                )}
                              </td>
                                <td className="py-2.5 px-4 text-right">
                                  <select
                                    value={c.domainCode}
                                    disabled={movingChapterId === c.id || isDeletingChapter}
                                    onChange={(e) =>
                                      void handleMoveChapterDomainRow(c, e.target.value)
                                    }
                                    title="Move chapter to another domain or to Dummy (Inactive)"
                                    className={`px-2 py-1 border rounded font-mono text-[11px] font-bold cursor-pointer focus:outline-none focus:border-[#1D4ED8] ${
                                      isSandbox
                                        ? 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'
                                        : 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]'
                                    }`}
                                  >
                                    {domains.map((domOpt) => (
                                      <option key={domOpt.id} value={domOpt.code}>
                                        {isTestingDomain(domOpt)
                                          ? `${domOpt.code} · Dummy (Inactive)`
                                          : `${domOpt.code} · ${domOpt.name}`}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td className="py-2.5 px-4 text-right">
                                  <button
                                    type="button"
                                    disabled={movingChapterId === c.id}
                                    onClick={() =>
                                      setPendingDeleteChapterId(isPendingDelete ? null : c.id)
                                    }
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded border border-[#FECACA] bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] text-[11px] font-semibold cursor-pointer"
                                    title={`Permanently delete chapter ${c.name} from Registry & disk`}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Delete</span>
                                  </button>
                                </td>
                              </tr>
                              {isPendingDelete && (
                                <tr className="bg-[#FEF2F2]">
                                  <td colSpan={6} className="px-4 py-2.5">
                                    {(() => {
                                      const dependentExams = exams.filter((ex) =>
                                        ex.domains.some((ed) =>
                                          ed.chapters.some(
                                            (ec) =>
                                              ec.chapterCode.toUpperCase() ===
                                              c.code.toUpperCase()
                                          )
                                        )
                                      );
                                      return (
                                        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#991B1B]">
                                          <div className="space-y-1">
                                            <div>
                                              Permanently delete{' '}
                                              <strong>
                                                {c.name} ({fullChapterId})
                                              </strong>
                                              ? This deletes{' '}
                                              {linkedFolder ? (
                                                <>
                                                  disk folder{' '}
                                                  <strong>/{linkedFolder}/</strong> (all code
                                                  files, <code>questions.html</code> &amp;{' '}
                                                  <code>tracker-ledger.json</code>)
                                                </>
                                              ) : (
                                                'all Registry & Tracker marks data'
                                              )}{' '}
                                              irreversibly.
                                            </div>
                                            {dependentExams.length > 0 && (
                                              <div className="text-[11px] font-semibold text-[#7F1D1D]">
                                                ⚠ Dependent Exam
                                                {dependentExams.length === 1 ? '' : 's'}:{' '}
                                                {dependentExams.map((e) => e.name).join(', ')} —
                                                will show a missing-weightage error until
                                                reallocated to 100%.
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <button
                                              type="button"
                                              disabled={isDeletingChapter}
                                              onClick={() => setPendingDeleteChapterId(null)}
                                              className="px-2.5 py-1 bg-white border border-[#D1CFC7] text-[#374151] rounded text-[11px] font-semibold cursor-pointer"
                                            >
                                              Cancel
                                            </button>
                                            <button
                                              type="button"
                                              disabled={isDeletingChapter}
                                              onClick={() => void handleConfirmDeleteChapter(c)}
                                              className="px-2.5 py-1 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-50 text-white rounded text-[11px] font-semibold cursor-pointer"
                                            >
                                              {isDeletingChapter
                                                ? 'Deleting Disk & Data...'
                                                : 'Permanently Delete Chapter + Disk'}
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })()}
                                  </td>
                                </tr>
                              )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {deleteFeedback && (
                  <div className="mt-2 px-3 py-2 rounded bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D] text-xs font-mono">
                    {deleteFeedback}
                  </div>
                )}
              </div>

              <form
                onSubmit={handleCreateChapter}
                className="p-4 rounded-lg bg-[#F9F8F4] border border-[#DFDDD4] space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-mono font-bold text-[#1D4ED8]">
                    2a) Chapter Creation Form (Permanent · Auto-Inherits Domain Code)
                  </div>
                  <span className="px-2.5 py-0.5 bg-white border border-[#BFDBFE] text-[#1D4ED8] rounded text-[11px] font-mono font-bold">
                    Full Chapter ID Preview: {chDomainSelect}-{chIdInput.trim() || 'TnD'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={chDomainSelect}
                    onChange={(e) => {
                      setChDomainSelect(e.target.value);
                      if (chError) setChError(null);
                    }}
                    className="px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
                  >
                    {domains.map((d) => (
                      <option key={d.id} value={d.code}>
                        Domain: {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Chapter name (e.g. Time and Distance)"
                    value={chNameInput}
                    onChange={(e) => {
                      setChNameInput(e.target.value);
                      if (chError) setChError(null);
                    }}
                    className="flex-1 min-w-[180px] px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
                  />
                  <input
                    type="text"
                    placeholder="Short code (e.g. TnD)"
                    value={chIdInput}
                    onChange={(e) => {
                      setChIdInput(e.target.value);
                      if (chError) setChError(null);
                    }}
                    className="w-40 px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
                  />
                  {unregisteredDiskFolders.length > 0 && (
                    <select
                      value={chFolderSelect}
                      onChange={(e) => setChFolderSelect(e.target.value)}
                      className="px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
                    >
                      <option value="">Link disk folder (optional)</option>
                      {unregisteredDiskFolders.map((f) => (
                        <option key={f.folder} value={f.folder}>
                          {f.folder}/
                        </option>
                      ))}
                    </select>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-mono font-semibold rounded flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create {chDomainSelect}-{chIdInput.trim() || 'ID'}</span>
                  </button>
                </div>
                {chError && (
                  <div className="px-3 py-2 rounded bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-xs font-mono flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{chError}</span>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* ================================================================
              REGISTRY PAGE 3: SUBTOPIC REGISTRY (LIVE ABSORBED FROM FILES)
              ================================================================ */}
          {registryPage === 'subtopic' && (
            <div className="p-5 space-y-5">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#111827]">
                    3) Subtopic Registry (Tier 3 · Live-Absorbed from Chapter Files · Not Saved Permanently)
                  </div>
                  <span className="text-[11px] font-mono text-[#15803D]">
                    Auto-populated from &lt;Subtopic == Domain-Chapter-ST, name = ...&gt;
                  </span>
                </div>
                <div className="border border-[#DFDDD4] rounded-lg overflow-x-auto">
                  <table className="w-full text-left border-collapse font-mono text-xs">
                    <thead>
                      <tr className="bg-[#F9F8F4] border-b border-[#DFDDD4] text-[10px] uppercase text-[#6B7280]">
                        <th className="py-2.5 px-4 w-16">S.No</th>
                        <th className="py-2.5 px-4">Full Cascading Subtopic ID</th>
                        <th className="py-2.5 px-4">Subtopic Name</th>
                        <th className="py-2.5 px-4">Parent Chapter</th>
                        <th className="py-2.5 px-4 text-right">Live Source</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0EFEA]">
                      {subtopics.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 px-4 text-center text-[#6B7280]">
                            No valid &lt;Subtopic == ...&gt; tags detected in registered chapter files yet.
                          </td>
                        </tr>
                      ) : (
                        subtopics.map((st, idx) => (
                          <tr key={st.id} className="hover:bg-[#F9F8F4]/60">
                            <td className="py-2.5 px-4 text-[#6B7280]">{idx + 1})</td>
                            <td className="py-2.5 px-4">
                              <span className="px-2 py-0.5 bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] rounded font-bold">
                                {st.fullId || `${st.domainCode}-${st.chapterCode}-${st.shortCode || st.code}`}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 font-sans font-semibold text-[#111827]">
                              {st.code}
                            </td>
                            <td className="py-2.5 px-4 text-[#374151]">
                              {st.chapterFullId || `${st.domainCode}-${st.chapterCode}`}
                            </td>
                            <td className="py-2.5 px-4 text-right text-[11px] text-[#6B7280]">
                              {st.sourceFile || 'Chapter file'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3a) On-the-Go MKML Subtopic Tag Builder */}
              <div className="p-4 rounded-lg bg-[#F9F8F4] border border-[#DFDDD4] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-mono font-bold text-[#1D4ED8]">
                    3a) Author Subtopics On The Go — Copy Valid Cascading MKML Tag
                  </div>
                  <span className="text-[11px] font-mono text-[#6B7280]">
                    Paste into your chapter HTML file in 02 Coding Area; Registry absorbs it live
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={stChapterSelect}
                    onChange={(e) => setStChapterSelect(e.target.value)}
                    className="px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
                  >
                    {activeNonTestingChapters.map((c) => (
                      <option key={c.id} value={c.code}>
                        Chapter: {c.domainCode}-{c.code} ({c.name})
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Subtopic code (e.g. RL)"
                    value={stCodeInput}
                    onChange={(e) => setStCodeInput(e.target.value)}
                    className="w-44 px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
                  />
                  <input
                    type="text"
                    placeholder="Display name (e.g. Relative Speed)"
                    value={stNameInput}
                    onChange={(e) => setStNameInput(e.target.value)}
                    className="flex-1 min-w-[200px] px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
                  />
                  <button
                    type="button"
                    onClick={() => copyTagSnippet('st', generatedSubtopicTag)}
                    className="px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-mono font-semibold rounded flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedTagKey === 'st' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedTagKey === 'st' ? 'Copied Tag' : 'Copy MKML Tag'}</span>
                  </button>
                </div>
                <pre className="p-2.5 bg-white border border-[#DFDDD4] rounded text-[11px] font-mono text-[#0F172A] overflow-x-auto">
                  {generatedSubtopicTag}
                </pre>
              </div>
            </div>
          )}

          {/* ================================================================
              REGISTRY PAGE 4: CONCEPT REGISTRY (LIVE ABSORBED FROM FILES)
              ================================================================ */}
          {registryPage === 'concept' && (
            <div className="p-5 space-y-5">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#111827]">
                    4) Concept Registry (Tier 4 · Live-Absorbed from Chapter Files · Cascading Prefix Enforced)
                  </div>
                  <span className="text-[11px] font-mono text-[#15803D]">
                    Auto-populated from &lt;Concept == Domain-Chapter-ST-CON, name = ...&gt;
                  </span>
                </div>
                <div className="border border-[#DFDDD4] rounded-lg overflow-x-auto">
                  <table className="w-full text-left border-collapse font-mono text-xs">
                    <thead>
                      <tr className="bg-[#F9F8F4] border-b border-[#DFDDD4] text-[10px] uppercase text-[#6B7280]">
                        <th className="py-2.5 px-4 w-16">S.No</th>
                        <th className="py-2.5 px-4">Full Cascading Concept ID</th>
                        <th className="py-2.5 px-4">Concept Name</th>
                        <th className="py-2.5 px-4">Parent Subtopic</th>
                        <th className="py-2.5 px-4 text-right">Live Source</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0EFEA]">
                      {concepts.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 px-4 text-center text-[#6B7280]">
                            No valid &lt;Concept == ...&gt; tags detected in registered chapter files yet.
                          </td>
                        </tr>
                      ) : (
                        concepts.map((con, idx) => (
                          <tr key={con.id} className="hover:bg-[#F9F8F4]/60">
                            <td className="py-2.5 px-4 text-[#6B7280]">{idx + 1})</td>
                            <td className="py-2.5 px-4">
                              <span className="px-2 py-0.5 bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] rounded font-bold">
                                {con.fullId || `${con.domainCode}-${con.chapterCode}-${con.subtopicCode}-${con.shortCode || con.code}`}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 font-sans font-semibold text-[#111827]">
                              {con.code}
                            </td>
                            <td className="py-2.5 px-4 text-[#374151]">
                              {con.subtopicFullId || con.subtopicCode}
                            </td>
                            <td className="py-2.5 px-4 text-right text-[11px] text-[#6B7280]">
                              {con.sourceFile || 'Chapter file'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4a) On-the-Go MKML Concept Tag Builder */}
              <div className="p-4 rounded-lg bg-[#F9F8F4] border border-[#DFDDD4] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-mono font-bold text-[#1D4ED8]">
                    4a) Author Concepts On The Go — Copy Valid Cascading MKML Tag
                  </div>
                  <span className="text-[11px] font-mono text-[#6B7280]">
                    Must nest inside a valid Subtopic prefix
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={selectedConSubtopic?.fullId || ''}
                    onChange={(e) => setConSubtopicSelect(e.target.value)}
                    className="px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
                  >
                    {subtopics.map((st) => (
                      <option key={st.id} value={st.fullId || st.id}>
                        Subtopic: {st.fullId || st.code} ({st.code})
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Concept code (e.g. SPD)"
                    value={conCodeInput}
                    onChange={(e) => setConCodeInput(e.target.value)}
                    className="w-44 px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
                  />
                  <input
                    type="text"
                    placeholder="Display name (e.g. Speed)"
                    value={conNameInput}
                    onChange={(e) => setConNameInput(e.target.value)}
                    className="flex-1 min-w-[200px] px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
                  />
                  <button
                    type="button"
                    onClick={() => copyTagSnippet('con', generatedConceptTag)}
                    className="px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-mono font-semibold rounded flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedTagKey === 'con' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedTagKey === 'con' ? 'Copied Tag' : 'Copy MKML Tag'}</span>
                  </button>
                </div>
                <pre className="p-2.5 bg-white border border-[#DFDDD4] rounded text-[11px] font-mono text-[#0F172A] overflow-x-auto">
                  {generatedConceptTag}
                </pre>
              </div>
            </div>
          )}

          {/* ================================================================
              REGISTRY PAGE 5: MICRO CONCEPT REGISTRY (PERMANENT FULL BASE IDs)
              ================================================================ */}
          {registryPage === 'micro' && (
            <div className="p-5 space-y-5">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#111827]">
                    5) Micro Concept Registry (Permanent 5-Tier Full Base IDs + Global TG)
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] rounded text-[11px] font-mono font-semibold">
                      Permanent Base IDs · Zero Unstable Tn Drift
                    </span>
                  </div>
                </div>

                <div className="border border-[#DFDDD4] rounded-lg overflow-x-auto">
                  <table className="w-full text-left border-collapse font-mono text-xs">
                    <thead>
                      <tr className="bg-[#F9F8F4] border-b border-[#DFDDD4] text-[10px] uppercase text-[#6B7280]">
                        <th className="py-2.5 px-3 w-12">S.No</th>
                        <th className="py-2.5 px-3">Permanent Step / Base ID</th>
                        <th className="py-2.5 px-3">Micro Concept Description &amp; Source</th>
                        <th className="py-2.5 px-3 text-right w-40">Scope</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0EFEA]">
                      {microConcepts.map((mc, idx) => (
                        <tr
                          key={mc.id}
                          className={`hover:bg-[#F9F8F4]/60 ${mc.isGlobalGeneral ? 'bg-[#FFFBEB]/50' : ''}`}
                        >
                          <td className="py-2.5 px-3 text-[#6B7280]">{idx + 1})</td>
                          <td className="py-2.5 px-3">
                            {mc.isGlobalGeneral || !mc.baseId ? (
                              <span className="px-2.5 py-0.5 rounded font-bold border bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]">
                                TG
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded font-bold border bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]">
                                {mc.baseId}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-sans font-semibold text-[#111827]">{mc.code}</div>
                            <div className="text-[10px] text-[#6B7280] mt-0.5">
                              {mc.isGlobalGeneral
                                ? 'Cross-Chapter Basic Arithmetic & Substitution (No Base ID)'
                                : `${mc.sourceFile || `${mc.domainCode}-${mc.chapterCode}`} · ${mc.subtopicCode} → ${mc.conceptCode}`}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="text-[10px] font-bold uppercase text-[#6B7280]">
                              {mc.isGlobalGeneral ? 'Global Constant' : 'Permanent Base ID'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 5a) On-the-Go MKML Micro Concept Tag Builder */}
              <div className="p-4 rounded-lg bg-[#F9F8F4] border border-[#DFDDD4] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-mono font-bold text-[#1D4ED8]">
                    5a) Author Micro Concepts On The Go — Copy Permanent 5-Tier Base ID Tag
                  </div>
                  <span className="text-[11px] font-mono text-[#6B7280]">
                    Use the exact 5-tier Base ID directly inside &lt;step N - BASE_ID&gt;
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={selectedMcConcept?.fullId || ''}
                    onChange={(e) => setMcConceptSelect(e.target.value)}
                    className="px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
                  >
                    {concepts.map((con) => (
                      <option key={con.id} value={con.fullId || con.id}>
                        Concept: {con.fullId || con.code} ({con.code})
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="MC segment (e.g. MC4)"
                    value={mcSegInput}
                    onChange={(e) => setMcSegInput(e.target.value)}
                    className="w-40 px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
                  />
                  <input
                    type="text"
                    placeholder="Micro-concept description"
                    value={mcNameInput}
                    onChange={(e) => setMcNameInput(e.target.value)}
                    className="flex-1 min-w-[200px] px-3 py-2 text-xs font-mono bg-white border border-[#D1CFC7] rounded text-[#111827] focus:outline-none focus:border-[#1D4ED8]"
                  />
                  <button
                    type="button"
                    onClick={() => copyTagSnippet('mc', generatedMcTag)}
                    className="px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-mono font-semibold rounded flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedTagKey === 'mc' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedTagKey === 'mc' ? 'Copied Tag' : 'Copy MKML Tag'}</span>
                  </button>
                </div>
                <pre className="p-2.5 bg-white border border-[#DFDDD4] rounded text-[11px] font-mono text-[#0F172A] overflow-x-auto">
                  {generatedMcTag}
                </pre>
              </div>
            </div>
          )}

          {/* ================================================================
              REGISTRY PAGE 6: ASKED REGISTRY (START -> END BOUNDARY RULES)
              ================================================================ */}
          {registryPage === 'asked' && (
            <BoundaryRegistrySection
              title="6) Asked Registry (Start Point → End Point Extraction Rules)"
              subtitle="Selects the most matching boundary rule to extract what is asked; optional Combined Rule Fallback collects non-overlapping targets."
              accentHex="#B45309"
              addButtonLabel="6a) Add Asked Registry Rule"
              rules={askedRules}
              setRules={setAskedRules}
              combineFallback={combineAskedFallback}
              setCombineFallback={setCombineAskedFallback}
            />
          )}

          {/* ================================================================
              REGISTRY PAGE 7: GIVEN REGISTRY (START -> END BOUNDARY RULES)
              ================================================================ */}
          {registryPage === 'given' && (
            <BoundaryRegistrySection
              title="7) Given Registry (Start Point → End Point Extraction Rules)"
              subtitle="Selects the most matching boundary rule to extract given equations, values, and conditions; optional Combined Rule Fallback collects non-overlapping clauses."
              accentHex="#15803D"
              addButtonLabel="7a) Add Given Registry Rule"
              rules={givenRules}
              setRules={setGivenRules}
              combineFallback={combineGivenFallback}
              setCombineFallback={setCombineGivenFallback}
            />
          )}

          {/* ================================================================
              REGISTRY PAGE 8: OPERATOR REGISTRY (MKML <math ==> BASE DICTIONARY)
              ================================================================ */}
          {registryPage === 'operator' && (
            <OperatorRegistrySection
              operatorRules={operatorRules}
              setOperatorRules={setOperatorRules}
            />
          )}

          {/* ================================================================
              REGISTRY PAGE 9: SOLVER'S REGISTRY (PATH & STEP CHAIN MAPPING)
              ================================================================ */}
          {registryPage === 'solver' && (
            <SolverRegistrySection
              solverPaths={solverPathRules}
              setSolverPaths={setSolverPathRules}
              symbolAliases={symbolAliases}
              setSymbolAliases={setSymbolAliases}
              operatorRules={operatorRules}
              concepts={concepts}
              microConcepts={microConcepts}
            />
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
                    const exIntegrity = examIntegrityById[ex.id];
                    const hasIssues = Boolean(exIntegrity && !exIntegrity.isValid);
                    return (
                      <button
                        key={ex.id}
                        type="button"
                        onClick={() => setSelectedExamId(ex.id)}
                        className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? hasIssues
                              ? 'bg-[#DC2626] text-white shadow-2xs'
                              : 'bg-[#1D4ED8] text-white shadow-2xs'
                            : hasIssues
                              ? 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FCA5A5] hover:bg-[#FEE2E2]'
                              : 'bg-[#F9F8F4] text-[#374151] border border-[#DFDDD4] hover:bg-[#EFECE6]'
                        }`}
                      >
                        {hasIssues && <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
                        <span>
                          {idx + 1}) {ex.name}
                        </span>
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

          {/* EXAM WEIGHTAGE INTEGRITY ERROR BANNER (DELETED / MOVED DOMAINS OR CHAPTERS) */}
          {selectedExamIntegrity && !selectedExamIntegrity.isValid && (
            <div className="bg-[#FEF2F2] border-2 border-[#DC2626] rounded-lg p-4 shadow-2xs space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#991B1B]">
                      EXAM WEIGHTAGE INTEGRITY ERROR — REALLOCATION REQUIRED ({examReadinessReport.examName})
                    </div>
                    <div className="text-xs font-sans text-[#7F1D1D]">
                      One or more domains or chapters used by this exam were deleted or moved in Registry. Combined domain and per-domain chapter weightages no longer sum to 100%.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedExam) {
                      handleSelectConfigTarget(selectedExam.id);
                    }
                    onSwitchMode('exam-page-2');
                  }}
                  className="px-3.5 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-md text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Edit &amp; Reallocate Weightages</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <ul className="bg-white border border-[#FECACA] rounded-md p-3 space-y-1.5 text-xs font-mono text-[#991B1B] list-disc list-inside">
                {selectedExamIntegrity.issues.map((issue, idx) => (
                  <li key={`${issue.type}-${idx}`}>{issue.message}</li>
                ))}
              </ul>
            </div>
          )}

          {/* TIER 1 HERO CARD: EXAM READINESS PERCENTAGE (ERP) */}
          <div
            className={`bg-white border-2 rounded-lg p-5 shadow-2xs space-y-3 ${
              selectedExamIntegrity && !selectedExamIntegrity.isValid
                ? 'border-[#F59E0B]'
                : 'border-[#1D4ED8]'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#1D4ED8]">
                  <Calculator className="w-4 h-4" />
                  <span>EXAM READINESS PERCENTAGE (ERP) — {examReadinessReport.examName}</span>
                  {selectedExamIntegrity && !selectedExamIntegrity.isValid && (
                    <span className="px-2 py-0.5 text-[10px] rounded bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
                      Incomplete · Fix Weightages to 100%
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-4xl font-mono font-extrabold text-[#111827]">
                    {examReadinessReport.ERP.toFixed(3)}%
                  </span>
                  <span className="text-xs font-mono text-[#6B7280]">
                    (Weighted Roll-Up Across {examReadinessReport.domains.length} Configured
                    Domain{examReadinessReport.domains.length === 1 ? '' : 's'})
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
                  <span key={`${d.domainCode}-${i}`}>
                    {i > 0 && ' + '}
                    <span className={d.isMissingDomain ? 'text-[#DC2626] line-through' : ''}>
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
                key={`${dom.domainCode}-${dom.index}`}
                className={`bg-white rounded-lg p-4 shadow-2xs space-y-3 flex flex-col justify-between ${
                  dom.isMissingDomain
                    ? 'border-2 border-[#FCA5A5] bg-[#FFF5F5]'
                    : 'border border-[#DFDDD4]'
                }`}
              >
                <div className="space-y-3">
                  {/* Domain Header & DRP Score */}
                  <div className="flex flex-wrap items-start justify-between gap-2 pb-2.5 border-b border-[#E5E3DC]">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
                            dom.isMissingDomain ? 'text-[#DC2626]' : 'text-[#1D4ED8]'
                          }`}
                        >
                          DOMAIN {dom.index}: {dom.domainName} [{dom.domainCode}]
                        </span>
                        {dom.domainStatusNote && (
                          <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#FEE2E2] text-[#B91C1C] border border-[#FCA5A5] rounded">
                            ⚠ {dom.domainStatusNote}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono text-[#6B7280] mt-0.5">
                        Exam Weight (D{dom.index}P{dom.index}): <strong>{dom.DnPn}%</strong> (
                        {dom.DnPnNorm.toFixed(2)}) · ERP Contribution:{' '}
                        <strong className={dom.isMissingDomain ? 'text-[#DC2626]' : 'text-[#15803D]'}>
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
                        key={`${ch.chapterCode}-${ch.index}`}
                        className={`p-2.5 rounded border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono ${
                          ch.isMissingChapter
                            ? 'border-[#FCA5A5] bg-[#FEF2F2]'
                            : 'border-[#E5E3DC] bg-[#F9F8F4]'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`font-sans font-bold ${
                                ch.isMissingChapter ? 'text-[#991B1B]' : 'text-[#111827]'
                              }`}
                            >
                              {ch.index}. {ch.chapterName} [{ch.chapterCode}]
                            </span>
                            {ch.chapterStatusNote ? (
                              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#FEE2E2] text-[#B91C1C] border border-[#FCA5A5] rounded">
                                ⚠ {ch.chapterStatusNote}
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onJumpToChapterLedger(ch.chapterCode)}
                                className="px-1.5 py-0.5 text-[10px] bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] rounded flex items-center gap-0.5 cursor-pointer"
                                title="Inspect this chapter's question pool ledger"
                              >
                                <span>TCR Ledger</span>
                                <ArrowUpRight className="w-3 h-3" />
                              </button>
                            )}
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
                          <div
                            className={`text-sm font-bold ${
                              ch.isMissingChapter ? 'text-[#DC2626]' : 'text-[#15803D]'
                            }`}
                          >
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
                handleSelectConfigTarget(selectedExam?.id || selectedExamId);
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
                  {exams.map((ex, i) => {
                    const hasIssues = Boolean(
                      examIntegrityById[ex.id] && !examIntegrityById[ex.id].isValid
                    );
                    return (
                      <button
                        key={ex.id}
                        type="button"
                        onClick={() => handleSelectConfigTarget(ex.id)}
                        className={`px-2.5 py-1 rounded border flex items-center gap-1 cursor-pointer transition-colors ${
                          configTargetId === ex.id
                            ? hasIssues
                              ? 'bg-[#DC2626] text-white border-[#DC2626] font-bold'
                              : 'bg-[#1D4ED8] text-white border-[#1D4ED8] font-bold'
                            : hasIssues
                              ? 'bg-[#FEF2F2] text-[#B91C1C] border-[#FCA5A5] hover:bg-[#FEE2E2] font-semibold'
                              : 'bg-[#F9F8F4] text-[#374151] border-[#DFDDD4] hover:bg-[#EFECE6]'
                        }`}
                      >
                        {hasIssues ? (
                          <AlertTriangle className="w-3 h-3" />
                        ) : (
                          <Edit3 className="w-3 h-3" />
                        )}
                        <span>
                          {i + 1}) {ex.name}
                        </span>
                      </button>
                    );
                  })}
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

              {configTargetId !== 'NEW' && exams.length > 1 && (
                <div className="flex items-center gap-2 text-xs font-mono">
                  {pendingDeleteExamId === configTargetId ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setPendingDeleteExamId(null)}
                        className="px-2.5 py-1 bg-white border border-[#D1CFC7] text-[#374151] rounded font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteExamProfile(configTargetId)}
                        className="px-2.5 py-1 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded font-semibold cursor-pointer"
                      >
                        Confirm Delete Exam
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPendingDeleteExamId(configTargetId)}
                      className="px-2.5 py-1 bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] rounded font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Exam</span>
                    </button>
                  )}
                </div>
              )}
            </div>

          {(!draftIntegrity.hasNoBrokenRefs || !draftIntegrity.hasNoDuplicates) && (
            <div className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FCA5A5] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#991B1B]">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-[#DC2626]" />
                <span>
                  {!draftIntegrity.hasNoBrokenRefs
                    ? 'Deleted or moved domains/chapters are highlighted in red below. Remove or replace them and rebalance weightages to 100%.'
                    : 'Duplicate domain or chapter rows detected below. Remove duplicates before saving.'}
                </span>
              </div>
              {!draftIntegrity.hasNoBrokenRefs && (
                <button
                  type="button"
                  onClick={handleAutoCleanBrokenDraftRows}
                  className="px-3 py-1 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded font-semibold cursor-pointer shrink-0"
                >
                  Remove Broken Rows
                </button>
              )}
            </div>
          )}

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
                  disabled={activeNonTestingDomains.length === 0}
                  className="px-2.5 py-1 bg-[#EFF6FF] hover:bg-[#DBEAFE] disabled:opacity-40 text-[#1D4ED8] border border-[#BFDBFE] rounded text-xs font-mono font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Domain</span>
                </button>
              </div>

              <div className="space-y-2">
                {draftDomains.map((domRow, dIdx) => {
                  const isBrokenDom = draftIntegrity.brokenDomainIndices.has(dIdx);
                  const isDupDom = draftIntegrity.duplicateDomainIndices.has(dIdx);
                  return (
                    <div
                      key={`${domRow.domainCode}-${dIdx}`}
                      className={`flex flex-wrap items-center gap-2 p-2 rounded border ${
                        isBrokenDom || isDupDom
                          ? 'bg-[#FEF2F2] border-[#FCA5A5]'
                          : 'bg-white border-[#E5E3DC]'
                      }`}
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
                        className={`flex-1 min-w-[180px] px-2.5 py-1 text-xs font-mono bg-white border rounded ${
                          isBrokenDom || isDupDom
                            ? 'border-[#DC2626] text-[#B91C1C] font-bold'
                            : 'border-[#D1CFC7] text-[#111827]'
                        }`}
                      >
                        {isBrokenDom && (
                          <option value={domRow.domainCode}>
                            ⚠ Deleted / Invalid Domain: {domRow.domainCode}
                          </option>
                        )}
                        {activeNonTestingDomains.map((d) => (
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

                      {(draftDomains.length > 1 || isBrokenDom) && (
                        <button
                          type="button"
                          onClick={() => handleRemoveDraftDomainRow(dIdx)}
                          className="p-1 text-[#DC2626] hover:bg-[#FEE2E2] rounded cursor-pointer"
                          title="Remove domain"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
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
                    (c) =>
                      c.domainCode.toUpperCase() === domRow.domainCode.toUpperCase() &&
                      !testingDomainCodes.has(domRow.domainCode.toUpperCase())
                  );
                  const validity = domainChapterValidity[dIdx];
                  const isBrokenDom = draftIntegrity.brokenDomainIndices.has(dIdx);

                  return (
                    <div
                      key={`ch-group-${domRow.domainCode}-${dIdx}`}
                      className={`bg-white rounded-lg p-3 space-y-2.5 ${
                        isBrokenDom
                          ? 'border-2 border-[#FCA5A5] bg-[#FFF5F5]'
                          : 'border border-[#DFDDD4]'
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-[#E5E3DC] pb-2">
                        <span
                          className={`text-xs font-mono font-bold ${
                            isBrokenDom ? 'text-[#DC2626]' : 'text-[#1D4ED8]'
                          }`}
                        >
                          Domain {dIdx + 1}: {domRow.domainCode} (D{dIdx + 1}P{dIdx + 1} ={' '}
                          {domRow.percentage}%)
                          {isBrokenDom ? ' · DELETED' : ''}
                        </span>
                        <button
                          type="button"
                          disabled={domChapters.length === 0}
                          onClick={() => handleAddDraftChapterRow(dIdx)}
                          className="px-2 py-0.5 bg-[#EFF6FF] hover:bg-[#DBEAFE] disabled:opacity-40 text-[#1D4ED8] border border-[#BFDBFE] rounded text-[11px] font-mono font-semibold cursor-pointer"
                        >
                          + Add Chapter
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {domRow.chapters.map((chRow, cIdx) => {
                          const key = `${dIdx}:${cIdx}`;
                          const isBrokenCh = draftIntegrity.brokenChapterKeys.has(key);
                          const isDupCh = draftIntegrity.duplicateChapterKeys.has(key);
                          return (
                            <div
                              key={`${chRow.chapterCode}-${cIdx}`}
                              className={`flex items-center gap-1 text-xs font-mono rounded ${
                                isBrokenCh || isDupCh ? 'bg-[#FEF2F2] p-1 border border-[#FCA5A5]' : ''
                              }`}
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
                                className={`flex-1 px-2 py-1 bg-white border rounded ${
                                  isBrokenCh || isDupCh
                                    ? 'border-[#DC2626] text-[#B91C1C] font-bold'
                                    : 'border-[#D1CFC7] text-[#111827]'
                                }`}
                              >
                                {isBrokenCh && (
                                  <option value={chRow.chapterCode}>
                                    ⚠ Deleted / Moved Chapter: {chRow.chapterCode}
                                  </option>
                                )}
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

                              {(domRow.chapters.length > 1 || isBrokenCh) && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDraftChapterRow(dIdx, cIdx)}
                                  className="p-1 text-[#DC2626] hover:bg-[#FEE2E2] rounded cursor-pointer"
                                  title="Remove chapter"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Per-Domain Sum Status */}
                      <div
                        className={`px-2.5 py-1.5 rounded text-[11px] font-mono flex items-center justify-between ${
                          validity?.isValid && !isBrokenDom
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
              <div className="flex flex-wrap items-center gap-3">
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
                {!canSaveExam && (
                  <span className="text-[11px] font-mono text-[#DC2626]">
                    {!draftIntegrity.hasNoBrokenRefs
                      ? 'Fix deleted/moved domains & chapters before saving.'
                      : !draftIntegrity.hasNoDuplicates
                        ? 'Remove duplicate domains or chapters before saving.'
                        : !isDomainSumValid
                          ? 'Domain percentages must sum to 100%.'
                          : !areAllChaptersValid
                            ? 'Every domain’s chapters must sum to 100%.'
                            : 'Enter an exam name and at least one domain.'}
                  </span>
                )}
              </div>

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
