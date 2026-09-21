import { Search } from 'lucide-react';
import type { FilterOptions } from '@/services/transactionService';

export interface TransactionFiltersProps {
  options: FilterOptions;
  onChange: (options: FilterOptions) => void;
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  options,
  onChange,
}) => {
  return (
    <div className="space-y-2.5">
      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search note, category, or UPI..."
          value={options.query || ''}
          onChange={(e) => onChange({ ...options, query: e.target.value })}
          className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Type Toggle & Date Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin text-xs">
        {/* Type pills */}
        {(['all', 'expense', 'income'] as const).map((t) => (
          <button
            key={t}
            onClick={() => onChange({ ...options, type: t })}
            className={`px-3 py-1 rounded-lg capitalize border font-semibold shrink-0 transition-all ${
              (options.type || 'all') === t
                ? 'border-emerald-500 bg-emerald-600 text-white'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900'
            }`}
          >
            {t}
          </button>
        ))}

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 shrink-0 mx-0.5" />

        {/* Date Range Selector */}
        <select
          value={options.dateRange || 'all'}
          onChange={(e) => onChange({ ...options, dateRange: e.target.value as any })}
          className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none shrink-0"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="this_month">This Month</option>
          <option value="last_month">Last Month</option>
        </select>

        {/* Sorting option */}
        <select
          value={options.sortBy || 'newest'}
          onChange={(e) => onChange({ ...options, sortBy: e.target.value as any })}
          className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none shrink-0"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Amount</option>
          <option value="lowest">Lowest Amount</option>
        </select>
      </div>
    </div>
  );
};
