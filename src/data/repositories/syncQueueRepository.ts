import { db } from '../database/db';
import type { SyncQueueItem, CreateSyncQueueInput, SyncStatus } from '../models/SyncQueueItem';

export const syncQueueRepository = {
  async add(input: CreateSyncQueueInput): Promise<SyncQueueItem> {
    const item: SyncQueueItem = {
      id: crypto.randomUUID(),
      ...input,
      retry_count: input.retry_count || 0,
      status: input.status || 'pending',
      created_at: new Date().toISOString(),
    };
    await db.sync_queue.add(item);
    return item;
  },

  async getPending(): Promise<SyncQueueItem[]> {
    return await db.sync_queue.where('status').equals('pending').toArray();
  },

  async updateStatus(id: string, status: SyncStatus, retryCount?: number): Promise<void> {
    const updates: Partial<SyncQueueItem> = { status };
    if (retryCount !== undefined) {
      updates.retry_count = retryCount;
    }
    await db.sync_queue.update(id, updates);
  },

  async clearSynced(): Promise<number> {
    const synced = await db.sync_queue.where('status').equals('synced').toArray();
    const ids = synced.map((s) => s.id);
    await db.sync_queue.bulkDelete(ids);
    return ids.length;
  },
};
