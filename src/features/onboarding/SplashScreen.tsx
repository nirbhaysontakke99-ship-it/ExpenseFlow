import React, { useEffect } from 'react';
import { Sparkles } from 'lucide-react';

export interface SplashScreenProps {
  onFinish: () => void;
  durationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  durationMs = 1400,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [onFinish, durationMs]);

  return (
    <div
      onClick={onFinish}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-6 cursor-pointer select-none animate-in fade-in duration-300"
    >
      <div className="flex flex-col items-center gap-4 text-center">
      {/* ExpenseFlow Logo */}
      <img
        src="/expenseflow-icon.png"
        alt="ExpenseFlow"
        className="w-20 h-20 rounded-3xl object-cover"
      />

        {/* Brand Name & Tagline */}
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            ExpenseFlow
          </h1>
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 tracking-wide">
            Track. Understand. Improve.
          </p>
        </div>
      </div>

      {/* Subtle loader footer */}
      <div className="absolute bottom-10 flex flex-col items-center gap-2">
        <div className="w-12 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="w-full h-full bg-emerald-500 animate-pulse" />
        </div>
        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
          Personal Finance for Students & Professionals
        </span>
      </div>
    </div>
  );
};
