import React from 'react';
import { Card } from '@/shared/components/Card';
import { formatCurrency } from '@/core/utils/currencyUtils';
import type { SpendingStatistics } from '@/services/reportService';
import { DEFAULT_CURRENCY } from '@/core/constants/currency';
import { BarChart2, Calendar, Receipt, Award } from 'lucide-react';

export interface SpendingStatisticsCardProps {
  stats: SpendingStatistics;
  currencyCode?: string;
  onHighestDayClick?: (dateStr: string) => void;
}

export const SpendingStatisticsCard: React.FC<SpendingStatisticsCardProps> = ({
  stats,
  currencyCode = 'INR',
  onHighestDayClick,
}) => {
  const currencyConfig = { ...DEFAULT_CURRENCY, code: currencyCode };
  const {
    transactionCount,
    averageExpensePaise,
    largestExpensePaise,
    highestSpendingDayStr,
    highestSpendingDayPaise,
    averageDailySpendPaise,
  } = stats;

  if (transactionCount === 0) return null;

  const formattedHighestDay = highestSpendingDayStr
    ? new Date(highestSpendingDayStr).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      })
    : 'N/A';

  return (
    <Card variant="default" className="space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <BarChart2 className="w-4 h-4 text-emerald-500" />
          Spending Statistics
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block">Avg Daily Spend</span>
            <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
              {formatCurrency(averageDailySpendPaise, currencyConfig)}/day
            </span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block">Largest Expense</span>
            <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
              {formatCurrency(largestExpensePaise, currencyConfig)}
            </span>
          </div>
        </div>
      </div>

      {highestSpendingDayStr && highestSpendingDayPaise > 0 && (
        <div
          onClick={() => onHighestDayClick && onHighestDayClick(highestSpendingDayStr)}
          className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between cursor-pointer hover:bg-amber-100/60 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Highest Spending Day
              </span>
              <span className="text-[10px] text-amber-700 dark:text-amber-300 font-medium">
                {formattedHighestDay}
              </span>
            </div>
          </div>

          <span className="text-xs font-black text-amber-800 dark:text-amber-200">
            {formatCurrency(highestSpendingDayPaise, currencyConfig)}
          </span>
        </div>
      )}

      <div className="flex justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
        <span>Total Transactions: <strong>{transactionCount}</strong></span>
        <span>Avg Expense: <strong>{formatCurrency(averageExpensePaise, currencyConfig)}</strong></span>
      </div>
    </Card>
  );
};
