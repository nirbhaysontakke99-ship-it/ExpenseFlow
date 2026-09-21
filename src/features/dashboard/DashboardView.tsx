import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { fetchDashboardData } from '@/services/dashboardService';
import { calculateMoneyHealthScore } from '@/services/moneyHealthService';
import { GreetingHeader } from './components/GreetingHeader';
import { SafeToSpendCard } from './components/SafeToSpendCard';
import { MoneySummaryCard } from './components/MoneySummaryCard';
import { BudgetProgressCard } from './components/BudgetProgressCard';
import { TodaySpendingCard } from './components/TodaySpendingCard';
import { RecentTransactionsCard } from './components/RecentTransactionsCard';
import { InsightCard } from './components/InsightCard';
import { GoalPreviewCard } from './components/GoalPreviewCard';
import { RecurringPreviewCard } from '@/features/recurring/components/RecurringPreviewCard';
import { MoneyHealthCard } from '@/features/health/components/MoneyHealthCard';
import { MoneyHealthDetailModal } from '@/features/health/components/MoneyHealthDetailModal';
import { DashboardSkeleton } from './components/DashboardSkeleton';
import { Button } from '@/shared/components/Button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export interface DashboardViewProps {
  onOpenAddModal: () => void;
  onNavigateSetup?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenAddModal,
  onNavigateSetup,
}) => {
  const [isHealthModalOpen, setIsHealthModalOpen] = useState<boolean>(false);

  // Dexie live queries: automatically recalculates when IndexedDB transactions, budgets, or user profiles change!
  const dashboardData = useLiveQuery(() => fetchDashboardData(), []);
  const healthData = useLiveQuery(() => calculateMoneyHealthScore(), []);

  if (dashboardData === undefined || healthData === undefined) {
    return <DashboardSkeleton />;
  }

  if (!dashboardData) {
    return (
      <div className="flex-1 p-6 text-center space-y-4 flex flex-col items-center justify-center max-w-md mx-auto">
        <div className="p-3 bg-red-50 dark:bg-red-950 text-red-600 rounded-2xl">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            We couldn't load your money summary.
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Please check local database connection and try again.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => window.location.reload()}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Try Again
        </Button>
      </div>
    );
  }

  const {
    userName,
    currencyCode,
    availableIncomePaise,
    monthlyExpensesPaise,
    remainingBalancePaise,
    budgetStatus,
    safeToSpend,
    todaySpendingPaise,
    todayTransactions,
    recentTransactions,
    categoriesMap,
    insight,
  } = dashboardData;

  return (
    <div className="flex-1 p-4 space-y-4 pb-24 max-w-md mx-auto w-full animate-in fade-in duration-300">
      {/* 1. Header with greeting */}
      <GreetingHeader userName={userName} />

      {/* 2. ExpenseFlow Money Health Card */}
      {healthData && (
        <MoneyHealthCard
          healthResult={healthData}
          onClick={() => setIsHealthModalOpen(true)}
        />
      )}

      {/* 3. Safe-To-Spend Hero Card */}
      <SafeToSpendCard
        safeToSpend={safeToSpend}
        currencyCode={currencyCode}
        onSetIncomeClick={onNavigateSetup}
      />

      {/* 4. Monthly Financial Summary (Income, Expenses, Remaining) */}
      <MoneySummaryCard
        incomePaise={availableIncomePaise}
        expensesPaise={monthlyExpensesPaise}
        remainingPaise={remainingBalancePaise}
        currencyCode={currencyCode}
      />

      {/* 5. Monthly Budget Progress Card */}
      <BudgetProgressCard
        budgetStatus={budgetStatus}
        currencyCode={currencyCode}
        onSetBudgetClick={onNavigateSetup}
      />

      {/* 6. Today's Spending Card */}
      <TodaySpendingCard
        todayTransactions={todayTransactions}
        todaySpendingPaise={todaySpendingPaise}
        categoriesMap={categoriesMap}
        currencyCode={currencyCode}
        onAddExpenseClick={onOpenAddModal}
      />

      {/* 7. Savings Goal Preview Card */}
      <GoalPreviewCard />

      {/* 8. Upcoming Recurring Preview Card */}
      <RecurringPreviewCard />

      {/* 9. Smart Financial Insight Card */}
      <InsightCard insight={insight} />

      {/* 10. Recent Transactions Feed */}
      <RecentTransactionsCard
        transactions={recentTransactions}
        categoriesMap={categoriesMap}
        currencyCode={currencyCode}
      />

      {/* Money Health Detail Modal */}
      <MoneyHealthDetailModal
        isOpen={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
        healthResult={healthData}
      />
    </div>
  );
};
