import { db } from '@/data/database/db';
import { disablePinLock } from './securityService';

export async function resetAllLocalData(): Promise<void> {
  // 1. Delete IndexedDB database completely
  await db.delete();
  await db.open();

  // 2. Clear local storage settings & PIN
  disablePinLock();
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('ef_privacy_mode');
    localStorage.removeItem('ef_theme');
  }
}
