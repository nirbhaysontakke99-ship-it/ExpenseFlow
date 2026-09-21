import React from 'react';
import { Card } from '@/shared/components/Card';
import { usePrivacyMode } from '@/core/privacy/PrivacyContext';
import { DEFAULT_CURRENCY } from '@/core/constants/currency';

export interface MoneySummaryCardProps {
  incomePaise: number;
  expensesPaise: number;
  remainingPaise: number;
  currencyCode?: string;
}

export const MoneySummaryCard: React.FC<MoneySummaryCardProps> = ({
  incomePaise,
  expensesPaise,
  remainingPaise,
  currencyCode = 'INR',
}) => {
  const { formatSensitive } = usePrivacyMode();
  const currencyConfig = { ...DEFAULT_CURRENCY, code: currencyCode };

  return (
    <div className="grid grid-cols-3 gap-2.5">
      <Card variant="flat" className="p-3 text-center">
        <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block tracking-wider">
          Income
        </span>
        <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block truncate">
          {formatSensitive(incomePaise, currencyConfig)}
        </span>
      </Card>

      <Card variant="flat" className="p-3 text-center">
        <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block tracking-wider">
          Expenses
        </span>
        <span className="text-xs font-extrabold text-red-600 dark:text-red-400 mt-1 block truncate">
          {formatSensitive(expensesPaise, currencyConfig)}
        </span>
      </Card>

      <Card variant="flat" className="p-3 text-center">
        <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block tracking-wider">
          Remaining
        </span>
        <span
          className={`text-xs font-extrabold mt-1 block truncate ${
            remainingPaise < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'
          }`}
        >
          {formatSensitive(remainingPaise, currencyConfig)}
        </span>
      </Card>
    </div>
  );
};
