import React, { useState } from 'react';
import { Card } from '@/shared/components/Card';
import { formatCurrency } from '@/core/utils/currencyUtils';
import type { CategoryBreakdownItem } from '@/services/reportService';
import { DEFAULT_CURRENCY } from '@/core/constants/currency';
import { PieChart, X } from 'lucide-react';

export interface ExpenseBreakdownChartProps {
  breakdown: CategoryBreakdownItem[];
  currencyCode?: string;
}

export const ExpenseBreakdownChart: React.FC<ExpenseBreakdownChartProps> = ({
  breakdown,
  currencyCode = 'INR',
}) => {
  const currencyConfig = { ...DEFAULT_CURRENCY, code: currencyCode };
  const [selectedCategory, setSelectedCategory] = useState<CategoryBreakdownItem | null>(null);

  if (breakdown.length === 0) return null;

  // Compute SVG Donut Chart Segments
  const totalAmountPaise = breakdown.reduce((sum, item) => sum + item.amountPaise, 0);

  let accumulatedPercent = 0;
  const segments = breakdown.map((item) => {
    const startAngle = accumulatedPercent * 360;
    const itemPercent = totalAmountPaise > 0 ? item.amountPaise / totalAmountPaise : 0;
    accumulatedPercent += itemPercent;
    const endAngle = accumulatedPercent * 360;

    return {
      ...item,
      startAngle,
      endAngle,
    };
  });

  return (
    <Card variant="default" className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <PieChart className="w-4 h-4 text-emerald-500" />
          Expense Breakdown
        </h3>
        {selectedCategory && (
          <button
            onClick={() => setSelectedCategory(null)}
            className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
          >
            <X className="w-3 h-3" /> View All
          </button>
        )}
      </div>

      {/* Selected Category Drill-Down Banner */}
      {selectedCategory ? (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-1.5 animate-in fade-in duration-200">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black text-slate-900 dark:text-white">
              {selectedCategory.categoryName}
            </span>
            <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
              {selectedCategory.percentage}% of expenses
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">Total Spent</span>
              <span className="font-bold text-slate-900 dark:text-white block">
                {formatCurrency(selectedCategory.amountPaise, currencyConfig)}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block">Transactions</span>
              <span className="font-bold text-slate-900 dark:text-white block">
                {selectedCategory.transactionCount}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block">Average</span>
              <span className="font-bold text-slate-900 dark:text-white block">
                {formatCurrency(selectedCategory.averageTransactionPaise, currencyConfig)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Donut Visual Representation */
        <div className="flex items-center justify-center py-2">
          <div className="relative w-36 h-36">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {segments.map((seg, idx) => {
                const strokeDasharray = `${seg.endAngle - seg.startAngle} 360`;
                const strokeDashoffset = -seg.startAngle;

                return (
                  <circle
                    key={seg.categoryId || idx}
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke={seg.categoryColor}
                    strokeWidth="16"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                    onClick={() => setSelectedCategory(seg)}
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
              <span className="text-xs font-black text-slate-900 dark:text-white">
                {formatCurrency(totalAmountPaise, currencyConfig)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Category List */}
      <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
        {breakdown.map((cat) => (
          <div
            key={cat.categoryId}
            onClick={() => setSelectedCategory(cat)}
            className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
              selectedCategory?.categoryId === cat.categoryId
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60'
                : 'border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-3.5 h-3.5 rounded-full shrink-0"
                style={{ backgroundColor: cat.categoryColor }}
              />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {cat.categoryName}
              </span>
            </div>

            <div className="text-right">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                {formatCurrency(cat.amountPaise, currencyConfig)}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {cat.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
