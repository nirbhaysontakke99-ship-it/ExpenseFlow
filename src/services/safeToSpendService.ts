export interface SafeToSpendParams {
  incomePaise: number;
  expensesPaise: number;
  committedExpensesPaise?: number;
  savingsAllocationsPaise?: number;
  hasConfiguredIncome: boolean;
  hasConfiguredBudget: boolean;
  currentDate?: Date;
}

export interface SafeToSpendResult {
  discretionaryRemainingPaise: number;
  safeDailySpendPaise: number;
  daysRemaining: number;
  status: 'healthy' | 'caution' | 'overspending' | 'no_income';
  statusText: string;
  overAmountPaise: number;
  isEstimate: boolean;
}

/**
 * Calculates remaining days in current month including today.
 * e.g., On Aug 16 (31 days in Aug), remaining days = 31 - 16 + 1 = 16 days.
 * Minimum returned value is 1 to avoid division by zero.
 */
export function getRemainingDaysInMonth(now: Date = new Date()): number {
  const year = now.getFullYear();
  const month = now.getMonth();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const currentDay = now.getDate();
  const remaining = totalDaysInMonth - currentDay + 1;
  return Math.max(1, remaining);
}

/**
 * Safe-To-Spend Calculation Engine (Paise Integer Math)
 */
export function calculateSafeToSpend(params: SafeToSpendParams): SafeToSpendResult {
  const {
    incomePaise,
    expensesPaise,
    committedExpensesPaise = 0,
    savingsAllocationsPaise = 0,
    hasConfiguredIncome,
    hasConfiguredBudget,
    currentDate = new Date(),
  } = params;

  const daysRemaining = getRemainingDaysInMonth(currentDate);

  // Case 5: No income configured
  if (!hasConfiguredIncome && incomePaise <= 0) {
    return {
      discretionaryRemainingPaise: 0,
      safeDailySpendPaise: 0,
      daysRemaining,
      status: 'no_income',
      statusText: 'Set your income to calculate Safe-to-Spend',
      overAmountPaise: 0,
      isEstimate: !hasConfiguredBudget,
    };
  }

  // Discretionary Remaining = Income - Expenses - Committed - Savings
  const discretionaryRemainingPaise =
    incomePaise - expensesPaise - committedExpensesPaise - savingsAllocationsPaise;

  // Case 4: Negative Discretionary Balance (Over budget)
  if (discretionaryRemainingPaise < 0) {
    const overAmountPaise = Math.abs(discretionaryRemainingPaise);
    return {
      discretionaryRemainingPaise,
      safeDailySpendPaise: 0,
      daysRemaining,
      status: 'overspending',
      statusText: "You're over budget",
      overAmountPaise,
      isEstimate: !hasConfiguredBudget,
    };
  }

  // Safe Daily Spend = Discretionary Remaining / Remaining Days
  const safeDailySpendPaise = Math.floor(discretionaryRemainingPaise / daysRemaining);

  // Case 3: Zero remaining
  if (safeDailySpendPaise === 0) {
    return {
      discretionaryRemainingPaise,
      safeDailySpendPaise: 0,
      daysRemaining,
      status: 'overspending',
      statusText: "You've reached your spending limit",
      overAmountPaise: 0,
      isEstimate: !hasConfiguredBudget,
    };
  }

  // Case 2: Caution threshold (< ₹100/day = 10000 paise)
  if (safeDailySpendPaise < 10000) {
    return {
      discretionaryRemainingPaise,
      safeDailySpendPaise,
      daysRemaining,
      status: 'caution',
      statusText: 'Keep an eye on spending',
      overAmountPaise: 0,
      isEstimate: !hasConfiguredBudget,
    };
  }

  // Case 1: Healthy Positive balance
  return {
    discretionaryRemainingPaise,
    safeDailySpendPaise,
    daysRemaining,
    status: 'healthy',
    statusText: "You're on track 🎉",
    overAmountPaise: 0,
    isEstimate: !hasConfiguredBudget,
  };
}
