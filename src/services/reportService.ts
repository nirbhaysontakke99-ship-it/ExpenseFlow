import { transactionRepository } from '@/data/repositories/transactionRepository';
import { categoryRepository } from '@/data/repositories/categoryRepository';
import { userRepository } from '@/data/repositories/userRepository';
import { budgetRepository } from '@/data/repositories/budgetRepository';
import { calculateBudgetStatus, type BudgetStatusResult } from './budgetService';
import { getPeriodDateRange, type PeriodType, type DateRangeResult } from './reportDateService';
import type { Transaction } from '@/data/models/Transaction';
import type { Category } from '@/data/models/Category';

export interface CategoryBreakdownItem {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  amountPaise: number;
  percentage: number;
  transactionCount: number;
  averageTransactionPaise: number;
}

export interface DailyTrendPoint {
  dateStr: string;
  dayLabel: string;
  expensePaise: number;
}

export interface MonthOverMonthComparison {
  currentMonthPaise: number;
  previousMonthPaise: number;
  percentageChange: number; // e.g. +16.1 or -10.5
  isIncrease: boolean;
  hasPreviousData: boolean;
}

export interface SpendingStatistics {
  transactionCount: number;
  averageExpensePaise: number;
  largestExpensePaise: number;
  smallestExpensePaise: number;
  highestSpendingDayStr: string;
  highestSpendingDayPaise: number;
  averageDailySpendPaise: number;
}

export interface ReportData {
  periodInfo: DateRangeResult;
  incomePaise: number;
  expensesPaise: number;
  savedPaise: number;
  hasIncomeData: boolean;
  categoryBreakdown: CategoryBreakdownItem[];
  dailyTrends: DailyTrendPoint[];
  momComparison: MonthOverMonthComparison;
  statistics: SpendingStatistics;
  overallBudgetStatus: BudgetStatusResult | null;
  categoriesMap: Map<string, Category>;
  rawTransactions: Transaction[];
}

export async function generateReportData(
  period: PeriodType,
  customStart?: string,
  customEnd?: string,
  now: Date = new Date()
): Promise<ReportData> {
  const dateRange = getPeriodDateRange(period, customStart, customEnd, now);
  const { startDateStr, endDateStr, totalDays } = dateRange;

  const user = await userRepository.getCurrentUser();
  const userId = user?.id || 'default_user';

  const categories = await categoryRepository.getAll(userId);
  const categoriesMap = new Map(categories.map((c) => [c.id, c]));

  // 1. Query Transactions in Period
  const allUserTxs = await transactionRepository.getAllByUserId(userId);
  const periodTxs = allUserTxs.filter(
    (t) => t.date >= startDateStr && t.date <= endDateStr && !t.deleted_at
  );

  const expenseTxs = periodTxs.filter((t) => t.type === 'expense');
  const incomeTxs = periodTxs.filter((t) => t.type === 'income');

  const expensesPaise = expenseTxs.reduce((sum, t) => sum + t.amount, 0);

  // Available income: Use period income if > 0, fallback to user's monthly income
  const hasIncomeData = incomeTxs.length > 0 || (user?.monthly_income || 0) > 0;
  const incomePaise =
    incomeTxs.length > 0 ? incomeTxs.reduce((sum, t) => sum + t.amount, 0) : user?.monthly_income || 0;

  const savedPaise = incomePaise - expensesPaise;

  // 2. Category Breakdown
  const catAmountMap = new Map<string, number>();
  const catCountMap = new Map<string, number>();

  expenseTxs.forEach((t) => {
    const currAmt = catAmountMap.get(t.category_id) || 0;
    catAmountMap.set(t.category_id, currAmt + t.amount);

    const currCnt = catCountMap.get(t.category_id) || 0;
    catCountMap.set(t.category_id, currCnt + 1);
  });

  const categoryBreakdown: CategoryBreakdownItem[] = [];
  catAmountMap.forEach((amt, catId) => {
    const cat = categoriesMap.get(catId);
    const count = catCountMap.get(catId) || 1;
    const percentage = expensesPaise > 0 ? (amt / expensesPaise) * 100 : 0;
    const avg = Math.round(amt / count);

    categoryBreakdown.push({
      categoryId: catId,
      categoryName: cat?.name || 'Other',
      categoryIcon: cat?.icon || 'Tag',
      categoryColor: cat?.color || '#6B7280',
      amountPaise: amt,
      percentage: Number(percentage.toFixed(1)),
      transactionCount: count,
      averageTransactionPaise: avg,
    });
  });

  categoryBreakdown.sort((a, b) => b.amountPaise - a.amountPaise);

  // 3. Daily Spending Trends
  const dailyTrends: DailyTrendPoint[] = [];
  const dailyAmountMap = new Map<string, number>();

  expenseTxs.forEach((t) => {
    const curr = dailyAmountMap.get(t.date) || 0;
    dailyAmountMap.set(t.date, curr + t.amount);
  });

  // Populate daily points across range
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  const currDate = new Date(startDate);

  while (currDate <= endDate) {
    const year = currDate.getFullYear();
    const month = String(currDate.getMonth() + 1).padStart(2, '0');
    const day = String(currDate.getDate()).padStart(2, '0');
    const dStr = `${year}-${month}-${day}`;

    const dayLabel = currDate.toLocaleDateString('en-IN', { weekday: 'narrow', day: 'numeric' });
    const exp = dailyAmountMap.get(dStr) || 0;

    dailyTrends.push({
      dateStr: dStr,
      dayLabel,
      expensePaise: exp,
    });

    currDate.setDate(currDate.getDate() + 1);
  }

  // 4. Month-Over-Month Comparison
  const currentMonthNum = now.getMonth() + 1;
  const currentYearNum = now.getFullYear();

  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthNum = prevMonthDate.getMonth() + 1;
  const prevYearNum = prevMonthDate.getFullYear();

  const currentMonthTotals = await transactionRepository.getMonthlyTotals(userId, currentMonthNum, currentYearNum);
  const prevMonthTotals = await transactionRepository.getMonthlyTotals(userId, prevMonthNum, prevYearNum);

  const curMonthExp = currentMonthTotals.expensePaise;
  const prevMonthExp = prevMonthTotals.expensePaise;
  const hasPreviousData = prevMonthExp > 0;

  let percentageChange = 0;
  if (hasPreviousData) {
    percentageChange = Number((((curMonthExp - prevMonthExp) / prevMonthExp) * 100).toFixed(1));
  }

  const momComparison: MonthOverMonthComparison = {
    currentMonthPaise: curMonthExp,
    previousMonthPaise: prevMonthExp,
    percentageChange,
    isIncrease: percentageChange > 0,
    hasPreviousData,
  };

  // 5. Statistics
  let largestExpensePaise = 0;
  let smallestExpensePaise = expenseTxs.length > 0 ? Infinity : 0;
  let highestSpendingDayStr = '';
  let highestSpendingDayPaise = 0;

  expenseTxs.forEach((t) => {
    if (t.amount > largestExpensePaise) largestExpensePaise = t.amount;
    if (t.amount < smallestExpensePaise) smallestExpensePaise = t.amount;
  });

  if (smallestExpensePaise === Infinity) smallestExpensePaise = 0;

  dailyAmountMap.forEach((amt, dStr) => {
    if (amt > highestSpendingDayPaise) {
      highestSpendingDayPaise = amt;
      highestSpendingDayStr = dStr;
    }
  });

  const transactionCount = expenseTxs.length;
  const averageExpensePaise = transactionCount > 0 ? Math.round(expensesPaise / transactionCount) : 0;
  const averageDailySpendPaise = Math.round(expensesPaise / Math.max(1, totalDays));

  const statistics: SpendingStatistics = {
    transactionCount,
    averageExpensePaise,
    largestExpensePaise,
    smallestExpensePaise,
    highestSpendingDayStr,
    highestSpendingDayPaise,
    averageDailySpendPaise,
  };

  // 6. Overall Budget Status for current month
  const overallBudget = await budgetRepository.getOverallBudget(userId, currentMonthNum, currentYearNum);
  const overallBudgetStatus = overallBudget
    ? calculateBudgetStatus(curMonthExp, overallBudget.amount)
    : null;

  return {
    periodInfo: dateRange,
    incomePaise,
    expensesPaise,
    savedPaise,
    hasIncomeData,
    categoryBreakdown,
    dailyTrends,
    momComparison,
    statistics,
    overallBudgetStatus,
    categoriesMap,
    rawTransactions: periodTxs,
  };
}
