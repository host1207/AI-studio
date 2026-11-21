import type { ChapterLedger } from '../components/TrackerPageOne';
import type {
  DomainItem,
  ChapterItem,
  ExamProfile,
} from '../components/ExamRegistryDashboard';
import type { ExplanationStepItem } from './mkmlStorageScanner';
import type { TestSessionRecord } from '../components/TrackerTestAnalysis';

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

    const exams =
      Array.isArray(parsed.exams) && parsed.exams.length > 0 ? parsed.exams : defaults.exams;
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
    const exams =
      Array.isArray(parsed.exams) && parsed.exams.length > 0 ? parsed.exams : defaults.exams;
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
