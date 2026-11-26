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

interface TrackerBoundaryState {
  error: Error | null;
}

class TrackerErrorBoundary extends React.Component<
  { children: React.ReactNode },
  TrackerBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): TrackerBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error) {
    window.__ANGLES_TRACKER_ERROR__ = error?.message || String(error);
    console.error('[Angles] Tracker suite runtime error:', error);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            maxWidth: '720px',
            margin: '32px auto',
            padding: '24px',
            background: '#fff',
            border: '1px solid #fecaca',
            borderRadius: '10px',
            fontFamily: 'Inter, system-ui, sans-serif',
            color: '#171817',
          }}
        >
          <div
            style={{
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: '#dc2626',
              marginBottom: '8px',
            }}
          >
            PAGES 08–10 RENDER ERROR
          </div>
          <h2 style={{ fontSize: '20px', margin: '0 0 8px' }}>
            Tracker / Exam Info / Registry hit an unexpected error
          </h2>
          <p style={{ fontSize: '13px', color: '#57534e', margin: '0 0 14px' }}>
            {this.state.error.message || 'Unknown rendering error'}
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                padding: '9px 14px',
                borderRadius: '6px',
                border: '1px solid #2457ff',
                background: '#2457ff',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reload Page
            </button>
            <button
              type="button"
              onClick={() => {
                clearPersistedTrackerState();
                window.location.reload();
              }}
              style={{
                padding: '9px 14px',
                borderRadius: '6px',
                border: '1px solid #d8d8d1',
                background: '#f5f4ef',
                color: '#171817',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Clear Browser Cache &amp; Reload (Disk Data Safe)
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

let trackerRoot: Root | null = null;

function ensureMounted() {
  const container = document.getElementById('tracker-root');
  if (!container) return false;
  if (!trackerRoot) {
    try {
      container.innerHTML = '';
      trackerRoot = createRoot(container);
      trackerRoot.render(
        <React.StrictMode>
          <TrackerErrorBoundary>
            <TrackerPageOne />
          </TrackerErrorBoundary>
        </React.StrictMode>
      );
      window.__ANGLES_TRACKER_MOUNTED__ = true;
      window.__ANGLES_TRACKER_ERROR__ = null;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      window.__ANGLES_TRACKER_MOUNTED__ = false;
      window.__ANGLES_TRACKER_ERROR__ = msg;
      console.error('[Angles] Failed to mount tracker suite:', error);
      if (typeof window.__anglesTrackerLoadFailed === 'function') {
        window.__anglesTrackerLoadFailed(msg);
      }
      return false;
    }
  }
  return true;
}

declare global {
  interface Window {
    __ANGLES_TRACKER_MOUNTED__?: boolean;
    __ANGLES_TRACKER_ERROR__?: string | null;
    __anglesTrackerLoadFailed?: (reason?: string) => void;
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
        | 'qiq'
        | 'tester'
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
      : upper.includes('PRONOUN NEW')
        ? 'PN'
        : upper.includes('PHRASES')
          ? 'PC'
          : upper.includes('TENSES')
            ? 'TE'
            : upper.includes('SUBJECT')
              ? 'SVA'
              : upper.includes('VERB')
                ? 'VB'
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
