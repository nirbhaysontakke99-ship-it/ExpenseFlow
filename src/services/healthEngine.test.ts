import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '@/data/database/db';
import { calculateMoneyHealthScore } from './moneyHealthService';
import { generateSmartInsights } from './insightService';
import { userRepository } from '@/data/repositories/userRepository';
import { transactionRepository } from '@/data/repositories/transactionRepository';
import { budgetRepository } from '@/data/repositories/budgetRepository';
import { seedDefaultCategories } from '@/data/seed/defaultCategoriesSeed';
import { toPaise } from '@/core/utils/currencyUtils';

describe('Phase 10 Smart Insights & Money Health Score Engine', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
    await seedDefaultCategories();
  });

  it('1. Returns insufficient data result when < 3 transactions exist', async () => {
    const user = await userRepository.create({
      name: 'New Health User',
      email: 'huser@example.com',
      currency: 'INR',
      monthly_income: toPaise(30000),
      theme: 'light',
    });

    // Add only 1 transaction
    await transactionRepository.create({
      user_id: user.id,
      type: 'expense',
      amount: toPaise(250),
      category_id: 'food',
      date: '2026-08-16',
      payment_method: 'UPI',
    });

    const result = await calculateMoneyHealthScore();
    expect(result.hasSufficientData).toBe(false);
    expect(result.howToImprove[0]).toContain('Add a few transactions');
  });

  it('2. Calculates Money Health score (0-100) and factors accurately when data exists', async () => {
    const user = await userRepository.create({
      name: 'Active Health User',
      email: 'activehuser@example.com',
      currency: 'INR',
      monthly_income: toPaise(40000),
      theme: 'light',
    });

    // Create overall budget of ₹25,000
    await budgetRepository.upsertBudget({
      user_id: user.id,
      category_id: null,
      amount: toPaise(25000),
      month: 8,
      year: 2026,
    });

    // Add 4 expenses totalling ₹12,000 (well within ₹25,000 budget, ₹28,000 saved)
    await transactionRepository.create({
      user_id: user.id,
      type: 'expense',
      amount: toPaise(3000),
      category_id: 'rent',
      date: '2026-08-01',
      payment_method: 'UPI',
    });
    await transactionRepository.create({
      user_id: user.id,
      type: 'expense',
      amount: toPaise(3000),
      category_id: 'food',
      date: '2026-08-05',
      payment_method: 'UPI',
    });
    await transactionRepository.create({
      user_id: user.id,
      type: 'expense',
      amount: toPaise(3000),
      category_id: 'groceries',
      date: '2026-08-10',
      payment_method: 'UPI',
    });
    await transactionRepository.create({
      user_id: user.id,
      type: 'expense',
      amount: toPaise(3000),
      category_id: 'transport',
      date: '2026-08-15',
      payment_method: 'UPI',
    });

    const result = await calculateMoneyHealthScore(new Date(2026, 7, 16));
    expect(result.hasSufficientData).toBe(true);
    expect(result.totalScore).toBeGreaterThanOrEqual(0);
    expect(result.totalScore).toBeLessThanOrEqual(100);
    expect(result.factors.length).toBe(5);
    expect(result.healthLevel).toBe('Healthy');
  });

  it('3. Generates ranked smart insights using significance thresholds', async () => {
    const user = await userRepository.create({
      name: 'Insight User',
      email: 'iuser@example.com',
      currency: 'INR',
      monthly_income: toPaise(20000),
      theme: 'light',
    });

    // Budget ₹10,000
    await budgetRepository.upsertBudget({
      user_id: user.id,
      category_id: null,
      amount: toPaise(10000),
      month: 8,
      year: 2026,
    });

    // Expenses ₹12,000 (Exceeded budget)
    await transactionRepository.create({
      user_id: user.id,
      type: 'expense',
      amount: toPaise(12000),
      category_id: 'food',
      date: '2026-08-10',
      payment_method: 'UPI',
    });

    const insights = await generateSmartInsights(new Date(2026, 7, 16));
    expect(insights.length).toBeGreaterThan(0);
    // Highest priority insight should be budget exceeded (priority 1)
    expect(insights[0].type).toBe('budget_exceeded');
    expect(insights[0].severity).toBe('danger');
  });
});
