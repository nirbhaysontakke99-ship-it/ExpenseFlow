import React, { useState, useEffect } from 'react';
import { syncService, type SyncStatusInfo } from '@/services/sync/syncService';
import { RefreshCw, CloudOff, AlertCircle } from 'lucide-react';

export interface SyncStatusIndicatorProps {
  showLabel?: boolean;
  className?: string;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  showLabel = true,
  className = '',
}) => {
  const [status, setStatus] = useState<SyncStatusInfo>(syncService.getStatus());

  useEffect(() => {
    return syncService.subscribe((newStatus) => {
      setStatus(newStatus);
    });
  }, []);

  const handleManualSync = () => {
    syncService.processSyncQueue();
  };

  const { state, pendingCount, errorMessage } = status;

  if (state === 'syncing') {
    return (
      <div
        className={`flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-semibold cursor-pointer ${className}`}
        onClick={handleManualSync}
        title="Syncing with cloud..."
      >
        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        {showLabel && <span>Syncing...</span>}
      </div>
    );
  }

  if (state === 'offline') {
    return (
      <div
        className={`flex items-center gap-1.5 text-xs text-slate-400 font-semibold cursor-pointer ${className}`}
        onClick={handleManualSync}
        title="Offline — changes saved on this device"
      >
        <CloudOff className="w-3.5 h-3.5" />
        {showLabel && <span>Offline</span>}
      </div>
    );
  }

  if (state === 'error') {
    return (
      <button
        onClick={handleManualSync}
        className={`flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-bold hover:underline ${className}`}
        title={errorMessage || 'Sync failed. Click to retry.'}
      >
        <AlertCircle className="w-3.5 h-3.5" />
        {showLabel && <span>Sync Failed (Retry)</span>}
      </button>
    );
  }

  if (pendingCount > 0) {
    return (
      <button
        onClick={handleManualSync}
        className={`flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline ${className}`}
        title={`${pendingCount} pending local changes`}
      >
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        {showLabel && <span>{pendingCount} Pending</span>}
      </button>
    );
  }

  return (
    <div
      className={`flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold cursor-pointer ${className}`}
      onClick={handleManualSync}
      title="All changes synced safely"
    >
      <span className="w-2 h-2 rounded-full bg-emerald-500" />
      {showLabel && <span>Synced</span>}
    </div>
  );
};
