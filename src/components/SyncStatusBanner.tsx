/**
 * Accessible, Plural-Aware Sync & Network Status Banner.
 * Complies with W3C WAI-ARIA standards: role="status" and aria-live="polite".
 */

import React from 'react';
import { useI18n } from '../lib/i18nContext';
import { Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';

interface SyncStatusBannerProps {
  isOnline: boolean;
  pendingCount: number;
  deadLetterCount: number;
  isSyncing: boolean;
  onSyncNow: () => void;
  latencyMs?: number | null;
}

export const SyncStatusBanner: React.FC<SyncStatusBannerProps> = ({
  isOnline,
  pendingCount,
  deadLetterCount,
  isSyncing,
  onSyncNow,
  latencyMs,
}) => {
  const { language } = useI18n();

  // If online with 0 pending and 0 failed actions, keep interface clean
  if (isOnline && pendingCount === 0 && deadLetterCount === 0) {
    return null;
  }

  // ICU-style pluralization helper across supported languages
  const formatPendingMessage = (count: number, lang: string): string => {
    switch (lang) {
      case 'hi':
        return count === 1
          ? `1 कार्रवाई ऑफ़लाइन कतार में है`
          : `${count} कार्रवाइयां ऑफ़लाइन कतार में हैं`;
      case 'pt':
        return count === 1
          ? `1 ação pendente para sincronização`
          : `${count} ações pendentes para sincronização`;
      case 'ar':
        if (count === 1) return `إجراء واحد معلق للمزامنة`;
        if (count === 2) return `إجراءان معلقان للمزامنة`;
        if (count >= 3 && count <= 10) return `${count} إجراءات معلقة للمزامنة`;
        return `${count} إجراء معلق للمزامنة`;
      case 'ru': {
        const mod10 = count % 10;
        const mod100 = count % 100;
        if (mod10 === 1 && mod100 !== 11) {
          return `${count} действие в очереди синхронизации`;
        }
        if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
          return `${count} действия в очереди синхронизации`;
        }
        return `${count} действий в очереди синхронизации`;
      }
      case 'zh':
        return `${count} 个操作等待同步`;
      case 'es':
        return count === 1
          ? `1 acción pendiente de sincronización`
          : `${count} acciones pendientes de sincronización`;
      case 'en':
      default:
        return count === 1
          ? `1 action queued for synchronization`
          : `${count} actions queued for synchronization`;
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`w-full px-4 py-2 text-xs md:text-sm font-medium transition-colors shadow-sm flex flex-wrap items-center justify-between gap-2 ${
        !isOnline
          ? 'bg-amber-600 text-white'
          : deadLetterCount > 0
          ? 'bg-red-700 text-white'
          : 'bg-emerald-700 text-white'
      }`}
    >
      <div className="flex items-center gap-2">
        {!isOnline ? (
          <WifiOff className="w-4 h-4 animate-pulse shrink-0" />
        ) : (
          <Wifi className="w-4 h-4 shrink-0" />
        )}

        <span>
          {!isOnline ? (
            <span>
              <strong>Field Offline Mode:</strong> {formatPendingMessage(pendingCount, language)}
            </span>
          ) : isSyncing ? (
            <span className="flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Replaying queued field actions...
            </span>
          ) : (
            <span>
              <strong>Network Restored:</strong> {formatPendingMessage(pendingCount, language)}
              {latencyMs ? ` (${latencyMs}ms latency)` : ''}
            </span>
          )}
        </span>

        {deadLetterCount > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-900/60 text-white text-[11px] font-semibold">
            <AlertTriangle className="w-3 h-3" />
            {deadLetterCount} failed
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {isOnline && pendingCount > 0 && (
          <button
            onClick={onSyncNow}
            disabled={isSyncing}
            className="px-2.5 py-1 bg-white text-emerald-900 hover:bg-emerald-50 rounded text-xs font-semibold flex items-center gap-1 shadow-xs transition"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync Now
          </button>
        )}
      </div>
    </div>
  );
};
