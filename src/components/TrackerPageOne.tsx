import React, { useState, useMemo, useEffect } from 'react';
import {
  Activity,
  FileJson,
  Lock,
  Unlock,
  RotateCcw,
  ArrowRight,
  Copy,
  Check,
  X,
} from 'lucide-react';
import {
  ExamRegistryDashboard,
  type DashboardSectionMode,
  type DomainItem,
  type ChapterItem,
  type SubtopicItem,
  type ConceptItem,
  type MicroConceptItem,
  type ExamProfile,
  INITIAL_DOMAINS,
  INITIAL_CHAPTERS,
  INITIAL_SUBTOPICS,
  INITIAL_CONCEPTS,
  INITIAL_MICRO_CONCEPTS,
  INITIAL_EXAMS,
} from './ExamRegistryDashboard';
import { TrackerPageTwo } from './TrackerPageTwo';
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
  DEFAULT_STEPS_BY_UNIQUE_ID,
  scanChapterStorageAndMarks,
  type ExplanationStepItem,
} from '../utils/mkmlStorageScanner';
import {
  loadPersistedTrackerState,
  savePersistedTrackerState,
} from '../utils/trackerLocalStorage';

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

// Helper to build a pre-populated chapter ledger that yields an exact target TCR = (LTM / MM) * 100
function createSeededChapterLedger(
  chapterCode: string,
  chapterName: string,
  fastCorrectedCount: number,
  medCorrectedCount: number,
  notAskedCount: number,
  fastLimit = 45,
  mediumLimit = 75,
  slowLimit = 110
): ChapterLedger {
  const qMap: Record<string, AttemptTuple[]> = {};
  let qIdx = 1;
  for (let i = 0; i < fastCorrectedCount; i++) {
    // Each fast correct gives +1 acc + 2 time = 3.0 LTM
    qMap[`${chapterCode}-C1-Qn${qIdx++}`] = [['C', Math.max(10, fastLimit - 10), 1, 2, 'A']];
  }
  for (let i = 0; i < medCorrectedCount; i++) {
    // Each med correct gives +1 acc + 1 time = 2.0 LTM
    qMap[`${chapterCode}-C1-Qn${qIdx++}`] = [['C', fastLimit + 10, 1, 1, 'B']];
  }
  for (let i = 0; i < notAskedCount; i++) {
    // Each not asked gives 0 LTM (still adds +3 to MM = TQ * 3)
    qMap[`${chapterCode}-C1-Qn${qIdx++}`] = [];
  }
  return {
    chapterCode,
    chapterName,
    evaluationDate: '19/11/2026',
    timing: {
      fastLimit,
      mediumLimit,
      slowLimit,
      locked: true,
    },
    concepts: {
      C1: qMap,
    },
  };
}

const INITIAL_LEDGERS: Record<string, ChapterLedger> = {
  // 1) TD: Exact 7.3 / 18 = 40.556% (Part 1) AND exact 1.1) V1 = 2.5 / 6 = 41.67% (Part 2)
  // Using Chained Unique Question IDs: <Domain-Chapter-Subtopic-Concept-x_n>
  TD: {
    chapterCode: 'TD',
    chapterName: 'Time and Distance',
    evaluationDate: '28/09/2026',
    timing: {
      fastLimit: 60,
      mediumLimit: 90,
      slowLimit: 120,
      locked: true,
    },
    concepts: {
      'BWR-V1': {
        'QA-TD-BWR-V1-1': [
          ['C', 52, 1, 2, 'A'],
          ['C', 41, 1, 2, 'A'],
        ],
        'QA-TD-BWR-V1-2': [
          ['C', 72, 1, 1, 'B'],
          ['W', 75, -0.5, 0, 'D'],
        ],
      },
      'BWR-V2': {
        'QA-TD-BWR-V2-1': [
          ['C', 54, 1, 2, 'B'],
          ['C', 48, 1, 2, 'B'],
        ],
      },
      'RST-V1': {
        'QA-TD-RST-V1-1': [
          ['C', 50, 1, 2, 'B'],
          ['C', 74, 1, 1, 'C'],
        ],
        'QA-TD-RST-V1-2': [
          ['C', 78, 1, 1, 'B'],
          ['S', 36, -0.2, 0, '-'],
        ],
        'QA-TD-RST-V1-3': [], // Not asked yet (Pending)
      },
    },
  },
  // 2) TRG: All 23 Questions from 18-Page Notebook PDF (<Subtopic == QA-TRG-BS> -> <Concept == QA-TRG-BS-FR>)
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
        'QA-TRG-BS-FR-22': [], // Unattempted in storage for testing fresh evaluation
        'QA-TRG-BS-FR-23': [], // Unattempted in storage for testing fresh evaluation
      },
    },
  },
  // PL: 12 Fast Correct (36 LTM) / 20 Total Qs (MM=60) => 60.000% TCR
  PL: createSeededChapterLedger('PL', 'Profit and Loss', 12, 0, 8, 45, 75, 110),
  // ALG: 10 Fast Correct (30 LTM) / 20 Total Qs (MM=60) => 50.000% TCR
  ALG: createSeededChapterLedger('ALG', 'Algebra', 10, 0, 10, 45, 75, 110),
  // GEO: 6 Fast Correct (18 LTM) / 20 Total Qs (MM=60) => 30.000% TCR
  GEO: createSeededChapterLedger('GEO', 'Geometry', 6, 0, 14, 50, 80, 120),
  // TW: 5 Fast Correct (15 LTM) / 10 Total Qs (MM=30) => 50.000% TCR
  TW: createSeededChapterLedger('TW', 'Time and Work', 5, 0, 5, 45, 75, 110),

  // English Language (Eng) chapters for SSC CHSL sample report
  // PN: 17 Fast Correct (51 LTM) / 20 Total Qs (MM=60) => 85.000% TCR
  PN: createSeededChapterLedger('PN', 'Pronouns', 17, 0, 3, 25, 50, 80),
  // VB: 16 Fast Correct (48 LTM) / 20 Total Qs (MM=60) => 80.000% TCR
  VB: createSeededChapterLedger('VB', 'Verbs & Tenses', 16, 0, 4, 25, 50, 80),
  // ADJ: 4 Fast Correct (12 LTM) / 20 Total Qs (MM=60) => 20.000% TCR
  ADJ: createSeededChapterLedger('ADJ', 'Adjectives', 4, 0, 16, 25, 50, 80),
  // VOC: 12 Fast Correct (36 LTM) / 20 Total Qs (MM=60) => 60.000% TCR
  VOC: createSeededChapterLedger('VOC', 'Vocabulary & Cloze', 12, 0, 8, 20, 40, 60),

  // General Intelligence & Reasoning (GI) chapters
  // SER: 16 Fast Correct (48 LTM) / 20 Total Qs (MM=60) => 80.000% TCR
  SER: createSeededChapterLedger('SER', 'Number & Letter Series', 16, 0, 4, 35, 60, 90),
  // ANA: 14 Fast Correct (42 LTM) / 20 Total Qs (MM=60) => 70.000% TCR
  ANA: createSeededChapterLedger('ANA', 'Analogy & Classification', 14, 0, 6, 30, 55, 85),
  // COD: 12 Fast Correct (36 LTM) / 20 Total Qs (MM=60) => 60.000% TCR
  COD: createSeededChapterLedger('COD', 'Coding-Decoding', 12, 0, 8, 35, 60, 90),

  // General Studies (GS) chapters
  // POL: 10 Fast Correct (30 LTM) / 20 Total Qs (MM=60) => 50.000% TCR
  POL: createSeededChapterLedger('POL', 'Indian Polity', 10, 0, 10, 20, 40, 60),
  // HIS: 8 Fast Correct (24 LTM) / 20 Total Qs (MM=60) => 40.000% TCR
  HIS: createSeededChapterLedger('HIS', 'History & Culture', 8, 0, 12, 20, 40, 60),
  // SCI: 7 Fast Correct (21 LTM) / 20 Total Qs (MM=60) => 35.000% TCR
  SCI: createSeededChapterLedger('SCI', 'General Science', 7, 0, 13, 20, 40, 60),

  // Basics clean skeleton
  BS: {
    chapterCode: 'BS',
    chapterName: 'Basics',
    evaluationDate: '16/11/2026',
    timing: {
      fastLimit: 30,
      mediumLimit: 60,
      slowLimit: 90,
      locked: false,
    },
    concepts: {
      UN: {
        'BS-UN-Qn1': [],
        'BS-UN-Qn2': [],
        'BS-UN-Qn3': [],
        'BS-UN-Qn4': [],
        'BS-UN-Qn5': [],
        'BS-UN-Qn6': [],
        'BS-UN-Qn7': [],
        'BS-UN-Qn8': [],
        'BS-UN-Qn9': [],
        'BS-UN-Qn10': [],
        'BS-UN-Qn11': [],
        'BS-UN-Qn12': [],
        'BS-UN-Qn13': [],
      },
    },
  },
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
  {
    id: 'test-1',
    label: 'test id(1)',
    chapterCode: 'TD',
    questionUniqueIds: ['QA-TD-BWR-V1-1', 'QA-TD-BWR-V1-2', 'QA-TD-BWR-V2-1'],
    createdAt: '17/11/2026',
  },
  {
    id: 'test-2',
    label: 'test id(2)',
    chapterCode: 'TD',
    questionUniqueIds: ['QA-TD-RST-V1-1', 'QA-TD-RST-V1-2', 'QA-TD-RST-V1-3'],
    createdAt: '18/11/2026',
  },
  {
    id: 'test-3',
    label: 'test id(3)',
    chapterCode: 'TD',
    questionUniqueIds: [
      'QA-TD-BWR-V1-1',
      'QA-TD-BWR-V1-2',
      'QA-TD-BWR-V2-1',
      'QA-TD-RST-V1-1',
      'QA-TD-RST-V1-2',
      'QA-TD-RST-V1-3',
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
      subtopics: INITIAL_SUBTOPICS,
      concepts: INITIAL_CONCEPTS,
      microConcepts: INITIAL_MICRO_CONCEPTS,
      stepsByQid: DEFAULT_STEPS_BY_UNIQUE_ID,
      testSessions: INITIAL_TEST_SESSIONS,
      activeTestSessionId: 'test-trg-1',
      exams: INITIAL_EXAMS,
      selectedExamId: INITIAL_EXAMS[0].id,
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
  const [showJsonModal, setShowJsonModal] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  // Shared 5-Tier Registry State (drives both Registry 5 Pages and Part 2 MKML Tag Scanner)
  const [domains, setDomains] = useState<DomainItem[]>(initialHydrated.domains);
  const [chapters, setChapters] = useState<ChapterItem[]>(initialHydrated.chapters);
  const [subtopics, setSubtopics] = useState<SubtopicItem[]>(initialHydrated.subtopics);
  const [concepts, setConcepts] = useState<ConceptItem[]>(initialHydrated.concepts);
  const [microConcepts, setMicroConcepts] = useState<MicroConceptItem[]>(
    initialHydrated.microConcepts
  );
  // Shared Question Step-IDs (T1, T2, T3) mapped by Unique Question ID
  const [stepsByQid, setStepsByQid] = useState<Record<string, ExplanationStepItem[]>>(
    initialHydrated.stepsByQid
  );
  // Lifted Exam Info Profiles (survives page switches and browser reloads)
  const [exams, setExams] = useState<ExamProfile[]>(initialHydrated.exams);
  const [selectedExamId, setSelectedExamId] = useState<string>(initialHydrated.selectedExamId);

  const currentLedger = ledgers[activeChapterKey] || ledgers.TD;

  // Auto-persist every Tracker, Exam Info, and Registry change to browser localStorage
  useEffect(() => {
    savePersistedTrackerState({
      activeChapterKey,
      ledgers,
      domains,
      chapters,
      subtopics,
      concepts,
      microConcepts,
      stepsByQid,
      testSessions,
      activeTestSessionId,
      exams,
      selectedExamId,
    });
  }, [
    activeChapterKey,
    ledgers,
    domains,
    chapters,
    subtopics,
    concepts,
    microConcepts,
    stepsByQid,
    testSessions,
    activeTestSessionId,
    exams,
    selectedExamId,
  ]);

  // Listen for backup import / reset commands from 06 Settings
  useEffect(() => {
    const applyState = (next: Omit<typeof initialHydrated, 'restoredFromLocal' | 'savedAt'>) => {
      setLedgers(next.ledgers);
      setActiveChapterKey(next.activeChapterKey);
      setDomains(next.domains);
      setChapters(next.chapters);
      setSubtopics(next.subtopics);
      setConcepts(next.concepts);
      setMicroConcepts(next.microConcepts);
      setStepsByQid(next.stepsByQid);
      setTestSessions(next.testSessions);
      setActiveTestSessionId(next.activeTestSessionId);
      setExams(next.exams);
      setSelectedExamId(next.selectedExamId);
      const nextLedger = next.ledgers[next.activeChapterKey] || next.ledgers.TD;
      if (nextLedger) {
        setFastInput(String(nextLedger.timing.fastLimit));
        setMedInput(String(nextLedger.timing.mediumLimit));
        setSlowInput(String(nextLedger.timing.slowLimit));
      }
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
  }, [defaultBundle]);

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
        if (ledgers[code]) {
          setActiveChapterKey(code);
          setFastInput(String(ledgers[code].timing.fastLimit));
          setMedInput(String(ledgers[code].timing.mediumLimit));
          setSlowInput(String(ledgers[code].timing.slowLimit));
        }
      }
      if (detail.action === 'set-view' && detail.view) {
        setActiveSectionView(detail.view);
        return;
      }
      if (detail.action === 'launch-scoped-cards') {
        const rawCode = String(detail.rootMid || detail.chapterCode || '').trim().toUpperCase();
        const folderUpper = String(detail.folder || '').toUpperCase();
        const inferredFromFolder = folderUpper.includes('PRONOUN')
          ? 'PN'
          : folderUpper.includes('TIME')
            ? 'TD'
            : folderUpper.includes('TRIG')
              ? 'TRG'
              : '';
        const candidateCode = rawCode || inferredFromFolder || 'TRG';
        const targetCode = ledgers[candidateCode]
          ? candidateCode
          : candidateCode.includes('PRONOUN')
            ? 'PN'
            : 'TRG';
        const targetLedger = ledgers[targetCode] || ledgers.TRG;
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
          microConcepts
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
  }, [ledgers, domains, chapters, subtopics, concepts, microConcepts]);

  useEffect(() => {
    const targetNavPage =
      activeSectionView === 'exam-page-1' || activeSectionView === 'exam-page-2'
        ? 'exam-info'
        : activeSectionView === 'registry'
          ? 'registry'
          : 'tracker';
    window.dispatchEvent(
      new CustomEvent('angles:sync-nav', { detail: { page: targetNavPage } })
    );
  }, [activeSectionView]);

  const handleJumpToChapterLedger = (chapterCode: string) => {
    if (!ledgers[chapterCode]) {
      setLedgers((prev) => ({
        ...prev,
        [chapterCode]: createSeededChapterLedger(chapterCode, chapterCode, 0, 0, 10),
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
        [chapterCode]: createSeededChapterLedger(chapterCode, chapterName, 0, 0, 10),
      };
    });
  };

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
    setLedgers((prev) => ({
      ...prev,
      [activeChapterKey]: {
        ...prev[activeChapterKey],
        timing: {
          fastLimit: f,
          mediumLimit: m,
          slowLimit: s,
          locked: true,
        },
      },
    }));
  };

  const handleUnlockTiming = () => {
    setLedgers((prev) => ({
      ...prev,
      [activeChapterKey]: {
        ...prev[activeChapterKey],
        timing: {
          ...prev[activeChapterKey].timing,
          locked: false,
        },
      },
    }));
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

  // Simulate recording an attempt on the first Not Asked question (or cycling through pool)
  const handleSimulateAttempt = (status: AttemptStatus, seconds: number, option = 'A') => {
    setLedgers((prev) => {
      const target = prev[activeChapterKey];
      const nextConcepts: Record<string, Record<string, AttemptTuple[]>> = {};

      // Deep clone
      Object.entries(target.concepts).forEach(([cMid, qMap]) => {
        nextConcepts[cMid] = {};
        Object.entries(qMap).forEach(([qid, arr]) => {
          nextConcepts[cMid][qid] = [...arr];
        });
      });

      // Find first pending question, or if none pending, append a new question to first concept
      let targetCMid = Object.keys(nextConcepts)[0] || 'C1';
      let targetQid: string | null = null;

      for (const [cMid, qMap] of Object.entries(nextConcepts)) {
        for (const [qid, arr] of Object.entries(qMap)) {
          if (arr.length === 0) {
            targetCMid = cMid;
            targetQid = qid;
            break;
          }
        }
        if (targetQid) break;
      }

      if (!targetQid) {
        const existingCount = Object.keys(nextConcepts[targetCMid] || {}).length;
        targetQid = `${target.chapterCode}-${targetCMid}-Qn${existingCount + 1}`;
        if (!nextConcepts[targetCMid]) nextConcepts[targetCMid] = {};
        nextConcepts[targetCMid][targetQid] = [];
      }

      const { accMark, timeMark } = computeAttemptMarks(status, seconds, target.timing);
      nextConcepts[targetCMid][targetQid].push([status, seconds, accMark, timeMark, option]);

      return {
        ...prev,
        [activeChapterKey]: {
          ...target,
          concepts: nextConcepts,
        },
      };
    });
  };

  const handleResetSkeleton = () => {
    setLedgers((prev) => {
      const target = prev[activeChapterKey];
      const cleanConcepts: Record<string, Record<string, AttemptTuple[]>> = {};
      Object.entries(target.concepts).forEach(([cMid, qMap]) => {
        cleanConcepts[cMid] = {};
        Object.keys(qMap).forEach((qid) => {
          cleanConcepts[cMid][qid] = [];
        });
      });
      return {
        ...prev,
        [activeChapterKey]: {
          ...target,
          concepts: cleanConcepts,
        },
      };
    });
  };

  // Simulate ingesting a new batch of questions into the chapter folder (grows TQ and MM = TQ * 3)
  const handleIngestBatch = (count: number) => {
    setLedgers((prev) => {
      const target = prev[activeChapterKey];
      const nextConcepts: Record<string, Record<string, AttemptTuple[]>> = {};
      Object.entries(target.concepts).forEach(([cMid, qMap]) => {
        nextConcepts[cMid] = { ...qMap };
      });

      const firstMid = Object.keys(nextConcepts)[0] || 'C1';
      if (!nextConcepts[firstMid]) nextConcepts[firstMid] = {};
      const startIdx = Object.keys(nextConcepts[firstMid]).length + 1;

      for (let i = 0; i < count; i++) {
        const newQid = `${target.chapterCode}-${firstMid}-Qn${startIdx + i}`;
        nextConcepts[firstMid][newQid] = [];
      }

      return {
        ...prev,
        [activeChapterKey]: {
          ...target,
          concepts: nextConcepts,
        },
      };
    });
  };

  const handleRestoreDemoData = () => {
    setLedgers(INITIAL_LEDGERS);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(currentLedger, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 1800);
  };

  // Simulate recording an attempt inside a specific Part 2 Subtopic / Concept scope
  const handleSimulateAttemptInScope = (
    targetUniqueIds: string[],
    status: AttemptStatus,
    seconds: number,
    conceptKeyHint = 'C1'
  ) => {
    setLedgers((prev) => {
      const target = prev[activeChapterKey];
      const nextConcepts: Record<string, Record<string, AttemptTuple[]>> = {};

      Object.entries(target.concepts).forEach(([cMid, qMap]) => {
        nextConcepts[cMid] = {};
        Object.entries(qMap).forEach(([qid, arr]) => {
          nextConcepts[cMid][qid] = [...arr];
        });
      });

      const { accMark, timeMark } = computeAttemptMarks(status, seconds, target.timing);
      const idSet = new Set(targetUniqueIds);

      // 1. Try to find an unattempted question inside the selected scope
      for (const [cMid, qMap] of Object.entries(nextConcepts)) {
        for (const [qid, arr] of Object.entries(qMap)) {
          if (idSet.has(qid) && arr.length === 0) {
            nextConcepts[cMid][qid].push([status, seconds, accMark, timeMark, 'A']);
            return {
              ...prev,
              [activeChapterKey]: { ...target, concepts: nextConcepts },
            };
          }
        }
      }

      // 2. Otherwise append a new attempt to the first question matching the selected scope
      for (const [cMid, qMap] of Object.entries(nextConcepts)) {
        for (const [qid] of Object.entries(qMap)) {
          if (idSet.has(qid)) {
            nextConcepts[cMid][qid].push([status, seconds, accMark, timeMark, 'A']);
            return {
              ...prev,
              [activeChapterKey]: { ...target, concepts: nextConcepts },
            };
          }
        }
      }

      // 3. Fallback: append to first concept
      const fallbackMid = Object.keys(nextConcepts)[0] || conceptKeyHint;
      if (!nextConcepts[fallbackMid]) nextConcepts[fallbackMid] = {};
      const firstQid =
        Object.keys(nextConcepts[fallbackMid])[0] ||
        targetUniqueIds[0] ||
        `${target.chapterCode}-${fallbackMid}-1`;
      if (!nextConcepts[fallbackMid][firstQid]) nextConcepts[fallbackMid][firstQid] = [];
      nextConcepts[fallbackMid][firstQid].push([status, seconds, accMark, timeMark, 'A']);

      return {
        ...prev,
        [activeChapterKey]: { ...target, concepts: nextConcepts },
      };
    });
  };

  // Record evaluated test questions from Question Index (Full Test mode)
  const handleRecordEvaluatedTest = (
    evaluations: {
      uniqueId: string;
      conceptKey: string;
      status: AttemptStatus;
      seconds: number;
      option: string;
    }[]
  ) => {
    setLedgers((prev) => {
      const target = prev[activeChapterKey];
      const nextConcepts: Record<string, Record<string, AttemptTuple[]>> = {};

      Object.entries(target.concepts).forEach(([cMid, qMap]) => {
        nextConcepts[cMid] = {};
        Object.entries(qMap).forEach(([qid, arr]) => {
          nextConcepts[cMid][qid] = [...arr];
        });
      });

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
        }
      });

      return {
        ...prev,
        [activeChapterKey]: { ...target, concepts: nextConcepts },
      };
    });

    // Also register this completed Full Test as a new test session in Test Analysis
    const nextNum = testSessions.length + 1;
    const newSessionId = `test-${Date.now()}`;
    const now = new Date();
    const todayStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const newSession: TestSessionRecord = {
      id: newSessionId,
      label: `test id(${nextNum})`,
      chapterCode: activeChapterKey,
      questionUniqueIds: evaluations.map((e) => e.uniqueId),
      createdAt: todayStr,
    };
    setTestSessions((prev) => [...prev, newSession]);
    setActiveTestSessionId(newSessionId);
  };

  const { timing } = currentLedger;

  return (
    <div className="w-full min-h-screen bg-[#F5F4EF] text-[#111827] px-2 py-2 space-y-2 font-sans select-none">
      {/* SUB-PAGE OF CHAPTER TRACKER: PART 2 (SUBTOPIC BREAKDOWN) */}
      {activeSectionView === 'part-2' && (
        <TrackerPageTwo
          ledger={currentLedger}
          allLedgers={ledgers}
          onSelectChapter={handleSelectChapter}
          onSimulateAttemptInScope={handleSimulateAttemptInScope}
          onBackToPartOne={() => setActiveSectionView('part-1')}
          onOpenQuestionIndex={() => setActiveSectionView('question-index')}
          onLaunchScopedQuestionsDirect={(questions, pathLabel, mode) => {
            setLaunchedCardItems(
              questions.map((q) => ({
                question: q,
                pathLabel,
              }))
            );
            setLaunchedModality(mode);
            setActiveSectionView('question-cards');
          }}
          domains={domains}
          chapters={chapters}
          subtopics={subtopics}
          concepts={concepts}
          microConcepts={microConcepts}
          stepsByQid={stepsByQid}
        />
      )}

      {/* SUB-PAGE OF PART 2: QUESTION INDEX (TEST SELECTION & LAUNCHER) */}
      {activeSectionView === 'question-index' && (
        <TrackerQuestionIndex
          ledger={currentLedger}
          allLedgers={ledgers}
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
          domains={domains}
          setDomains={setDomains}
          chapters={chapters}
          setChapters={setChapters}
          subtopics={subtopics}
          setSubtopics={setSubtopics}
          concepts={concepts}
          setConcepts={setConcepts}
          microConcepts={microConcepts}
          setMicroConcepts={setMicroConcepts}
          exams={exams}
          setExams={setExams}
          selectedExamId={selectedExamId}
          setSelectedExamId={setSelectedExamId}
        />
      )}

      {/* MAIN PAGE 1: CHAPTER TRACKER (PART 1: TOPIC OVERVIEW) */}
      {activeSectionView === 'part-1' && (
        <>
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
                value={activeChapterKey}
                onChange={(e) => handleSelectChapter(e.target.value)}
                className="text-xl font-bold tracking-tight text-[#111827] bg-transparent border-b border-dashed border-[#9CA3AF] focus:outline-none focus:border-[#2563EB] cursor-pointer pr-1"
              >
                {Object.values(ledgers).map((l) => (
                  <option key={l.chapterCode} value={l.chapterCode}>
                    {l.chapterName} [{l.chapterCode}]
                  </option>
                ))}
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

        {/* Right: Evaluation Date (No duplicate Part 2 button at top) */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#6B7280]">
              EVALUATION DATE
            </div>
            <div className="text-sm font-mono font-bold text-[#111827] mt-0.5">
              {currentLedger.evaluationDate}
            </div>
          </div>
        </div>
      </div>

      {/* CARD 2: LEDGER SKELETON & SANDBOX BAR */}
      <div className="w-full bg-white border border-[#DFDDD4] rounded-lg px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
        {/* Left: Pool Counts */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="flex items-center gap-1.5 font-bold text-[#1D4ED8]">
            <Activity className="w-3.5 h-3.5" />
            <span>CHAPTER POOL (TQ):</span>
          </span>

          <span className="px-2 py-0.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded text-[#1D4ED8] font-bold">
            Total Qs: {stats.TQ} (MM = {stats.TQ} × 3 = {stats.MM})
          </span>
          <span className="px-2 py-0.5 bg-[#F9F8F4] border border-[#DFDDD4] rounded text-[#111827]">
            Attempted: <strong className="text-[#16A34A]">{stats.attemptedCount}</strong>
          </span>
          <span className="px-2 py-0.5 bg-[#F9F8F4] border border-[#DFDDD4] rounded text-[#111827]">
            Not Asked: <strong className="text-[#D97706]">{stats.NQNA}</strong>
          </span>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
          <button
            onClick={() => handleIngestBatch(10)}
            className="px-2.5 py-1 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] rounded font-semibold transition-colors cursor-pointer"
            title="Simulate adding a new batch of 10 mapped questions to this chapter folder"
          >
            +Batch (10 Qs)
          </button>

          <button
            onClick={() => handleSimulateAttempt('C', Math.max(1, timing.fastLimit - 15), 'A')}
            className="px-2.5 py-1 bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0] rounded font-semibold transition-colors cursor-pointer"
          >
            +Correct ({Math.max(1, timing.fastLimit - 15)}s)
          </button>

          <button
            onClick={() =>
              handleSimulateAttempt(
                'C',
                Math.floor((timing.fastLimit + timing.mediumLimit) / 2),
                'B'
              )
            }
            className="px-2.5 py-1 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] rounded font-semibold transition-colors cursor-pointer"
          >
            +Med ({Math.floor((timing.fastLimit + timing.mediumLimit) / 2)}s)
          </button>

          <button
            onClick={() => handleSimulateAttempt('W', timing.mediumLimit - 15, 'D')}
            className="px-2.5 py-1 bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] rounded font-semibold transition-colors cursor-pointer"
          >
            +Wrong ({timing.mediumLimit - 15}s)
          </button>

          <button
            onClick={() => handleSimulateAttempt('S', 30, '-')}
            className="px-2.5 py-1 bg-[#FFFBEB] hover:bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] rounded font-semibold transition-colors cursor-pointer"
          >
            +Skip
          </button>

          <button
            onClick={handleResetSkeleton}
            className="px-2 py-1 bg-[#F9F8F4] hover:bg-[#EFECE6] text-[#4B5563] border border-[#DFDDD4] rounded flex items-center gap-1 transition-colors cursor-pointer"
            title="Clear all attempts to 0 (Clean Skeleton)"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </button>

          <button
            onClick={handleRestoreDemoData}
            className="px-2 py-1 bg-[#F9F8F4] hover:bg-[#EFECE6] text-[#4B5563] border border-[#DFDDD4] rounded transition-colors cursor-pointer"
            title="Restore sample evaluation state"
          >
            Reset
          </button>

          <button
            onClick={() => setShowJsonModal(true)}
            className="px-2.5 py-1 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] rounded font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>Ledger JSON</span>
          </button>
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

      {/* LEDGER JSON TREE MODAL */}
      {showJsonModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#DFDDD4] rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 bg-[#F9F8F4] border-b border-[#DFDDD4]">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#111827]">
                <FileJson className="w-4 h-4 text-[#1D4ED8]" />
                <span>Topic Statistics Ledger JSON Tree ({currentLedger.chapterCode})</span>
              </div>
              <button
                onClick={() => setShowJsonModal(false)}
                className="p-1 text-[#6B7280] hover:text-[#111827] rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 max-h-[420px] overflow-y-auto bg-[#F5F4EF] font-mono text-xs text-[#111827]">
              <pre className="whitespace-pre-wrap break-all">
                {JSON.stringify(currentLedger, null, 2)}
              </pre>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#F9F8F4] border-t border-[#DFDDD4] text-[11px] font-mono">
              <span className="text-[#6B7280]">
                Hierarchy: Chapter [{currentLedger.chapterCode}] → Concept MID → Question ID →
                [[status, sec, acc, time, opt]]
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetSkeleton}
                  className="px-2.5 py-1 bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] rounded font-semibold hover:bg-[#FEE2E2]"
                >
                  Reset to Clean Skeleton
                </button>
                <button
                  onClick={handleCopyJson}
                  className="px-3 py-1 bg-[#1D4ED8] text-white rounded font-semibold flex items-center gap-1 hover:bg-[#1E40AF]"
                >
                  {copiedJson ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
