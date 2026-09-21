import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { generateReportData } from '@/services/reportService';
import { generateReportInsights } from '@/services/reportInsightService';
import type { PeriodType } from '@/services/reportDateService';
import { categoryRepository } from '@/data/repositories/categoryRepository';
import { userRepository } from '@/data/repositories/userRepository';
import { PeriodSelector } from './components/PeriodSelector';
import { ReportSummaryCard } from './components/ReportSummaryCard';
import { ExpenseBreakdownChart } from './components/ExpenseBreakdownChart';
import { SpendingTrendChart } from './components/SpendingTrendChart';
import { MonthComparisonCard } from './components/MonthComparisonCard';
import { SpendingStatisticsCard } from './components/SpendingStatisticsCard';
import { ReportInsightsCard } from './components/ReportInsightsCard';
import { OverallBudgetCard } from '@/features/budgets/components/OverallBudgetCard';
import { BudgetModal } from '@/features/budgets/components/BudgetModal';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { BarChart3, Plus } from 'lucide-react';

export interface ReportsViewProps {
  onOpenAddModal: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ onOpenAddModal }) => {
  const [period, setPeriod] = useState<PeriodType>('this_month');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  // Budget Modal State
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState<boolean>(false);
  const [modalAmountPaise, setModalAmountPaise] = useState<number>(0);

  // Live IndexedDB query for Report Data and User/Category details
  const data = useLiveQuery(async () => {
    const user = await userRepository.getCurrentUser();
    const categories = user ? await categoryRepository.getAll(user.id) : [];
    const reportData = await generateReportData(period, customStart, customEnd);
    return { user, categories, reportData };
  }, [period, customStart, customEnd]);

  if (!data || !data.reportData) return null;

  const { user, categories, reportData } = data;

  const {
    periodInfo,
    incomePaise,
    expensesPaise,
    savedPaise,
    hasIncomeData,
    categoryBreakdown,
    dailyTrends,
    momComparison,
    statistics,
    overallBudgetStatus,
  } = reportData;

  const insights = generateReportInsights(reportData);
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex-1 p-4 space-y-4 pb-24 max-w-md mx-auto w-full animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Reports & Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {periodInfo.label}
          </p>
        </div>
      </div>

      {/* Period Selector Pills */}
      <PeriodSelector
        period={period}
        customStart={customStart}
        customEnd={customEnd}
        onPeriodChange={(p, s, e) => {
          setPeriod(p);
          if (s) setCustomStart(s);
          if (e) setCustomEnd(e);
        }}
      />

      {expensesPaise === 0 ? (
        <Card variant="flat" className="py-12 text-center space-y-3">
          <BarChart3 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto opacity-80" />
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Your reports are waiting for your first expense
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Add a few transactions and ExpenseFlow will show where your money goes.
            </p>
          </div>
          <Button variant="emerald" size="sm" onClick={onOpenAddModal} leftIcon={<Plus className="w-4 h-4" />}>
            Add Expense
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Summary Card */}
          <ReportSummaryCard
            incomePaise={incomePaise}
            expensesPaise={expensesPaise}
            savedPaise={savedPaise}
            hasIncomeData={hasIncomeData}
            periodLabel={periodInfo.label}
          />

          {/* Insights Engine */}
          <ReportInsightsCard insights={insights} />

          {/* Expense Breakdown Donut Chart */}
          <ExpenseBreakdownChart breakdown={categoryBreakdown} />

          {/* Spending Trend Bar Chart */}
          <SpendingTrendChart trends={dailyTrends} />

          {/* Month-over-Month Comparison */}
          <MonthComparisonCard mom={momComparison} />

          {/* Budget Vs Actual Integration */}
          {overallBudgetStatus && (
            <OverallBudgetCard
              overallDetail={{
                spentPaise: overallBudgetStatus.spentPaise,
                budgetPaise: overallBudgetStatus.budgetPaise,
                hasBudget: true,
                status: overallBudgetStatus,
              }}
              currencyCode={user?.currency}
              onEditClick={() => {
                setModalAmountPaise(overallBudgetStatus.budgetPaise);
                setIsBudgetModalOpen(true);
              }}
              onCreateClick={() => {
                setModalAmountPaise(0);
                setIsBudgetModalOpen(true);
              }}
            />
          )}

          {/* Spending Statistics */}
          <SpendingStatisticsCard stats={statistics} />
        </div>
      )}

      {/* Reusable Budget Edit Modal */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        categories={categories}
        initialCategoryId={null}
        initialAmountPaise={modalAmountPaise}
        month={currentMonth}
        year={currentYear}
        onBudgetSaved={() => {}}
      />
    </div>
  );
};
