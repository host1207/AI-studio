import type { ChapterLedger } from '../components/TrackerPageOne';
import type {
  DomainItem,
  ChapterItem,
  ExamProfile,
} from '../components/ExamRegistryDashboard';
import type { ExplanationStepItem } from './mkmlStorageScanner';
import type { TestSessionRecord } from '../components/TrackerTestAnalysis';
import type {
  BoundaryRuleItem,
  OperatorRuleItem,
  SolverPathRuleItem,
  SymbolAliasItem,
} from './givenAskedEngine';

export const TRACKER_STORAGE_KEY = 'angles_tracker_suite_v1';
export const NOTE_DRAFTS_STORAGE_KEY = 'angles_note_drafts_v1';
export const STORAGE_ENABLED_KEY = 'angles_local_storage_enabled_v1';

export interface PersistedTrackerState {
  version: 4;
  savedAt: string;
  activeChapterKey: string;
  ledgers: Record<string, ChapterLedger>;
  domains: DomainItem[];
  chapters: ChapterItem[];
  /** Legacy field preserved for backward compatibility (permanent Full Base IDs are now used directly) */
  stepIdOverrides: Record<string, string>;
  stepsByQid: Record<string, ExplanationStepItem[]>;
  testSessions: TestSessionRecord[];
  activeTestSessionId: string;
  exams: ExamProfile[];
  selectedExamId: string;
  nextExamId?: number;
  microConceptWeaknessPoints?: Record<string, number>;
  askedRules?: BoundaryRuleItem[];
  givenRules?: BoundaryRuleItem[];
  combineAskedFallback?: boolean;
  combineGivenFallback?: boolean;
  operatorRules?: OperatorRuleItem[];
  solverPathRules?: SolverPathRuleItem[];
  symbolAliases?: SymbolAliasItem[];
}

function isValidOperatorList(raw: unknown): raw is OperatorRuleItem[] {
  return (
    Array.isArray(raw) &&
    raw.every(
      (o) =>
        o &&
        typeof o === 'object' &&
        typeof (o as OperatorRuleItem).id === 'string' &&
        typeof (o as OperatorRuleItem).name === 'string' &&
        typeof (o as OperatorRuleItem).egOutput === 'string' &&
        typeof (o as OperatorRuleItem).symbol === 'string' &&
        typeof (o as OperatorRuleItem).topic === 'string'
    )
  );
}

function isValidSolverList(raw: unknown): raw is SolverPathRuleItem[] {
  return (
    Array.isArray(raw) &&
    raw.every(
      (s) =>
        s &&
        typeof s === 'object' &&
        typeof (s as SolverPathRuleItem).id === 'string' &&
        Array.isArray((s as SolverPathRuleItem).askedAliases) &&
        Array.isArray((s as SolverPathRuleItem).branches)
    )
  );
}

function isValidAliasList(raw: unknown): raw is SymbolAliasItem[] {
  return (
    Array.isArray(raw) &&
    raw.every(
      (a) =>
        a &&
        typeof a === 'object' &&
        typeof (a as SymbolAliasItem).id === 'string' &&
        Array.isArray((a as SymbolAliasItem).aliases) &&
        typeof (a as SymbolAliasItem).canonical === 'string'
    )
  );
}

function upgradeLegacyDefaultGivenRules(raw: BoundaryRuleItem[]): BoundaryRuleItem[] {
  return raw.map((rule) => {
    if (rule.id === 'giv-1' && rule.endPoint.trim() === ', | and | then | find') {
      return { ...rule, endPoint: ', | and* -> then | find | what | . | ?' };
    }
    if (rule.id === 'giv-2' && rule.endPoint.trim() === ', | . | then | find') {
      return { ...rule, endPoint: ', | and* -> then | find | what | . | ?' };
    }
    return rule;
  });
}

function normalizeExamsWithNumericIds(
  exams: ExamProfile[],
  savedNextExamId?: number
): { exams: ExamProfile[]; nextExamId: number } {
  const used = new Set<number>();
  let maxId = 0;
  exams.forEach((ex) => {
    if (typeof ex.examId === 'number' && Number.isInteger(ex.examId) && ex.examId > 0) {
      used.add(ex.examId);
      if (ex.examId > maxId) maxId = ex.examId;
    }
  });
  let assignCursor = 1;
  const normalized = exams.map((ex) => {
    if (typeof ex.examId === 'number' && Number.isInteger(ex.examId) && ex.examId > 0) {
      return ex;
    }
    while (used.has(assignCursor)) assignCursor += 1;
    const assigned = assignCursor;
    used.add(assigned);
    if (assigned > maxId) maxId = assigned;
    assignCursor += 1;
    return { ...ex, examId: assigned };
  });
  const nextExamId = Math.max(
    maxId + 1,
    typeof savedNextExamId === 'number' && Number.isInteger(savedNextExamId) ? savedNextExamId : 1
  );
  return { exams: normalized, nextExamId };
}

function sanitizeWeaknessPoints(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== 'object') return {};
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const key = String(k || '').trim();
    const num = Number(v);
    if (key && Number.isFinite(num) && num > 0) {
      out[key] = Math.round(num);
    }
  }
  return out;
}

export function isLocalStoragePersistenceEnabled(): boolean {
  try {
    const raw = window.localStorage.getItem(STORAGE_ENABLED_KEY);
    return raw === null ? true : raw !== 'false';
  } catch {
    return false;
  }
}

export function setLocalStoragePersistenceEnabled(enabled: boolean): void {
  try {
    window.localStorage.setItem(STORAGE_ENABLED_KEY, enabled ? 'true' : 'false');
  } catch {
    // ignore quota / private-mode errors
  }
}

export function loadPersistedTrackerState(
  defaults: Omit<PersistedTrackerState, 'version' | 'savedAt'>
): Omit<PersistedTrackerState, 'version' | 'savedAt'> & { restoredFromLocal: boolean; savedAt: string | null } {
  if (!isLocalStoragePersistenceEnabled()) {
    return { ...defaults, restoredFromLocal: false, savedAt: null };
  }
  try {
    const raw = window.localStorage.getItem(TRACKER_STORAGE_KEY);
    if (!raw) return { ...defaults, restoredFromLocal: false, savedAt: null };
    const parsed = JSON.parse(raw) as Omit<Partial<PersistedTrackerState>, 'version'> & { version?: number };
    if (!parsed || typeof parsed !== 'object') {
      return { ...defaults, restoredFromLocal: false, savedAt: null };
    }

    // Migrate legacy v1 placeholder-seeded state cleanly to v3:
    // keep any recorded Trigonometry attempts and valid TRG step overrides,
    // while clearing legacy placeholder domains (GI/GS), chapters (TD/PL/ALG/...), mock ledgers, and stale plain-text steps.
    if (parsed.version !== 2 && parsed.version !== 3 && parsed.version !== 4) {
      const migratedLedgers: Record<string, ChapterLedger> = { ...defaults.ledgers };
      if (parsed.ledgers?.TRG && parsed.ledgers.TRG.concepts && migratedLedgers.TRG) {
        const mergedConcepts: Record<string, Record<string, ChapterLedger['concepts'][string][string]>> = {};
        for (const [cMid, qMap] of Object.entries(migratedLedgers.TRG.concepts)) {
          mergedConcepts[cMid] = { ...qMap };
        }
        for (const [cMid, qMap] of Object.entries(parsed.ledgers.TRG.concepts)) {
          mergedConcepts[cMid] = { ...(mergedConcepts[cMid] || {}), ...qMap };
        }
        migratedLedgers.TRG = {
          ...migratedLedgers.TRG,
          ...parsed.ledgers.TRG,
          timing: parsed.ledgers.TRG.timing || migratedLedgers.TRG.timing,
          concepts: mergedConcepts,
        };
      }
      const migratedOverrides: Record<string, string> = {};
      if (parsed.stepIdOverrides && typeof parsed.stepIdOverrides === 'object') {
        for (const [baseId, shortCode] of Object.entries(parsed.stepIdOverrides)) {
          if (
            typeof baseId === 'string' &&
            typeof shortCode === 'string' &&
            baseId.toUpperCase().startsWith('QA-TRG-') &&
            shortCode.trim()
          ) {
            migratedOverrides[baseId.trim()] = shortCode.trim().toUpperCase();
          }
        }
      }
      return {
        ...defaults,
        ledgers: migratedLedgers,
        stepIdOverrides: migratedOverrides,
        stepsByQid: {},
        restoredFromLocal: true,
        savedAt: typeof parsed.savedAt === 'string' ? parsed.savedAt : null,
      };
    }

    // Smart merge ledgers so newly added code chapters are never lost while user attempts win
    const mergedLedgers: Record<string, ChapterLedger> = { ...defaults.ledgers };
    if (parsed.ledgers && typeof parsed.ledgers === 'object') {
      for (const [code, savedLedger] of Object.entries(parsed.ledgers)) {
        if (!savedLedger || !savedLedger.concepts) continue;
        const defaultLedger = mergedLedgers[code];
        if (!defaultLedger) {
          mergedLedgers[code] = savedLedger;
        } else {
          const mergedConcepts: Record<string, Record<string, ChapterLedger['concepts'][string][string]>> = {};
          for (const [cMid, qMap] of Object.entries(defaultLedger.concepts)) {
            mergedConcepts[cMid] = { ...qMap };
          }
          for (const [cMid, qMap] of Object.entries(savedLedger.concepts)) {
            mergedConcepts[cMid] = { ...(mergedConcepts[cMid] || {}), ...qMap };
          }
          mergedLedgers[code] = {
            ...defaultLedger,
            ...savedLedger,
            timing: savedLedger.timing || defaultLedger.timing,
            concepts: mergedConcepts,
          };
        }
      }
    }

    const activeChapterKey =
      parsed.activeChapterKey && mergedLedgers[parsed.activeChapterKey]
        ? parsed.activeChapterKey
        : defaults.activeChapterKey;

    const rawExams =
      Array.isArray(parsed.exams) && parsed.exams.length > 0 ? parsed.exams : defaults.exams;
    const { exams, nextExamId } = normalizeExamsWithNumericIds(rawExams, parsed.nextExamId);
    const selectedExamId =
      parsed.selectedExamId && exams.some((e) => e.id === parsed.selectedExamId)
        ? parsed.selectedExamId
        : exams[0]?.id || defaults.selectedExamId;

    // Subtopics, Concepts, and Micro Concepts are intentionally NEVER restored from localStorage —
    // they are absorbed live from disk chapter files using registered Domains & Chapters.
    const cleanOverrides: Record<string, string> = {};
    if (parsed.stepIdOverrides && typeof parsed.stepIdOverrides === 'object') {
      for (const [baseId, shortCode] of Object.entries(parsed.stepIdOverrides)) {
        if (typeof baseId === 'string' && typeof shortCode === 'string' && baseId.trim() && shortCode.trim()) {
          cleanOverrides[baseId.trim()] = shortCode.trim().toUpperCase();
        }
      }
    }

    return {
      activeChapterKey,
      ledgers: mergedLedgers,
      domains: Array.isArray(parsed.domains) && parsed.domains.length > 0 ? parsed.domains : defaults.domains,
      chapters: Array.isArray(parsed.chapters) && parsed.chapters.length > 0 ? parsed.chapters : defaults.chapters,
      stepIdOverrides: {},
      // Reset cached stepsByQid when upgrading from v2/v3 -> v4 so permanent Full Base IDs
      // from chapter questions.html render cleanly without stale T1/T2 overrides.
      stepsByQid:
        parsed.version === 4 && parsed.stepsByQid && typeof parsed.stepsByQid === 'object'
          ? { ...defaults.stepsByQid, ...parsed.stepsByQid }
          : defaults.stepsByQid,
      testSessions:
        Array.isArray(parsed.testSessions) && parsed.testSessions.length > 0
          ? parsed.testSessions
          : defaults.testSessions,
      activeTestSessionId: parsed.activeTestSessionId || defaults.activeTestSessionId,
      exams,
      selectedExamId,
      nextExamId,
      microConceptWeaknessPoints: sanitizeWeaknessPoints(parsed.microConceptWeaknessPoints),
      askedRules: Array.isArray(parsed.askedRules) ? parsed.askedRules : defaults.askedRules,
      givenRules: Array.isArray(parsed.givenRules)
        ? upgradeLegacyDefaultGivenRules(parsed.givenRules)
        : defaults.givenRules,
      combineAskedFallback:
        typeof parsed.combineAskedFallback === 'boolean'
          ? parsed.combineAskedFallback
          : defaults.combineAskedFallback,
      combineGivenFallback:
        typeof parsed.combineGivenFallback === 'boolean'
          ? parsed.combineGivenFallback
          : defaults.combineGivenFallback,
      operatorRules: isValidOperatorList(parsed.operatorRules)
        ? parsed.operatorRules
        : defaults.operatorRules,
      solverPathRules: isValidSolverList(parsed.solverPathRules)
        ? parsed.solverPathRules
        : defaults.solverPathRules,
      symbolAliases: isValidAliasList(parsed.symbolAliases)
        ? parsed.symbolAliases
        : defaults.symbolAliases,
      restoredFromLocal: true,
      savedAt: typeof parsed.savedAt === 'string' ? parsed.savedAt : null,
    };
  } catch {
    return { ...defaults, restoredFromLocal: false, savedAt: null };
  }
}

export function savePersistedTrackerState(
  state: Omit<PersistedTrackerState, 'version' | 'savedAt'>
): string | null {
  if (!isLocalStoragePersistenceEnabled()) return null;
  try {
    const savedAt = new Date().toISOString();
    const payload: PersistedTrackerState = {
      version: 4,
      savedAt,
      ...state,
    };
    window.localStorage.setItem(TRACKER_STORAGE_KEY, JSON.stringify(payload));
    window.dispatchEvent(
      new CustomEvent('angles:storage-updated', { detail: { savedAt, source: 'tracker' } })
    );
    return savedAt;
  } catch {
    return null;
  }
}

export async function saveDiskTrackerState(
  state: Omit<PersistedTrackerState, 'version' | 'savedAt'>,
  savedAt?: string | null,
  keepalive = false
): Promise<boolean> {
  try {
    const payload: PersistedTrackerState = {
      version: 4,
      savedAt: savedAt || new Date().toISOString(),
      ...state,
    };
    const res = await fetch('/api/state', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: payload }),
      keepalive,
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function loadDiskTrackerState(
  defaults: Omit<PersistedTrackerState, 'version' | 'savedAt'>
): Promise<(Omit<PersistedTrackerState, 'version' | 'savedAt'> & { savedAt: string | null }) | null> {
  try {
    const res = await fetch('/api/state', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = (await res.json()) as { ok?: boolean; exists?: boolean; state?: Partial<PersistedTrackerState> };
    if (!data?.exists || !data.state || typeof data.state !== 'object') return null;
    const parsed = data.state;
    const mergedLedgers: Record<string, ChapterLedger> = { ...defaults.ledgers };
    if (parsed.ledgers && typeof parsed.ledgers === 'object') {
      for (const [code, savedLedger] of Object.entries(parsed.ledgers)) {
        if (!savedLedger || !savedLedger.concepts) continue;
        const defaultLedger = mergedLedgers[code];
        if (!defaultLedger) {
          mergedLedgers[code] = savedLedger;
        } else {
          const mergedConcepts: Record<string, Record<string, ChapterLedger['concepts'][string][string]>> = {};
          for (const [cMid, qMap] of Object.entries(defaultLedger.concepts)) {
            mergedConcepts[cMid] = { ...qMap };
          }
          for (const [cMid, qMap] of Object.entries(savedLedger.concepts)) {
            mergedConcepts[cMid] = { ...(mergedConcepts[cMid] || {}), ...qMap };
          }
          mergedLedgers[code] = {
            ...defaultLedger,
            ...savedLedger,
            timing: savedLedger.timing || defaultLedger.timing,
            concepts: mergedConcepts,
          };
        }
      }
    }
    const rawExams =
      Array.isArray(parsed.exams) && parsed.exams.length > 0 ? parsed.exams : defaults.exams;
    const { exams, nextExamId } = normalizeExamsWithNumericIds(rawExams, parsed.nextExamId);
    return {
      activeChapterKey:
        parsed.activeChapterKey && mergedLedgers[parsed.activeChapterKey]
          ? parsed.activeChapterKey
          : defaults.activeChapterKey,
      ledgers: mergedLedgers,
      domains: Array.isArray(parsed.domains) && parsed.domains.length > 0 ? parsed.domains : defaults.domains,
      chapters: Array.isArray(parsed.chapters) && parsed.chapters.length > 0 ? parsed.chapters : defaults.chapters,
      stepIdOverrides: {},
      stepsByQid:
        parsed.stepsByQid && typeof parsed.stepsByQid === 'object'
          ? { ...defaults.stepsByQid, ...parsed.stepsByQid }
          : defaults.stepsByQid,
      testSessions:
        Array.isArray(parsed.testSessions) && parsed.testSessions.length > 0
          ? parsed.testSessions
          : defaults.testSessions,
      activeTestSessionId: parsed.activeTestSessionId || defaults.activeTestSessionId,
      exams,
      selectedExamId:
        parsed.selectedExamId && exams.some((e) => e.id === parsed.selectedExamId)
          ? parsed.selectedExamId
          : exams[0]?.id || defaults.selectedExamId,
      nextExamId,
      microConceptWeaknessPoints: sanitizeWeaknessPoints(parsed.microConceptWeaknessPoints),
      askedRules: Array.isArray(parsed.askedRules) ? parsed.askedRules : defaults.askedRules,
      givenRules: Array.isArray(parsed.givenRules)
        ? upgradeLegacyDefaultGivenRules(parsed.givenRules)
        : defaults.givenRules,
      combineAskedFallback:
        typeof parsed.combineAskedFallback === 'boolean'
          ? parsed.combineAskedFallback
          : defaults.combineAskedFallback,
      combineGivenFallback:
        typeof parsed.combineGivenFallback === 'boolean'
          ? parsed.combineGivenFallback
          : defaults.combineGivenFallback,
      operatorRules: isValidOperatorList(parsed.operatorRules)
        ? parsed.operatorRules
        : defaults.operatorRules,
      solverPathRules: isValidSolverList(parsed.solverPathRules)
        ? parsed.solverPathRules
        : defaults.solverPathRules,
      symbolAliases: isValidAliasList(parsed.symbolAliases)
        ? parsed.symbolAliases
        : defaults.symbolAliases,
      savedAt: typeof parsed.savedAt === 'string' ? parsed.savedAt : null,
    };
  } catch {
    return null;
  }
}

export function clearPersistedTrackerState(): void {
  try {
    window.localStorage.removeItem(TRACKER_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('angles:storage-updated', { detail: { savedAt: null } }));
  } catch {
    // ignore
  }
}

export function buildFullBackupBundle(): string {
  let trackerSuite: unknown = null;
  let noteDrafts: Record<string, { content: string; updatedAt: string }> = {};
  try {
    const rawTracker = window.localStorage.getItem(TRACKER_STORAGE_KEY);
    if (rawTracker) trackerSuite = JSON.parse(rawTracker);
  } catch {
    trackerSuite = null;
  }
  try {
    const rawDrafts = window.localStorage.getItem(NOTE_DRAFTS_STORAGE_KEY);
    if (rawDrafts) noteDrafts = JSON.parse(rawDrafts);
  } catch {
    noteDrafts = {};
  }
  return JSON.stringify(
    {
      format: 'angles-local-backup',
      version: 1,
      exportedAt: new Date().toISOString(),
      trackerSuite,
      noteDrafts,
    },
    null,
    2
  );
}

export function importFullBackupBundle(jsonText: string): {
  ok: boolean;
  message: string;
  draftCount: number;
} {
  try {
    const parsed = JSON.parse(jsonText);
    if (!parsed || typeof parsed !== 'object') {
      return { ok: false, message: 'Invalid JSON backup structure.', draftCount: 0 };
    }
    let importedSomething = false;
    let draftCount = 0;

    // Support both full bundle format and direct trackerSuite format
    if (parsed.trackerSuite && typeof parsed.trackerSuite === 'object') {
      window.localStorage.setItem(TRACKER_STORAGE_KEY, JSON.stringify(parsed.trackerSuite));
      importedSomething = true;
    } else if (parsed.ledgers && typeof parsed.ledgers === 'object') {
      window.localStorage.setItem(TRACKER_STORAGE_KEY, JSON.stringify(parsed));
      importedSomething = true;
    }

    if (parsed.noteDrafts && typeof parsed.noteDrafts === 'object') {
      window.localStorage.setItem(NOTE_DRAFTS_STORAGE_KEY, JSON.stringify(parsed.noteDrafts));
      draftCount = Object.keys(parsed.noteDrafts).length;
      importedSomething = true;
    }

    if (!importedSomething) {
      return {
        ok: false,
        message: 'Backup file did not contain recognized Angles tracker or note draft data.',
        draftCount: 0,
      };
    }

    window.dispatchEvent(new CustomEvent('angles:tracker-reload-storage'));
    window.dispatchEvent(new CustomEvent('angles:storage-updated'));
    return {
      ok: true,
      message: `Backup restored (${draftCount} local note ${draftCount === 1 ? 'draft' : 'drafts'}).`,
      draftCount,
    };
  } catch (err) {
    return {
      ok: false,
      message: `Could not parse backup JSON: ${err instanceof Error ? err.message : 'invalid JSON'}`,
      draftCount: 0,
    };
  }
}

export function getLocalStorageSummary(): {
  enabled: boolean;
  savedAt: string | null;
  trackerBytes: number;
  draftBytes: number;
  chapterCount: number;
  attemptCount: number;
  examCount: number;
  draftCount: number;
  draftKeys: string[];
} {
  const enabled = isLocalStoragePersistenceEnabled();
  let trackerRaw = '';
  let draftsRaw = '';
  try {
    trackerRaw = window.localStorage.getItem(TRACKER_STORAGE_KEY) || '';
    draftsRaw = window.localStorage.getItem(NOTE_DRAFTS_STORAGE_KEY) || '';
  } catch {
    trackerRaw = '';
    draftsRaw = '';
  }

  let savedAt: string | null = null;
  let chapterCount = 0;
  let attemptCount = 0;
  let examCount = 0;
  if (trackerRaw) {
    try {
      const parsed = JSON.parse(trackerRaw) as Partial<PersistedTrackerState>;
      savedAt = typeof parsed.savedAt === 'string' ? parsed.savedAt : null;
      if (parsed.ledgers) {
        chapterCount = Object.keys(parsed.ledgers).length;
        Object.values(parsed.ledgers).forEach((ledger) => {
          Object.values(ledger.concepts || {}).forEach((qMap) => {
            Object.values(qMap || {}).forEach((attempts) => {
              attemptCount += Array.isArray(attempts) ? attempts.length : 0;
            });
          });
        });
      }
      if (Array.isArray(parsed.exams)) {
        examCount = parsed.exams.length;
      }
    } catch {
      // ignore
    }
  }

  let draftKeys: string[] = [];
  if (draftsRaw) {
    try {
      const parsedDrafts = JSON.parse(draftsRaw);
      if (parsedDrafts && typeof parsedDrafts === 'object') {
        draftKeys = Object.keys(parsedDrafts);
      }
    } catch {
      draftKeys = [];
    }
  }

  return {
    enabled,
    savedAt,
    trackerBytes: trackerRaw.length,
    draftBytes: draftsRaw.length,
    chapterCount,
    attemptCount,
    examCount,
    draftCount: draftKeys.length,
    draftKeys,
  };
}
