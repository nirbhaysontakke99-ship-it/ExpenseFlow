import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '@/data/database/db';
import { userRepository } from '@/data/repositories/userRepository';
import { budgetRepository } from '@/data/repositories/budgetRepository';
import { toPaise } from '@/core/utils/currencyUtils';

describe('Phase 3 Onboarding & Setup Wizard Verification', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  it('1. Persists user profile with onboarding completion state', async () => {
    const user = await userRepository.create({
      name: 'Nirbhay',
      email: 'nirbhay@expenseflow.app',
      currency: 'INR',
      monthly_income: toPaise(25000),
      income_source: 'Pocket Money',
      main_financial_goal: 'Save money',
      theme: 'system',
      onboarding_completed: true,
      setup_step: 6,
    });

    expect(user.id).toBeDefined();
    expect(user.onboarding_completed).toBe(true);
    expect(user.monthly_income).toBe(2500000);

    const activeUser = await userRepository.getCurrentUser();
    expect(activeUser?.name).toBe('Nirbhay');
    expect(activeUser?.onboarding_completed).toBe(true);
  });

  it('2. Resumes setup step when user reopens application before finishing', async () => {
    const user = await userRepository.create({
      name: 'Simran',
      email: 'simran@example.com',
      currency: 'INR',
      monthly_income: toPaise(15000),
      theme: 'dark',
      onboarding_completed: false,
      setup_step: 3,
    });

    const activeUser = await userRepository.getCurrentUser();
    expect(activeUser?.onboarding_completed).toBe(false);
    expect(activeUser?.setup_step).toBe(3);

    // Update setup step to completion
    const updated = await userRepository.update(user.id, {
      onboarding_completed: true,
      setup_step: 6,
    });
    expect(updated?.onboarding_completed).toBe(true);
  });

  it('3. Persists monthly budget correctly during setup wizard', async () => {
    const user = await userRepository.create({
      name: 'Rahul',
      email: 'rahul@example.com',
      currency: 'INR',
      monthly_income: toPaise(30000),
      theme: 'light',
      onboarding_completed: true,
      setup_step: 6,
    });

    const budget = await budgetRepository.upsertBudget({
      user_id: user.id,
      category_id: null,
      amount: toPaise(20000),
      month: 8,
      year: 2026,
    });

    expect(budget.amount).toBe(2000000);

    const overallBudget = await budgetRepository.getOverallBudget(user.id, 8, 2026);
    expect(overallBudget?.amount).toBe(2000000);
  });

  it('4. Handles optional skipped income and budget gracefully', async () => {
    const user = await userRepository.create({
      name: 'Guest User',
      email: 'guest@example.com',
      currency: 'INR',
      monthly_income: 0,
      theme: 'system',
      onboarding_completed: true,
      setup_step: 6,
    });

    expect(user.monthly_income).toBe(0);
    const overallBudget = await budgetRepository.getOverallBudget(user.id, 8, 2026);
    expect(overallBudget).toBeUndefined();
  });
});
