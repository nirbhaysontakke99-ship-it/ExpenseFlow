import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';
import { SyncStatusIndicator } from '@/shared/components/SyncStatusIndicator';

export interface HeaderNavProps {
  isMobileFrameMode?: boolean;
  onToggleFrameMode?: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = () => {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-4 py-3">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {/* Brand identity */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
            <span className="font-bold text-lg leading-none tracking-tighter">EF</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                ExpenseFlow
              </h1>
              <SyncStatusIndicator showLabel={false} />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Track. Understand. Improve.
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1.5">
          <SyncStatusIndicator showLabel={true} className="hidden sm:flex mr-1" />

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={`Current mode: ${resolvedTheme}. Click to switch.`}
            aria-label="Toggle dark mode"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

