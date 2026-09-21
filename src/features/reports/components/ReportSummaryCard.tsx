import React from 'react';
import { Card } from '@/shared/components/Card';
import { formatCurrency } from '@/core/utils/currencyUtils';
import { DEFAULT_CURRENCY } from '@/core/constants/currency';

export interface ReportSummaryCardProps {
  incomePaise: number;
  expensesPaise: number;
  savedPaise: number;
  hasIncomeData: boolean;
  currencyCode?: string;
  periodLabel: string;
}

export const ReportSummaryCard: React.FC<ReportSummaryCardProps> = ({
  incomePaise,
  expensesPaise,
  savedPaise,
  hasIncomeData,
  currencyCode = 'INR',
  periodLabel,
}) => {
  const currencyConfig = { ...DEFAULT_CURRENCY, code: currencyCode };

  return (
    <Card variant="default" className="space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Financial Summary ({periodLabel})
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Income</span>
          <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block truncate">
            {hasIncomeData ? formatCurrency(incomePaise, currencyConfig) : 'N/A'}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Expenses</span>
          <span className="text-xs font-extrabold text-red-600 dark:text-red-400 mt-0.5 block truncate">
            {formatCurrency(expensesPaise, currencyConfig)}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Saved</span>
          <span
            className={`text-xs font-extrabold mt-0.5 block truncate ${
              savedPaise < 0 ? 'text-red-600' : 'text-slate-900 dark:text-white'
            }`}
          >
            {hasIncomeData ? formatCurrency(savedPaise, currencyConfig) : 'N/A'}
          </span>
        </div>
      </div>
    </Card>
  );
};
