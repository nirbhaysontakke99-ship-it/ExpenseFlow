import React from 'react';
import { Card } from '@/shared/components/Card';
import { usePrivacyMode } from '@/core/privacy/PrivacyContext';
import { type BudgetStatusResult } from '@/services/budgetService';
import { DEFAULT_CURRENCY } from '@/core/constants/currency';
import { PieChart } from 'lucide-react';

export interface BudgetProgressCardProps {
  budgetStatus: BudgetStatusResult;
  currencyCode?: string;
  onSetBudgetClick?: () => void;
}

export const BudgetProgressCard: React.FC<BudgetProgressCardProps> = ({
  budgetStatus,
  currencyCode = 'INR',
  onSetBudgetClick,
}) => {
  const { formatSensitive } = usePrivacyMode();
  const currencyConfig = { ...DEFAULT_CURRENCY, code: currencyCode };
  const {
    spentPaise,
    budgetPaise,
    remainingPaise,
    overAmountPaise,
    percentage,
    status,
    isExceeded,
  } = budgetStatus;

  if (budgetPaise <= 0) {
    return (
      <Card variant="default" className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">No Monthly Budget Set</h4>
            <p className="text-[11px] text-slate-400">Set a budget cap to stay on track</p>
          </div>
        </div>
        {onSetBudgetClick && (
          <button
            onClick={onSetBudgetClick}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline focus:outline-none"
          >
            Set Budget
          </button>
        )}
      </Card>
    );
  }

  const progressBarColor =
    status === 'danger'
      ? 'bg-red-500'
      : status === 'warning'
      ? 'bg-amber-500'
      : 'bg-emerald-500';

  return (
    <Card variant="default" className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PieChart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Monthly Budget
          </h3>
        </div>
        <span className="text-xs font-extrabold text-slate-900 dark:text-white">
          {percentage}%
        </span>
      </div>

      {/* Progress Bar with ARIA accessibility */}
      <div
        className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Monthly budget progress: ${percentage}% used`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${progressBarColor}`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs pt-1">
        <span className="font-semibold text-slate-500">
          {formatSensitive(spentPaise, currencyConfig)} / {formatSensitive(budgetPaise, currencyConfig)}
        </span>

        <span
          className={`font-bold ${
            isExceeded ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
          }`}
        >
          {isExceeded
            ? `${formatSensitive(overAmountPaise, currencyConfig)} over budget`
            : `${formatSensitive(remainingPaise, currencyConfig)} remaining`}
        </span>
      </div>
    </Card>
  );
};
