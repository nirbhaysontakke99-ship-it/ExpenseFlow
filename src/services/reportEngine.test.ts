import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '@/data/database/db';
import { getPeriodDateRange } from './reportDateService';
import { generateReportData } from './reportService';
import { userRepository } from '@/data/repositories/userRepository';
import { transactionRepository } from '@/data/repositories/transactionRepository';
import { seedDefaultCategories } from '@/data/seed/defaultCategoriesSeed';
import { toPaise } from '@/core/utils/currencyUtils';

describe('Phase 7 Reports & Spending Analytics Engine', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
    await seedDefaultCategories();
  });

  it('1. Calculates Date Ranges correctly', () => {
    const aug16 = new Date(2026, 7, 16);
    const range7d = getPeriodDateRange('7d', undefined, undefined, aug16);
    expect(range7d.totalDays).toBe(7);
    expect(range7d.startDateStr).toBe('2026-08-10');
    expect(range7d.endDateStr).toBe('2026-08-16');

    const rangeThisMonth = getPeriodDateRange('this_month', undefined, undefined, aug16);
    expect(rangeThisMonth.startDateStr).toBe('2026-08-01');
    expect(rangeThisMonth.endDateStr).toBe('2026-08-31');
    expect(rangeThisMonth.totalDays).toBe(31);
  });

  it('2. Aggregates category breakdown, statistics, and MoM comparison', async () => {
    const aug16 = new Date(2026, 7, 16);

    const user = await userRepository.create({
      name: 'Analytics User',
      email: 'auser@example.com',
      currency: 'INR',
      monthly_income: toPaise(25000),
      theme: 'light',
    });

    // August food & transport expenses
    await transactionRepository.create({
      user_id: user.id,
      type: 'expense',
      amount: toPaise(3420), // ₹3,420
      category_id: 'food',
      date: '2026-08-15',
      payment_method: 'UPI',
    });

    await transactionRepository.create({
      user_id: user.id,
      type: 'expense',
      amount: toPaise(2100), // ₹2,100
      category_id: 'transport',
      date: '2026-08-16',
      payment_method: 'Cash',
    });

    // July food expense for MoM comparison (₹2,900)
    await transactionRepository.create({
      user_id: user.id,
      type: 'expense',
      amount: toPaise(2900),
      category_id: 'food',
      date: '2026-07-20',
      payment_method: 'UPI',
    });

    const report = await generateReportData('this_month', undefined, undefined, aug16);

    expect(report.expensesPaise).toBe(toPaise(5520)); // ₹3,420 + ₹2,100 = ₹5,520
    expect(report.categoryBreakdown.length).toBe(2);
    expect(report.categoryBreakdown[0].categoryId).toBe('food');
    expect(report.categoryBreakdown[0].amountPaise).toBe(toPaise(3420));

    // Statistics
    expect(report.statistics.transactionCount).toBe(2);
    expect(report.statistics.highestSpendingDayStr).toBe('2026-08-15');
    expect(report.statistics.highestSpendingDayPaise).toBe(toPaise(3420));

    // MoM comparison: August ₹5,520 vs July ₹2,900
    expect(report.momComparison.hasPreviousData).toBe(true);
    expect(report.momComparison.isIncrease).toBe(true);
    expect(report.momComparison.percentageChange).toBeGreaterThan(0);
  });

  it('3. Handles empty transaction data safely without errors', async () => {
    const report = await generateReportData('this_month');
    expect(report.expensesPaise).toBe(0);
    expect(report.categoryBreakdown.length).toBe(0);
    expect(report.statistics.transactionCount).toBe(0);
    expect(report.statistics.averageDailySpendPaise).toBe(0);
  });
});
