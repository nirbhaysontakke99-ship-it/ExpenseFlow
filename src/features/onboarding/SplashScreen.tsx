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
        {/* Brand Badge */}
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-xl shadow-emerald-600/30 border border-emerald-400/30 animate-in zoom-in-90 duration-500">
            <span className="font-extrabold text-3xl tracking-tighter">EF</span>
          </div>
          <div className="absolute -top-1 -right-1 p-1 bg-amber-400 rounded-full text-slate-950 shadow-md">
            <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
          </div>
        </div>

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
