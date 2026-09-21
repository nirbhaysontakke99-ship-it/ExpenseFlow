import React from 'react';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { usePrivacyMode } from '@/core/privacy/PrivacyContext';
import type { Goal } from '@/data/models/Goal';
import { calculateGoalMetrics } from '@/services/goalService';
import { DEFAULT_CURRENCY } from '@/core/constants/currency';
import { Target, Laptop, Smartphone, Headphones, Bike, Plane, GraduationCap, Home, ShieldAlert, PiggyBank, Gamepad2, Car, Gift } from 'lucide-react';

export interface GoalCardProps {
  goal: Goal;
  currencyCode?: string;
  onClick: () => void;
}

export function getGoalIconComponent(iconName: string) {
  switch (iconName) {
    case 'Laptop': return <Laptop className="w-5 h-5" />;
    case 'Phone': return <Smartphone className="w-5 h-5" />;
    case 'Headphones': return <Headphones className="w-5 h-5" />;
    case 'Bike': return <Bike className="w-5 h-5" />;
    case 'Travel': return <Plane className="w-5 h-5" />;
    case 'Education': return <GraduationCap className="w-5 h-5" />;
    case 'Home': return <Home className="w-5 h-5" />;
    case 'Emergency': return <ShieldAlert className="w-5 h-5" />;
    case 'Savings': return <PiggyBank className="w-5 h-5" />;
    case 'Gaming': return <Gamepad2 className="w-5 h-5" />;
    case 'Car': return <Car className="w-5 h-5" />;
    case 'Gift': return <Gift className="w-5 h-5" />;
    default: return <Target className="w-5 h-5" />;
  }
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  currencyCode = 'INR',
  onClick,
}) => {
  const { formatSensitive } = usePrivacyMode();
  const currencyConfig = { ...DEFAULT_CURRENCY, code: currencyCode };
  const metrics = calculateGoalMetrics(goal);
  const { progressPercent, remainingPaise, isCompleted, requiredWeeklyPaise, scheduleStatus } = metrics;

  const targetDateStr = new Date(goal.target_date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });

  return (
    <Card
      variant="default"
      onClick={onClick}
      className="space-y-3 cursor-pointer select-none hover:border-emerald-300 dark:hover:border-emerald-700 transition-all active:scale-[0.99]"
      aria-label={`${goal.name} savings goal: ${progressPercent}% saved`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
            isCompleted
              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
              : 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400'
          }`}>
            {getGoalIconComponent(goal.icon)}
          </div>

          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white block leading-tight">
              {goal.name}
            </h4>
            <span className="text-[11px] font-semibold text-slate-400">
              Target: {targetDateStr}
            </span>
          </div>
        </div>

        <Badge
          variant={isCompleted ? 'healthy' : scheduleStatus === 'behind' ? 'warning' : 'healthy'}
          size="sm"
        >
          {isCompleted ? 'Completed 🎉' : `${progressPercent}%`}
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-900 dark:text-white">
            {formatSensitive(goal.current_amount, currencyConfig)}
          </span>
          <span className="text-slate-400 font-normal">
            / {formatSensitive(goal.target_amount, currencyConfig)}
          </span>
        </div>

        <div
          className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${goal.name} progress: ${progressPercent}%`}
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isCompleted ? 'bg-emerald-500' : 'bg-emerald-600 dark:bg-emerald-400'
            }`}
            style={{ width: `${Math.min(100, progressPercent)}%` }}
          />
        </div>
      </div>

      {/* Status & Weekly Rate */}
      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800">
        <span className="font-semibold text-slate-500">
          {isCompleted
            ? '100% achieved 🎉'
            : `${formatSensitive(remainingPaise, currencyConfig)} remaining`}
        </span>

        {!isCompleted && requiredWeeklyPaise > 0 && (
          <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
            Save {formatSensitive(requiredWeeklyPaise, currencyConfig)}/wk
          </span>
        )}
      </div>
    </Card>
  );
};
