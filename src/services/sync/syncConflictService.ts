export interface TimestampedEntity {
  updated_at: string;
  [key: string]: unknown;
}

export function resolveConflict<T extends TimestampedEntity>(
  localEntity: T,
  remoteEntity: T
): { winningEntity: T; winner: 'local' | 'remote' } {
  const localTime = new Date(localEntity.updated_at).getTime();
  const remoteTime = new Date(remoteEntity.updated_at).getTime();

  // If local timestamp is newer or equal, local wins (preserving user's immediate edits)
  if (localTime >= remoteTime) {
    return { winningEntity: localEntity, winner: 'local' };
  }

  return { winningEntity: remoteEntity, winner: 'remote' };
}
