import React, { useState } from 'react';
import type { PeriodType } from '@/services/reportDateService';

export interface PeriodSelectorProps {
  period: PeriodType;
  customStart?: string;
  customEnd?: string;
  onPeriodChange: (period: PeriodType, customStart?: string, customEnd?: string) => void;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  period,
  customStart = '',
  customEnd = '',
  onPeriodChange,
}) => {
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [start, setStart] = useState<string>(customStart || new Date().toISOString().split('T')[0]);
  const [end, setEnd] = useState<string>(customEnd || new Date().toISOString().split('T')[0]);

  const periods: { id: PeriodType; label: string }[] = [
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: 'this_month', label: 'This Month' },
    { id: 'last_month', label: 'Last Month' },
    { id: 'custom', label: 'Custom' },
  ];

  const handleSelect = (p: PeriodType) => {
    if (p === 'custom') {
      setShowCustomModal(true);
    } else {
      setShowCustomModal(false);
      onPeriodChange(p);
    }
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (start && end && start <= end) {
      setShowCustomModal(false);
      onPeriodChange('custom', start, end);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin text-xs">
        {periods.map((p) => {
          const isSelected = period === p.id;
          return (
            <button
              key={p.id}
              onClick={() => handleSelect(p.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold shrink-0 transition-all border ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-600 text-white shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {showCustomModal && (
        <form onSubmit={handleApplyCustom} className="p-3 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
          <span className="text-slate-400 font-bold">to</span>
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
          <button
            type="submit"
            className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700"
          >
            Apply
          </button>
        </form>
      )}
    </div>
  );
};
