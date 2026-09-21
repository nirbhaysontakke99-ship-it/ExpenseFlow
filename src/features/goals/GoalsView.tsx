import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { goalRepository } from '@/data/repositories/goalRepository';
import { userRepository } from '@/data/repositories/userRepository';
import type { Goal } from '@/data/models/Goal';
import { GoalCard } from './components/GoalCard';
import { GoalFormModal } from './components/GoalFormModal';
import { GoalDetailModal } from './components/GoalDetailModal';
import { ContributionModal } from './components/ContributionModal';
import { DeleteGoalDialog } from './components/DeleteGoalDialog';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Plus, Target, CheckCircle2 } from 'lucide-react';

export const GoalsView: React.FC = () => {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  // Modal States
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isContribOpen, setIsContribOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);

  // Live IndexedDB Query
  const data = useLiveQuery(async () => {
    const user = await userRepository.getCurrentUser();
    if (!user) return null;

    const goals = await goalRepository.getByUserId(user.id);
    const selectedContribs = selectedGoal
      ? await goalRepository.getContributions(selectedGoal.id)
      : [];

    return { user, goals, selectedContribs };
  }, [selectedGoal]);

  if (!data) return null;

  const { user, goals, selectedContribs } = data;

  const activeGoals = goals.filter((g) => g.status !== 'completed' && g.current_amount < g.target_amount);
  const completedGoals = goals.filter((g) => g.status === 'completed' || g.current_amount >= g.target_amount);

  const handleGoalCardClick = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsDetailOpen(true);
  };

  return (
    <div className="flex-1 p-4 space-y-4 pb-24 max-w-md mx-auto w-full animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            My Goals
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Give your money a destination.
          </p>
        </div>
        <Button
          variant="emerald"
          size="sm"
          onClick={() => {
            setEditingGoal(null);
            setIsFormOpen(true);
          }}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          New Goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <Card variant="flat" className="py-12 text-center space-y-3">
          <Target className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto opacity-80" />
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Give your money a destination
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Create your first savings goal and watch your progress grow.
            </p>
          </div>
          <Button
            variant="emerald"
            size="sm"
            onClick={() => {
              setEditingGoal(null);
              setIsFormOpen(true);
            }}
          >
            Create Goal
          </Button>
        </Card>
      ) : (
        <div className="space-y-5">
          {/* Active Goals Section */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Active Goals ({activeGoals.length})
            </h3>
            {activeGoals.length === 0 ? (
              <p className="text-xs text-slate-400 px-1 italic">
                All goals completed! Create a new goal to keep saving.
              </p>
            ) : (
              activeGoals.map((g) => (
                <GoalCard
                  key={g.id}
                  goal={g}
                  currencyCode={user.currency}
                  onClick={() => handleGoalCardClick(g)}
                />
              ))
            )}
          </div>

          {/* Completed Goals Section */}
          {completedGoals.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1 px-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Completed Goals ({completedGoals.length})
              </h3>
              {completedGoals.map((g) => (
                <GoalCard
                  key={g.id}
                  goal={g}
                  currencyCode={user.currency}
                  onClick={() => handleGoalCardClick(g)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Goal Detail Modal */}
      <GoalDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        goal={selectedGoal}
        contributions={selectedContribs}
        currencyCode={user.currency}
        onOpenAddContribution={() => setIsContribOpen(true)}
        onOpenEditGoal={() => {
          setIsDetailOpen(false);
          setEditingGoal(selectedGoal);
          setIsFormOpen(true);
        }}
        onOpenDeleteGoal={() => {
          setIsDetailOpen(false);
          setIsDeleteOpen(true);
        }}
        onGoalUpdated={async () => {
          if (selectedGoal) {
            const updated = await goalRepository.getById(selectedGoal.id);
            if (updated) setSelectedGoal(updated);
          }
        }}
      />

      {/* Goal Form Modal */}
      <GoalFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        goal={editingGoal}
        onGoalSaved={() => {}}
      />

      {/* Add Contribution Modal */}
      {selectedGoal && (
        <ContributionModal
          isOpen={isContribOpen}
          onClose={() => setIsContribOpen(false)}
          goalId={selectedGoal.id}
          goalName={selectedGoal.name}
          onContributionAdded={async () => {
            const updated = await goalRepository.getById(selectedGoal.id);
            if (updated) setSelectedGoal(updated);
          }}
        />
      )}

      {/* Delete Goal Dialog */}
      {selectedGoal && (
        <DeleteGoalDialog
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          goalId={selectedGoal.id}
          goalName={selectedGoal.name}
          onGoalDeleted={() => setSelectedGoal(null)}
        />
      )}
    </div>
  );
};
