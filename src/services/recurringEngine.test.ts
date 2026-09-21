import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '@/data/database/db';
import { calculateNextOccurrenceDate } from './recurringDateService';
import { recordOccurrence, skipOccurrence, pauseRecurringExpense, resumeRecurringExpense } from './recurringExpenseService';
import { recurringRepository } from '@/data/repositories/recurringRepository';
import { userRepository } from '@/data/repositories/userRepository';
import { transactionRepository } from '@/data/repositories/transactionRepository';
import { seedDefaultCategories } from '@/data/seed/defaultCategoriesSeed';
import { toPaise } from '@/core/utils/currencyUtils';

describe('Phase 9 Recurring Expenses Engine', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
    await seedDefaultCategories();
  });

  it('1. Calculates next occurrence dates correctly for all frequencies', () => {
    // Daily
    expect(calculateNextOccurrenceDate('2026-08-01', 'daily')).toBe('2026-08-02');

    // Weekly
    expect(calculateNextOccurrenceDate('2026-08-01', 'weekly')).toBe('2026-08-08');

    // 28 days
    expect(calculateNextOccurrenceDate('2026-08-01', '28_days')).toBe('2026-08-29');

    // Monthly normal
    expect(calculateNextOccurrenceDate('2026-08-01', 'monthly')).toBe('2026-09-01');

    // Monthly Month-End Capping (Jan 31 -> Feb 28 in non-leap year)
    expect(calculateNextOccurrenceDate('2026-01-31', 'monthly')).toBe('2026-02-28');
  });

  it('2. Records occurrence as active transaction and updates next_date', async () => {
    const user = await userRepository.create({
      name: 'Recurring User',
      email: 'ruser@example.com',
      currency: 'INR',
      monthly_income: toPaise(30000),
      theme: 'light',
    });

    const rule = await recurringRepository.create({
      user_id: user.id,
      title: 'Rent',
      amount: toPaise(6000),
      category_id: 'rent',
      frequency: 'monthly',
      next_date: '2026-08-01',
      payment_method: 'UPI',
      active: true,
    });

    // Record Rent occurrence
    await recordOccurrence(rule.id, '2026-08-01');

    // Check updated rule
    const updatedRule = await recurringRepository.getById(rule.id);
    expect(updatedRule?.next_date).toBe('2026-09-01');

    // Check recorded transaction
    const txs = await transactionRepository.getAllByUserId(user.id);
    expect(txs.length).toBe(1);
    expect(txs[0].amount).toBe(toPaise(6000));
    expect(txs[0].note).toBe('Rent');
  });

  it('3. Skips occurrence without creating transaction', async () => {
    const user = await userRepository.create({
      name: 'Recurring User 2',
      email: 'ruser2@example.com',
      currency: 'INR',
      monthly_income: toPaise(30000),
      theme: 'light',
    });

    const rule = await recurringRepository.create({
      user_id: user.id,
      title: 'Mobile Recharge',
      amount: toPaise(299),
      category_id: 'recharge',
      frequency: '28_days',
      next_date: '2026-08-01',
      payment_method: 'UPI',
      active: true,
    });

    await skipOccurrence(rule.id, '2026-08-01');

    const updatedRule = await recurringRepository.getById(rule.id);
    expect(updatedRule?.next_date).toBe('2026-08-29');

    const txs = await transactionRepository.getAllByUserId(user.id);
    expect(txs.length).toBe(0); // No transaction created on skip
  });

  it('4. Pauses and resumes recurring expense rule', async () => {
    const user = await userRepository.create({
      name: 'Recurring User 3',
      email: 'ruser3@example.com',
      currency: 'INR',
      monthly_income: toPaise(30000),
      theme: 'light',
    });

    const rule = await recurringRepository.create({
      user_id: user.id,
      title: 'Netflix Subscription',
      amount: toPaise(199),
      category_id: 'entertainment',
      frequency: 'monthly',
      next_date: '2026-08-01',
      payment_method: 'UPI',
      active: true,
    });

    // Pause
    await pauseRecurringExpense(rule.id);
    let updated = await recurringRepository.getById(rule.id);
    expect(updated?.active).toBe(false);

    // Resume
    await resumeRecurringExpense(rule.id);
    updated = await recurringRepository.getById(rule.id);
    expect(updated?.active).toBe(true);
  });
});
