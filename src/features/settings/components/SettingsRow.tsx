import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface SettingsRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  value?: React.ReactNode;
  onClick?: () => void;
  isDanger?: boolean;
}

export const SettingsRow: React.FC<SettingsRowProps> = ({
  icon,
  title,
  subtitle,
  value,
  onClick,
  isDanger = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`p-3.5 flex items-center justify-between transition-colors ${
        onClick ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0 ${
            isDanger
              ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400'
              : 'bg-slate-100 dark:bg-slate-800'
          }`}
        >
          {icon}
        </div>

        <div>
          <span
            className={`text-xs font-bold block ${
              isDanger ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'
            }`}
          >
            {title}
          </span>
          {subtitle && (
            <span className="text-[11px] text-slate-400 font-medium block">{subtitle}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {value && <div className="text-xs text-slate-500 font-semibold">{value}</div>}
        {onClick && <ChevronRight className="w-4 h-4 text-slate-400" />}
      </div>
    </div>
  );
};
