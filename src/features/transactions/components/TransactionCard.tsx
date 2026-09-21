import React from 'react';
import type { Transaction } from '@/data/models/Transaction';
import type { Category } from '@/data/models/Category';
import { formatCurrency } from '@/core/utils/currencyUtils';
import { DEFAULT_CURRENCY } from '@/core/constants/currency';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export interface TransactionCardProps {
  transaction: Transaction;
  category?: Category;
  currencyCode?: string;
  onClick?: () => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  category,
  currencyCode = 'INR',
  onClick,
}) => {
  const currencyConfig = { ...DEFAULT_CURRENCY, code: currencyCode };
  const isIncome = transaction.type === 'income';

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer select-none active:scale-[0.99]"
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isIncome
              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
          }`}
        >
          {isIncome ? (
            <ArrowDownRight className="w-5 h-5" />
          ) : (
            <ArrowUpRight className="w-5 h-5 text-red-500" />
          )}
        </div>

        <div>
          <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
            {transaction.note || category?.name || 'Transaction'}
          </span>
          <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
            {category?.name || 'General'} • {transaction.payment_method}
          </span>
        </div>
      </div>

      <div className="text-right">
        <span
          className={`text-xs font-black block ${
            isIncome
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-900 dark:text-white'
          }`}
        >
          {isIncome ? '+' : '-'}
          {formatCurrency(transaction.amount, currencyConfig)}
        </span>
        <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
          {transaction.date}
        </span>
      </div>
    </div>
  );
};
