import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '@/data/database/db';
import { calculateBudgetStatus, getOverallBudgetDetail } from './budgetService';
import { userRepository } from '@/data/repositories/userRepository';
import { budgetRepository } from '@/data/repositories/budgetRepository';
import { transactionRepository } from '@/data/repositories/transactionRepository';
import { seedDefaultCategories } from '@/data/seed/defaultCategoriesSeed';
import { toPaise } from '@/core/utils/currencyUtils';

describe('Phase 6 Budget Management System Engine', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
    await seedDefaultCategories();
  });

  it('1. Calculates overall budget status (₹23,500 budget, ₹16,840 spent)', () => {
    const result = calculateBudgetStatus(toPaise(16840), toPaise(23500));
    expect(result.spentPaise).toBe(1684000);
    expect(result.budgetPaise).toBe(2350000);
    expect(result.remainingPaise).toBe(666000);
    expect(result.percentage).toBe(72);
    expect(result.status).toBe('warning'); // 72% is in >70-90% warning range
    expect(result.isExceeded).toBe(false);
  });

  it('2. Calculates category budget status (₹4,000 budget, ₹3,420 spent)', () => {
    const result = calculateBudgetStatus(toPaise(3420), toPaise(4000));
    expect(result.remainingPaise).toBe(58000);
    expect(result.percentage).toBe(86);
    expect(result.status).toBe('warning');
  });

  it('3. Handles budget thresholds (0%, 50%, 70%, 90%, 100%, 125% exceeded)', () => {
    // 0%
    const b0 = calculateBudgetStatus(0, toPaise(5000));
    expect(b0.percentage).toBe(0);
    expect(b0.status).toBe('healthy');

    // 50%
    const b50 = calculateBudgetStatus(toPaise(2500), toPaise(5000));
    expect(b50.percentage).toBe(50);
    expect(b50.status).toBe('healthy');

    // 75%
    const b75 = calculateBudgetStatus(toPaise(3750), toPaise(5000));
    expect(b75.status).toBe('warning');

    // 95%
    const b95 = calculateBudgetStatus(toPaise(4750), toPaise(5000));
    expect(b95.status).toBe('danger');

    // 125% Exceeded
    const b125 = calculateBudgetStatus(toPaise(6250), toPaise(5000));
    expect(b125.status).toBe('exceeded');
    expect(b125.isExceeded).toBe(true);
    expect(b125.overAmountPaise).toBe(toPaise(1250));
  });

  it('4. Handles zero budget safely without NaN or Infinity', () => {
    const bZero = calculateBudgetStatus(toPaise(500), 0);
    expect(bZero.percentage).toBe(0);
    expect(isNaN(bZero.percentage)).toBe(false);
    expect(isFinite(bZero.percentage)).toBe(true);
    expect(bZero.statusText).toBe('No budget set');
  });

  it('5. Ignores soft-deleted transactions and isolated months', async () => {
    const user = await userRepository.create({
      name: 'Budget Test User',
      email: 'buser@example.com',
      currency: 'INR',
      monthly_income: toPaise(30000),
      theme: 'light',
    });

    // Create August budget
    await budgetRepository.upsertBudget({
      user_id: user.id,
      category_id: null,
      amount: toPaise(20000),
      month: 8,
      year: 2026,
    });

    // August active transaction
    await transactionRepository.create({
      user_id: user.id,
      type: 'expense',
      amount: toPaise(5000),
      category_id: 'food',
      date: '2026-08-16',
      payment_method: 'UPI',
    });

    // July transaction (Must NOT count toward August)
    await transactionRepository.create({
      user_id: user.id,
      type: 'expense',
      amount: toPaise(8000),
      category_id: 'food',
      date: '2026-07-20',
      payment_method: 'UPI',
    });

    // Soft deleted August transaction (Must NOT count)
    const deletedTx = await transactionRepository.create({
      user_id: user.id,
      type: 'expense',
      amount: toPaise(3000),
      category_id: 'food',
      date: '2026-08-10',
      payment_method: 'Cash',
    });
    await transactionRepository.softDelete(deletedTx.id);

    const augOverall = await getOverallBudgetDetail(user.id, 8, 2026);
    expect(augOverall.spentPaise).toBe(toPaise(5000)); // Only ₹5,000 active Aug expense counted
    expect(augOverall.status.remainingPaise).toBe(toPaise(15000));
  });
});
