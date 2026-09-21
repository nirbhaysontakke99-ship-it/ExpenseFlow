import React from 'react';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { formatCurrency } from '@/core/utils/currencyUtils';
import type { CategoryBudgetDetail } from '@/services/budgetService';
import { DEFAULT_CURRENCY } from '@/core/constants/currency';
import { Edit3, Trash2, Plus } from 'lucide-react';

export interface CategoryBudgetCardProps {
  detail: CategoryBudgetDetail;
  currencyCode?: string;
  onEditClick: (detail: CategoryBudgetDetail) => void;
  onDeleteClick: (detail: CategoryBudgetDetail) => void;
  onCreateClick: (categoryId: string) => void;
}

export const CategoryBudgetCard: React.FC<CategoryBudgetCardProps> = ({
  detail,
  currencyCode = 'INR',
  onEditClick,
  onDeleteClick,
  onCreateClick,
}) => {
  const currencyConfig = { ...DEFAULT_CURRENCY, code: currencyCode };
  const {
    categoryId,
    categoryName,
    spentPaise,
    budgetPaise,
    hasBudget,
    status,
  } = detail;

  const { percentage, remainingPaise, overAmountPaise, isExceeded } = status;

  if (!hasBudget) {
    return (
      <Card variant="flat" className="p-3.5 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">{categoryName}</h4>
          <span className="text-[11px] text-slate-500 font-medium">
            Spent: {formatCurrency(spentPaise, currencyConfig)} • No budget set
          </span>
        </div>
        <button
          onClick={() => onCreateClick(categoryId)}
          className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Set Budget
        </button>
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

  const badgeVariant = isExceeded
    ? 'danger'
    : status.status === 'danger' || status.status === 'warning'
    ? 'warning'
    : 'healthy';

  return (
    <Card variant="default" className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
            {categoryName}
          </h4>
          <Badge variant={badgeVariant} size="sm">
            {isExceeded ? 'Exceeded' : `${percentage}%`}
          </Badge>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEditClick(detail)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            aria-label="Edit category budget"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDeleteClick(detail)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
            aria-label="Delete category budget"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${progressBarColor}`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs pt-0.5">
        <span className="font-semibold text-slate-500">
          {formatCurrency(spentPaise, currencyConfig)} / {formatCurrency(budgetPaise, currencyConfig)}
        </span>

        <span
          className={`font-bold ${
            isExceeded ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'
          }`}
        >
          {isExceeded
            ? `${formatCurrency(overAmountPaise, currencyConfig)} over`
            : `${formatCurrency(remainingPaise, currencyConfig)} remaining`}
        </span>
      </div>
    </Card>
  );
};
