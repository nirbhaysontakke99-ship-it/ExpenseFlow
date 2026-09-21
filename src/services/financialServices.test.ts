import { describe, it, expect } from 'vitest';
import { getRemainingDaysInMonth, calculateSafeToSpend } from './safeToSpendService';
import { calculateBudgetStatus } from './budgetService';
import { toPaise } from '@/core/utils/currencyUtils';

describe('Financial Calculation Engines (Phase 4)', () => {
  it('1. Calculates remaining days in month correctly (including today)', () => {
    // Aug 16, 2026 -> 31 days total -> 31 - 16 + 1 = 16 remaining days
    const aug16 = new Date(2026, 7, 16);
    expect(getRemainingDaysInMonth(aug16)).toBe(16);

    // Aug 31, 2026 -> last day -> 1 remaining day
    const aug31 = new Date(2026, 7, 31);
    expect(getRemainingDaysInMonth(aug31)).toBe(1);
  });

  it('2. Calculates Safe-To-Spend for positive balance (Healthy Case 1)', () => {
    const aug16 = new Date(2026, 7, 16); // 16 days left
    const result = calculateSafeToSpend({
      incomePaise: toPaise(25000),
      expensesPaise: toPaise(5000),
      committedExpensesPaise: toPaise(2000),
      savingsAllocationsPaise: toPaise(3000),
      hasConfiguredIncome: true,
      hasConfiguredBudget: true,
      currentDate: aug16,
    });

    // Discretionary = 25000 - 5000 - 2000 - 3000 = 15000 rupees (1500000 paise)
    // 1500000 / 16 days = 93750 paise/day (₹937/day)
    expect(result.discretionaryRemainingPaise).toBe(1500000);
    expect(result.safeDailySpendPaise).toBe(93750);
    expect(result.daysRemaining).toBe(16);
    expect(result.status).toBe('healthy');
    expect(result.statusText).toContain("on track");
  });

  it('3. Handles low daily amount (< ₹100/day) as Caution (Case 2)', () => {
    const aug16 = new Date(2026, 7, 16); // 16 days left
    const result = calculateSafeToSpend({
      incomePaise: toPaise(10000),
      expensesPaise: toPaise(8800),
      hasConfiguredIncome: true,
      hasConfiguredBudget: true,
      currentDate: aug16,
    });

    // Discretionary = 1200 rupees (120000 paise)
    // 120000 / 16 days = 7500 paise/day (₹75/day < ₹100)
    expect(result.safeDailySpendPaise).toBe(7500);
    expect(result.status).toBe('caution');
    expect(result.statusText).toBe('Keep an eye on spending');
  });

  it('4. Handles negative discretionary balance (Over budget Case 4)', () => {
    const result = calculateSafeToSpend({
      incomePaise: toPaise(10000),
      expensesPaise: toPaise(11240),
      hasConfiguredIncome: true,
      hasConfiguredBudget: true,
    });

    expect(result.discretionaryRemainingPaise).toBe(-124000);
    expect(result.safeDailySpendPaise).toBe(0);
    expect(result.status).toBe('overspending');
    expect(result.overAmountPaise).toBe(124000);
    expect(result.statusText).toBe("You're over budget");
  });

  it('5. Handles no income configured (Case 5)', () => {
    const result = calculateSafeToSpend({
      incomePaise: 0,
      expensesPaise: 0,
      hasConfiguredIncome: false,
      hasConfiguredBudget: false,
    });

    expect(result.safeDailySpendPaise).toBe(0);
    expect(result.status).toBe('no_income');
    expect(result.statusText).toBe('Set your income to calculate Safe-to-Spend');
  });

  it('6. Calculates budget status thresholds correctly (0-70%, 70-90%, 90%+)', () => {
    // Healthy 50%
    const healthy = calculateBudgetStatus(toPaise(5000), toPaise(10000));
    expect(healthy.status).toBe('healthy');
    expect(healthy.percentage).toBe(50);
    expect(healthy.remainingPaise).toBe(toPaise(5000));

    // Warning 80%
    const warning = calculateBudgetStatus(toPaise(8000), toPaise(10000));
    expect(warning.status).toBe('warning');
    expect(warning.percentage).toBe(80);

    // Danger 95%
    const danger = calculateBudgetStatus(toPaise(9500), toPaise(10000));
    expect(danger.status).toBe('danger');
    expect(danger.percentage).toBe(95);

    // Exceeded 120%
    const exceeded = calculateBudgetStatus(toPaise(12000), toPaise(10000));
    expect(exceeded.status).toBe('exceeded');
    expect(exceeded.isExceeded).toBe(true);
    expect(exceeded.overAmountPaise).toBe(toPaise(2000));
  });
});
