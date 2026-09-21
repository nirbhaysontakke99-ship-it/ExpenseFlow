export type EntityType = 
  | 'user' 
  | 'transaction' 
  | 'category' 
  | 'budget' 
  | 'goal' 
  | 'recurring_transaction' 
  | 'goal_contribution';

export type SyncOperation = 'CREATE' | 'UPDATE' | 'DELETE';
export type SyncStatus = 'pending' | 'processing' | 'failed' | 'synced';

export interface SyncQueueItem {
  id: string;
  entity_type: EntityType;
  entity_id: string;
  operation: SyncOperation;
  payload: Record<string, unknown>;
  created_at: string;
  retry_count: number;
  status: SyncStatus;
}

export type CreateSyncQueueInput = Omit<SyncQueueItem, 'id' | 'created_at' | 'retry_count' | 'status'> & {
  retry_count?: number;
  status?: SyncStatus;
};
