import { syncQueueRepository } from '@/data/repositories/syncQueueRepository';
import type { EntityType, SyncOperation, SyncQueueItem } from '@/data/models/SyncQueueItem';

export async function enqueueOperation(
  entityType: EntityType,
  entityId: string,
  operation: SyncOperation,
  payload: Record<string, unknown> = {}
): Promise<SyncQueueItem> {
  const pending = await syncQueueRepository.getPending();

  // Deduplicate queue: if an identical pending operation exists, update its payload
  const existing = pending.find(
    (item) => item.entity_type === entityType && item.entity_id === entityId && item.operation === operation
  );

  if (existing) {
    await syncQueueRepository.updateStatus(existing.id, 'pending', existing.retry_count);
    return existing;
  }

  return await syncQueueRepository.add({
    entity_type: entityType,
    entity_id: entityId,
    operation,
    payload,
  });
}

export async function getPendingOperations(): Promise<SyncQueueItem[]> {
  return await syncQueueRepository.getPending();
}

export async function markOperationSuccess(queueItemId: string): Promise<void> {
  await syncQueueRepository.updateStatus(queueItemId, 'synced');
  await syncQueueRepository.clearSynced();
}

export async function markOperationFailed(
  queueItemId: string,
  currentRetryCount: number
): Promise<void> {
  const newRetryCount = currentRetryCount + 1;
  const newStatus = newRetryCount >= 3 ? 'failed' : 'pending';
  await syncQueueRepository.updateStatus(queueItemId, newStatus, newRetryCount);
}
