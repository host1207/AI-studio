import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { TrackerPageOne } from './components/TrackerPageOne';
import {
  buildFullBackupBundle,
  clearPersistedTrackerState,
  getLocalStorageSummary,
  importFullBackupBundle,
  isLocalStoragePersistenceEnabled,
  NOTE_DRAFTS_STORAGE_KEY,
  setLocalStoragePersistenceEnabled,
} from './utils/trackerLocalStorage';
import './tracker-suite.css';

let trackerRoot: Root | null = null;

function ensureMounted() {
  const container = document.getElementById('tracker-root');
  if (!container) return false;
  if (!trackerRoot) {
    container.innerHTML = '';
    trackerRoot = createRoot(container);
    trackerRoot.render(
      <React.StrictMode>
        <TrackerPageOne />
      </React.StrictMode>
    );
  }
  return true;
}

declare global {
  interface Window {
    refreshTracker?: (preferredFolder?: string) => Promise<void>;
    openTrackerScopedCards?: (opts: {
      folder?: string;
      rootMid?: string;
      conceptMid?: string;
      mode?: 'study' | 'shallow';
    }) => Promise<void>;
    openTrackerSection?: (
      view:
        | 'part-1'
        | 'part-2'
        | 'question-index'
        | 'question-cards'
        | 'test-analysis'
        | 'exam-page-1'
        | 'exam-page-2'
        | 'registry',
      chapterCode?: string
    ) => void;
    anglesStorage?: {
      isEnabled: () => boolean;
      setEnabled: (enabled: boolean) => void;
      getSummary: typeof getLocalStorageSummary;
      exportBackup: typeof buildFullBackupBundle;
      importBackup: typeof importFullBackupBundle;
      resetTrackerDefaults: () => void;
      clearNoteDrafts: () => void;
    };
  }
}

window.anglesStorage = {
  isEnabled: isLocalStoragePersistenceEnabled,
  setEnabled: (enabled: boolean) => {
    setLocalStoragePersistenceEnabled(enabled);
    window.dispatchEvent(new CustomEvent('angles:storage-updated'));
  },
  getSummary: getLocalStorageSummary,
  exportBackup: buildFullBackupBundle,
  importBackup: importFullBackupBundle,
  resetTrackerDefaults: () => {
    clearPersistedTrackerState();
    window.dispatchEvent(new CustomEvent('angles:tracker-reset-defaults'));
  },
  clearNoteDrafts: () => {
    try {
      window.localStorage.removeItem(NOTE_DRAFTS_STORAGE_KEY);
    } catch {
      // ignore
    }
    window.dispatchEvent(new CustomEvent('angles:storage-updated'));
  },
};

window.refreshTracker = async (preferredFolder?: string) => {
  ensureMounted();
  if (preferredFolder) {
    const upper = preferredFolder.toUpperCase();
    const code = upper.includes('TRIG')
      ? 'TRG'
      : upper.includes('PRONOUN')
        ? 'PN'
        : upper.includes('TIME')
          ? 'TD'
          : undefined;
    if (code) {
      window.dispatchEvent(
        new CustomEvent('angles:tracker-command', {
          detail: { action: 'select-chapter', chapterCode: code },
        })
      );
    }
  }
};

window.openTrackerSection = (view, chapterCode) => {
  ensureMounted();
  setTimeout(() => {
    window.dispatchEvent(
      new CustomEvent('angles:tracker-command', {
        detail: { action: 'set-view', view, chapterCode },
      })
    );
  }, 15);
};

window.openTrackerScopedCards = async (opts = {}) => {
  ensureMounted();
  setTimeout(() => {
    window.dispatchEvent(
      new CustomEvent('angles:tracker-command', {
        detail: {
          action: 'launch-scoped-cards',
          folder: opts.folder,
          rootMid: opts.rootMid,
          conceptMid: opts.conceptMid,
          mode: opts.mode === 'study' ? 'study' : 'shallow',
        },
      })
    );
  }, 20);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ensureMounted();
  });
} else {
  ensureMounted();
}
