import { recurringRepository } from '@/data/repositories/recurringRepository';
import { transactionRepository } from '@/data/repositories/transactionRepository';
import { calculateNextOccurrenceDate, getOccurrenceStatus } from './recurringDateService';
import { getLocalDateString } from './transactionService';
import type { RecurringTransaction } from '@/data/models/RecurringTransaction';

export interface PendingOccurrence {
  occurrenceId: string; // `${recurringId}_${scheduledDate}`
  recurringRule: RecurringTransaction;
  scheduledDate: string;
  status: 'due' | 'overdue';
}

// In-memory set of processed occurrence IDs during the app session to prevent duplicate processing
const processedOccurrencesSet = new Set<string>();

/**
 * Checks for all due or overdue occurrences across active recurring expense rules.
 */
export async function getDueOrOverdueOccurrences(
  userId: string,
  now: Date = new Date()
): Promise<PendingOccurrence[]> {
  const rules = await recurringRepository.getByUserId(userId);
  const activeRules = rules.filter((r) => r.active);

  const pending: PendingOccurrence[] = [];

  for (const rule of activeRules) {
    const status = getOccurrenceStatus(rule.next_date, rule.active, now);

    if (status === 'due' || status === 'overdue') {
      const occurrenceId = `${rule.id}_${rule.next_date}`;

      if (!processedOccurrencesSet.has(occurrenceId)) {
        pending.push({
          occurrenceId,
          recurringRule: rule,
          scheduledDate: rule.next_date,
          status,
        });
      }
    }
  }

  // Sort by earliest scheduled date first
  pending.sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));

  return pending;
}

/**
 * Records a recurring occurrence as an active Expense transaction in Dexie IndexedDB.
 * Updates next_date for the recurring rule and marks occurrence as processed.
 */
export async function recordOccurrence(
  recurringId: string,
  scheduledDate: string,
  overridePaymentMethod?: string,
  overrideNote?: string
) {
  const occurrenceId = `${recurringId}_${scheduledDate}`;

  // 1. Duplicate Prevention
  if (processedOccurrencesSet.has(occurrenceId)) {
    console.warn(`Occurrence ${occurrenceId} already processed.`);
    return;
  }

  const rule = await recurringRepository.getById(recurringId);
  if (!rule) return;

  // 2. Create standard transaction
  await transactionRepository.create({
    user_id: rule.user_id,
    type: 'expense',
    amount: rule.amount,
    category_id: rule.category_id,
    payment_method: overridePaymentMethod || rule.payment_method,
    note: overrideNote || rule.title,
    date: scheduledDate || getLocalDateString(),
  });

  // 3. Mark occurrence as processed
  processedOccurrencesSet.add(occurrenceId);

  // 4. Calculate next occurrence date
  const nextDate = calculateNextOccurrenceDate(rule.next_date, rule.frequency);

  // 5. Update recurring rule next_date
  await recurringRepository.update(recurringId, {
    next_date: nextDate,
  });
}

/**
 * Skips a recurring occurrence without creating an Expense transaction.
 * Advances next_date to next scheduled occurrence.
 */
export async function skipOccurrence(recurringId: string, scheduledDate: string) {
  const occurrenceId = `${recurringId}_${scheduledDate}`;
  processedOccurrencesSet.add(occurrenceId);

  const rule = await recurringRepository.getById(recurringId);
  if (!rule) return;

  const nextDate = calculateNextOccurrenceDate(rule.next_date, rule.frequency);

  await recurringRepository.update(recurringId, {
    next_date: nextDate,
  });
}

/**
 * Pauses a recurring expense rule.
 */
export async function pauseRecurringExpense(recurringId: string) {
  await recurringRepository.toggleActive(recurringId, false);
}

/**
 * Resumes a paused recurring expense rule.
 */
export async function resumeRecurringExpense(recurringId: string) {
  const rule = await recurringRepository.getById(recurringId);
  if (!rule) return;

  const todayStr = getLocalDateString();
  const nextDate = rule.next_date < todayStr ? todayStr : rule.next_date;

  await recurringRepository.update(recurringId, {
    active: true,
    next_date: nextDate,
  });
}
