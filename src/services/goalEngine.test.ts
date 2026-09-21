import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '@/data/database/db';
import { calculateGoalMetrics, addContributionToGoal, deleteContributionFromGoal } from './goalService';
import { goalRepository } from '@/data/repositories/goalRepository';
import { userRepository } from '@/data/repositories/userRepository';
import { toPaise } from '@/core/utils/currencyUtils';
import type { Goal } from '@/data/models/Goal';

describe('Phase 8 Savings Goals Engine', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  it('1. Calculates Goal progress (₹5,760 / ₹8,000 = 72%, ₹2,240 remaining)', () => {
    const goal: Goal = {
      id: 'g1',
      user_id: 'u1',
      name: 'Headphones',
      target_amount: toPaise(8000),
      current_amount: toPaise(5760),
      target_date: '2026-09-30',
      icon: 'Headphones',
      status: 'active',
      created_at: '2026-08-01T00:00:00Z',
      updated_at: '2026-08-01T00:00:00Z',
    };

    const aug16 = new Date(2026, 7, 16);
    const metrics = calculateGoalMetrics(goal, aug16);

    expect(metrics.progressPercent).toBe(72);
    expect(metrics.remainingPaise).toBe(toPaise(2240));
    expect(metrics.isCompleted).toBe(false);
    expect(metrics.motivationalText).toBe('Halfway there! 🔥');
  });

  it('2. Calculates required weekly saving rate correctly', () => {
    // Target date 28 days away (4 weeks)
    const goal: Goal = {
      id: 'g1',
      user_id: 'u1',
      name: 'Headphones',
      target_amount: toPaise(8000),
      current_amount: toPaise(5760), // ₹2,240 remaining
      target_date: '2026-09-13',
      icon: 'Headphones',
      status: 'active',
      created_at: '2026-08-01T00:00:00Z',
      updated_at: '2026-08-01T00:00:00Z',
    };

    const aug16 = new Date(2026, 7, 16);
    const metrics = calculateGoalMetrics(goal, aug16);

    // 28 days = 4 weeks -> ₹2,240 / 4 weeks = ₹560/week
    expect(metrics.requiredWeeklyPaise).toBe(toPaise(560));
  });

  it('3. Handles completed goals (current_amount >= target_amount)', () => {
    const goal: Goal = {
      id: 'g1',
      user_id: 'u1',
      name: 'Headphones',
      target_amount: toPaise(8000),
      current_amount: toPaise(8000),
      target_date: '2026-09-30',
      icon: 'Headphones',
      status: 'completed',
      created_at: '2026-08-01T00:00:00Z',
      updated_at: '2026-08-01T00:00:00Z',
    };

    const metrics = calculateGoalMetrics(goal);
    expect(metrics.progressPercent).toBe(100);
    expect(metrics.remainingPaise).toBe(0);
    expect(metrics.isCompleted).toBe(true);
    expect(metrics.requiredWeeklyPaise).toBe(0);
    expect(metrics.motivationalText).toBe('Goal completed! 🎉');
  });

  it('4. Handles contribution addition & deletion with atomic goal recalculations', async () => {
    const user = await userRepository.create({
      name: 'Goal User',
      email: 'guser@example.com',
      currency: 'INR',
      monthly_income: toPaise(30000),
      theme: 'light',
    });

    const createdGoal = await goalRepository.create({
      user_id: user.id,
      name: 'New Phone',
      target_amount: toPaise(10000),
      current_amount: toPaise(2000),
      target_date: '2026-10-01',
      icon: 'Phone',
      status: 'active',
    });

    // Add ₹3,000 contribution
    await addContributionToGoal(createdGoal.id, toPaise(3000), 'Pocket money');

    let updatedGoal = await goalRepository.getById(createdGoal.id);
    expect(updatedGoal?.current_amount).toBe(toPaise(5000)); // ₹2,000 + ₹3,000 = ₹5,000

    const contributions = await goalRepository.getContributions(createdGoal.id);
    expect(contributions.length).toBe(1);

    // Delete contribution
    await deleteContributionFromGoal(contributions[0].id, createdGoal.id);

    updatedGoal = await goalRepository.getById(createdGoal.id);
    expect(updatedGoal?.current_amount).toBe(0); // Only contributions now count towards balance
  });
});
