import React from 'react';
import { Card } from '@/shared/components/Card';
import { useLiveQuery } from 'dexie-react-hooks';
import { recurringRepository } from '@/data/repositories/recurringRepository';
import { userRepository } from '@/data/repositories/userRepository';
import { formatCurrency } from '@/core/utils/currencyUtils';
import { DEFAULT_CURRENCY } from '@/core/constants/currency';
import { getOccurrenceStatus } from '@/services/recurringDateService';
import { Clock, ChevronRight } from 'lucide-react';

export interface RecurringPreviewCardProps {
  onNavigateRecurring?: () => void;
}

export const RecurringPreviewCard: React.FC<RecurringPreviewCardProps> = ({
  onNavigateRecurring,
}) => {
  const data = useLiveQuery(async () => {
    const user = await userRepository.getCurrentUser();
    if (!user) return null;

    const rules = await recurringRepository.getByUserId(user.id);
    const active = rules.filter((r) => r.active);
    active.sort((a, b) => a.next_date.localeCompare(b.next_date));

    return { user, topRule: active[0] || null };
  }, []);

  if (!data || !data.topRule) return null;

  const { user, topRule } = data;
  const status = getOccurrenceStatus(topRule.next_date, topRule.active);

  const formattedDate = new Date(topRule.next_date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });

  const currencyConfig = { ...DEFAULT_CURRENCY, code: user.currency };

  return (
    <Card
      variant="default"
      onClick={onNavigateRecurring}
      className="p-3.5 flex items-center justify-between cursor-pointer select-none hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
          <Clock className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Upcoming Recurring
          </span>
          <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
            {topRule.title}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-right">
          <span className="text-xs font-black text-slate-900 dark:text-white block">
            {formatCurrency(topRule.amount, currencyConfig)}
          </span>
          <span
            className={`text-[10px] font-semibold block ${
              status === 'due' || status === 'overdue'
                ? 'text-amber-600 font-bold'
                : 'text-slate-400'
            }`}
          >
            {status === 'due' ? 'Due Today' : `Due ${formattedDate}`}
          </span>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </div>
    </Card>
  );
};
