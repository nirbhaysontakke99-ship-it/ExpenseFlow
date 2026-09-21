import type { ReportData } from './reportService';
import { formatCurrency } from '@/core/utils/currencyUtils';

export interface ReportInsightItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  type: 'danger' | 'warning' | 'positive' | 'info';
}

export function generateReportInsights(data: ReportData): ReportInsightItem[] {
  const insights: ReportInsightItem[] = [];

  const {
    overallBudgetStatus,
    momComparison,
    categoryBreakdown,
    statistics,
    expensesPaise,
  } = data;

  if (expensesPaise <= 0) return insights;

  // 1. Budget Warning / Overspending Insight
  if (overallBudgetStatus && overallBudgetStatus.isExceeded) {
    insights.push({
      id: 'budget_exceeded',
      icon: 'AlertTriangle',
      title: 'Budget Exceeded',
      description: `You've exceeded your monthly budget by ${formatCurrency(overallBudgetStatus.overAmountPaise)}.`,
      type: 'danger',
    });
  } else if (overallBudgetStatus && overallBudgetStatus.status === 'warning') {
    insights.push({
      id: 'budget_warning',
      icon: 'AlertTriangle',
      title: 'Budget Warning',
      description: `You've used ${overallBudgetStatus.percentage}% of your overall monthly budget.`,
      type: 'warning',
    });
  }

  // 2. Month-Over-Month Increase/Decrease Insight
  if (momComparison.hasPreviousData) {
    if (momComparison.isIncrease && momComparison.percentageChange >= 10) {
      insights.push({
        id: 'mom_increase',
        icon: 'TrendingUp',
        title: 'Spending Increase',
        description: `Your spending increased by ${momComparison.percentageChange}% compared with last month.`,
        type: 'warning',
      });
    } else if (!momComparison.isIncrease && Math.abs(momComparison.percentageChange) >= 5) {
      insights.push({
        id: 'mom_decrease',
        icon: 'TrendingDown',
        title: 'Great Progress!',
        description: `You spent ${Math.abs(momComparison.percentageChange)}% less than last month.`,
        type: 'positive',
      });
    }
  }

  // 3. Top Spending Category Insight
  if (categoryBreakdown.length > 0) {
    const top = categoryBreakdown[0];
    insights.push({
      id: 'top_category',
      icon: 'PieChart',
      title: `Top Category: ${top.categoryName}`,
      description: `${top.categoryName} accounts for ${top.percentage}% of your total expenses (${formatCurrency(top.amountPaise)}).`,
      type: 'info',
    });
  }

  // 4. Highest Spending Day Insight
  if (statistics.highestSpendingDayStr && statistics.highestSpendingDayPaise > 0) {
    const d = new Date(statistics.highestSpendingDayStr);
    const dayLabel = d.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' });

    insights.push({
      id: 'highest_day',
      icon: 'Calendar',
      title: 'Highest Spending Day',
      description: `${dayLabel} was your highest spending day with ${formatCurrency(statistics.highestSpendingDayPaise)}.`,
      type: 'info',
    });
  }

  // Return top 3 prioritized insights
  return insights.slice(0, 3);
}
