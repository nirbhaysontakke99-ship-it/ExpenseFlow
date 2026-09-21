import React from 'react';
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { formatCurrency } from '@/core/utils/currencyUtils';
import type { Goal } from '@/data/models/Goal';
import type { GoalContribution } from '@/data/models/GoalContribution';
import { calculateGoalMetrics, deleteContributionFromGoal } from '@/services/goalService';
import { getGoalIconComponent } from './GoalCard';
import { DEFAULT_CURRENCY } from '@/core/constants/currency';
import { Plus, Edit3, Trash2, Calendar, Sparkles } from 'lucide-react';

export interface GoalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal | null;
  contributions: GoalContribution[];
  currencyCode?: string;
  onOpenAddContribution: () => void;
  onOpenEditGoal: () => void;
  onOpenDeleteGoal: () => void;
  onGoalUpdated: () => void;
}

export const GoalDetailModal: React.FC<GoalDetailModalProps> = ({
  isOpen,
  onClose,
  goal,
  contributions,
  currencyCode = 'INR',
  onOpenAddContribution,
  onOpenEditGoal,
  onOpenDeleteGoal,
  onGoalUpdated,
}) => {
  if (!goal) return null;

  const currencyConfig = { ...DEFAULT_CURRENCY, code: currencyCode };
  const metrics = calculateGoalMetrics(goal);
  const { progressPercent, isCompleted, requiredWeeklyPaise, motivationalText } = metrics;

  const formattedTargetDate = new Date(goal.target_date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handleDeleteContribution = async (contribId: string) => {
    try {
      await deleteContributionFromGoal(contribId, goal.id);
      onGoalUpdated();
    } catch (err) {
      console.error('Failed to delete contribution:', err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Goal Details">
      <div className="space-y-4">
        {/* Goal Hero Card */}
        <div className="text-center py-5 px-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            {getGoalIconComponent(goal.icon)}
          </div>

          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {goal.name}
            </h3>
            {goal.description && (
              <p className="text-xs text-slate-500 mt-0.5">{goal.description}</p>
            )}
          </div>

          <div className="space-y-1 pt-1">
            <span className="text-3xl font-black text-slate-900 dark:text-white block tracking-tight">
              {formatCurrency(goal.current_amount, currencyConfig)}
            </span>
            <span className="text-xs text-slate-400 font-semibold block">
              Target: {formatCurrency(goal.target_amount, currencyConfig)}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCompleted ? 'bg-emerald-500' : 'bg-emerald-600 dark:bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, progressPercent)}%` }}
            />
          </div>

          {/* Motivational Microcopy */}
          <div className="flex items-center justify-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{motivationalText}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Target Date</span>
            <span className="font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> {formattedTargetDate}
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Required Weekly</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              {isCompleted ? 'Completed 🎉' : `${formatCurrency(requiredWeeklyPaise, currencyConfig)}/wk`}
            </span>
          </div>
        </div>

        {/* Primary Add Money CTA */}
        <Button
          variant="emerald"
          fullWidth
          size="lg"
          onClick={onOpenAddContribution}
          leftIcon={<Plus className="w-5 h-5" />}
        >
          Add Money
        </Button>

        {/* Contribution History */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Contribution History ({contributions.length})
          </h4>

          {contributions.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">
              No contributions added yet. Tap "+ Add Money" to start saving.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
              {contributions.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs"
                >
                  <div>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 block">
                      +{formatCurrency(c.amount, currencyConfig)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {c.date} {c.note ? `• ${c.note}` : ''}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteContribution(c.id)}
                    className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                    aria-label="Delete contribution"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit / Delete Goal controls */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenEditGoal}
            leftIcon={<Edit3 className="w-3.5 h-3.5" />}
          >
            Edit Goal
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onOpenDeleteGoal}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Delete Goal
          </Button>
        </div>
      </div>
    </Modal>
  );
};
