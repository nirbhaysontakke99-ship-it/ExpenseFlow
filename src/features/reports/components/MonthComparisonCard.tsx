import React from 'react';
import { Card } from '@/shared/components/Card';
import { formatCurrency } from '@/core/utils/currencyUtils';
import type { MonthOverMonthComparison } from '@/services/reportService';
import { DEFAULT_CURRENCY } from '@/core/constants/currency';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export interface MonthComparisonCardProps {
  mom: MonthOverMonthComparison;
  currencyCode?: string;
}

export const MonthComparisonCard: React.FC<MonthComparisonCardProps> = ({
  mom,
  currencyCode = 'INR',
}) => {
  const currencyConfig = { ...DEFAULT_CURRENCY, code: currencyCode };
  const { currentMonthPaise, previousMonthPaise, percentageChange, isIncrease, hasPreviousData } = mom;

  if (!hasPreviousData) {
    return (
      <Card variant="flat" className="p-3.5 text-center text-xs text-slate-500">
        <span className="font-semibold block">Not enough data for comparison yet</span>
        <span className="text-[11px] text-slate-400 mt-0.5 block">
          Add transactions in previous months to see Month-over-Month spending trends.
        </span>
      </Card>
    );
  }

  return (
    <Card variant="default" className="space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Month-Over-Month Comparison
        </h3>
        <div
          className={`flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded-full ${
            isIncrease
              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
              : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
          }`}
        >
          {isIncrease ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          <span>{Math.abs(percentageChange)}%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-center text-xs">
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
          <span className="text-[10px] text-slate-400 block font-semibold">This Month</span>
          <span className="font-extrabold text-slate-900 dark:text-white mt-0.5 block">
            {formatCurrency(currentMonthPaise, currencyConfig)}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
          <span className="text-[10px] text-slate-400 block font-semibold">Last Month</span>
          <span className="font-extrabold text-slate-900 dark:text-white mt-0.5 block">
            {formatCurrency(previousMonthPaise, currencyConfig)}
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
        {isIncrease
          ? `Spending increased ${Math.abs(percentageChange)}% compared with last month.`
          : `Great! You spent ${Math.abs(percentageChange)}% less than last month.`}
      </p>
    </Card>
  );
};
