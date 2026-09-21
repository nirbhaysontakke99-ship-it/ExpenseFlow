import { networkService } from '../networkService';
import { getPendingOperations, markOperationSuccess, markOperationFailed } from './syncQueueService';
import { pushSyncQueueItem } from './supabaseAdapter';

export type SyncState = 'synced' | 'syncing' | 'offline' | 'pending' | 'error';

export interface SyncStatusInfo {
  state: SyncState;
  pendingCount: number;
  lastSyncedAt: string | null;
  errorMessage?: string;
}

export type SyncStatusListener = (info: SyncStatusInfo) => void;

class SyncService {
  private currentState: SyncState = 'synced';
  private pendingCount: number = 0;
  private lastSyncedAt: string | null = null;
  private errorMessage?: string;
  private syncInProgress: boolean = false;
  private listeners: Set<SyncStatusListener> = new Set();

  constructor() {
    // Auto-trigger sync on network reconnect
    networkService.subscribe((isOnline) => {
      if (isOnline) {
        this.processSyncQueue();
      } else {
        this.updateState('offline');
      }
    });
  }

  private updateState(state: SyncState, errorMessage?: string) {
    this.currentState = state;
    this.errorMessage = errorMessage;

    const info: SyncStatusInfo = {
      state: this.currentState,
      pendingCount: this.pendingCount,
      lastSyncedAt: this.lastSyncedAt,
      errorMessage: this.errorMessage,
    };

    this.listeners.forEach((l) => l(info));
  }

  public getStatus(): SyncStatusInfo {
    return {
      state: this.currentState,
      pendingCount: this.pendingCount,
      lastSyncedAt: this.lastSyncedAt,
      errorMessage: this.errorMessage,
    };
  }

  public subscribe(listener: SyncStatusListener): () => void {
    this.listeners.add(listener);
    listener(this.getStatus());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public async processSyncQueue(): Promise<void> {
    if (!networkService.isOnline()) {
      const pending = await getPendingOperations();
      this.pendingCount = pending.length;
      this.updateState('offline');
      return;
    }

    if (this.syncInProgress) return;

    this.syncInProgress = true;
    const pending = await getPendingOperations();
    this.pendingCount = pending.length;

    if (this.pendingCount === 0) {
      this.syncInProgress = false;
      this.lastSyncedAt = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      this.updateState('synced');
      return;
    }

    this.updateState('syncing');

    let hasError = false;
    let lastErrorMsg = '';

    for (const item of pending) {
      const result = await pushSyncQueueItem(item);

      if (result.success) {
        await markOperationSuccess(item.id);
      } else {
        hasError = true;
        lastErrorMsg = result.error || 'Sync failed';
        await markOperationFailed(item.id, item.retry_count);
      }
    }

    const remainingPending = await getPendingOperations();
    this.pendingCount = remainingPending.length;
    this.syncInProgress = false;

    if (hasError && this.pendingCount > 0) {
      this.updateState('error', lastErrorMsg);
    } else {
      this.lastSyncedAt = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      this.updateState('synced');
    }
  }
}

export const syncService = new SyncService();
