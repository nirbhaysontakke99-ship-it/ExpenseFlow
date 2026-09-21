import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '@/data/database/db';
import { networkService } from './networkService';
import { enqueueOperation, getPendingOperations, markOperationFailed } from './sync/syncQueueService';
import { resolveConflict } from './sync/syncConflictService';
import { syncService } from './sync/syncService';

describe('Phase 11 Offline-First & Cloud Sync Abstraction Engine', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  it('1. Reports network status via networkService', () => {
    expect(typeof networkService.isOnline()).toBe('boolean');
  });

  it('2. Enqueues and deduplicates sync operations in Dexie sync_queue', async () => {
    // Enqueue initial create operation
    const op1 = await enqueueOperation('transaction', 'tx123', 'CREATE', { amount: 25000 });
    expect(op1.entity_id).toBe('tx123');

    // Enqueue identical operation (Deduplication)
    const op2 = await enqueueOperation('transaction', 'tx123', 'CREATE', { amount: 30000 });
    expect(op2.id).toBe(op1.id);

    const pending = await getPendingOperations();
    expect(pending.length).toBe(1);
  });

  it('3. Resolves conflicts using Last-Updated-Wins timestamp policy', () => {
    const localRecord = {
      id: 'tx1',
      amount: 25000,
      updated_at: '2026-08-16T12:00:00Z',
    };

    const olderRemoteRecord = {
      id: 'tx1',
      amount: 20000,
      updated_at: '2026-08-16T11:00:00Z',
    };

    const res1 = resolveConflict(localRecord, olderRemoteRecord);
    expect(res1.winner).toBe('local');
    expect(res1.winningEntity.amount).toBe(25000);

    const newerRemoteRecord = {
      id: 'tx1',
      amount: 40000,
      updated_at: '2026-08-16T13:00:00Z',
    };

    const res2 = resolveConflict(localRecord, newerRemoteRecord);
    expect(res2.winner).toBe('remote');
    expect(res2.winningEntity.amount).toBe(40000);
  });

  it('4. Handles retry limits and marks queue item failed after 3 attempts', async () => {
    const op = await enqueueOperation('goal', 'g100', 'UPDATE', { name: 'Trip' });

    await markOperationFailed(op.id, 0); // Attempt 1 -> retry count 1, status pending
    let pending = await getPendingOperations();
    expect(pending.length).toBe(1);

    await markOperationFailed(op.id, 1); // Attempt 2 -> retry count 2, status pending
    await markOperationFailed(op.id, 2); // Attempt 3 -> retry count 3, status failed

    pending = await getPendingOperations();
    expect(pending.length).toBe(0); // No longer returned as pending
  });

  it('5. Processes sync queue and updates sync state', async () => {
    await syncService.processSyncQueue();
    const status = syncService.getStatus();
    expect(['synced', 'offline']).toContain(status.state);
  });
});
