import { budgetRepository } from '@/data/repositories/budgetRepository';
import { transactionRepository } from '@/data/repositories/transactionRepository';
import { categoryRepository } from '@/data/repositories/categoryRepository';
import type { Budget } from '@/data/models/Budget';

export type BudgetStatusType = 'healthy' | 'warning' | 'danger' | 'exceeded';

export interface BudgetStatusResult {
  spentPaise: number;
  budgetPaise: number;
  remainingPaise: number;
  overAmountPaise: number;
  percentage: number;
  status: BudgetStatusType;
  isExceeded: boolean;
  statusText: string;
}

export interface CategoryBudgetDetail {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  spentPaise: number;
  budgetPaise: number;
  hasBudget: boolean;
  budgetId?: string;
  status: BudgetStatusResult;
}

export interface OverallBudgetDetail {
  budget?: Budget;
  spentPaise: number;
  budgetPaise: number;
  hasBudget: boolean;
  status: BudgetStatusResult;
}

/**
 * Calculates budget status, remaining amount, overspending, and percentage.
 * Prevents division by zero, NaN, or Infinity.
 */
export function calculateBudgetStatus(
  spentPaise: number,
  budgetPaise: number
): BudgetStatusResult {
  if (budgetPaise <= 0) {
    return {
      spentPaise,
      budgetPaise: 0,
      remainingPaise: 0,
      overAmountPaise: 0,
      percentage: 0,
      status: 'healthy',
      isExceeded: false,
      statusText: 'No budget set',
    };
  }

  const isExceeded = spentPaise > budgetPaise;
  const rawPercentage = Math.round((spentPaise / budgetPaise) * 100);

  const remainingPaise = Math.max(0, budgetPaise - spentPaise);
  const overAmountPaise = isExceeded ? spentPaise - budgetPaise : 0;

  let status: BudgetStatusType = 'healthy';
  let statusText = "You're on track 🎉";

  if (isExceeded) {
    status = 'exceeded';
    statusText = 'Over budget limit';
  } else if (rawPercentage >= 90) {
    status = 'danger';
    statusText = "You're close to your limit";
  } else if (rawPercentage >= 70) {
    status = 'warning';
    statusText = 'Keep an eye on your spending';
  }

  return {
    spentPaise,
    budgetPaise,
    remainingPaise,
    overAmountPaise,
    percentage: rawPercentage,
    status,
    isExceeded,
    statusText,
  };
}

/**
 * Aggregates Overall Budget details for a given user, month, and year.
 */
export async function getOverallBudgetDetail(
  userId: string,
  month: number,
  year: number
): Promise<OverallBudgetDetail> {
  const budget = await budgetRepository.getOverallBudget(userId, month, year);
  const monthlyTotals = await transactionRepository.getMonthlyTotals(userId, month, year);

  const spentPaise = monthlyTotals.expensePaise;
  const budgetPaise = budget?.amount || 0;
  const hasBudget = Boolean(budget && budget.amount > 0);

  const status = calculateBudgetStatus(spentPaise, budgetPaise);

  return {
    budget,
    spentPaise,
    budgetPaise,
    hasBudget,
    status,
  };
}

/**
 * Aggregates Category Budgets details for a given user, month, and year.
 * Categories are ranked by urgency:
 * 1. Exceeded budgets
 * 2. High spending percentage
 * 3. Budgeted categories
 * 4. Unbudgeted categories with expenses
 */
export async function getCategoryBudgetDetails(
  userId: string,
  month: number,
  year: number
): Promise<CategoryBudgetDetail[]> {
  const categories = await categoryRepository.getAll(userId);

  const categoryBudgets = await budgetRepository.getCategoryBudgets(userId, month, year);
  const budgetsMap = new Map(categoryBudgets.map((b) => [b.category_id, b]));

  const allTxs = await transactionRepository.getAllByUserId(userId);
  const monthExpenses = allTxs.filter((t) => {
    if (t.type !== 'expense' || t.deleted_at) return false;
    const d = new Date(t.date);
    return d.getMonth() + 1 === month && d.getFullYear() === year;
  });

  const categorySpentMap = new Map<string, number>();
  monthExpenses.forEach((t) => {
    const curr = categorySpentMap.get(t.category_id) || 0;
    categorySpentMap.set(t.category_id, curr + t.amount);
  });

  const result: CategoryBudgetDetail[] = [];

  // 1. Process all expense categories
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  for (const cat of expenseCategories) {
    const budgetObj = budgetsMap.get(cat.id);
    const spentPaise = categorySpentMap.get(cat.id) || 0;
    const budgetPaise = budgetObj?.amount || 0;
    const hasBudget = Boolean(budgetObj && budgetObj.amount > 0);

    // Only include categories that either have a budget set OR have spending in this month
    if (hasBudget || spentPaise > 0) {
      const status = calculateBudgetStatus(spentPaise, budgetPaise);
      result.push({
        categoryId: cat.id,
        categoryName: cat.name,
        categoryIcon: cat.icon,
        categoryColor: cat.color,
        spentPaise,
        budgetPaise,
        hasBudget,
        budgetId: budgetObj?.id,
        status,
      });
    }
  }

  // Rank categories by urgency
  result.sort((a, b) => {
    // 1. Exceeded first
    if (a.status.isExceeded !== b.status.isExceeded) {
      return a.status.isExceeded ? -1 : 1;
    }
    // 2. Highest percentage
    if (a.hasBudget && b.hasBudget) {
      return b.status.percentage - a.status.percentage;
    }
    // 3. Budgeted over non-budgeted
    if (a.hasBudget !== b.hasBudget) {
      return a.hasBudget ? -1 : 1;
    }
    // 4. Highest spending
    return b.spentPaise - a.spentPaise;
  });

  return result;
}
