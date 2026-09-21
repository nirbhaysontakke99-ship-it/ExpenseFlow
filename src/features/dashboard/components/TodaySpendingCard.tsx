import React from 'react';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { formatCurrency } from '@/core/utils/currencyUtils';
import type { Transaction } from '@/data/models/Transaction';
import type { Category } from '@/data/models/Category';
import { DEFAULT_CURRENCY } from '@/core/constants/currency';
import { Plus, Sparkles } from 'lucide-react';
import { CategoryIcon } from '@/shared/components/CategoryIcon';

export interface TodaySpendingCardProps {
  todayTransactions: Transaction[];
  todaySpendingPaise: number;
  categoriesMap: Map<string, Category>;
  currencyCode?: string;
  onAddExpenseClick: () => void;
}

export const TodaySpendingCard: React.FC<TodaySpendingCardProps> = ({
  todayTransactions,
  todaySpendingPaise,
  categoriesMap,
  currencyCode = 'INR',
  onAddExpenseClick,
}) => {
  const currencyConfig = { ...DEFAULT_CURRENCY, code: currencyCode };

  return (
    <Card variant="default" className="space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Today's Spending
        </h3>
        {todaySpendingPaise > 0 && (
          <span className="text-xs font-black text-slate-900 dark:text-white">
            Today: {formatCurrency(todaySpendingPaise, currencyConfig)}
          </span>
        )}
      </div>

      {todayTransactions.length === 0 ? (
        <div className="py-6 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">No spending today</h4>
            <p className="text-[11px] text-slate-400">Your wallet is having a quiet day.</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddExpenseClick}
            leftIcon={<Plus className="w-4 h-4 text-emerald-600" />}
          >
            Add Expense
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {todayTransactions.map((tx) => {
            const cat = categoriesMap.get(tx.category_id);
            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-xs">
                    <CategoryIcon category={cat || tx.category_id} className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {tx.note || cat?.name || 'Expense'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {cat?.name || 'General'} • {tx.payment_method}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-xs font-extrabold ${
                    tx.type === 'income'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {tx.type === 'income' ? '+' : '-'}
                  {formatCurrency(tx.amount, currencyConfig)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

