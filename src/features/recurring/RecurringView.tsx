import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { recurringRepository } from '@/data/repositories/recurringRepository';
import { categoryRepository } from '@/data/repositories/categoryRepository';
import { userRepository } from '@/data/repositories/userRepository';
import {
  getDueOrOverdueOccurrences,
  recordOccurrence,
  skipOccurrence,
  pauseRecurringExpense,
  resumeRecurringExpense,
} from '@/services/recurringExpenseService';
import type { RecurringTransaction } from '@/data/models/RecurringTransaction';
import { RecurringExpenseCard } from './components/RecurringExpenseCard';
import { RecurringFormModal } from './components/RecurringFormModal';
import { PendingOccurrencesModal } from './components/PendingOccurrencesModal';
import { DeleteRecurringDialog } from './components/DeleteRecurringDialog';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Plus, Clock, AlertTriangle } from 'lucide-react';

export const RecurringView: React.FC = () => {
  const [selectedRule, setSelectedRule] = useState<RecurringTransaction | null>(null);

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingRule, setEditingRule] = useState<RecurringTransaction | null>(null);
  const [isPendingOpen, setIsPendingOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);

  // Live IndexedDB Query
  const data = useLiveQuery(async () => {
    const user = await userRepository.getCurrentUser();
    if (!user) return null;

    const rules = await recurringRepository.getByUserId(user.id);
    const categories = await categoryRepository.getAll(user.id);
    const categoriesMap = new Map(categories.map((c) => [c.id, c]));

    const pendingOccurrences = await getDueOrOverdueOccurrences(user.id);

    return { user, rules, categories, categoriesMap, pendingOccurrences };
  }, []);

  if (!data) return null;

  const { user, rules, categories, categoriesMap, pendingOccurrences } = data;

  const activeRules = rules.filter((r) => r.active);
  const pausedRules = rules.filter((r) => !r.active);

  const handleRecordNow = async (rule: RecurringTransaction) => {
    await recordOccurrence(rule.id, rule.next_date);
  };

  const handleSkip = async (rule: RecurringTransaction) => {
    await skipOccurrence(rule.id, rule.next_date);
  };

  const handlePauseToggle = async (rule: RecurringTransaction) => {
    if (rule.active) {
      await pauseRecurringExpense(rule.id);
    } else {
      await resumeRecurringExpense(rule.id);
    }
  };

  return (
    <div className="flex-1 p-4 space-y-4 pb-24 max-w-md mx-auto w-full animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Recurring Expenses
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Never forget a regular payment.
          </p>
        </div>
        <Button
          variant="emerald"
          size="sm"
          onClick={() => {
            setEditingRule(null);
            setIsFormOpen(true);
          }}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Rule
        </Button>
      </div>

      {/* Pending Occurrences Alert Banner */}
      {pendingOccurrences.length > 0 && (
        <div
          onClick={() => setIsPendingOpen(true)}
          className="p-3.5 bg-amber-50 dark:bg-amber-950/60 rounded-2xl border border-amber-200 dark:border-amber-900 flex items-center justify-between cursor-pointer hover:bg-amber-100/60 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                {pendingOccurrences.length} Pending Regular Payment{pendingOccurrences.length > 1 ? 's' : ''}
              </span>
              <span className="text-[10px] text-amber-700 dark:text-amber-300 font-medium">
                Tap to review & record in 1 click
              </span>
            </div>
          </div>

          <Button variant="emerald" size="sm">
            Review
          </Button>
        </div>
      )}

      {rules.length === 0 ? (
        <Card variant="flat" className="py-12 text-center space-y-3">
          <Clock className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto opacity-80" />
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              No recurring expenses added
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Add rent, subscriptions, bills, or regular recharges to avoid manual tracking.
            </p>
          </div>
          <Button
            variant="emerald"
            size="sm"
            onClick={() => {
              setEditingRule(null);
              setIsFormOpen(true);
            }}
          >
            Add Recurring Expense
          </Button>
        </Card>
      ) : (
        <div className="space-y-5">
          {/* Active Rules */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Active Recurring Rules ({activeRules.length})
            </h3>
            {activeRules.map((r) => (
              <RecurringExpenseCard
                key={r.id}
                rule={r}
                category={categoriesMap.get(r.category_id)}
                currencyCode={user.currency}
                onRecordNow={handleRecordNow}
                onSkip={handleSkip}
                onPauseToggle={handlePauseToggle}
                onEdit={(ruleToEdit) => {
                  setEditingRule(ruleToEdit);
                  setIsFormOpen(true);
                }}
                onDelete={(ruleToDelete) => {
                  setSelectedRule(ruleToDelete);
                  setIsDeleteOpen(true);
                }}
              />
            ))}
          </div>

          {/* Paused Rules */}
          {pausedRules.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                Paused Rules ({pausedRules.length})
              </h3>
              {pausedRules.map((r) => (
                <RecurringExpenseCard
                  key={r.id}
                  rule={r}
                  category={categoriesMap.get(r.category_id)}
                  currencyCode={user.currency}
                  onRecordNow={handleRecordNow}
                  onSkip={handleSkip}
                  onPauseToggle={handlePauseToggle}
                  onEdit={(ruleToEdit) => {
                    setEditingRule(ruleToEdit);
                    setIsFormOpen(true);
                  }}
                  onDelete={(ruleToDelete) => {
                    setSelectedRule(ruleToDelete);
                    setIsDeleteOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Form Modal */}
      <RecurringFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        rule={editingRule}
        categories={categories}
        onRuleSaved={() => {}}
      />

      {/* Pending Occurrences Review Modal */}
      <PendingOccurrencesModal
        isOpen={isPendingOpen}
        onClose={() => setIsPendingOpen(false)}
        pendingList={pendingOccurrences}
        currencyCode={user.currency}
        onProcessed={() => {}}
      />

      {/* Delete Dialog */}
      {selectedRule && (
        <DeleteRecurringDialog
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          ruleId={selectedRule.id}
          ruleTitle={selectedRule.title}
          onRuleDeleted={() => setSelectedRule(null)}
        />
      )}
    </div>
  );
};
