import { userRepository } from '@/data/repositories/userRepository';
import { transactionRepository } from '@/data/repositories/transactionRepository';
import { budgetRepository } from '@/data/repositories/budgetRepository';
import { goalRepository } from '@/data/repositories/goalRepository';

export const SCORE_WEIGHTS = {
  BUDGET_ADHERENCE: 30,
  SAVINGS_BEHAVIOR: 25,
  SPENDING_CONSISTENCY: 20,
  GOAL_PROGRESS: 15,
  TRACKING_CONSISTENCY: 10,
};

export const MIN_DATA_REQUIREMENT = {
  MIN_TRANSACTIONS: 3,
  MIN_DAYS: 3,
};

export type HealthLevel =
  | 'Excellent'
  | 'Healthy'
  | 'Fair'
  | 'Needs Attention'
  | 'Needs Improvement';

export interface ScoreFactor {
  name: string;
  score: number; // 0-100
  weight: number; // e.g. 30
  weightedScore: number;
  statusText: string;
}

export interface MoneyHealthResult {
  totalScore: number; // 0-100
  healthLevel: HealthLevel;
  hasSufficientData: boolean;
  factors: ScoreFactor[];
  whatsGoingWell: string[];
  opportunities: string[];
  howToImprove: string[];
}

export function calculateHealthLevel(score: number): HealthLevel {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Healthy';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Needs Attention';
  return 'Needs Improvement';
}

export async function calculateMoneyHealthScore(
  now: Date = new Date()
): Promise<MoneyHealthResult> {
  const user = await userRepository.getCurrentUser();
  if (!user) {
    return createInsufficientDataResult();
  }

  const currentMonthNum = now.getMonth() + 1;
  const currentYearNum = now.getFullYear();

  // 1. Transactions & Activity
  const allTxs = await transactionRepository.getAllByUserId(user.id);
  const activeTxs = allTxs.filter((t) => !t.deleted_at);

  if (activeTxs.length < MIN_DATA_REQUIREMENT.MIN_TRANSACTIONS) {
    return createInsufficientDataResult();
  }

  // Monthly totals
  const monthlyTotals = await transactionRepository.getMonthlyTotals(
    user.id,
    currentMonthNum,
    currentYearNum
  );
  const monthExpensesPaise = monthlyTotals.expensePaise;

  // 2. Budget Adherence Score (30 pts)
  const overallBudget = await budgetRepository.getOverallBudget(
    user.id,
    currentMonthNum,
    currentYearNum
  );
  let budgetScore = 75; // Neutral default if no budget set
  let budgetStatusText = 'No budget set';

  if (overallBudget && overallBudget.amount > 0) {
    if (monthExpensesPaise <= overallBudget.amount) {
      const ratio = monthExpensesPaise / overallBudget.amount;
      budgetScore = Math.round(100 - ratio * 20); // 80 - 100
      budgetStatusText = "Within overall budget";
    } else {
      const overRatio = (monthExpensesPaise - overallBudget.amount) / overallBudget.amount;
      budgetScore = Math.max(0, Math.round(70 - overRatio * 100));
      budgetStatusText = "Over budget limit";
    }
  }

  // 3. Savings Behavior Score (25 pts)
  const incomePaise = user.monthly_income || 0;
  let savingsScore = 70;
  let savingsStatusText = 'Savings rate building';

  if (incomePaise > 0) {
    const savedPaise = incomePaise - monthExpensesPaise;
    const savingsRate = (savedPaise / incomePaise) * 100;
    if (savingsRate >= 20) {
      savingsScore = 100;
      savingsStatusText = 'Excellent savings rate (20%+)';
    } else if (savingsRate >= 10) {
      savingsScore = 85;
      savingsStatusText = 'Good savings rate (10%+)';
    } else if (savingsRate > 0) {
      savingsScore = 65;
      savingsStatusText = 'Positive savings rate';
    } else {
      savingsScore = 30;
      savingsStatusText = 'Expenses equal or exceed income';
    }
  }

  // 4. Spending Consistency Score (20 pts)
  const daysInMonth = new Date(currentYearNum, currentMonthNum, 0).getDate();
  const avgDailySpend = monthExpensesPaise / Math.max(1, daysInMonth);

  // Group daily totals to detect spikes (> 3x average daily spend)
  const dailyMap = new Map<string, number>();
  activeTxs.forEach((t) => {
    if (t.type === 'expense') {
      const curr = dailyMap.get(t.date) || 0;
      dailyMap.set(t.date, curr + t.amount);
    }
  });

  let spikeCount = 0;
  dailyMap.forEach((amt) => {
    if (avgDailySpend > 0 && amt > avgDailySpend * 3) {
      spikeCount += 1;
    }
  });

  let consistencyScore = Math.max(40, 100 - spikeCount * 15);
  let consistencyStatusText = spikeCount === 0 ? 'Consistent daily spending' : `${spikeCount} high-spend day spikes`;

  // 5. Goal Progress Score (15 pts)
  const goals = await goalRepository.getByUserId(user.id);
  const activeGoals = goals.filter((g) => g.status !== 'completed' && g.current_amount < g.target_amount);

  let goalScore = 75; // Neutral default if no goals
  let goalStatusText = 'No active goals';

  if (activeGoals.length > 0) {
    const totalProgress = activeGoals.reduce((sum, g) => {
      const p = g.target_amount > 0 ? (g.current_amount / g.target_amount) * 100 : 0;
      return sum + Math.min(100, p);
    }, 0);
    goalScore = Math.round(totalProgress / activeGoals.length);
    goalStatusText = `Active goals at ${goalScore}% avg progress`;
  }

  // 6. Tracking Consistency Score (10 pts)
  const trackingScore = Math.min(100, activeTxs.length * 15);
  const trackingStatusText = `${activeTxs.length} transactions recorded`;

  // 7. Weighted Total Calculation & Clamping (0-100)
  const weightedBudget = (budgetScore * SCORE_WEIGHTS.BUDGET_ADHERENCE) / 100;
  const weightedSavings = (savingsScore * SCORE_WEIGHTS.SAVINGS_BEHAVIOR) / 100;
  const weightedConsistency = (consistencyScore * SCORE_WEIGHTS.SPENDING_CONSISTENCY) / 100;
  const weightedGoal = (goalScore * SCORE_WEIGHTS.GOAL_PROGRESS) / 100;
  const weightedTracking = (trackingScore * SCORE_WEIGHTS.TRACKING_CONSISTENCY) / 100;

  const rawTotal = weightedBudget + weightedSavings + weightedConsistency + weightedGoal + weightedTracking;
  const totalScore = Math.min(100, Math.max(0, Math.round(rawTotal)));
  const healthLevel = calculateHealthLevel(totalScore);

  const factors: ScoreFactor[] = [
    {
      name: 'Budget Adherence',
      score: budgetScore,
      weight: SCORE_WEIGHTS.BUDGET_ADHERENCE,
      weightedScore: Math.round(weightedBudget),
      statusText: budgetStatusText,
    },
    {
      name: 'Savings Behavior',
      score: savingsScore,
      weight: SCORE_WEIGHTS.SAVINGS_BEHAVIOR,
      weightedScore: Math.round(weightedSavings),
      statusText: savingsStatusText,
    },
    {
      name: 'Spending Consistency',
      score: consistencyScore,
      weight: SCORE_WEIGHTS.SPENDING_CONSISTENCY,
      weightedScore: Math.round(weightedConsistency),
      statusText: consistencyStatusText,
    },
    {
      name: 'Goal Progress',
      score: goalScore,
      weight: SCORE_WEIGHTS.GOAL_PROGRESS,
      weightedScore: Math.round(weightedGoal),
      statusText: goalStatusText,
    },
    {
      name: 'Tracking Consistency',
      score: trackingScore,
      weight: SCORE_WEIGHTS.TRACKING_CONSISTENCY,
      weightedScore: Math.round(weightedTracking),
      statusText: trackingStatusText,
    },
  ];

  // Explanations
  const whatsGoingWell: string[] = [];
  const opportunities: string[] = [];
  const howToImprove: string[] = [];

  if (budgetScore >= 80) whatsGoingWell.push('✓ You are keeping your spending within overall budget bounds.');
  else opportunities.push('Overall spending is close to or above budget limits.');

  if (savingsScore >= 80) whatsGoingWell.push('✓ You have a strong savings rate this month.');
  else howToImprove.push('Try reserving 10-20% of your income at the start of the month.');

  if (activeGoals.length > 0 && goalScore >= 50) whatsGoingWell.push('✓ You are making steady progress toward your savings goals.');

  if (spikeCount > 0) opportunities.push(`Unusually high spending spikes detected on ${spikeCount} day(s).`);

  if (howToImprove.length === 0) {
    howToImprove.push('Keep tracking your daily expenses consistently to maintain your high score.');
  }

  return {
    totalScore,
    healthLevel,
    hasSufficientData: true,
    factors,
    whatsGoingWell,
    opportunities,
    howToImprove,
  };
}

function createInsufficientDataResult(): MoneyHealthResult {
  return {
    totalScore: 0,
    healthLevel: 'Healthy',
    hasSufficientData: false,
    factors: [],
    whatsGoingWell: ['Building your Money Health profile'],
    opportunities: [],
    howToImprove: ['Add a few transactions to unlock your personalized score.'],
  };
}
