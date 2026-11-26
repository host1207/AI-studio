import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Lock,
  Unlock,
  ArrowRight,
} from 'lucide-react';
import {
  ExamRegistryDashboard,
  type DashboardSectionMode,
  type DomainItem,
  type ChapterItem,
  type ExamProfile,
  INITIAL_DOMAINS,
  INITIAL_CHAPTERS,
  INITIAL_EXAMS,
  isTestingDomain,
} from './ExamRegistryDashboard';
import { TrackerPageTwo } from './TrackerPageTwo';
import { TrackerQiqTab } from './TrackerQiqTab';
import { TrackerTesterTab } from './TrackerTesterTab';
import { TrackerQuestionIndex } from './TrackerQuestionIndex';
import {
  TrackerQuestionCards,
  type QuestionCardPayloadItem,
} from './TrackerQuestionCards';
import {
  TrackerTestAnalysis,
  type TestSessionRecord,
} from './TrackerTestAnalysis';
import {
  CHAPTER_MKML_STORAGE,
  scanChapterStorageAndMarks,
  type ExplanationStepItem,
} from '../utils/mkmlStorageScanner';
import {
  loadPersistedTrackerState,
  savePersistedTrackerState,
  loadDiskTrackerState,
  saveDiskTrackerState,
} from '../utils/trackerLocalStorage';
import {
  absorbLiveRegistryFromFiles,
  type DiskChapterFolder,
} from '../utils/registryAbsorber';
import {
  QuestionRoutingStatus,
  type QuestionRoutingStatusState,
} from './QuestionRoutingStatus';
import {
  INITIAL_ASKED_RULES,
  INITIAL_GIVEN_RULES,
  INITIAL_OPERATOR_RULES,
  INITIAL_SOLVER_PATH_RULES,
  INITIAL_SYMBOL_ALIASES,
  type BoundaryRuleItem,
  type OperatorRuleItem,
  type SolverPathRuleItem,
  type SymbolAliasItem,
} from '../utils/givenAskedEngine';

export type AttemptStatus = 'C' | 'W' | 'S';
// [status, seconds, accuracyMark, timeMark, option]
export type AttemptTuple = [AttemptStatus, number, number, number, string];

export interface ChapterTimingConfig {
  fastLimit: number;
  mediumLimit: number;
  slowLimit: number;
  locked: boolean;
}

export interface ChapterLedger {
  chapterCode: string;
  chapterName: string;
  evaluationDate: string;
  timing: ChapterTimingConfig;
  concepts: Record<string, Record<string, AttemptTuple[]>>;
}

function formatEvaluationDate(value?: string | Date | null): string {
  if (!value) return 'Not evaluated';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return 'Not evaluated';
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

// Clean empty chapter ledger (0 questions, 0 marks) for chapters that do not yet have subtopics/marks
function createEmptyChapterLedger(
  chapterCode: string,
  chapterName: string,
  fastLimit = 30,
  mediumLimit = 60,
  slowLimit = 90
): ChapterLedger {
  return {
    chapterCode,
    chapterName,
    evaluationDate: 'Not evaluated',
    timing: {
      fastLimit,
      mediumLimit,
      slowLimit,
      locked: false,
    },
    concepts: {},
  };
}

const INITIAL_LEDGERS: Record<string, ChapterLedger> = {
  // QA: Trigonometry (only chapter authored with the new 5-tier hierarchy syntax)
  TRG: {
    chapterCode: 'TRG',
    chapterName: 'Trigonometry',
    evaluationDate: '19/11/2026',
    timing: {
      fastLimit: 45,
      mediumLimit: 75,
      slowLimit: 110,
      locked: true,
    },
    concepts: {
      'BS-FR': {
        'QA-TRG-BS-FR-1': [
          ['C', 28, 1, 2, 'A'],
          ['C', 22, 1, 2, 'A'],
        ],
        'QA-TRG-BS-FR-2': [
          ['C', 38, 1, 2, 'B'],
          ['C', 31, 1, 2, 'B'],
        ],
        'QA-TRG-BS-FR-3': [
          ['C', 62, 1, 1, 'B'],
          ['C', 41, 1, 2, 'B'],
        ],
        'QA-TRG-BS-FR-4': [
          ['W', 68, -0.5, 0, 'D'],
          ['C', 44, 1, 2, 'A'],
        ],
        'QA-TRG-BS-FR-5': [
          ['C', 30, 1, 2, 'C'],
          ['C', 25, 1, 2, 'C'],
        ],
        'QA-TRG-BS-FR-6': [
          ['C', 35, 1, 2, 'B'],
          ['C', 29, 1, 2, 'B'],
        ],
        'QA-TRG-BS-FR-7': [
          ['C', 33, 1, 2, 'C'],
          ['C', 27, 1, 2, 'C'],
        ],
        'QA-TRG-BS-FR-8': [
          ['C', 42, 1, 2, 'A'],
          ['C', 36, 1, 2, 'A'],
        ],
        'QA-TRG-BS-FR-9': [
          ['C', 58, 1, 1, 'B'],
          ['C', 43, 1, 2, 'B'],
        ],
        'QA-TRG-BS-FR-10': [
          ['C', 64, 1, 1, 'B'],
          ['C', 40, 1, 2, 'B'],
        ],
        'QA-TRG-BS-FR-11': [
          ['C', 34, 1, 2, 'B'],
          ['C', 26, 1, 2, 'B'],
        ],
        'QA-TRG-BS-FR-12': [
          ['W', 74, -0.5, 0, 'A'],
          ['C', 52, 1, 1, 'B'],
        ],
        'QA-TRG-BS-FR-13': [
          ['C', 82, 1, 0.5, 'A'],
          ['C', 65, 1, 1, 'A'],
        ],
        'QA-TRG-BS-FR-14': [
          ['W', 85, -0.5, 0, 'A'],
          ['W', 70, -0.5, 0, 'C'],
        ],
        'QA-TRG-BS-FR-15': [
          ['C', 71, 1, 1, 'A'],
          ['C', 55, 1, 1, 'A'],
        ],
        'QA-TRG-BS-FR-16': [
          ['C', 39, 1, 2, 'C'],
          ['C', 32, 1, 2, 'C'],
        ],
        'QA-TRG-BS-FR-17': [
          ['W', 78, -0.5, 0, 'B'],
          ['W', 66, -0.5, 0, 'B'],
        ],
        'QA-TRG-BS-FR-18': [
          ['C', 69, 1, 1, 'A'],
          ['W', 72, -0.5, 0, 'B'],
        ],
        'QA-TRG-BS-FR-19': [
          ['C', 60, 1, 1, 'A'],
          ['C', 44, 1, 2, 'A'],
        ],
        'QA-TRG-BS-FR-20': [
          ['S', 40, -0.2, 0, '-'],
          ['W', 76, -0.5, 0, 'C'],
        ],
        'QA-TRG-BS-FR-21': [
          ['C', 73, 1, 1, 'A'],
          ['S', 35, -0.2, 0, '-'],
        ],
        'QA-TRG-BS-FR-22': [],
        'QA-TRG-BS-FR-23': [],
      },
    },
  },
  // English Language (Eng) — real disk chapters with no subtopic tags or marks yet
  PC: createEmptyChapterLedger('PC', 'Phrases and Clauses'),
  TE: createEmptyChapterLedger('TE', 'Tenses'),
  VB: createEmptyChapterLedger('VB', 'Verb'),
  PN: createEmptyChapterLedger('PN', 'Pronoun New'),
  SVA: createEmptyChapterLedger('SVA', 'Subject-Verb Agreement'),
};

function computeAttemptMarks(
  status: AttemptStatus,
  seconds: number,
  timing: ChapterTimingConfig
): { accMark: number; timeMark: number } {
  if (status === 'W') return { accMark: -0.5, timeMark: 0 };
  if (status === 'S') return { accMark: -0.2, timeMark: 0 };
  // status === 'C'
  let timeMark = 0;
  if (seconds <= timing.fastLimit) {
    timeMark = 2.0;
  } else if (seconds <= timing.mediumLimit) {
    timeMark = 1.0;
  } else if (seconds <= timing.slowLimit) {
    timeMark = 0.5;
  } else {
    timeMark = 0.0;
  }
  return { accMark: 1.0, timeMark };
}

function formatNum(n: number, maxDecimals = 2): string {
  if (Number.isInteger(n)) return n.toString();
  return Number(n.toFixed(maxDecimals)).toString();
}

const INITIAL_TEST_SESSIONS: TestSessionRecord[] = [
  {
    id: 'test-trg-1',
    label: 'test id(1) — TRG Basics FR (23 Qs)',
    chapterCode: 'TRG',
    questionUniqueIds: Array.from({ length: 23 }, (_, i) => `QA-TRG-BS-FR-${i + 1}`),
    createdAt: '19/11/2026',
  },
  {
    id: 'test-trg-2',
    label: 'test id(2) — TRG Dual-Angle & Triplets (10 Qs)',
    chapterCode: 'TRG',
    questionUniqueIds: [
      'QA-TRG-BS-FR-1',
      'QA-TRG-BS-FR-2',
      'QA-TRG-BS-FR-4',
      'QA-TRG-BS-FR-12',
      'QA-TRG-BS-FR-16',
      'QA-TRG-BS-FR-17',
      'QA-TRG-BS-FR-18',
      'QA-TRG-BS-FR-19',
      'QA-TRG-BS-FR-20',
      'QA-TRG-BS-FR-21',
    ],
    createdAt: '19/11/2026',
  },
];

export const TrackerPageOne: React.FC = () => {
  const defaultBundle = useMemo(
    () => ({
      activeChapterKey: 'TRG',
      ledgers: INITIAL_LEDGERS,
      domains: INITIAL_DOMAINS,
      chapters: INITIAL_CHAPTERS,
      stepIdOverrides: {} as Record<string, string>,
      stepsByQid: {} as Record<string, ExplanationStepItem[]>,
      testSessions: INITIAL_TEST_SESSIONS,
      activeTestSessionId: 'test-trg-1',
      exams: INITIAL_EXAMS,
      selectedExamId: INITIAL_EXAMS[0].id,
      askedRules: INITIAL_ASKED_RULES,
      givenRules: INITIAL_GIVEN_RULES,
      combineAskedFallback: true,
      combineGivenFallback: true,
      operatorRules: INITIAL_OPERATOR_RULES,
      solverPathRules: INITIAL_SOLVER_PATH_RULES,
      symbolAliases: INITIAL_SYMBOL_ALIASES,
    }),
    []
  );

  const initialHydrated = useMemo(
    () => loadPersistedTrackerState(defaultBundle),
    [defaultBundle]
  );

  const [ledgers, setLedgers] = useState<Record<string, ChapterLedger>>(initialHydrated.ledgers);
  const [activeChapterKey, setActiveChapterKey] = useState<string>(initialHydrated.activeChapterKey);
  // Opens directly on Part 1 (Topic Overview) with zero extra top buttons
  const [activeSectionView, setActiveSectionView] = useState<
    | 'part-1'
    | 'part-2'
    | 'qiq'
    | 'tester'
    | 'question-index'
    | 'question-cards'
    | 'test-analysis'
    | DashboardSectionMode
  >('part-1');
  const [launchedCardItems, setLaunchedCardItems] = useState<QuestionCardPayloadItem[]>([]);
  const [launchedModality, setLaunchedModality] = useState<'study' | 'shallow' | 'full'>('shallow');
  const [testSessions, setTestSessions] = useState<TestSessionRecord[]>(initialHydrated.testSessions);
  const [activeTestSessionId, setActiveTestSessionId] = useState<string>(
    initialHydrated.activeTestSessionId
  );

  // Permanent Tier 1 (Domains) & Tier 2 (Chapters) Registry State + Optional 1-to-1 Step ID Swaps
  const [domains, setDomains] = useState<DomainItem[]>(initialHydrated.domains);
  const [chapters, setChapters] = useState<ChapterItem[]>(initialHydrated.chapters);
  const [stepIdOverrides, setStepIdOverrides] = useState<Record<string, string>>(
    initialHydrated.stepIdOverrides
  );

  // Solver & Extraction Registries (Asked, Given, Operator, Solver Paths)
  const [askedRules, setAskedRules] = useState<BoundaryRuleItem[]>(
    initialHydrated.askedRules ?? INITIAL_ASKED_RULES
  );
  const [givenRules, setGivenRules] = useState<BoundaryRuleItem[]>(
    initialHydrated.givenRules ?? INITIAL_GIVEN_RULES
  );
  const [combineAskedFallback, setCombineAskedFallback] = useState<boolean>(
    initialHydrated.combineAskedFallback ?? true
  );
  const [combineGivenFallback, setCombineGivenFallback] = useState<boolean>(
    initialHydrated.combineGivenFallback ?? true
  );
  const [operatorRules, setOperatorRules] = useState<OperatorRuleItem[]>(
    initialHydrated.operatorRules ?? INITIAL_OPERATOR_RULES
  );
  const [solverPathRules, setSolverPathRules] = useState<SolverPathRuleItem[]>(
    initialHydrated.solverPathRules ?? INITIAL_SOLVER_PATH_RULES
  );
  const [symbolAliases, setSymbolAliases] = useState<SymbolAliasItem[]>(
    initialHydrated.symbolAliases ?? INITIAL_SYMBOL_ALIASES
  );

  // Live Disk Folders fetched dynamically from `/api/registry/files` (Subtopics, Concepts, MCs NEVER saved permanently)
  const [diskFolders, setDiskFolders] = useState<DiskChapterFolder[]>([]);
  const [diskSyncStatus, setDiskSyncStatus] = useState<'loading' | 'synced' | 'offline'>('loading');
  const [draftRevision, setDraftRevision] = useState<number>(0);

  const [routingState, setRoutingState] = useState<QuestionRoutingStatusState>(() => {
    const existing = (
      window as unknown as { __anglesRoutingStatus?: QuestionRoutingStatusState }
    ).__anglesRoutingStatus;
    if (existing && (existing.status === 'Pending' || existing.status === 'Verified' || existing.status === 'Sync Error')) {
      return existing;
    }
    return {
      status: 'Pending',
      detail: 'Checking chapter HTML files & question routes on disk...',
      source: 'disk-sync',
      updatedAt: new Date().toISOString(),
    };
  });

  const fetchDiskRegistryFiles = useCallback(async (manualVerify = false) => {
    setDiskSyncStatus('loading');
    if (manualVerify) {
      setRoutingState((prev) => ({
        ...prev,
        status: 'Pending',
        detail: 'Verifying chapter HTML files & question routes on disk...',
        source: 'disk-sync',
        updatedAt: new Date().toISOString(),
      }));
    }
    try {
      const response = await fetch('/api/registry/files', { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = (await response.json()) as { folders?: DiskChapterFolder[] };
      const folders = Array.isArray(payload.folders) ? payload.folders : [];
      setDiskFolders(folders);
      setDiskSyncStatus('synced');
      const totalFiles = folders.reduce((sum, f) => sum + (f.files?.length || 0), 0);
      setRoutingState((prev) => {
        if (!manualVerify && prev.source === 'question-index') {
          return prev;
        }
        return {
          status: 'Verified',
          detail: `Disk question bank verified (${folders.length} chapter folder${folders.length === 1 ? '' : 's'}, ${totalFiles} file${totalFiles === 1 ? '' : 's'} synced).`,
          targetPath: prev.targetPath,
          addedIds: manualVerify ? [] : prev.addedIds,
          source: 'disk-sync',
          updatedAt: new Date().toISOString(),
        };
      });
    } catch (err) {
      setDiskSyncStatus('offline');
      setRoutingState((prev) => ({
        ...prev,
        status: 'Sync Error',
        detail:
          err instanceof Error
            ? `Disk sync failed (${err.message}) — check local server connection.`
            : 'Disk sync failed — unable to reach /api/registry/files.',
        source: 'disk-sync',
        updatedAt: new Date().toISOString(),
      }));
    }
  }, []);

  useEffect(() => {
    void fetchDiskRegistryFiles();
  }, [fetchDiskRegistryFiles]);

  // Listen to live Question Routing Status broadcasts from 07 Question Index & Study Mode disk saves
  useEffect(() => {
    const onRoutingStatus = (event: Event) => {
      const detail = (event as CustomEvent<QuestionRoutingStatusState>)?.detail;
      if (!detail || !detail.status) return;
      setRoutingState({
        status: detail.status,
        detail: detail.detail || '',
        targetPath: detail.targetPath,
        addedIds: detail.addedIds,
        questionCount: detail.questionCount,
        source: detail.source,
        updatedAt: detail.updatedAt || new Date().toISOString(),
      });
    };
    window.addEventListener('angles:routing-status', onRoutingStatus);
    return () => window.removeEventListener('angles:routing-status', onRoutingStatus);
  }, []);

  // Re-absorb live whenever the user saves/edits study materials in 02 Coding Area, ships a PYQ batch, or restores a backup
  useEffect(() => {
    const onStorageUpdated = (event: Event) => {
      const detail = (event as CustomEvent)?.detail;
      if (detail?.source === 'tracker') return;
      setDraftRevision((n) => n + 1);
      void fetchDiskRegistryFiles(false);
    };
    window.addEventListener('angles:storage-updated', onStorageUpdated);
    return () => window.removeEventListener('angles:storage-updated', onStorageUpdated);
  }, [fetchDiskRegistryFiles]);

  useEffect(() => {
    if (activeSectionView === 'registry') {
      void fetchDiskRegistryFiles(false);
    }
  }, [activeSectionView, fetchDiskRegistryFiles]);

  const absorbedRegistry = useMemo(
    () => {
      void draftRevision;
      return absorbLiveRegistryFromFiles(
        domains,
        chapters,
        diskFolders,
        CHAPTER_MKML_STORAGE,
        stepIdOverrides
      );
    },
    [domains, chapters, diskFolders, stepIdOverrides, draftRevision]
  );

  const {
    subtopics,
    concepts,
    microConcepts,
    invalidIds: invalidRegistryIds,
    orphanedOverrides: orphanedStepOverrides,
    liveMkmlByChapter,
    unregisteredDiskFolders,
    scannedFileCount,
    linkedFolderByChapterCode,
  } = absorbedRegistry;

  // Cascading cleanup when a code file is deleted in 02 Coding Area:
  // purge removed question IDs & orphaned attempt history from ledgers, stepsByQid, and testSessions
  useEffect(() => {
    const onFileDeleted = (event: Event) => {
      const detail = (
        event as CustomEvent<{
          folder?: string;
          file?: string;
          removedQuestionIds?: string[];
          removedConceptIds?: string[];
          ledgerRemoved?: boolean;
        }>
      )?.detail;
      if (!detail || !detail.folder) return;

      const removedIdSet = new Set(
        (Array.isArray(detail.removedQuestionIds) ? detail.removedQuestionIds : []).map((id) =>
          String(id).toUpperCase()
        )
      );
      const folderLower = String(detail.folder).trim().toLowerCase();

      // Match chapter code(s) linked to this disk folder
      const matchedChapterCodes = new Set<string>();
      for (const [chCode, linkedFolder] of Object.entries(linkedFolderByChapterCode)) {
        if (String(linkedFolder).trim().toLowerCase() === folderLower) {
          matchedChapterCodes.add(chCode.toUpperCase());
        }
      }
      for (const ch of chapters) {
        if (
          (ch.folderName && ch.folderName.trim().toLowerCase() === folderLower) ||
          ch.name.trim().toLowerCase() === folderLower
        ) {
          matchedChapterCodes.add(ch.code.toUpperCase());
        }
      }

      if (removedIdSet.size > 0 || detail.ledgerRemoved) {
        setLedgers((prev) => {
          let changed = false;
          const next: Record<string, ChapterLedger> = {};
          for (const [chCode, ledger] of Object.entries(prev)) {
            const isTargetChapter = matchedChapterCodes.has(chCode.toUpperCase());
            if (isTargetChapter && detail.ledgerRemoved) {
              if (Object.keys(ledger.concepts || {}).length > 0) {
                next[chCode] = { ...ledger, concepts: {} };
                changed = true;
              } else {
                next[chCode] = ledger;
              }
              continue;
            }
            if (removedIdSet.size === 0) {
              next[chCode] = ledger;
              continue;
            }
            let ledgerChanged = false;
            const nextConcepts: Record<string, Record<string, AttemptTuple[]>> = {};
            for (const [cMid, qMap] of Object.entries(ledger.concepts || {})) {
              const filteredQMap: Record<string, AttemptTuple[]> = {};
              for (const [qid, attempts] of Object.entries(qMap || {})) {
                if (removedIdSet.has(qid.toUpperCase())) {
                  ledgerChanged = true;
                } else {
                  filteredQMap[qid] = attempts;
                }
              }
              if (Object.keys(filteredQMap).length > 0) {
                nextConcepts[cMid] = filteredQMap;
              } else if (Object.keys(qMap || {}).length > 0) {
                ledgerChanged = true;
              }
            }
            if (ledgerChanged) {
              next[chCode] = { ...ledger, concepts: nextConcepts };
              changed = true;
            } else {
              next[chCode] = ledger;
            }
          }
          return changed ? next : prev;
        });
      }

      if (removedIdSet.size > 0) {
        setStepsByQid((prev) => {
          let changed = false;
          const next: Record<string, ExplanationStepItem[]> = {};
          for (const [qid, steps] of Object.entries(prev)) {
            if (removedIdSet.has(qid.toUpperCase())) {
              changed = true;
            } else {
              next[qid] = steps;
            }
          }
          return changed ? next : prev;
        });

        setTestSessions((prev) => {
          let changed = false;
          const next: TestSessionRecord[] = [];
          for (const session of prev) {
            const filteredIds = session.questionUniqueIds.filter(
              (qid) => !removedIdSet.has(qid.toUpperCase())
            );
            if (filteredIds.length !== session.questionUniqueIds.length) {
              changed = true;
            }
            if (filteredIds.length > 0) {
              next.push(
                filteredIds.length === session.questionUniqueIds.length
                  ? session
                  : { ...session, questionUniqueIds: filteredIds }
              );
            } else {
              changed = true;
            }
          }
          return changed ? next : prev;
        });
      }

      setRoutingState({
        status: 'Verified',
        detail: `Deleted ${detail.folder}/${detail.file || 'file'} — purged ${removedIdSet.size} question(s) & marks history.`,
        targetPath: `${detail.folder}/${detail.file || ''}`,
        addedIds: [],
        source: 'disk-sync',
        updatedAt: new Date().toISOString(),
      });
      setDraftRevision((n) => n + 1);
      void fetchDiskRegistryFiles(false);
    };

    window.addEventListener('angles:file-deleted', onFileDeleted);
    return () => window.removeEventListener('angles:file-deleted', onFileDeleted);
  }, [chapters, linkedFolderByChapterCode, fetchDiskRegistryFiles]);

  // Shared Question Step-IDs (T1, T2, T3) mapped by Unique Question ID
  const [stepsByQid, setStepsByQid] = useState<Record<string, ExplanationStepItem[]>>(
    initialHydrated.stepsByQid
  );
  // Lifted Exam Info Profiles (survives page switches and browser reloads)
  const [exams, setExams] = useState<ExamProfile[]>(initialHydrated.exams);
  const [selectedExamId, setSelectedExamId] = useState<string>(initialHydrated.selectedExamId);

  const testingChapterCodes = useMemo(() => {
    const testingDomSet = new Set(
      domains.filter((d) => isTestingDomain(d)).map((d) => d.code.toUpperCase())
    );
    return new Set(
      chapters
        .filter((c) => testingDomSet.has(c.domainCode.toUpperCase()))
        .map((c) => c.code.toUpperCase())
    );
  }, [domains, chapters]);

  const visibleLedgers = useMemo(() => {
    const registeredActiveCodes = new Set(
      chapters
        .filter((c) => !testingChapterCodes.has(c.code.toUpperCase()))
        .map((c) => c.code.toUpperCase())
    );
    const filtered: Record<string, ChapterLedger> = {};
    for (const [code, ledger] of Object.entries(ledgers)) {
      const upper = code.toUpperCase();
      if (!testingChapterCodes.has(upper) && (registeredActiveCodes.size === 0 || registeredActiveCodes.has(upper))) {
        filtered[code] = ledger;
      }
    }
    return filtered;
  }, [ledgers, chapters, testingChapterCodes]);

  const emptyFallbackLedger = useMemo(
    () => createEmptyChapterLedger('NONE', 'No Active Chapters'),
    []
  );

  const currentLedger =
    visibleLedgers[activeChapterKey] ||
    Object.values(visibleLedgers)[0] ||
    emptyFallbackLedger;

  // Keep activeChapterKey valid whenever chapters are deleted or moved into Dummy/Sandbox domain
  useEffect(() => {
    const availableKeys = Object.keys(visibleLedgers);
    if (availableKeys.length === 0) return;
    if (!visibleLedgers[activeChapterKey]) {
      const nextKey = availableKeys[0];
      setActiveChapterKey(nextKey);
      const nextLedger = visibleLedgers[nextKey];
      if (nextLedger) {
        setFastInput(String(nextLedger.timing.fastLimit));
        setMedInput(String(nextLedger.timing.mediumLimit));
        setSlowInput(String(nextLedger.timing.slowLimit));
      }
    }
  }, [visibleLedgers, activeChapterKey]);

  // Hydrate from disk (data/studio-state.json) on mount before enabling auto-save so disk is never clobbered
  const [diskHydrated, setDiskHydrated] = useState<boolean>(false);
  const pendingDiskFlushRef = React.useRef<{
    snapshot: Omit<typeof initialHydrated, 'restoredFromLocal' | 'savedAt'>;
    savedAt: string | null;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      loadDiskTrackerState(defaultBundle),
      fetch('/api/marks', { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null) as Promise<{
        ok?: boolean;
        ledgers?: {
          folder: string;
          file: string;
          chapterCode: string;
          ledger: {
            chapterCode?: string;
            chapterMid?: string;
            topic?: string;
            lastUpdated?: string | null;
            timingConfig?: Partial<ChapterTimingConfig>;
            concepts?: Record<string, Record<string, AttemptTuple[]>>;
          };
        }[];
      } | null>,
    ]).then(([diskState, marksPayload]) => {
      if (cancelled) return;
      let baseLedgers = initialHydrated.ledgers;
      if (diskState) {
        const localTs = initialHydrated.savedAt ? Date.parse(initialHydrated.savedAt) : 0;
        const diskTs = diskState.savedAt ? Date.parse(diskState.savedAt) : 0;
        if (!initialHydrated.restoredFromLocal || diskTs >= localTs) {
          baseLedgers = diskState.ledgers;
          setActiveChapterKey(diskState.activeChapterKey);
          setDomains(diskState.domains);
          setChapters(diskState.chapters);
          setStepIdOverrides(diskState.stepIdOverrides);
          setStepsByQid(diskState.stepsByQid);
          setTestSessions(diskState.testSessions);
          setActiveTestSessionId(diskState.activeTestSessionId);
          setExams(diskState.exams);
          setSelectedExamId(diskState.selectedExamId);
          setAskedRules(diskState.askedRules ?? INITIAL_ASKED_RULES);
          setGivenRules(diskState.givenRules ?? INITIAL_GIVEN_RULES);
          setCombineAskedFallback(diskState.combineAskedFallback ?? true);
          setCombineGivenFallback(diskState.combineGivenFallback ?? true);
          setOperatorRules(diskState.operatorRules ?? INITIAL_OPERATOR_RULES);
          setSolverPathRules(diskState.solverPathRules ?? INITIAL_SOLVER_PATH_RULES);
          setSymbolAliases(diskState.symbolAliases ?? INITIAL_SYMBOL_ALIASES);
        }
      }

      // Overlay dedicated per-chapter tracker-ledger.json files from disk (authoritative marks store)
      const diskMarkEntries = Array.isArray(marksPayload?.ledgers) ? marksPayload.ledgers : [];
      if (diskMarkEntries.length > 0) {
        const mergedWithMarks: Record<string, ChapterLedger> = { ...baseLedgers };
        for (const entry of diskMarkEntries) {
          const code = (entry.chapterCode || entry.ledger?.chapterCode || entry.ledger?.chapterMid || '').toUpperCase();
          if (!code || !entry.ledger?.concepts) continue;
          const existing = mergedWithMarks[code] || createEmptyChapterLedger(code, entry.ledger.topic || entry.folder);
          const tc = entry.ledger.timingConfig;
          const hasAnyAttempt = Object.values(entry.ledger.concepts || {}).some((qMap) =>
            Object.values(qMap || {}).some((attempts) => Array.isArray(attempts) && attempts.length > 0)
          );
          const resolvedEvalDate = entry.ledger.lastUpdated
            ? formatEvaluationDate(entry.ledger.lastUpdated)
            : hasAnyAttempt
              ? existing.evaluationDate
              : 'Not evaluated';
          mergedWithMarks[code] = {
            ...existing,
            chapterCode: code,
            chapterName: entry.ledger.topic || existing.chapterName,
            evaluationDate: resolvedEvalDate,
            timing:
              tc && tc.fastLimit && tc.mediumLimit && tc.slowLimit
                ? {
                    fastLimit: Number(tc.fastLimit),
                    mediumLimit: Number(tc.mediumLimit),
                    slowLimit: Number(tc.slowLimit),
                    locked: Boolean(tc.locked),
                  }
                : existing.timing,
            concepts: entry.ledger.concepts,
          };
        }
        setLedgers(mergedWithMarks);
      } else if (baseLedgers !== initialHydrated.ledgers) {
        setLedgers(baseLedgers);
      }

      setDiskHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, [defaultBundle, initialHydrated.ledgers, initialHydrated.restoredFromLocal, initialHydrated.savedAt]);

  // Authoritative disk sync: reconcile each linked chapter's question pool strictly against real disk <Qn> blocks.
  // Preserves all real attempt histories while automatically pruning phantom/legacy sandbox keys or deleted questions.
  useEffect(() => {
    if (!diskHydrated || diskSyncStatus !== 'synced') return;
    const linkedChapters = Object.keys(linkedFolderByChapterCode);
    if (linkedChapters.length === 0) return;

    setLedgers((prev) => {
      let changed = false;
      const next: Record<string, ChapterLedger> = { ...prev };

      for (const chapterCode of linkedChapters) {
        const ledger = next[chapterCode];
        if (!ledger) continue;
        const rawMkml = liveMkmlByChapter[chapterCode] || '';
        const tree = scanChapterStorageAndMarks(
          chapterCode,
          ledger,
          domains,
          chapters,
          subtopics,
          concepts,
          microConcepts,
          rawMkml
        );

        const existingAttemptsByQid = new Map<string, AttemptTuple[]>();
        for (const qMap of Object.values(ledger.concepts || {})) {
          for (const [qid, history] of Object.entries(qMap || {})) {
            existingAttemptsByQid.set(qid.toUpperCase(), Array.isArray(history) ? history : []);
          }
        }

        const reconciledConcepts: Record<string, Record<string, AttemptTuple[]>> = {};
        for (const q of tree.allQuestions) {
          const conceptKey =
            q.subtopicShortCode && q.conceptShortCode
              ? `${q.subtopicShortCode}-${q.conceptShortCode}`
              : q.conceptShortCode || 'C1';
          if (!reconciledConcepts[conceptKey]) reconciledConcepts[conceptKey] = {};
          reconciledConcepts[conceptKey][q.uniqueId] =
            existingAttemptsByQid.get(q.uniqueId.toUpperCase()) || [];
        }

        // Check structural equality (concept keys + exact question IDs per concept) to avoid redundant state updates
        const oldConceptKeys = Object.keys(ledger.concepts || {});
        const newConceptKeys = Object.keys(reconciledConcepts);
        let differs = oldConceptKeys.length !== newConceptKeys.length;
        if (!differs) {
          for (const cKey of newConceptKeys) {
            const oldMap = ledger.concepts[cKey];
            const newMap = reconciledConcepts[cKey];
            if (!oldMap) {
              differs = true;
              break;
            }
            const oldQids = Object.keys(oldMap);
            const newQids = Object.keys(newMap);
            if (
              oldQids.length !== newQids.length ||
              newQids.some((qid) => !Object.prototype.hasOwnProperty.call(oldMap, qid))
            ) {
              differs = true;
              break;
            }
          }
        }

        if (differs) {
          next[chapterCode] = { ...ledger, concepts: reconciledConcepts };
          changed = true;
        }
      }

      return changed ? next : prev;
    });
  }, [
    diskHydrated,
    diskSyncStatus,
    linkedFolderByChapterCode,
    liveMkmlByChapter,
    domains,
    chapters,
    subtopics,
    concepts,
    microConcepts,
  ]);

  // Flush any pending disk write on tab close / refresh using keepalive
  useEffect(() => {
    const flushPendingToDisk = () => {
      const pending = pendingDiskFlushRef.current;
      if (!pending) return;
      pendingDiskFlushRef.current = null;
      void saveDiskTrackerState(pending.snapshot, pending.savedAt, true);
    };
    window.addEventListener('pagehide', flushPendingToDisk);
    window.addEventListener('beforeunload', flushPendingToDisk);
    return () => {
      window.removeEventListener('pagehide', flushPendingToDisk);
      window.removeEventListener('beforeunload', flushPendingToDisk);
    };
  }, []);

  // Auto-persist permanent Tracker, Exam Info (weightages), Domains, Chapters, and Step Overrides to LocalStorage + Disk JSON
  useEffect(() => {
    if (!diskHydrated) return;
    const snapshot = {
      activeChapterKey,
      ledgers,
      domains,
      chapters,
      stepIdOverrides,
      stepsByQid,
      testSessions,
      activeTestSessionId,
      exams,
      selectedExamId,
      askedRules,
      givenRules,
      combineAskedFallback,
      combineGivenFallback,
      operatorRules,
      solverPathRules,
      symbolAliases,
    };
    const savedAt = savePersistedTrackerState(snapshot);
    pendingDiskFlushRef.current = { snapshot, savedAt };
    const timer = window.setTimeout(() => {
      pendingDiskFlushRef.current = null;
      void saveDiskTrackerState(snapshot, savedAt, false);
    }, 120);
    return () => window.clearTimeout(timer);
  }, [
    diskHydrated,
    activeChapterKey,
    ledgers,
    domains,
    chapters,
    stepIdOverrides,
    stepsByQid,
    testSessions,
    activeTestSessionId,
    exams,
    selectedExamId,
    askedRules,
    givenRules,
    combineAskedFallback,
    combineGivenFallback,
    operatorRules,
    solverPathRules,
    symbolAliases,
  ]);

  // Listen for backup import / reset commands from 06 Settings
  useEffect(() => {
    const applyState = (next: Omit<typeof initialHydrated, 'restoredFromLocal' | 'savedAt'>) => {
      setLedgers(next.ledgers);
      setActiveChapterKey(next.activeChapterKey);
      setDomains(next.domains);
      setChapters(next.chapters);
      setStepIdOverrides(next.stepIdOverrides);
      setStepsByQid(next.stepsByQid);
      setTestSessions(next.testSessions);
      setActiveTestSessionId(next.activeTestSessionId);
      setExams(next.exams);
      setSelectedExamId(next.selectedExamId);
      setAskedRules(next.askedRules ?? INITIAL_ASKED_RULES);
      setGivenRules(next.givenRules ?? INITIAL_GIVEN_RULES);
      setCombineAskedFallback(next.combineAskedFallback ?? true);
      setCombineGivenFallback(next.combineGivenFallback ?? true);
      setOperatorRules(next.operatorRules ?? INITIAL_OPERATOR_RULES);
      setSolverPathRules(next.solverPathRules ?? INITIAL_SOLVER_PATH_RULES);
      setSymbolAliases(next.symbolAliases ?? INITIAL_SYMBOL_ALIASES);
      const nextLedger =
        next.ledgers[next.activeChapterKey] ||
        next.ledgers.TRG ||
        Object.values(next.ledgers)[0];
      if (nextLedger) {
        setFastInput(String(nextLedger.timing.fastLimit));
        setMedInput(String(nextLedger.timing.mediumLimit));
        setSlowInput(String(nextLedger.timing.slowLimit));
      }
      void fetchDiskRegistryFiles();
    };
    const onReloadStorage = () => {
      applyState(loadPersistedTrackerState(defaultBundle));
    };
    const onResetDefaults = () => {
      applyState(defaultBundle);
    };
    window.addEventListener('angles:tracker-reload-storage', onReloadStorage);
    window.addEventListener('angles:tracker-reset-defaults', onResetDefaults);
    return () => {
      window.removeEventListener('angles:tracker-reload-storage', onReloadStorage);
      window.removeEventListener('angles:tracker-reset-defaults', onResetDefaults);
    };
  }, [defaultBundle, fetchDiskRegistryFiles]);

  // Local timing input state for editing when unlocked
  const [fastInput, setFastInput] = useState<string>(String(currentLedger.timing.fastLimit));
  const [medInput, setMedInput] = useState<string>(String(currentLedger.timing.mediumLimit));
  const [slowInput, setSlowInput] = useState<string>(String(currentLedger.timing.slowLimit));
  const [timingError, setTimingError] = useState<string | null>(null);

  const handleSelectChapter = (key: string) => {
    const target = ledgers[key];
    if (!target) return;
    setActiveChapterKey(key);
    setFastInput(String(target.timing.fastLimit));
    setMedInput(String(target.timing.mediumLimit));
    setSlowInput(String(target.timing.slowLimit));
    setTimingError(null);
  };

  useEffect(() => {
    const onTrackerCommand = (event: Event) => {
      const detail = (event as CustomEvent)?.detail || {};
      if (detail.chapterCode) {
        const code = String(detail.chapterCode).toUpperCase();
        if (visibleLedgers[code]) {
          setActiveChapterKey(code);
          setFastInput(String(visibleLedgers[code].timing.fastLimit));
          setMedInput(String(visibleLedgers[code].timing.mediumLimit));
          setSlowInput(String(visibleLedgers[code].timing.slowLimit));
        }
      }
      if (detail.action === 'set-view' && detail.view) {
        setActiveSectionView(detail.view);
        return;
      }
      if (detail.action === 'launch-scoped-cards') {
        const rawCode = String(detail.rootMid || detail.chapterCode || '').trim().toUpperCase();
        const folderUpper = String(detail.folder || '').toUpperCase();
        const inferredFromFolder = folderUpper.includes('TRIG')
          ? 'TRG'
          : folderUpper.includes('PRONOUN NEW')
            ? 'PN'
            : folderUpper.includes('PHRASES')
              ? 'PC'
              : folderUpper.includes('TENSES')
                ? 'TE'
                : folderUpper.includes('SUBJECT')
                  ? 'SVA'
                  : folderUpper.includes('VERB')
                    ? 'VB'
                    : '';
        const candidateCode = rawCode || inferredFromFolder || 'TRG';
        const targetCode = visibleLedgers[candidateCode] ? candidateCode : 'TRG';
        const targetLedger = visibleLedgers[targetCode] || visibleLedgers.TRG || INITIAL_LEDGERS.TRG;
        setActiveChapterKey(targetCode);
        setFastInput(String(targetLedger.timing.fastLimit));
        setMedInput(String(targetLedger.timing.mediumLimit));
        setSlowInput(String(targetLedger.timing.slowLimit));

        const tree = scanChapterStorageAndMarks(
          targetCode,
          targetLedger,
          domains,
          chapters,
          subtopics,
          concepts,
          microConcepts,
          liveMkmlByChapter[targetCode]
        );
        const requestedConcept = String(detail.conceptMid || '').trim().toUpperCase();
        let matchedQuestions = tree.allQuestions;
        let pathLabel = `${targetCode}-ALL`;

        if (requestedConcept) {
          const conceptFiltered = tree.allQuestions.filter(
            (q) =>
              q.conceptId.toUpperCase() === requestedConcept ||
              q.conceptShortCode.toUpperCase() === requestedConcept ||
              requestedConcept.endsWith(`-${q.conceptShortCode.toUpperCase()}`) ||
              (requestedConcept === 'C1' && q.conceptShortCode.toUpperCase() === 'FR')
          );
          if (conceptFiltered.length > 0) {
            matchedQuestions = conceptFiltered;
            pathLabel = `${matchedQuestions[0].subtopicShortCode}-${matchedQuestions[0].conceptShortCode}`;
          }
        } else if (matchedQuestions.length > 0) {
          pathLabel = `${matchedQuestions[0].subtopicShortCode}-${matchedQuestions[0].conceptShortCode}`;
        }

        setLaunchedCardItems(
          matchedQuestions.map((question) => ({
            question,
            pathLabel: `${question.subtopicShortCode}-${question.conceptShortCode}` || pathLabel,
          }))
        );
        setLaunchedModality(detail.mode === 'study' ? 'study' : 'shallow');
        setActiveSectionView('question-cards');
      }
    };

    window.addEventListener('angles:tracker-command', onTrackerCommand);
    return () => window.removeEventListener('angles:tracker-command', onTrackerCommand);
  }, [visibleLedgers, domains, chapters, subtopics, concepts, microConcepts, liveMkmlByChapter]);

  useEffect(() => {
    const targetNavPage =
      activeSectionView === 'exam-page-1' || activeSectionView === 'exam-page-2'
        ? 'exam-info'
        : activeSectionView === 'registry'
          ? 'registry'
          : activeSectionView === 'qiq'
            ? 'qiq'
            : activeSectionView === 'tester'
              ? 'tester'
              : 'tracker';
    window.dispatchEvent(
      new CustomEvent('angles:sync-nav', { detail: { page: targetNavPage } })
    );
  }, [activeSectionView]);

  const handleJumpToChapterLedger = (chapterCode: string) => {
    if (testingChapterCodes.has(chapterCode.toUpperCase())) return;
    if (!ledgers[chapterCode]) {
      const chMeta = chapters.find((c) => c.code === chapterCode);
      setLedgers((prev) => ({
        ...prev,
        [chapterCode]: createEmptyChapterLedger(chapterCode, chMeta?.name || chapterCode),
      }));
    }
    setActiveChapterKey(chapterCode);
    const target = ledgers[chapterCode];
    if (target) {
      setFastInput(String(target.timing.fastLimit));
      setMedInput(String(target.timing.mediumLimit));
      setSlowInput(String(target.timing.slowLimit));
    }
    setTimingError(null);
    setActiveSectionView('part-1');
  };

  const handleRegisterNewChapterLedger = (chapterCode: string, chapterName: string) => {
    setLedgers((prev) => {
      if (prev[chapterCode]) return prev;
      return {
        ...prev,
        [chapterCode]: createEmptyChapterLedger(chapterCode, chapterName),
      };
    });
  };

  // Permanently purge all Tracker state (ledger, steps, test sessions, overrides, drafts) when a chapter is deleted
  const handleDeleteChapterData = useCallback(
    (chapterCode: string, folderName?: string) => {
      const codeUpper = chapterCode.toUpperCase();
      const deletedQids = new Set<string>();
      const existingLedger = ledgers[chapterCode];
      if (existingLedger?.concepts) {
        for (const qMap of Object.values(existingLedger.concepts)) {
          for (const qid of Object.keys(qMap || {})) {
            deletedQids.add(qid.toUpperCase());
          }
        }
      }

      setLedgers((prev) => {
        const next: Record<string, ChapterLedger> = {};
        for (const [k, v] of Object.entries(prev)) {
          if (k.toUpperCase() !== codeUpper) {
            next[k] = v;
          }
        }
        return next;
      });

      const chapterSegmentRe = new RegExp(`-${codeUpper.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-`, 'i');

      setStepsByQid((prev) => {
        let changed = false;
        const next: Record<string, ExplanationStepItem[]> = {};
        for (const [qid, steps] of Object.entries(prev)) {
          if (deletedQids.has(qid.toUpperCase()) || chapterSegmentRe.test(qid)) {
            changed = true;
          } else {
            next[qid] = steps;
          }
        }
        return changed ? next : prev;
      });

      setStepIdOverrides((prev) => {
        let changed = false;
        const next: Record<string, string> = {};
        for (const [baseId, stepCode] of Object.entries(prev)) {
          if (chapterSegmentRe.test(baseId)) {
            changed = true;
          } else {
            next[baseId] = stepCode;
          }
        }
        return changed ? next : prev;
      });

      setTestSessions((prev) =>
        prev.filter((session) => session.chapterCode.toUpperCase() !== codeUpper)
      );

      // Clear any browser drafts stored for the deleted chapter folder
      if (folderName) {
        try {
          const prefix = `angles-studio-draft:${folderName}/`;
          const keysToRemove: string[] = [];
          for (let i = 0; i < window.localStorage.length; i++) {
            const k = window.localStorage.key(i);
            if (k && k.startsWith(prefix)) keysToRemove.push(k);
          }
          keysToRemove.forEach((k) => window.localStorage.removeItem(k));
        } catch {
          // ignore localStorage errors
        }
      }

      setRoutingState({
        status: 'Verified',
        detail: `Deleted chapter [${chapterCode}]${folderName ? ` and disk folder /${folderName}/` : ''} — purged ledger, steps & sessions.`,
        targetPath: folderName || chapterCode,
        addedIds: [],
        source: 'disk-sync',
        updatedAt: new Date().toISOString(),
      });
    },
    [ledgers]
  );

  // Move chapter between domains (including Dummy/Sandbox <-> Active):
  // rewrites OLD-CH prefix on disk (HTML files + tracker-ledger.json) and in React state so attempt history survives intact
  const handleMoveChapterDomain = useCallback(
    async (
      chapterCode: string,
      oldDomainCode: string,
      newDomainCode: string,
      folderName?: string
    ) => {
      if (!oldDomainCode || !newDomainCode || oldDomainCode.toUpperCase() === newDomainCode.toUpperCase()) {
        return;
      }

      const escapedOld = oldDomainCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const escapedCh = chapterCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const prefixRe = new RegExp(`^${escapedOld}-${escapedCh}(?=-|$)`, 'i');
      const rewriteKey = (key: string) =>
        prefixRe.test(key) ? key.replace(prefixRe, `${newDomainCode}-${chapterCode}`) : key;

      const resolvedFolder = folderName || linkedFolderByChapterCode[chapterCode];
      if (resolvedFolder) {
        try {
          await fetch(`/api/chapters/${encodeURIComponent(resolvedFolder)}/rewrite-domain-prefix`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              oldDomainCode,
              newDomainCode,
              chapterCode,
            }),
          });
        } catch {
          // Non-fatal if folder does not exist on disk yet
        }
      }

      const chapterMeta = chapters.find(
        (c) => c.code.toUpperCase() === chapterCode.toUpperCase()
      );
      const targetIsTesting = domains.some(
        (d) => d.code.toUpperCase() === newDomainCode.toUpperCase() && isTestingDomain(d)
      );

      setLedgers((prev) => {
        const existing = prev[chapterCode];
        if (!existing) {
          if (targetIsTesting) return prev;
          return {
            ...prev,
            [chapterCode]: createEmptyChapterLedger(
              chapterCode,
              chapterMeta?.name || chapterCode
            ),
          };
        }
        const rewrittenConcepts: Record<string, Record<string, AttemptTuple[]>> = {};
        for (const [cMid, qMap] of Object.entries(existing.concepts || {})) {
          rewrittenConcepts[cMid] = {};
          for (const [qid, attempts] of Object.entries(qMap || {})) {
            rewrittenConcepts[cMid][rewriteKey(qid)] = attempts;
          }
        }
        return {
          ...prev,
          [chapterCode]: { ...existing, concepts: rewrittenConcepts },
        };
      });

      setStepsByQid((prev) => {
        let changed = false;
        const next: Record<string, ExplanationStepItem[]> = {};
        for (const [qid, steps] of Object.entries(prev)) {
          const rewritten = rewriteKey(qid);
          if (rewritten !== qid) changed = true;
          next[rewritten] = steps;
        }
        return changed ? next : prev;
      });

      setStepIdOverrides((prev) => {
        let changed = false;
        const next: Record<string, string> = {};
        for (const [baseId, stepCode] of Object.entries(prev)) {
          const rewritten = rewriteKey(baseId);
          if (rewritten !== baseId) changed = true;
          next[rewritten] = stepCode;
        }
        return changed ? next : prev;
      });

      setTestSessions((prev) =>
        prev.map((session) =>
          session.chapterCode.toUpperCase() === chapterCode.toUpperCase()
            ? {
                ...session,
                questionUniqueIds: session.questionUniqueIds.map((qid) => rewriteKey(qid)),
              }
            : session
        )
      );

      setDraftRevision((n) => n + 1);
      await fetchDiskRegistryFiles(false);
      const refreshQI = (window as unknown as { refreshQuestionIndex?: () => void })
        .refreshQuestionIndex;
      if (typeof refreshQI === 'function') refreshQI();
    },
    [chapters, domains, linkedFolderByChapterCode, fetchDiskRegistryFiles]
  );

  const resolveChapterDiskFolder = useCallback(
    (chapterCode: string, fallbackName?: string): string => {
      const upper = chapterCode.toUpperCase();
      const linked = linkedFolderByChapterCode[upper] || linkedFolderByChapterCode[chapterCode];
      if (linked) return linked;
      const chMeta = chapters.find((c) => c.code.toUpperCase() === upper);
      if (chMeta?.folderName) return chMeta.folderName;
      return fallbackName || chMeta?.name || chapterCode;
    },
    [linkedFolderByChapterCode, chapters]
  );

  const syncLedgerToMarksFile = useCallback(
    async (ledgerToSync: ChapterLedger) => {
      const folder = resolveChapterDiskFolder(ledgerToSync.chapterCode, ledgerToSync.chapterName);
      try {
        await fetch(`/api/marks/${encodeURIComponent(folder)}/sync`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ledger: ledgerToSync }),
        });
      } catch {
        // fallback already persisted in studio-state.json & localStorage
      }
    },
    [resolveChapterDiskFolder]
  );

  const handleSaveTiming = () => {
    const f = parseInt(fastInput, 10);
    const m = parseInt(medInput, 10);
    const s = parseInt(slowInput, 10);
    if (
      !Number.isInteger(f) ||
      !Number.isInteger(m) ||
      !Number.isInteger(s) ||
      f <= 0 ||
      !(f < m && m < s)
    ) {
      setTimingError('Require integers: 0 < Fast < Med < Slow');
      return;
    }
    setTimingError(null);
    const current = ledgers[activeChapterKey];
    if (!current) return;
    const updatedLedger: ChapterLedger = {
      ...current,
      timing: {
        fastLimit: f,
        mediumLimit: m,
        slowLimit: s,
        locked: true,
      },
    };
    setLedgers((prev) => ({
      ...prev,
      [activeChapterKey]: updatedLedger,
    }));
    void syncLedgerToMarksFile(updatedLedger);
  };

  const handleUnlockTiming = () => {
    setLedgers((prev) => {
      if (!prev[activeChapterKey]) return prev;
      return {
        ...prev,
        [activeChapterKey]: {
          ...prev[activeChapterKey],
          timing: {
            ...prev[activeChapterKey].timing,
            locked: false,
          },
        },
      };
    });
  };

  // Flatten all unique questions in the chapter and inspect their LATEST attempt (An)
  const stats = useMemo(() => {
    const { timing, concepts } = currentLedger;
    const allQuestions: { qid: string; conceptMid: string; history: AttemptTuple[] }[] = [];

    Object.entries(concepts).forEach(([conceptMid, qMap]) => {
      Object.entries(qMap).forEach(([qid, history]) => {
        allQuestions.push({ qid, conceptMid, history });
      });
    });

    const TQ = allQuestions.length;
    let NQC = 0;
    let NQW = 0;
    let NQS = 0;
    let NQNA = 0;

    let NQF = 0;
    let NQM = 0;
    let NQSl = 0;
    let NQOT = 0;

    allQuestions.forEach(({ history }) => {
      if (!history || history.length === 0) {
        NQNA += 1;
        return;
      }
      const latest = history[history.length - 1];
      const [status, seconds] = latest;
      if (status === 'C') {
        NQC += 1;
        if (seconds <= timing.fastLimit) NQF += 1;
        else if (seconds <= timing.mediumLimit) NQM += 1;
        else if (seconds <= timing.slowLimit) NQSl += 1;
        else NQOT += 1;
      } else if (status === 'W') {
        NQW += 1;
      } else if (status === 'S') {
        NQS += 1;
      }
    });

    const attemptedCount = NQC + NQW + NQS;
    const MM = TQ * 3;

    // Accuracy marks
    const correctMarks = NQC * 1.0;
    const wrongPenalty = NQW * 0.5;
    const skipPenalty = NQS * 0.2;
    const ARMNT = Number((correctMarks - wrongPenalty - skipPenalty).toFixed(2));

    // Accuracy Ratio: against Attempted if > 0 (like 2.3 / 5 = 46.00% in screenshot), plus Pool ratio
    const accuracyDenominator = attemptedCount > 0 ? attemptedCount : TQ;
    const accuracyRatioPct =
      accuracyDenominator > 0 ? (ARMNT / accuracyDenominator) * 100 : 0;

    // Time marks
    const fastMarks = NQF * 2.0;
    const medMarks = NQM * 1.0;
    const slowMarks = NQSl * 0.5;
    const otMarks = NQOT * 0.0;
    const NTM = Number((fastMarks + medMarks + slowMarks + otMarks).toFixed(2));

    // Lifetime Time Percentage: against Attempted Time Cap (attempted * 2, like 5 / 10 = 50.00% in screenshot)
    const timeCapAttempted = attemptedCount * 2;
    const timeCapPool = TQ * 2;
    const timeDenominator = timeCapAttempted > 0 ? timeCapAttempted : timeCapPool;
    const timeRatioPct = timeDenominator > 0 ? (NTM / timeDenominator) * 100 : 0;

    // Synthesis
    const LTM = Number((ARMNT + NTM).toFixed(2));
    const AM = Number((MM - LTM).toFixed(2));
    const completionPct = MM > 0 ? (LTM / MM) * 100 : 0;

    // Invariants
    const inv1 = NQC + NQW + NQS + NQNA === TQ;
    const inv2 = NQF + NQM + NQSl + NQOT === NQC;
    const inv3 = NQF + NQM + NQSl + NQOT + NQW + NQS + NQNA === TQ;

    return {
      allQuestions,
      TQ,
      attemptedCount,
      NQC,
      NQW,
      NQS,
      NQNA,
      NQF,
      NQM,
      NQSl,
      NQOT,
      MM,
      correctMarks,
      wrongPenalty,
      skipPenalty,
      ARMNT,
      accuracyDenominator,
      accuracyRatioPct,
      fastMarks,
      medMarks,
      slowMarks,
      otMarks,
      NTM,
      timeDenominator,
      timeRatioPct,
      LTM,
      AM,
      completionPct,
      invariantsPass: inv1 && inv2 && inv3,
    };
  }, [currentLedger]);

  // Record evaluated test questions from Question Index (3) Test Mode -> append A+1 to dedicated tracker-ledger.json
  const handleRecordEvaluatedTest = async (
    evaluations: {
      uniqueId: string;
      conceptKey: string;
      status: AttemptStatus;
      seconds: number;
      option: string;
    }[]
  ): Promise<{ ok: boolean; file?: string; attemptSummary?: string; error?: string }> => {
    const target = ledgers[activeChapterKey] || currentLedger;
    const preSubmitConcepts = target.concepts;
    const nextConcepts: Record<string, Record<string, AttemptTuple[]>> = {};

    Object.entries(target.concepts).forEach(([cMid, qMap]) => {
      nextConcepts[cMid] = {};
      Object.entries(qMap).forEach(([qid, arr]) => {
        nextConcepts[cMid][qid] = [...arr];
      });
    });

    const appendedLabels: string[] = [];
    evaluations.forEach((ev) => {
      const { accMark, timeMark } = computeAttemptMarks(ev.status, ev.seconds, target.timing);
      let found = false;
      for (const [cMid, qMap] of Object.entries(nextConcepts)) {
        if (qMap[ev.uniqueId]) {
          nextConcepts[cMid][ev.uniqueId].push([
            ev.status,
            ev.seconds,
            accMark,
            timeMark,
            ev.option,
          ]);
          appendedLabels.push(`A${nextConcepts[cMid][ev.uniqueId].length}`);
          found = true;
          break;
        }
      }
      if (!found) {
        const cKey = ev.conceptKey || Object.keys(nextConcepts)[0] || 'C1';
        if (!nextConcepts[cKey]) nextConcepts[cKey] = {};
        if (!nextConcepts[cKey][ev.uniqueId]) nextConcepts[cKey][ev.uniqueId] = [];
        nextConcepts[cKey][ev.uniqueId].push([
          ev.status,
          ev.seconds,
          accMark,
          timeMark,
          ev.option,
        ]);
        appendedLabels.push(`A${nextConcepts[cKey][ev.uniqueId].length}`);
      }
    });

    const now = new Date();
    const todayStr = formatEvaluationDate(now);

    setLedgers((prev) => ({
      ...prev,
      [activeChapterKey]: { ...target, evaluationDate: todayStr, concepts: nextConcepts },
    }));

    // Register this completed Test Mode session in Test Analysis
    const nextNum = testSessions.length + 1;
    const newSessionId = `test-${Date.now()}`;
    const newSession: TestSessionRecord = {
      id: newSessionId,
      label: `test id(${nextNum})`,
      chapterCode: activeChapterKey,
      questionUniqueIds: evaluations.map((e) => e.uniqueId),
      createdAt: todayStr,
    };
    setTestSessions((prev) => [...prev, newSession]);
    setActiveTestSessionId(newSessionId);

    // Write directly to dedicated per-chapter marks file: Angles-ultimate/data/<Folder>/tracker-ledger.json
    const folder = resolveChapterDiskFolder(target.chapterCode, target.chapterName);
    const uniqueLabels = [...new Set(appendedLabels)];
    const attemptSummary =
      uniqueLabels.length === 1
        ? uniqueLabels[0]
        : `${uniqueLabels[0] || 'A1'}–${uniqueLabels[uniqueLabels.length - 1] || 'A1'}`;

    const emitMarksStatus = (
      status: 'Pending' | 'Verified' | 'Sync Error',
      detail: string,
      targetPath?: string
    ) => {
      const payload = {
        status,
        detail,
        targetPath: targetPath || `${folder}/tracker-ledger.json`,
        addedIds: evaluations.slice(0, 4).map((e) => e.uniqueId),
        questionCount: evaluations.length,
        source: 'disk-sync' as const,
        updatedAt: new Date().toISOString(),
      };
      (window as unknown as { __anglesRoutingStatus?: typeof payload }).__anglesRoutingStatus = payload;
      window.dispatchEvent(new CustomEvent('angles:routing-status', { detail: payload }));
    };

    emitMarksStatus(
      'Pending',
      `Appending ${evaluations.length} Test Mode attempt(s) (${attemptSummary}) to ${folder}/tracker-ledger.json...`
    );

    try {
      const response = await fetch(`/api/marks/${encodeURIComponent(folder)}/submit-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterCode: target.chapterCode,
          chapterName: target.chapterName,
          timing: target.timing,
          existingConcepts: preSubmitConcepts,
          testSession: { id: newSessionId, label: newSession.label },
          evaluations,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        file?: string;
        appendedAttempts?: { attempt: string }[];
        error?: string;
      };
      if (!response.ok || !data.ok) {
        const errMsg = data.error || `HTTP ${response.status} writing ${folder}/tracker-ledger.json`;
        emitMarksStatus('Sync Error', errMsg);
        return { ok: false, error: errMsg };
      }
      const savedFile = data.file || `${folder}/tracker-ledger.json`;
      const serverLabels = [
        ...new Set((data.appendedAttempts || []).map((a) => a.attempt).filter(Boolean)),
      ];
      const finalSummary =
        serverLabels.length === 1
          ? serverLabels[0]
          : serverLabels.length > 1
            ? `${serverLabels[0]}–${serverLabels[serverLabels.length - 1]}`
            : attemptSummary;
      emitMarksStatus(
        'Verified',
        `Appended ${evaluations.length} Test Mode attempt(s) (${finalSummary}) to ${savedFile}.`,
        savedFile
      );
      const refreshTracker = (window as unknown as { refreshTracker?: (f?: string) => void }).refreshTracker;
      if (typeof refreshTracker === 'function') refreshTracker(folder);
      return { ok: true, file: savedFile, attemptSummary: finalSummary };
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to write tracker-ledger.json';
      emitMarksStatus('Sync Error', errMsg);
      return { ok: false, error: errMsg };
    }
  };

  const { timing } = currentLedger;

  return (
    <div className="w-full max-w-full overflow-x-hidden min-h-screen bg-[#F5F4EF] text-[#111827] px-2 py-2 space-y-2 font-sans select-none">
      {/* SUB-PAGE OF CHAPTER TRACKER: PART 2 (SUBTOPIC BREAKDOWN) */}
      {activeSectionView === 'part-2' && (
        <TrackerPageTwo
          ledger={currentLedger}
          allLedgers={visibleLedgers}
          onSelectChapter={handleSelectChapter}
          onBackToPartOne={() => setActiveSectionView('part-1')}
          onOpenQuestionIndex={() => setActiveSectionView('question-index')}
          domains={domains}
          chapters={chapters}
          subtopics={subtopics}
          concepts={concepts}
          microConcepts={microConcepts}
          liveChapterMkml={liveMkmlByChapter[currentLedger.chapterCode]}
        />
      )}

      {/* TOP-LEVEL TAB 11: QIQ (STEP-ID & MICRO CONCEPT DIAGNOSTICS TABLE) */}
      {activeSectionView === 'qiq' && (
        <TrackerQiqTab
          ledger={currentLedger}
          allLedgers={visibleLedgers}
          onSelectChapter={handleSelectChapter}
          domains={domains}
          chapters={chapters}
          subtopics={subtopics}
          concepts={concepts}
          microConcepts={microConcepts}
          stepsByQid={stepsByQid}
          liveChapterMkml={liveMkmlByChapter[currentLedger.chapterCode]}
        />
      )}

      {/* TOP-LEVEL TAB 12: TESTER (TAB A PASTE + TAB B BOOKLET + GIVEN/ASKED + SOLVER) */}
      {activeSectionView === 'tester' && (
        <TrackerTesterTab
          domains={domains}
          chapters={chapters}
          subtopics={subtopics}
          concepts={concepts}
          microConcepts={microConcepts}
          givenRules={givenRules}
          askedRules={askedRules}
          combineGivenFallback={combineGivenFallback}
          combineAskedFallback={combineAskedFallback}
          operatorRules={operatorRules}
          solverPathRules={solverPathRules}
          setSolverPathRules={setSolverPathRules}
          symbolAliases={symbolAliases}
          setSymbolAliases={setSymbolAliases}
        />
      )}

      {/* SUB-PAGE OF PART 2: QUESTION INDEX (TEST SELECTION & LAUNCHER) */}
      {activeSectionView === 'question-index' && (
        <TrackerQuestionIndex
          ledger={currentLedger}
          allLedgers={visibleLedgers}
          onSelectChapter={handleSelectChapter}
          onLaunchQuestionCards={(items, mod) => {
            setLaunchedCardItems(items);
            setLaunchedModality(mod);
            setActiveSectionView('question-cards');
          }}
          onBackToPartTwo={() => setActiveSectionView('part-2')}
          onGoToTrackerPageOne={() => setActiveSectionView('part-1')}
          domains={domains}
          chapters={chapters}
          subtopics={subtopics}
          concepts={concepts}
          microConcepts={microConcepts}
          liveChapterMkml={liveMkmlByChapter[currentLedger.chapterCode]}
        />
      )}

      {/* SUB-PAGE OF QUESTION INDEX: QUESTION CARDS (LIVE TIMERS + BOTTOM EXPLANATIONS & STEP-IDs) */}
      {activeSectionView === 'question-cards' && (
        <TrackerQuestionCards
          key={`${currentLedger.chapterCode}-${launchedModality}-${launchedCardItems.map((i) => i.question.uniqueId).join(',')}`}
          ledger={currentLedger}
          selectedItems={launchedCardItems}
          executionModality={launchedModality}
          stepsByQid={stepsByQid}
          setStepsByQid={setStepsByQid}
          onRecordEvaluatedTest={handleRecordEvaluatedTest}
          onBackToQuestionIndex={() => setActiveSectionView('question-index')}
          onOpenTestAnalysis={() => setActiveSectionView('test-analysis')}
          onGoToTrackerPageOne={() => setActiveSectionView('part-1')}
          domains={domains}
          chapters={chapters}
          subtopics={subtopics}
          concepts={concepts}
          microConcepts={microConcepts}
        />
      )}

      {/* SUB-PAGE OF QUESTION CARDS: TEST ANALYSIS (TOP TEST SUMMARY + BOTTOM ATTEMPT COMPARISON) */}
      {activeSectionView === 'test-analysis' && (
        <TrackerTestAnalysis
          ledger={currentLedger}
          testSessions={testSessions}
          activeTestSessionId={activeTestSessionId}
          onSelectTestSession={(id) => setActiveTestSessionId(id)}
          onBackToQuestionCards={() => setActiveSectionView('question-cards')}
          onGoToTrackerPageOne={() => setActiveSectionView('part-1')}
          domains={domains}
          chapters={chapters}
          subtopics={subtopics}
          concepts={concepts}
          microConcepts={microConcepts}
          stepsByQid={stepsByQid}
          liveChapterMkml={liveMkmlByChapter[currentLedger.chapterCode]}
        />
      )}

      {/* MAIN PAGE 2 (EXAM INFO + EDITOR SUB-PAGE) OR MAIN PAGE 3 (REGISTRY 5 SUB-PAGES) */}
      {(activeSectionView === 'registry' ||
        activeSectionView === 'exam-page-1' ||
        activeSectionView === 'exam-page-2') && (
        <ExamRegistryDashboard
          ledgers={ledgers}
          activeMode={activeSectionView}
          onSwitchMode={(m) => setActiveSectionView(m)}
          onJumpToChapterLedger={handleJumpToChapterLedger}
          onRegisterNewChapterLedger={handleRegisterNewChapterLedger}
          onDeleteChapterData={handleDeleteChapterData}
          onMoveChapterDomain={handleMoveChapterDomain}
          domains={domains}
          setDomains={setDomains}
          chapters={chapters}
          setChapters={setChapters}
          subtopics={subtopics}
          concepts={concepts}
          microConcepts={microConcepts}
          stepIdOverrides={stepIdOverrides}
          setStepIdOverrides={setStepIdOverrides}
          invalidRegistryIds={invalidRegistryIds}
          orphanedStepOverrides={orphanedStepOverrides}
          unregisteredDiskFolders={unregisteredDiskFolders}
          linkedFolderByChapterCode={linkedFolderByChapterCode}
          scannedFileCount={scannedFileCount}
          diskSyncStatus={diskSyncStatus}
          onRescanDiskFiles={() => void fetchDiskRegistryFiles(true)}
          exams={exams}
          setExams={setExams}
          selectedExamId={selectedExamId}
          setSelectedExamId={setSelectedExamId}
          askedRules={askedRules}
          setAskedRules={setAskedRules}
          givenRules={givenRules}
          setGivenRules={setGivenRules}
          combineAskedFallback={combineAskedFallback}
          setCombineAskedFallback={setCombineAskedFallback}
          combineGivenFallback={combineGivenFallback}
          setCombineGivenFallback={setCombineGivenFallback}
          operatorRules={operatorRules}
          setOperatorRules={setOperatorRules}
          solverPathRules={solverPathRules}
          setSolverPathRules={setSolverPathRules}
          symbolAliases={symbolAliases}
          setSymbolAliases={setSymbolAliases}
        />
      )}

      {/* MAIN PAGE 1: CHAPTER TRACKER (PART 1: TOPIC OVERVIEW) */}
      {activeSectionView === 'part-1' && (
        <>
          {/* QUESTION ROUTING STATUS FEEDBACK BAR (Pending / Verified / Sync Error) */}
          <QuestionRoutingStatus
            routingState={routingState}
            scannedFileCount={scannedFileCount}
            chapterCode={currentLedger.chapterCode}
            onVerifySync={() => void fetchDiskRegistryFiles(true)}
            isSyncing={diskSyncStatus === 'loading'}
          />

          {/* CARD 1: TARGET SUBJECT CATEGORY + INLINE ONE-TIME TIMING CONFIG */}
          <div className="w-full bg-white border border-[#DFDDD4] rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        {/* Left: Subject Category & Chapter Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#6B7280]">
              TARGET SUBJECT CATEGORY · CHAPTER FOLDER POOL
            </div>
            <div className="flex items-center gap-2.5 mt-0.5">
              <select
                value={visibleLedgers[activeChapterKey] ? activeChapterKey : currentLedger.chapterCode}
                onChange={(e) => handleSelectChapter(e.target.value)}
                disabled={Object.keys(visibleLedgers).length === 0}
                className="text-xl font-bold tracking-tight text-[#111827] bg-transparent border-b border-dashed border-[#9CA3AF] focus:outline-none focus:border-[#2563EB] cursor-pointer pr-1 disabled:opacity-60"
              >
                {Object.keys(visibleLedgers).length === 0 ? (
                  <option value="NONE">No Active Chapters (Add or Move from Dummy)</option>
                ) : (
                  Object.values(visibleLedgers).map((l) => (
                    <option key={l.chapterCode} value={l.chapterCode}>
                      {l.chapterName} [{l.chapterCode}]
                    </option>
                  ))
                )}
              </select>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] rounded">
                MM = TQ × 3
              </span>
              {/* Concept MID tags */}
              <div className="hidden sm:flex items-center gap-1 ml-1">
                {Object.entries(currentLedger.concepts).map(([cMid, qMap]) => (
                  <span
                    key={cMid}
                    className="px-1.5 py-0.5 text-[10px] font-mono bg-[#F5F4EF] text-[#374151] border border-[#DFDDD4] rounded"
                  >
                    {cMid}: {Object.keys(qMap).length} Qs
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Center: Compact One-Time Timing Config */}
        <div className="flex flex-wrap items-center gap-2 bg-[#F9F8F4] border border-[#E5E3DC] rounded-md px-3 py-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#4B5563] font-semibold mr-1">
            PACE TIERS (s):
          </span>

          <label className="flex items-center gap-1 text-[11px] font-mono text-[#374151]">
            <span className="text-[#6B7280]">Fast≤</span>
            <input
              type="number"
              min={1}
              step={1}
              disabled={timing.locked}
              value={fastInput}
              onChange={(e) => setFastInput(e.target.value.replace(/\D/g, ''))}
              className="w-12 px-1.5 py-0.5 text-center font-mono font-semibold bg-white border border-[#D1CFC7] rounded text-[#111827] disabled:bg-[#F3F2EE] disabled:text-[#6B7280]"
            />
          </label>

          <label className="flex items-center gap-1 text-[11px] font-mono text-[#374151]">
            <span className="text-[#6B7280]">Med≤</span>
            <input
              type="number"
              min={2}
              step={1}
              disabled={timing.locked}
              value={medInput}
              onChange={(e) => setMedInput(e.target.value.replace(/\D/g, ''))}
              className="w-12 px-1.5 py-0.5 text-center font-mono font-semibold bg-white border border-[#D1CFC7] rounded text-[#111827] disabled:bg-[#F3F2EE] disabled:text-[#6B7280]"
            />
          </label>

          <label className="flex items-center gap-1 text-[11px] font-mono text-[#374151]">
            <span className="text-[#6B7280]">Slow≤</span>
            <input
              type="number"
              min={3}
              step={1}
              disabled={timing.locked}
              value={slowInput}
              onChange={(e) => setSlowInput(e.target.value.replace(/\D/g, ''))}
              className="w-12 px-1.5 py-0.5 text-center font-mono font-semibold bg-white border border-[#D1CFC7] rounded text-[#111827] disabled:bg-[#F3F2EE] disabled:text-[#6B7280]"
            />
          </label>

          {timing.locked ? (
            <button
              onClick={handleUnlockTiming}
              className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] rounded flex items-center gap-1 hover:bg-[#DBEAFE] transition-colors"
              title="Unlock to edit chapter timing thresholds"
            >
              <Lock className="w-3 h-3" />
              <span>LOCKED</span>
            </button>
          ) : (
            <button
              onClick={handleSaveTiming}
              className="px-2.5 py-0.5 text-[10px] font-mono font-semibold bg-[#1D4ED8] text-white rounded flex items-center gap-1 hover:bg-[#1E40AF] transition-colors"
            >
              <Unlock className="w-3 h-3" />
              <span>SAVE &amp; LOCK</span>
            </button>
          )}

          {timingError && (
            <span className="text-[10px] font-mono text-[#DC2626]">{timingError}</span>
          )}
        </div>

        {/* Right: Evaluation Date (derived from real tracker-ledger.json lastUpdated / Test Mode submissions) */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#6B7280]">
              LAST EVALUATED
            </div>
            <div className="text-sm font-mono font-bold text-[#111827] mt-0.5">
              {currentLedger.evaluationDate || 'Not evaluated'}
            </div>
          </div>
        </div>
      </div>

      {/* CARD 3: TOTAL COMPLETION RATIO & MASTERY INDEX BAR */}
      <div className="w-full bg-white border border-[#DFDDD4] rounded-lg px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        {/* Left: Completion Percentage */}
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[#4B5563] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#1D4ED8]" />
            <span>TOTAL COMPLETION RATIO</span>
          </div>
          <div className="flex items-baseline gap-2.5 mt-1">
            <span
              className={`text-4xl font-mono font-extrabold tracking-tight ${
                stats.completionPct < 0 ? 'text-[#DC2626]' : 'text-[#111827]'
              }`}
            >
              {stats.completionPct.toFixed(3)}%
            </span>
            <span className="text-xs font-mono text-[#6B7280] uppercase">
              (LTM / MM = {formatNum(stats.LTM)} / {stats.MM})
            </span>
          </div>
        </div>

        {/* Right: Visual Mastery Index Bar */}
        <div className="w-full md:w-[420px] flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#4B5563] font-medium">Mastery Index</span>
            <span className="font-bold text-[#1D4ED8]">
              {formatNum(stats.LTM)} / {stats.MM} Marks
            </span>
          </div>
          <div className="w-full h-2.5 bg-[#EFECE6] rounded-full overflow-hidden border border-[#DFDDD4]">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                stats.completionPct < 0
                  ? 'bg-[#DC2626]'
                  : 'bg-gradient-to-r from-[#1D4ED8] to-[#16A34A]'
              }`}
              style={{
                width: `${Math.min(100, Math.max(0, Math.abs(stats.completionPct)))}%`,
              }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-[#6B7280]">
            <span>0% (Floor)</span>
            <span>
              MM Ceiling: {stats.MM} ({stats.TQ} Chapter Qs × 3)
            </span>
          </div>
        </div>
      </div>

      {/* ROW 4: 3-CARD METRIC ROW (MM, LTM, AM) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {/* MAXIMUM MARK (MM) */}
        <div className="bg-white border border-[#DFDDD4] rounded-lg px-4 py-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#4B5563] font-semibold">
              MAXIMUM MARK (CHAPTER POOL CAP)
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#F5F4EF] text-[#374151] border border-[#DFDDD4] rounded">
              MM = TQ × 3
            </span>
          </div>
          <div className="flex items-baseline gap-2.5 mt-2">
            <span className="text-3xl font-mono font-bold text-[#111827]">{stats.MM}</span>
            <span className="text-xs font-mono font-semibold text-[#1D4ED8]">
              ({stats.TQ} Accumulated Qs × 3)
            </span>
          </div>
          <div className="text-[11px] font-mono text-[#6B7280] mt-1">
            All ingested chapter &lt;Qn&gt; blocks × 3 (1 Acc + 2 Time)
          </div>
        </div>

        {/* LIFETIME MARKS (LM) */}
        <div className="bg-white border border-[#BFDBFE] rounded-lg px-4 py-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#1D4ED8] font-semibold">
              LIFETIME MARKS
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] rounded">
              LM
            </span>
          </div>
          <div
            className={`text-3xl font-mono font-bold mt-2 ${
              stats.LTM < 0 ? 'text-[#DC2626]' : 'text-[#1D4ED8]'
            }`}
          >
            {formatNum(stats.LTM)}
          </div>
          <div className="text-[11px] font-mono text-[#6B7280] mt-1">ARMNT + NTM</div>
        </div>

        {/* AVAILABLE MARKS (AM) */}
        <div className="bg-white border border-[#DFDDD4] rounded-lg px-4 py-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#4B5563] font-semibold">
              AVAILABLE MARKS
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#F5F4EF] text-[#374151] border border-[#DFDDD4] rounded">
              AM
            </span>
          </div>
          <div className="text-3xl font-mono font-bold text-[#111827] mt-2">
            {formatNum(stats.AM)}
          </div>
          <div className="text-[11px] font-mono text-[#6B7280] mt-1">MM - LTM</div>
        </div>
      </div>

      {/* CARD 5: ACCURACY OVERVIEW & BREAKDOWN (FULL WIDTH) */}
      <div className="w-full bg-white border border-[#DFDDD4] rounded-lg p-4 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E5E3DC]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#111827]">
              <span className="w-2 h-2 rounded-full bg-[#1D4ED8]" />
              <span>ACCURACY OVERVIEW &amp; BREAKDOWN</span>
            </div>
            <div className="text-[11px] font-mono text-[#6B7280] mt-0.5">
              Accuracy Metric Formula: Accuracy = {stats.NQC} / {stats.accuracyDenominator}
            </div>
          </div>

          {/* // ACCURACY RATIO VISUAL BADGE */}
          <div className="min-w-[210px] bg-[#F9F8F4] border border-[#DFDDD4] rounded-md px-3 py-2 flex items-center justify-between gap-4">
            <div>
              <div className="text-[9px] font-mono uppercase tracking-wider text-[#6B7280]">
                // ACCURACY RATIO
              </div>
              <div
                className={`text-base font-mono font-bold ${
                  stats.accuracyRatioPct < 0 ? 'text-[#DC2626]' : 'text-[#15803D]'
                }`}
              >
                {stats.accuracyRatioPct.toFixed(2)}%
              </div>
            </div>
            <div className="w-16 h-2 bg-[#E5E3DC] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  stats.accuracyRatioPct < 0 ? 'bg-[#DC2626]' : 'bg-[#16A34A]'
                }`}
                style={{
                  width: `${Math.min(100, Math.max(0, Math.abs(stats.accuracyRatioPct)))}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* 4-Column Accuracy Table */}
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-[#E5E3DC] text-[10px] uppercase tracking-wider text-[#6B7280]">
                <th className="py-2.5 pr-4 font-semibold">CLASSIFICATION</th>
                <th className="py-2.5 px-4 text-center font-semibold">COUNT</th>
                <th className="py-2.5 px-4 text-center font-semibold">MULTIPLICATION FORMULA</th>
                <th className="py-2.5 pl-4 text-right font-semibold">NET VALUATION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EFEA]">
              <tr>
                <td className="py-2.5 pr-4 font-sans font-medium text-[#111827]">
                  No. of questions correct (lifetime){' '}
                  <span className="font-mono text-[10px] text-[#1D4ED8] ml-1">[NQC]</span>
                </td>
                <td className="py-2.5 px-4 text-center font-bold text-[#111827]">{stats.NQC}</td>
                <td className="py-2.5 px-4 text-center text-[#4B5563]">{stats.NQC} × 1.0</td>
                <td className="py-2.5 pl-4 text-right font-bold text-[#15803D]">
                  +{formatNum(stats.correctMarks)} marks
                </td>
              </tr>

              <tr>
                <td className="py-2.5 pr-4 font-sans font-medium text-[#111827]">
                  No. of questions wrong{' '}
                  <span className="font-mono text-[10px] text-[#DC2626] ml-1">[NQW]</span>
                </td>
                <td className="py-2.5 px-4 text-center font-bold text-[#111827]">{stats.NQW}</td>
                <td className="py-2.5 px-4 text-center text-[#4B5563]">
                  {stats.NQW} × 0.5 (Penalty)
                </td>
                <td className="py-2.5 pl-4 text-right font-bold text-[#DC2626]">
                  {stats.wrongPenalty > 0 ? `-${formatNum(stats.wrongPenalty)}` : '0'} marks
                </td>
              </tr>

              <tr>
                <td className="py-2.5 pr-4 font-sans font-medium text-[#111827]">
                  No. of questions skipped{' '}
                  <span className="font-mono text-[10px] text-[#D97706] ml-1">[NQS]</span>
                </td>
                <td className="py-2.5 px-4 text-center font-bold text-[#111827]">{stats.NQS}</td>
                <td className="py-2.5 px-4 text-center text-[#4B5563]">
                  {stats.NQS} × 0.2 (Penalty)
                </td>
                <td className="py-2.5 pl-4 text-right font-bold text-[#D97706]">
                  {stats.skipPenalty > 0 ? `-${formatNum(stats.skipPenalty)}` : '0'} marks
                </td>
              </tr>

              <tr>
                <td className="py-2.5 pr-4 font-sans font-medium text-[#6B7280]">
                  No. of questions not asked{' '}
                  <span className="font-mono text-[10px] text-[#6B7280] ml-1">[NQNA]</span>
                </td>
                <td className="py-2.5 px-4 text-center font-bold text-[#6B7280]">{stats.NQNA}</td>
                <td className="py-2.5 px-4 text-center text-[#6B7280]">{stats.NQNA} × 0.0</td>
                <td className="py-2.5 pl-4 text-right font-semibold text-[#6B7280]">0 marks</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="bg-[#F9F8F4] border-t border-[#DFDDD4]">
                <td
                  colSpan={2}
                  className="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-[#1D4ED8]"
                >
                  ACCURACY REAL MARKS NET TOTAL (ARMNT)
                </td>
                <td className="py-2.5 px-4 text-center font-bold text-[#111827]">
                  {formatNum(stats.correctMarks)} - {formatNum(stats.wrongPenalty)} -{' '}
                  {formatNum(stats.skipPenalty)}
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-sm text-[#1D4ED8]">
                  = {formatNum(stats.ARMNT)} Marks
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* CARD 6: TIME PERFORMANCE & SPEED TIER BREAKDOWN (FULL WIDTH) */}
      <div className="w-full bg-white border border-[#DFDDD4] rounded-lg p-4 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E5E3DC]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#111827]">
              <span className="w-2 h-2 rounded-full bg-[#1D4ED8]" />
              <span>TIME PERFORMANCE &amp; SPEED TIER BREAKDOWN</span>
            </div>
            <div className="text-[11px] font-mono text-[#6B7280] mt-0.5">
              Lifetime Marks (Time = {formatNum(stats.NTM)} / {stats.timeDenominator})
            </div>
          </div>

          {/* // LIFETIME TIME PERCENTAGE VISUAL BADGE */}
          <div className="min-w-[210px] bg-[#F9F8F4] border border-[#DFDDD4] rounded-md px-3 py-2 flex items-center justify-between gap-4">
            <div>
              <div className="text-[9px] font-mono uppercase tracking-wider text-[#6B7280]">
                // LIFETIME TIME PERCENTAGE
              </div>
              <div className="text-base font-mono font-bold text-[#1D4ED8]">
                {stats.timeRatioPct.toFixed(2)}%
              </div>
            </div>
            <div className="w-16 h-2 bg-[#E5E3DC] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1D4ED8] rounded-full"
                style={{
                  width: `${Math.min(100, Math.max(0, stats.timeRatioPct))}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* 4-Column Speed Tier Table */}
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-[#E5E3DC] text-[10px] uppercase tracking-wider text-[#6B7280]">
                <th className="py-2.5 pr-4 font-semibold">LATENCY BAND</th>
                <th className="py-2.5 px-4 text-center font-semibold">COUNT</th>
                <th className="py-2.5 px-4 text-center font-semibold">MULTIPLIER STEP</th>
                <th className="py-2.5 pl-4 text-right font-semibold">NET VALUATION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EFEA]">
              <tr>
                <td className="py-2.5 pr-4 font-sans font-medium text-[#111827]">
                  No. of questions under {timing.fastLimit}s{' '}
                  <span className="font-mono text-[10px] text-[#1D4ED8] ml-1">[NQF]</span>
                </td>
                <td className="py-2.5 px-4 text-center font-bold text-[#111827]">{stats.NQF}</td>
                <td className="py-2.5 px-4 text-center text-[#4B5563]">{stats.NQF} × 2</td>
                <td className="py-2.5 pl-4 text-right font-bold text-[#1D4ED8]">
                  +{formatNum(stats.fastMarks)} marks
                </td>
              </tr>

              <tr>
                <td className="py-2.5 pr-4 font-sans font-medium text-[#111827]">
                  No. of questions under {timing.fastLimit}s - {timing.mediumLimit}s{' '}
                  <span className="font-mono text-[10px] text-[#1D4ED8] ml-1">[NQM]</span>
                </td>
                <td className="py-2.5 px-4 text-center font-bold text-[#111827]">{stats.NQM}</td>
                <td className="py-2.5 px-4 text-center text-[#4B5563]">{stats.NQM} × 1</td>
                <td className="py-2.5 pl-4 text-right font-bold text-[#1D4ED8]">
                  +{formatNum(stats.medMarks)} marks
                </td>
              </tr>

              <tr>
                <td className="py-2.5 pr-4 font-sans font-medium text-[#111827]">
                  No. of questions under {timing.mediumLimit}s - {timing.slowLimit}s{' '}
                  <span className="font-mono text-[10px] text-[#1D4ED8] ml-1">[NQSl]</span>
                </td>
                <td className="py-2.5 px-4 text-center font-bold text-[#111827]">{stats.NQSl}</td>
                <td className="py-2.5 px-4 text-center text-[#4B5563]">{stats.NQSl} × 0.5</td>
                <td className="py-2.5 pl-4 text-right font-bold text-[#4B5563]">
                  {stats.slowMarks > 0 ? `+${formatNum(stats.slowMarks)}` : '0'} marks
                </td>
              </tr>

              <tr>
                <td className="py-2.5 pr-4 font-sans font-medium text-[#6B7280]">
                  No. of questions over {timing.slowLimit}s{' '}
                  <span className="font-mono text-[10px] text-[#6B7280] ml-1">[NQOT]</span>
                </td>
                <td className="py-2.5 px-4 text-center font-bold text-[#6B7280]">{stats.NQOT}</td>
                <td className="py-2.5 px-4 text-center text-[#6B7280]">{stats.NQOT} × 0</td>
                <td className="py-2.5 pl-4 text-right font-semibold text-[#6B7280]">0 marks</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="bg-[#F9F8F4] border-t border-[#DFDDD4]">
                <td
                  colSpan={2}
                  className="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-[#1D4ED8]"
                >
                  NET TIME MARKS (NTM)
                </td>
                <td className="py-2.5 px-4 text-center font-bold text-[#111827]">
                  {formatNum(stats.fastMarks)} + {formatNum(stats.medMarks)} +{' '}
                  {formatNum(stats.slowMarks)}
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-sm text-[#1D4ED8]">
                  = {formatNum(stats.NTM)} Marks
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* CARD 7: FINAL AGGREGATION & TOPIC SYNTHESIS */}
      <div className="w-full bg-white border border-[#DFDDD4] rounded-lg p-4 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E3DC]">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#111827]">
            FINAL AGGREGATION &amp; TOPIC SYNTHESIS
          </span>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] rounded">
              {stats.invariantsPass ? 'INVARIANTS VERIFIED' : 'INVARIANT MISMATCH'}
            </span>
            <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] rounded">
              SYNTHESIS
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          {/* Left Box: LTM Formula */}
          <div className="bg-[#F9F8F4] border border-[#DFDDD4] rounded-lg p-3.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280]">
              LIFETIME MARKS (LTM) FORMULA
            </div>
            <div className="text-[11px] font-mono text-[#4B5563] mt-0.5">ARMNT + NTM</div>
            <div className="text-xl font-mono font-bold text-[#111827] mt-2">
              {formatNum(stats.ARMNT)} + {formatNum(stats.NTM)} ={' '}
              <span className={stats.LTM < 0 ? 'text-[#DC2626]' : 'text-[#1D4ED8]'}>
                {formatNum(stats.LTM)} Marks
              </span>
            </div>
          </div>

          {/* Right Box: Total Completion Percentage */}
          <div className="bg-[#F9F8F4] border border-[#DFDDD4] rounded-lg p-3.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280]">
              TOTAL COMPLETION PERCENTAGE
            </div>
            <div className="text-[11px] font-mono text-[#4B5563] mt-0.5">LTM / MM</div>
            <div className="text-xl font-mono font-bold text-[#111827] mt-2">
              {formatNum(stats.LTM)} / {stats.MM} ={' '}
              <span className={stats.completionPct < 0 ? 'text-[#DC2626]' : 'text-[#15803D]'}>
                {stats.completionPct.toFixed(3)}%
              </span>
            </div>
          </div>
        </div>
      </div>

          {/* EXCLUSIVE SUB-PAGE ENTRY AT THE VERY BOTTOM OF CHAPTER TRACKER PAGE 1 */}
          <div className="w-full bg-white border border-[#DFDDD4] rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="text-xs font-mono text-[#6B7280]">
              Chapter Tracker Sub-Page · Inspect Subtopic &amp; Concept Completion % via MKML Tag Scanner
            </div>
            <button
              type="button"
              onClick={() => setActiveSectionView('part-2')}
              className="px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white border border-[#1D4ED8] rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Proceed to Part 2: Subtopic Breakdown (Subtopic Analysis)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
