import type { Goal } from '@/data/models/Goal';
import { goalRepository } from '@/data/repositories/goalRepository';
import { getLocalDateString } from './transactionService';

export interface GoalMetrics {
  progressPercent: number;
  remainingPaise: number;
  isCompleted: boolean;
  daysRemaining: number;
  weeksRemaining: number;
  monthsRemaining: number;
  requiredDailyPaise: number;
  requiredWeeklyPaise: number;
  requiredMonthlyPaise: number;
  motivationalText: string;
  scheduleStatus: 'ahead' | 'on_track' | 'behind';
  scheduleText: string;
}

export function calculateGoalMetrics(
  goal: Goal,
  now: Date = new Date()
): GoalMetrics {
  const { current_amount, target_amount, target_date, created_at } = goal;

  const isCompleted = current_amount >= target_amount;
  const rawProgress = target_amount > 0 ? (current_amount / target_amount) * 100 : 0;
  const progressPercent = Math.min(100, Math.max(0, Math.round(rawProgress)));
  const remainingPaise = Math.max(0, target_amount - current_amount);

  // Date Calculations
  const todayStr = getLocalDateString(now);
  const targetDateObj = new Date(target_date);
  const todayObj = new Date(todayStr);

  const diffTime = targetDateObj.getTime() - todayObj.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const weeksRemaining = Math.max(1, Math.ceil(daysRemaining / 7));
  const monthsRemaining = Math.max(1, Math.ceil(daysRemaining / 30));

  // Required Rates
  const requiredDailyPaise = remainingPaise > 0 ? Math.round(remainingPaise / Math.max(1, daysRemaining)) : 0;
  const requiredWeeklyPaise = remainingPaise > 0 ? Math.round(remainingPaise / weeksRemaining) : 0;
  const requiredMonthlyPaise = remainingPaise > 0 ? Math.round(remainingPaise / monthsRemaining) : 0;

  // Motivational Microcopy
  let motivationalText = "You're getting started. Keep going!";
  if (isCompleted || progressPercent >= 100) {
    motivationalText = 'Goal completed! 🎉';
  } else if (progressPercent >= 90) {
    motivationalText = 'Almost there! 🎯';
  } else if (progressPercent >= 75) {
    motivationalText = "You're getting close!";
  } else if (progressPercent >= 50) {
    motivationalText = 'Halfway there! 🔥';
  } else if (progressPercent >= 25) {
    motivationalText = "You're making solid progress!";
  }

  // Schedule Status (Elapsed Time vs Progress Ratio)
  const createdDateObj = new Date(created_at || goal.target_date);
  const totalDurationTime = Math.max(1, targetDateObj.getTime() - createdDateObj.getTime());
  const elapsedTime = Math.max(0, todayObj.getTime() - createdDateObj.getTime());
  const elapsedRatio = Math.min(1, elapsedTime / totalDurationTime);
  const expectedProgress = elapsedRatio * 100;

  let scheduleStatus: 'ahead' | 'on_track' | 'behind' = 'on_track';
  let scheduleText = "You're on track 🎉";

  if (isCompleted) {
    scheduleStatus = 'ahead';
    scheduleText = 'Completed!';
  } else if (progressPercent >= expectedProgress + 10) {
    scheduleStatus = 'ahead';
    scheduleText = "You're ahead of schedule 🎉";
  } else if (progressPercent < expectedProgress - 15) {
    scheduleStatus = 'behind';
    scheduleText = "You're behind schedule";
  }

  return {
    progressPercent,
    remainingPaise,
    isCompleted,
    daysRemaining,
    weeksRemaining,
    monthsRemaining,
    requiredDailyPaise,
    requiredWeeklyPaise,
    requiredMonthlyPaise,
    motivationalText,
    scheduleStatus,
    scheduleText,
  };
}

/**
 * Adds a new contribution to a goal and atomically updates goal current_amount.
 */
export async function addContributionToGoal(
  goalId: string,
  amountPaise: number,
  note?: string,
  date: string = getLocalDateString()
) {
  if (amountPaise <= 0) return;

  const goal = await goalRepository.getById(goalId);
  if (!goal) return;

  await goalRepository.addContribution({
    goal_id: goalId,
    amount: amountPaise,
    date,
    note,
  });

  const newCurrent = goal.current_amount + amountPaise;
  const isCompleted = newCurrent >= goal.target_amount;

  await goalRepository.update(goalId, {
    current_amount: newCurrent,
    status: isCompleted ? 'completed' : 'active',
  });
}

/**
 * Edits a contribution and recalculates goal current_amount.
 */
export async function editContributionInGoal(
  contributionId: string,
  goalId: string,
  newAmountPaise: number,
  newNote?: string,
  newDate?: string
) {
  await goalRepository.updateContribution(contributionId, {
    amount: newAmountPaise,
    note: newNote,
    date: newDate,
  });

  await syncGoalCurrentAmountFromContributions(goalId);
}

/**
 * Deletes a contribution and recalculates goal current_amount.
 */
export async function deleteContributionFromGoal(
  contributionId: string,
  goalId: string
) {
  await goalRepository.deleteContribution(contributionId);
  await syncGoalCurrentAmountFromContributions(goalId);
}

/**
 * Recalculates total contributions for a goal and updates goal current_amount in Dexie.
 */
export async function syncGoalCurrentAmountFromContributions(goalId: string) {
  const goal = await goalRepository.getById(goalId);
  if (!goal) return;

  const contributions = await goalRepository.getContributions(goalId);
  const totalSavedPaise = contributions.reduce((sum, c) => sum + c.amount, 0);

  const isCompleted = totalSavedPaise >= goal.target_amount;

  await goalRepository.update(goalId, {
    current_amount: totalSavedPaise,
    status: isCompleted ? 'completed' : 'active',
  });
}
