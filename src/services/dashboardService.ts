import { userRepository } from '@/data/repositories/userRepository';
import { transactionRepository } from '@/data/repositories/transactionRepository';
import { budgetRepository } from '@/data/repositories/budgetRepository';
import { categoryRepository } from '@/data/repositories/categoryRepository';
import { calculateSafeToSpend, type SafeToSpendResult } from './safeToSpendService';
import { calculateBudgetStatus, type BudgetStatusResult } from './budgetService';
import type { Transaction } from '@/data/models/Transaction';
import type { Category } from '@/data/models/Category';

export interface DashboardData {
  userName: string;
  currencyCode: string;
  availableIncomePaise: number;
  monthlyExpensesPaise: number;
  remainingBalancePaise: number;
  monthlyBudgetPaise: number;
  budgetStatus: BudgetStatusResult;
  safeToSpend: SafeToSpendResult;
  todaySpendingPaise: number;
  todayTransactions: Transaction[];
  recentTransactions: Transaction[];
  categoriesMap: Map<string, Category>;
  hasIncomeConfigured: boolean;
  hasBudgetConfigured: boolean;
  insight: {
    title: string;
    description: string;
    type: 'info' | 'warning' | 'positive';
  } | null;
}

export async function fetchDashboardData(currentDate: Date = new Date()): Promise<DashboardData> {
  const now = currentDate;
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

  // 1. Fetch User & Categories
  const user = await userRepository.getCurrentUser();
  const categories = await categoryRepository.getAll(user?.id);
  const categoriesMap = new Map(categories.map((c) => [c.id, c]));

  const userName = user?.name || 'Friend';
  const currencyCode = user?.currency || 'INR';

  // 2. Fetch Monthly Transactions
  const monthlyTotals = user
    ? await transactionRepository.getMonthlyTotals(user.id, month, year)
    : { incomePaise: 0, expensePaise: 0, remainingPaise: 0 };

  // Available income: Use transaction income if > 0, otherwise fallback to configured monthly_income
  const hasConfiguredIncome = Boolean(user && user.monthly_income > 0);
  const availableIncomePaise =
    monthlyTotals.incomePaise > 0
      ? monthlyTotals.incomePaise
      : user?.monthly_income || 0;

  const monthlyExpensesPaise = monthlyTotals.expensePaise;
  const remainingBalancePaise = availableIncomePaise - monthlyExpensesPaise;

  // 3. Fetch Monthly Budget
  const overallBudget = user
    ? await budgetRepository.getOverallBudget(user.id, month, year)
    : undefined;

  const monthlyBudgetPaise = overallBudget?.amount || 0;
  const hasBudgetConfigured = monthlyBudgetPaise > 0;

  const budgetStatus = calculateBudgetStatus(monthlyExpensesPaise, monthlyBudgetPaise);

  // 4. Calculate Safe-To-Spend
  const safeToSpend = calculateSafeToSpend({
    incomePaise: availableIncomePaise,
    expensesPaise: monthlyExpensesPaise,
    hasConfiguredIncome,
    hasConfiguredBudget: hasBudgetConfigured,
    currentDate: now,
  });

  // 5. Fetch Today's & Recent Transactions
  const allUserTxs = user ? await transactionRepository.getAllByUserId(user.id) : [];

  const todayTransactions = allUserTxs
    .filter((t) => t.date.startsWith(todayStr))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const todaySpendingPaise = todayTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const recentTransactions = [...allUserTxs]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // 6. Generate Deterministic Insight
  let insight: DashboardData['insight'] = null;

  if (monthlyExpensesPaise > 0) {
    // Find top category expense
    const categoryTotals = new Map<string, number>();
    allUserTxs
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const curr = categoryTotals.get(t.category_id) || 0;
        categoryTotals.set(t.category_id, curr + t.amount);
      });

    let topCatId = '';
    let maxAmount = 0;
    categoryTotals.forEach((amt, catId) => {
      if (amt > maxAmount) {
        maxAmount = amt;
        topCatId = catId;
      }
    });

    const topCatName = categoriesMap.get(topCatId)?.name || 'Shopping';
    if (maxAmount > 0) {
      insight = {
        title: `Top Category: ${topCatName}`,
        description: `${topCatName} is your largest expense this month.`,
        type: 'info',
      };
    }
  } else if (hasConfiguredIncome) {
    insight = {
      title: 'Budget On Track',
      description: "You're currently within your monthly allowance.",
      type: 'positive',
    };
  }

  return {
    userName,
    currencyCode,
    availableIncomePaise,
    monthlyExpensesPaise,
    remainingBalancePaise,
    monthlyBudgetPaise,
    budgetStatus,
    safeToSpend,
    todaySpendingPaise,
    todayTransactions,
    recentTransactions,
    categoriesMap,
    hasIncomeConfigured: hasConfiguredIncome,
    hasBudgetConfigured,
    insight,
  };
}
