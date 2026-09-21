import React, { useState, useEffect } from 'react';
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { AmountInput } from '@/features/transactions/components/AmountInput';
import { budgetRepository } from '@/data/repositories/budgetRepository';
import { userRepository } from '@/data/repositories/userRepository';
import { rupeesToPaise } from '@/core/utils/currencyUtils';
import type { Category } from '@/data/models/Category';

export interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  initialCategoryId?: string | null;
  initialAmountPaise?: number;
  month: number;
  year: number;
  onBudgetSaved: () => void;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  categories,
  initialCategoryId = null,
  initialAmountPaise = 0,
  month,
  year,
  onBudgetSaved,
}) => {
  const [budgetScope, setBudgetScope] = useState<'overall' | 'category'>(
    initialCategoryId ? 'category' : 'overall'
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryId || 'food');
  const [amountInput, setAmountInput] = useState<string>(
    initialAmountPaise ? (initialAmountPaise / 100).toString() : '20000'
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    setBudgetScope(initialCategoryId ? 'category' : 'overall');
    if (initialCategoryId) setSelectedCategory(initialCategoryId);
    setAmountInput(initialAmountPaise ? (initialAmountPaise / 100).toString() : '20000');
  }, [initialCategoryId, initialAmountPaise, isOpen]);

  const parsedPaise = rupeesToPaise(parseFloat(amountInput) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedPaise <= 0 || isSaving) return;

    setIsSaving(true);
    try {
      const user = await userRepository.getCurrentUser();
      const userId = user?.id || 'default_user';

      await budgetRepository.upsertBudget({
        user_id: userId,
        category_id: budgetScope === 'overall' ? null : selectedCategory,
        amount: parsedPaise,
        month,
        year,
      });

      onBudgetSaved();
      onClose();
    } catch (err) {
      console.error('Failed to save budget:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialAmountPaise > 0 ? 'Edit Budget' : 'Set Budget'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Scope Toggle */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setBudgetScope('overall')}
            className={`py-2 rounded-lg transition-all ${
              budgetScope === 'overall'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            Overall Monthly Budget
          </button>
          <button
            type="button"
            onClick={() => setBudgetScope('category')}
            className={`py-2 rounded-lg transition-all ${
              budgetScope === 'category'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            Category Budget
          </button>
        </div>

        {/* Category Selector if Category Budget Scope */}
        {budgetScope === 'category' && (
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Select Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none"
            >
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Amount Input */}
        <AmountInput value={amountInput} onChange={setAmountInput} />

        <Button
          type="submit"
          variant="emerald"
          fullWidth
          size="lg"
          disabled={isSaving || parsedPaise <= 0}
        >
          {isSaving ? 'Saving...' : 'Save Budget'}
        </Button>
      </form>
    </Modal>
  );
};
