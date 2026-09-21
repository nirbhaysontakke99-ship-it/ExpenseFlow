import React from 'react';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { usePrivacyMode } from '@/core/privacy/PrivacyContext';
import type { RecurringTransaction } from '@/data/models/RecurringTransaction';
import type { Category } from '@/data/models/Category';
import { getOccurrenceStatus } from '@/services/recurringDateService';
import { DEFAULT_CURRENCY } from '@/core/constants/currency';
import { Play, Pause, Edit3, Trash2, CheckCircle2, SkipForward, Clock } from 'lucide-react';

export interface RecurringExpenseCardProps {
  rule: RecurringTransaction;
  category?: Category;
  currencyCode?: string;
  onRecordNow: (rule: RecurringTransaction) => void;
  onSkip: (rule: RecurringTransaction) => void;
  onPauseToggle: (rule: RecurringTransaction) => void;
  onEdit: (rule: RecurringTransaction) => void;
  onDelete: (rule: RecurringTransaction) => void;
}

export const RecurringExpenseCard: React.FC<RecurringExpenseCardProps> = ({
  rule,
  category,
  currencyCode = 'INR',
  onRecordNow,
  onSkip,
  onPauseToggle,
  onEdit,
  onDelete,
}) => {
  const { formatSensitive } = usePrivacyMode();
  const currencyConfig = { ...DEFAULT_CURRENCY, code: currencyCode };
  const status = getOccurrenceStatus(rule.next_date, rule.active);

  const formattedDate = new Date(rule.next_date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });

  const frequencyLabel =
    rule.frequency === 'daily'
      ? 'Daily'
      : rule.frequency === 'weekly'
      ? 'Weekly'
      : rule.frequency === '28_days'
      ? 'Every 28 Days'
      : rule.frequency === 'yearly'
      ? 'Yearly'
      : 'Monthly';

  const badgeVariant =
    status === 'overdue'
      ? 'danger'
      : status === 'due'
      ? 'warning'
      : status === 'paused'
      ? 'neutral'
      : 'healthy';

  return (
    <Card variant="default" className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs">
            <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>

          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white block leading-tight">
              {rule.title}
            </h4>
            <span className="text-[11px] font-semibold text-slate-400">
              {category?.name || 'General'} • {frequencyLabel}
            </span>
          </div>
        </div>

        <Badge variant={badgeVariant} size="sm">
          {status === 'paused'
            ? 'Paused'
            : status === 'due'
            ? 'Due Today'
            : status === 'overdue'
            ? 'Overdue'
            : 'Upcoming'}
        </Badge>
      </div>

      {/* Amount & Due Date */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Amount</span>
          <span className="font-extrabold text-slate-900 dark:text-white">
            {formatSensitive(rule.amount, currencyConfig)}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Next Due</span>
          <span className="font-bold text-slate-700 dark:text-slate-300">
            {formattedDate} ({rule.payment_method})
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
        <div className="flex gap-1.5">
          {rule.active && (
            <>
              <button
                onClick={() => onRecordNow(rule)}
                className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1 hover:bg-emerald-200 focus:outline-none"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Record Now
              </button>
              <button
                onClick={() => onSkip(rule)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1 hover:bg-slate-200 focus:outline-none"
              >
                <SkipForward className="w-3.5 h-3.5" /> Skip
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onPauseToggle(rule)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors focus:outline-none"
            title={rule.active ? 'Pause Rule' : 'Resume Rule'}
          >
            {rule.active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => onEdit(rule)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors focus:outline-none"
            title="Edit Rule"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(rule)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 transition-colors focus:outline-none"
            title="Delete Rule"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </Card>
  );
};
