import React from 'react';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import type { MoneyHealthResult } from '@/services/moneyHealthService';
import { HeartPulse, ChevronRight } from 'lucide-react';

export interface MoneyHealthCardProps {
  healthResult: MoneyHealthResult;
  onClick: () => void;
}

export const MoneyHealthCard: React.FC<MoneyHealthCardProps> = ({
  healthResult,
  onClick,
}) => {
  const { totalScore, healthLevel, hasSufficientData } = healthResult;

  const badgeVariant =
    healthLevel === 'Excellent' || healthLevel === 'Healthy'
      ? 'healthy'
      : healthLevel === 'Fair'
      ? 'warning'
      : 'danger';

  return (
    <Card
      variant="default"
      onClick={onClick}
      className="p-4 flex items-center justify-between cursor-pointer select-none hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
    >
      <div className="flex items-center gap-3">
        {/* Score Ring / Badge */}
        <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
            <path
              className="text-slate-100 dark:text-slate-800"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-emerald-500 transition-all duration-500"
              strokeDasharray={`${hasSufficientData ? totalScore : 100}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="absolute text-xs font-black text-slate-900 dark:text-white">
            {hasSufficientData ? totalScore : '--'}
          </span>
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <HeartPulse className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              ExpenseFlow Money Health
            </span>
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
              {hasSufficientData ? healthLevel : 'Building Your Score'}
            </h4>
            {hasSufficientData && (
              <Badge variant={badgeVariant} size="sm">
                {totalScore}/100
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center text-slate-400">
        <ChevronRight className="w-4 h-4" />
      </div>
    </Card>
  );
};
