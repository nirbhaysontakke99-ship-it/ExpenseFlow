import React from 'react';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { formatCurrency } from '@/core/utils/currencyUtils';
import type { OverallBudgetDetail } from '@/services/budgetService';
import { DEFAULT_CURRENCY } from '@/core/constants/currency';
import { PieChart, Edit3, Plus, ShieldCheck, AlertTriangle } from 'lucide-react';

export interface OverallBudgetCardProps {
  overallDetail: OverallBudgetDetail;
  currencyCode?: string;
  onEditClick: () => void;
  onCreateClick: () => void;
}

export const OverallBudgetCard: React.FC<OverallBudgetCardProps> = ({
  overallDetail,
  currencyCode = 'INR',
  onEditClick,
  onCreateClick,
}) => {
  const currencyConfig = { ...DEFAULT_CURRENCY, code: currencyCode };
  const { spentPaise, budgetPaise, hasBudget, status } = overallDetail;
  const { percentage, remainingPaise, overAmountPaise, isExceeded, statusText } = status;

  if (!hasBudget) {
    return (
      <Card variant="flat" className="p-5 border border-dashed border-emerald-300 dark:border-emerald-800 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
          <PieChart className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Set your overall monthly budget
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Give your monthly spending a limit and stay in full control of your finances.
          </p>
        </div>
        <Button variant="emerald" size="sm" onClick={onCreateClick} leftIcon={<Plus className="w-4 h-4" />}>
          Create Overall Budget
        </Button>
      </Card>
    );
  }

  const progressBarColor = isExceeded
    ? 'bg-red-500'
    : status.status === 'danger'
    ? 'bg-red-500'
    : status.status === 'warning'
    ? 'bg-amber-500'
    : 'bg-emerald-500';

  return (
    <Card variant="default" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Overall Monthly Budget
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
            {formatCurrency(budgetPaise, currencyConfig)}
          </div>
        </div>

        <button
          onClick={onEditClick}
          className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
          aria-label="Edit monthly budget"
        >
          <Edit3 className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar (Capped at 100% visually so it never overflows container) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-500">
            Spent: {formatCurrency(spentPaise, currencyConfig)}
          </span>
          <span className={isExceeded ? 'text-red-600 font-extrabold' : 'text-slate-700 dark:text-slate-300'}>
            {percentage}% used
          </span>
        </div>

        <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${progressBarColor}`}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>
      </div>

      {/* Status Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
        <span
          className={`font-semibold flex items-center gap-1.5 ${
            isExceeded
              ? 'text-red-600 dark:text-red-400'
              : status.status === 'warning'
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-emerald-600 dark:text-emerald-400'
          }`}
        >
          {isExceeded ? (
            <AlertTriangle className="w-3.5 h-3.5" />
          ) : (
            <ShieldCheck className="w-3.5 h-3.5" />
          )}
          {statusText}
        </span>

        <span className={`font-bold ${isExceeded ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
          {isExceeded
            ? `${formatCurrency(overAmountPaise, currencyConfig)} over budget`
            : `${formatCurrency(remainingPaise, currencyConfig)} remaining`}
        </span>
      </div>
    </Card>
  );
};
