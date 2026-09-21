import React from 'react';
import { Card } from '@/shared/components/Card';
import { usePrivacyMode } from '@/core/privacy/PrivacyContext';
import type { Transaction } from '@/data/models/Transaction';
import type { Category } from '@/data/models/Category';
import { DEFAULT_CURRENCY } from '@/core/constants/currency';
import { Receipt, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export interface RecentTransactionsCardProps {
  transactions: Transaction[];
  categoriesMap: Map<string, Category>;
  currencyCode?: string;
}

export const RecentTransactionsCard: React.FC<RecentTransactionsCardProps> = ({
  transactions,
  categoriesMap,
  currencyCode = 'INR',
}) => {
  const { formatSensitive } = usePrivacyMode();
  const currencyConfig = { ...DEFAULT_CURRENCY, code: currencyCode };

  if (transactions.length === 0) return null;

  return (
    <Card variant="default" className="space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Recent Transactions
        </h3>
        <Receipt className="w-4 h-4 text-slate-400" />
      </div>

      <div className="space-y-2">
        {transactions.map((tx) => {
          const cat = categoriesMap.get(tx.category_id);
          const isIncome = tx.type === 'income';

          return (
            <div
              key={tx.id}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isIncome
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {isIncome ? (
                    <ArrowDownRight className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    {tx.note || cat?.name || 'Transaction'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {cat?.name || 'General'} • {tx.date}
                  </span>
                </div>
              </div>

              <span
                className={`text-xs font-extrabold ${
                  isIncome
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-900 dark:text-white'
                }`}
              >
                {isIncome ? '+' : '-'}
                {formatSensitive(tx.amount, currencyConfig)}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
