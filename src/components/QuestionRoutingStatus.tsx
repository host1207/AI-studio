import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  GitBranch,
} from 'lucide-react';

export type QuestionRoutingStatusType = 'Pending' | 'Verified' | 'Sync Error';

export interface QuestionRoutingStatusState {
  status: QuestionRoutingStatusType;
  detail: string;
  targetPath?: string;
  addedIds?: string[];
  questionCount?: number;
  updatedAt?: string;
  source?: 'question-index' | 'disk-sync' | 'step-save';
}

interface QuestionRoutingStatusProps {
  routingState: QuestionRoutingStatusState;
  scannedFileCount: number;
  chapterCode: string;
  onVerifySync: () => void;
  isSyncing: boolean;
}

const STATUS_STYLE_MAP: Record<
  QuestionRoutingStatusType,
  {
    container: string;
    badge: string;
    dot: string;
    iconColor: string;
    subtext: string;
  }
> = {
  Pending: {
    container: 'bg-[#FFFBEB] border-[#FDE68A]',
    badge: 'bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]',
    dot: 'bg-[#F59E0B] animate-pulse',
    iconColor: 'text-[#D97706]',
    subtext: 'text-[#92400E]',
  },
  Verified: {
    container: 'bg-[#F0FDF4] border-[#BBF7D0]',
    badge: 'bg-[#DCFCE7] text-[#166534] border-[#22C55E]',
    dot: 'bg-[#16A34A]',
    iconColor: 'text-[#15803D]',
    subtext: 'text-[#166534]',
  },
  'Sync Error': {
    container: 'bg-[#FEF2F2] border-[#FECACA]',
    badge: 'bg-[#FEE2E2] text-[#991B1B] border-[#EF4444]',
    dot: 'bg-[#DC2626]',
    iconColor: 'text-[#DC2626]',
    subtext: 'text-[#991B1B]',
  },
};

function formatSyncTime(iso?: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export const QuestionRoutingStatus: React.FC<QuestionRoutingStatusProps> = ({
  routingState,
  scannedFileCount,
  chapterCode,
  onVerifySync,
  isSyncing,
}) => {
  const { status, detail, targetPath, addedIds, updatedAt } = routingState;
  const styles = STATUS_STYLE_MAP[status];
  const formattedTime = formatSyncTime(updatedAt);

  return (
    <div
      role="status"
      aria-live="polite"
      data-routing-status={status}
      className={`w-full border rounded-lg px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs transition-colors ${styles.container}`}
    >
      {/* Left: Label + Status Badge + Live Detail */}
      <div className="flex flex-wrap items-center gap-2.5 min-w-0">
        <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#4B5563] font-bold shrink-0">
          <GitBranch className={`w-3.5 h-3.5 ${styles.iconColor}`} />
          <span>QUESTION ROUTING STATUS</span>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border text-xs font-mono font-bold shrink-0 ${styles.badge}`}
        >
          <span className={`w-2 h-2 rounded-full ${styles.dot}`} />
          {status === 'Verified' && <CheckCircle2 className="w-3.5 h-3.5" />}
          {status === 'Pending' && <Clock className="w-3.5 h-3.5" />}
          {status === 'Sync Error' && <AlertTriangle className="w-3.5 h-3.5" />}
          <span>{status}</span>
        </span>

        <span className={`text-xs font-mono font-medium break-words ${styles.subtext}`}>
          {detail}
        </span>

        {targetPath && (
          <span className="px-2 py-0.5 text-[11px] font-mono font-semibold bg-white/80 text-[#1D4ED8] border border-[#BFDBFE] rounded">
            Path: {targetPath}
          </span>
        )}

        {addedIds && addedIds.length > 0 && (
          <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-white/80 text-[#15803D] border border-[#BBF7D0] rounded">
            IDs: {addedIds.slice(0, 4).join(', ')}
            {addedIds.length > 4 ? ` +${addedIds.length - 4} more` : ''}
          </span>
        )}
      </div>

      {/* Right: Synced File Count + Timestamp + Manual Re-verify Button */}
      <div className="flex items-center gap-2.5 text-[11px] font-mono shrink-0">
        <span className="hidden sm:inline text-[#4B5563]">
          Pool: <strong>{chapterCode}</strong> · {scannedFileCount} disk file
          {scannedFileCount === 1 ? '' : 's'}
        </span>

        {formattedTime && (
          <span className="text-[#6B7280]" title="Last routing check time">
            {formattedTime}
          </span>
        )}

        <button
          type="button"
          onClick={onVerifySync}
          disabled={isSyncing}
          className="px-2.5 py-1 bg-white hover:bg-[#F9F8F4] disabled:opacity-50 text-[#111827] border border-[#D1CFC7] rounded text-[11px] font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Re-scan chapter HTML files from disk to verify question routing"
        >
          <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-[#1D4ED8]' : 'text-[#4B5563]'}`} />
          <span>{status === 'Sync Error' ? 'Retry Sync' : 'Verify Disk'}</span>
        </button>
      </div>
    </div>
  );
};
