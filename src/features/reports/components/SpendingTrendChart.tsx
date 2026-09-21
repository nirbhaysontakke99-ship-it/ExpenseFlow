import React from 'react';
import { Card } from '@/shared/components/Card';
import { formatCurrency } from '@/core/utils/currencyUtils';
import type { DailyTrendPoint } from '@/services/reportService';
import { DEFAULT_CURRENCY } from '@/core/constants/currency';
import { TrendingUp } from 'lucide-react';

export interface SpendingTrendChartProps {
  trends: DailyTrendPoint[];
  currencyCode?: string;
}

export const SpendingTrendChart: React.FC<SpendingTrendChartProps> = ({
  trends,
  currencyCode = 'INR',
}) => {
  const currencyConfig = { ...DEFAULT_CURRENCY, code: currencyCode };

  if (trends.length === 0) return null;

  const maxExpensePaise = Math.max(1, ...trends.map((t) => t.expensePaise));

  return (
    <Card variant="default" className="space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          Spending Trend
        </h3>
        <span className="text-[11px] font-semibold text-slate-400">
          Max: {formatCurrency(maxExpensePaise, currencyConfig)}
        </span>
      </div>

      {/* SVG Bar Chart Container */}
      <div className="h-32 flex items-end justify-between gap-1 pt-4 pb-1">
        {trends.map((point) => {
          const heightPercent = maxExpensePaise > 0 ? (point.expensePaise / maxExpensePaise) * 100 : 0;
          const isHigh = point.expensePaise === maxExpensePaise && maxExpensePaise > 0;

          return (
            <div
              key={point.dateStr}
              className="flex-1 flex flex-col items-center h-full justify-end group relative"
            >
              {/* Tooltip on hover */}
              {point.expensePaise > 0 && (
                <div className="absolute -top-7 z-10 hidden group-hover:block bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded-md whitespace-nowrap shadow-md">
                  {formatCurrency(point.expensePaise, currencyConfig)}
                </div>
              )}

              {/* Bar */}
              <div
                className={`w-full max-w-[14px] rounded-t-md transition-all duration-300 ${
                  isHigh
                    ? 'bg-amber-500 shadow-xs'
                    : point.expensePaise > 0
                    ? 'bg-emerald-500/80 hover:bg-emerald-600'
                    : 'bg-slate-100 dark:bg-slate-800'
                }`}
                style={{ height: `${Math.max(6, heightPercent)}%` }}
              />
            </div>
          );
        })}
      </div>

      {/* X-axis date labels */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-1 border-t border-slate-100 dark:border-slate-800">
        <span>{trends[0]?.dateStr}</span>
        <span>{trends[Math.floor(trends.length / 2)]?.dateStr}</span>
        <span>{trends[trends.length - 1]?.dateStr}</span>
      </div>
    </Card>
  );
};
