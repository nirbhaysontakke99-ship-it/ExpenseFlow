import React from 'react';
import { Card } from '@/shared/components/Card';
import { useLiveQuery } from 'dexie-react-hooks';
import { goalRepository } from '@/data/repositories/goalRepository';
import { userRepository } from '@/data/repositories/userRepository';
import { calculateGoalMetrics } from '@/services/goalService';
import { usePrivacyMode } from '@/core/privacy/PrivacyContext';
import { DEFAULT_CURRENCY } from '@/core/constants/currency';
import { getGoalIconComponent } from '@/features/goals/components/GoalCard';
import { ChevronRight } from 'lucide-react';

export interface GoalPreviewCardProps {
  onNavigateGoals?: () => void;
}

export const GoalPreviewCard: React.FC<GoalPreviewCardProps> = ({ onNavigateGoals }) => {
  const { formatSensitive } = usePrivacyMode();
  const goalData = useLiveQuery(async () => {
    const user = await userRepository.getCurrentUser();
    if (!user) return null;
    const goals = await goalRepository.getByUserId(user.id);
    const active = goals.filter((g) => g.status !== 'completed' && g.current_amount < g.target_amount);
    return { user, topGoal: active[0] || null };
  }, []);

  if (!goalData || !goalData.topGoal) return null;

  const { user, topGoal } = goalData;
  const metrics = calculateGoalMetrics(topGoal);
  const currencyConfig = { ...DEFAULT_CURRENCY, code: user.currency };

  return (
    <Card
      variant="default"
      onClick={onNavigateGoals}
      className="p-3.5 flex items-center justify-between cursor-pointer select-none hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          {getGoalIconComponent(topGoal.icon)}
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Savings Goal
          </span>
          <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
            {topGoal.name}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-right">
          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block">
            {metrics.progressPercent}%
          </span>
          <span className="text-[10px] text-slate-400 font-medium block">
            {formatSensitive(metrics.remainingPaise, currencyConfig)} to go
          </span>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </div>
    </Card>
  );
};
