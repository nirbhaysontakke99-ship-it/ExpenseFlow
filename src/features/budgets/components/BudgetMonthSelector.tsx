import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

export interface BudgetMonthSelectorProps {
  month: number;
  year: number;
  onMonthChange: (month: number, year: number) => void;
}

export const BudgetMonthSelector: React.FC<BudgetMonthSelectorProps> = ({
  month,
  year,
  onMonthChange,
}) => {
  const dateObj = new Date(year, month - 1, 1);
  const formattedMonth = dateObj.toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  const handlePrev = () => {
    let newM = month - 1;
    let newY = year;
    if (newM < 1) {
      newM = 12;
      newY -= 1;
    }
    onMonthChange(newM, newY);
  };

  const handleNext = () => {
    let newM = month + 1;
    let newY = year;
    if (newM > 12) {
      newM = 1;
      newY += 1;
    }
    onMonthChange(newM, newY);
  };

  return (
    <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-2xl">
      <button
        onClick={handlePrev}
        className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
        aria-label="Previous month"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
        <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>{formattedMonth}</span>
      </div>

      <button
        onClick={handleNext}
        className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
        aria-label="Next month"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
