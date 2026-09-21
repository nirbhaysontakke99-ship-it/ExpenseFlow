import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '@/data/database/db';
import { userRepository } from '@/data/repositories/userRepository';
import { budgetRepository } from '@/data/repositories/budgetRepository';
import { transactionRepository } from '@/data/repositories/transactionRepository';
import { goalRepository } from '@/data/repositories/goalRepository';
import { recurringRepository } from '@/data/repositories/recurringRepository';
import { seedDefaultCategories } from '@/data/seed/defaultCategoriesSeed';
import { toPaise } from '@/core/utils/currencyUtils';
import { fetchDashboardData } from './dashboardService';
import { calculateMoneyHealthScore } from './moneyHealthService';
import { generateSmartInsights } from './insightService';
import { recordOccurrence } from './recurringExpenseService';
import { addContributionToGoal } from './goalService';

describe('Phase 14 End-To-End Integration & Section 35 Cross-Check', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
    await seedDefaultCategories();
  });

  it('Executes complete user journey and verifies 100% financial consistency across all features', async () => {
    // 1. Create User with Income = ₹25,000 (2,500,000 paise)
    const user = await userRepository.create({
      name: 'QA Tester',
      email: 'qatester@expenseflow.app',
      currency: 'INR',
      monthly_income: toPaise(25000),
      theme: 'light',
      onboarding_completed: true,
    });

    // 2. Set overall monthly budget = ₹20,000 (2,000,000 paise) for Aug 2026
    await budgetRepository.upsertBudget({
      user_id: user.id,
      category_id: null,
      amount: toPaise(20000),
      month: 8,
      year: 2026,
    });

    // 3. Create Food category budget = ₹4,000 (400,000 paise)
    await budgetRepository.upsertBudget({
      user_id: user.id,
      category_id: 'food',
      amount: toPaise(4000),
      month: 8,
      year: 2026,
    });

    // 4. Create Goal = ₹8,000 (800,000 paise)
    const goal = await goalRepository.create({
      user_id: user.id,
      name: 'Laptop Fund',
      target_amount: toPaise(8000),
      current_amount: 0,
      target_date: '2026-12-31',
      icon: 'Laptop',
    });

    // 5. Add ₹500 Food expense
    await transactionRepository.create({
      user_id: user.id,
      type: 'expense',
      amount: toPaise(500),
      category_id: 'food',
      date: '2026-08-05',
      payment_method: 'UPI',
      note: 'Dinner with friends',
    });

    // 6. Add ₹300 Transport expense
    await transactionRepository.create({
      user_id: user.id,
      type: 'expense',
      amount: toPaise(300),
      category_id: 'transport',
      date: '2026-08-08',
      payment_method: 'UPI',
      note: 'Cab ride',
    });

    // 7. Add ₹1,000 goal contribution
    await addContributionToGoal(goal.id, toPaise(1000), 'Monthly saving', '2026-08-10');

    // 8. Create ₹6,000 monthly recurring rent
    const recurringRent = await recurringRepository.create({
      user_id: user.id,
      title: 'Apartment Rent',
      amount: toPaise(6000),
      category_id: 'rent',
      frequency: 'monthly',
      next_date: '2026-08-01',
      payment_method: 'Bank Transfer',
      active: true,
    });

    // 9. Record rent occurrence
    await recordOccurrence(recurringRent.id, '2026-08-01');

    // --- 10. VERIFICATION & CROSS-CHECKS ---

    // A. Verify Dashboard Data
    const dashboard = await fetchDashboardData(new Date(2026, 7, 16));
    expect(dashboard).not.toBeNull();
    if (!dashboard) return;

    // Total Expenses = ₹500 + ₹300 + ₹6000 = ₹6,800 (680,000 paise)
    expect(dashboard.monthlyExpensesPaise).toBe(toPaise(6800));

    // Remaining Balance = Income (₹25,000) - Expenses (₹6,800) = ₹18,200 (1,820,000 paise)
    expect(dashboard.remainingBalancePaise).toBe(toPaise(18200));

    // Overall Budget Status = Spent ₹6,800 / Budget ₹20,000 (34% used)
    expect(dashboard.budgetStatus.percentage).toBe(34);
    expect(dashboard.budgetStatus.remainingPaise).toBe(toPaise(13200));
    expect(dashboard.budgetStatus.isExceeded).toBe(false);

    // Safe to Spend = (₹25,000 - ₹6,800) / 16 remaining days = ₹1,137/day
    expect(dashboard.safeToSpend.safeDailySpendPaise).toBeGreaterThan(toPaise(1000));
    expect(dashboard.safeToSpend.status).toBe('healthy');

    // B. Verify Goal Progress
    const updatedGoal = await goalRepository.getById(goal.id);
    expect(updatedGoal?.current_amount).toBe(toPaise(1000)); // ₹1,000 saved out of ₹8,000 (12.5%)

    // C. Verify Money Health Score
    const health = await calculateMoneyHealthScore(new Date(2026, 7, 16));
    expect(health.hasSufficientData).toBe(true);
    expect(health.totalScore).toBeGreaterThanOrEqual(75);
    expect(health.healthLevel).toBe('Healthy');

    // D. Verify Smart Insights
    const insights = await generateSmartInsights(new Date(2026, 7, 16));
    expect(insights.length).toBeGreaterThan(0);
    // Highest spending category should be Rent & Hostel (₹6,000)
    const topCatInsight = insights.find((i) => i.type === 'top_category');
    expect(topCatInsight?.message).toContain('Rent');
  });
});
