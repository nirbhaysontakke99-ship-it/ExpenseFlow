import type { FrequencyType } from '@/data/models/RecurringTransaction';
import { getLocalDateString } from './transactionService';

/**
 * Calculates the next occurrence date based on frequency.
 * Handles month-end edge cases (e.g., Jan 31 -> Feb 28 -> Mar 31).
 */
export function calculateNextOccurrenceDate(
  currentDateStr: string,
  frequency: FrequencyType
): string {
  const parts = currentDateStr.split('-').map(Number);
  const year = parts[0];
  const month = parts[1] - 1; // 0-indexed
  const day = parts[2];

  const current = new Date(year, month, day);

  if (frequency === 'daily') {
    current.setDate(current.getDate() + 1);
    return getLocalDateString(current);
  }

  if (frequency === 'weekly') {
    current.setDate(current.getDate() + 7);
    return getLocalDateString(current);
  }

  if (frequency === '28_days') {
    current.setDate(current.getDate() + 28);
    return getLocalDateString(current);
  }

  if (frequency === 'yearly') {
    current.setFullYear(current.getFullYear() + 1);
    return getLocalDateString(current);
  }

  // Monthly Recurrence with Month-End Capping (Jan 31 -> Feb 28/29 -> Mar 31)
  let targetYear = year;
  let targetMonth = month + 1;
  if (targetMonth > 11) {
    targetMonth = 0;
    targetYear += 1;
  }

  // Get max days in target month
  const maxDaysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const targetDay = Math.min(day, maxDaysInTargetMonth);

  const nextDate = new Date(targetYear, targetMonth, targetDay);
  return getLocalDateString(nextDate);
}

/**
 * Checks recurrence status based on next_date compared to today.
 */
export function getOccurrenceStatus(
  nextDateStr: string,
  active: boolean,
  now: Date = new Date()
): 'upcoming' | 'due' | 'overdue' | 'paused' {
  if (!active) return 'paused';

  const todayStr = getLocalDateString(now);

  if (nextDateStr === todayStr) {
    return 'due';
  }

  if (nextDateStr < todayStr) {
    return 'overdue';
  }

  return 'upcoming';
}
