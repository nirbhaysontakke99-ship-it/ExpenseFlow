import { userRepository } from '@/data/repositories/userRepository';
import { transactionRepository } from '@/data/repositories/transactionRepository';
import { budgetRepository } from '@/data/repositories/budgetRepository';
import { goalRepository } from '@/data/repositories/goalRepository';
import { recurringRepository } from '@/data/repositories/recurringRepository';
import { categoryRepository } from '@/data/repositories/categoryRepository';
import { calculateBudgetStatus } from './budgetService';
import { calculateSafeToSpend } from './safeToSpendService';
import { calculateGoalMetrics } from './goalService';
import { getOccurrenceStatus } from './recurringDateService';
import { formatCurrency } from '@/core/utils/currencyUtils';
import { DEFAULT_CURRENCY } from '@/core/constants/currency';

export const INSIGHT_THRESHOLDS = {
  SPENDING_CHANGE_MIN_PERCENT: 8,
  CATEGORY_CHANGE_MIN_PERCENT: 12,
  BUDGET_WARNING_PERCENT: 70,
  BUDGET_DANGER_PERCENT: 90,
};

export type InsightType =
  | 'budget_exceeded'
  | 'budget_warning'
  | 'spending_increase'
  | 'spending_decrease'
  | 'top_category'
  | 'high_spending_day'
  | 'goal_progress'
  | 'recurring_due'
  | 'safe_to_spend_low'
  | 'positive_behavior';

export type InsightSeverity = 'info' | 'positive' | 'warning' | 'danger';

export interface SmartInsight {
  id: string;
  type: InsightType;
  priority: number; // Lower number = higher priority (1 is highest)
  title: string;
  message: string;
  severity: InsightSeverity;
  icon: string;
  actionText?: string;
  actionRoute?: string;
}

export async function generateSmartInsights(
  now: Date = new Date()
): Promise<SmartInsight[]> {
  const user = await userRepository.getCurrentUser();
  if (!user) return [];

  const currencyConfig = { ...DEFAULT_CURRENCY, code: user.currency };
  const currentMonthNum = now.getMonth() + 1;
  const currentYearNum = now.getFullYear();

  const insights: SmartInsight[] = [];

  // 1. Budget Warnings & Overspending Insights (Priority 1 & 2)
  const overallBudget = await budgetRepository.getOverallBudget(
    user.id,
    currentMonthNum,
    currentYearNum
  );
  const monthlyTotals = await transactionRepository.getMonthlyTotals(
    user.id,
    currentMonthNum,
    currentYearNum
  );

  if (overallBudget && overallBudget.amount > 0) {
    const status = calculateBudgetStatus(monthlyTotals.expensePaise, overallBudget.amount);
    if (status.isExceeded) {
      insights.push({
        id: 'overall_budget_exceeded',
        type: 'budget_exceeded',
        priority: 1,
        title: 'Monthly Budget Exceeded',
        message: `You've exceeded your monthly budget by ${formatCurrency(status.overAmountPaise, currencyConfig)}.`,
        severity: 'danger',
        icon: 'AlertTriangle',
        actionText: 'View Budgets',
      });
    } else if (status.status === 'warning' || status.status === 'danger') {
      insights.push({
        id: 'overall_budget_warning',
        type: 'budget_warning',
        priority: 3,
        title: 'Overall Budget Warning',
        message: `You've used ${status.percentage}% of your overall monthly spending limit.`,
        severity: 'warning',
        icon: 'AlertTriangle',
        actionText: 'View Budgets',
      });
    } else if (status.percentage > 0 && status.percentage <= 70) {
      insights.push({
        id: 'overall_budget_positive',
        type: 'positive_behavior',
        priority: 8,
        title: 'On Track with Budget',
        message: `Great job! You've used only ${status.percentage}% of your monthly budget so far.`,
        severity: 'positive',
        icon: 'CheckCircle2',
      });
    }
  }

  // 2. Safe-To-Spend Risk Insights (Priority 4)
  const allTxs = await transactionRepository.getAllByUserId(user.id);
  const safeToSpend = calculateSafeToSpend({
    incomePaise: user.monthly_income || 0,
    expensesPaise: monthlyTotals.expensePaise,
    committedExpensesPaise: 0,
    savingsAllocationsPaise: 0,
    hasConfiguredIncome: (user.monthly_income || 0) > 0,
    hasConfiguredBudget: Boolean(overallBudget && overallBudget.amount > 0),
    currentDate: now,
  });

  if (safeToSpend.status === 'overspending' || safeToSpend.status === 'no_income') {
    insights.push({
      id: 'safe_spend_risk',
      type: 'safe_to_spend_low',
      priority: 4,
      title: 'Limited Spending Room',
      message: 'Your discretionary spending room is very limited for the rest of this month.',
      severity: 'warning',
      icon: 'ShieldAlert',
    });
  }

  // 3. Goal Progress Insights (Priority 5 & 6)
  const goals = await goalRepository.getByUserId(user.id);
  const activeGoals = goals.filter((g) => g.status !== 'completed' && g.current_amount < g.target_amount);

  if (activeGoals.length > 0) {
    const topGoal = activeGoals[0];
    const metrics = calculateGoalMetrics(topGoal, now);

    if (metrics.scheduleStatus === 'ahead') {
      insights.push({
        id: `goal_ahead_${topGoal.id}`,
        type: 'positive_behavior',
        priority: 6,
        title: 'Ahead of Schedule',
        message: `You're ahead of schedule on your ${topGoal.name} savings goal (${metrics.progressPercent}% saved).`,
        severity: 'positive',
        icon: 'Sparkles',
        actionText: 'View Goal',
      });
    } else if (metrics.scheduleStatus === 'behind') {
      insights.push({
        id: `goal_behind_${topGoal.id}`,
        type: 'goal_progress',
        priority: 5,
        title: 'Goal Behind Schedule',
        message: `Save ${formatCurrency(metrics.requiredWeeklyPaise, currencyConfig)}/week to catch up on your ${topGoal.name} goal.`,
        severity: 'warning',
        icon: 'Target',
        actionText: 'View Goal',
      });
    }
  }

  // 4. Recurring Payment Due Insights (Priority 4)
  const recurringRules = await recurringRepository.getByUserId(user.id);
  const activeRules = recurringRules.filter((r) => r.active);

  for (const rule of activeRules) {
    const occStatus = getOccurrenceStatus(rule.next_date, rule.active, now);
    if (occStatus === 'due' || occStatus === 'overdue') {
      insights.push({
        id: `recurring_due_${rule.id}`,
        type: 'recurring_due',
        priority: 4,
        title: `${rule.title} Due`,
        message: `${rule.title} (${formatCurrency(rule.amount, currencyConfig)}) is scheduled for payment.`,
        severity: occStatus === 'overdue' ? 'warning' : 'info',
        icon: 'Clock',
        actionText: 'Review Payment',
      });
      break; // Show top 1 recurring payment
    }
  }

  // 5. Top Expense Category Insight (Priority 7)
  const categories = await categoryRepository.getAll(user.id);
  const categoriesMap = new Map(categories.map((c) => [c.id, c]));

  const catAmountMap = new Map<string, number>();
  allTxs.forEach((t) => {
    if (t.type === 'expense' && !t.deleted_at && t.date.startsWith(`${currentYearNum}-${String(currentMonthNum).padStart(2, '0')}`)) {
      const curr = catAmountMap.get(t.category_id) || 0;
      catAmountMap.set(t.category_id, curr + t.amount);
    }
  });

  let topCatId = '';
  let topCatAmount = 0;
  catAmountMap.forEach((amt, catId) => {
    if (amt > topCatAmount) {
      topCatAmount = amt;
      topCatId = catId;
    }
  });

  if (topCatId && topCatAmount > 0) {
    const catName = categoriesMap.get(topCatId)?.name || 'General';
    const percent = monthlyTotals.expensePaise > 0 ? Math.round((topCatAmount / monthlyTotals.expensePaise) * 100) : 0;

    insights.push({
      id: 'top_category_insight',
      type: 'top_category',
      priority: 7,
      title: `Top Category: ${catName}`,
      message: `${catName} is your largest spending category this month (${percent}% of total expenses).`,
      severity: 'info',
      icon: 'PieChart',
    });
  }

  // Sort by priority (1 is highest)
  insights.sort((a, b) => a.priority - b.priority);

  return insights;
}
