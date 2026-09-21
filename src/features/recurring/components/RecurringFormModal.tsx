import React, { useState, useEffect } from 'react';
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { AmountInput } from '@/features/transactions/components/AmountInput';
import { CategoryGrid } from '@/features/transactions/components/CategoryGrid';
import { PaymentSelector } from '@/features/transactions/components/PaymentSelector';
import { recurringRepository } from '@/data/repositories/recurringRepository';
import { userRepository } from '@/data/repositories/userRepository';
import { rupeesToPaise } from '@/core/utils/currencyUtils';
import type { RecurringTransaction, FrequencyType } from '@/data/models/RecurringTransaction';
import type { Category } from '@/data/models/Category';

export interface RecurringFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  rule?: RecurringTransaction | null;
  categories: Category[];
  onRuleSaved: () => void;
}

export const FREQUENCY_OPTIONS: { id: FrequencyType; label: string }[] = [
  { id: 'monthly', label: 'Monthly' },
  { id: '28_days', label: 'Every 28 Days' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'daily', label: 'Daily' },
  { id: 'yearly', label: 'Yearly' },
];

export const RecurringFormModal: React.FC<RecurringFormModalProps> = ({
  isOpen,
  onClose,
  rule,
  categories,
  onRuleSaved,
}) => {
  const [title, setTitle] = useState<string>('');
  const [amountInput, setAmountInput] = useState<string>('6000');
  const [selectedCategory, setSelectedCategory] = useState<string>('rent');
  const [frequency, setFrequency] = useState<FrequencyType>('monthly');
  const [nextDate, setNextDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (rule) {
      setTitle(rule.title);
      setAmountInput((rule.amount / 100).toString());
      setSelectedCategory(rule.category_id);
      setFrequency(rule.frequency);
      setNextDate(rule.next_date);
      setPaymentMethod(rule.payment_method);
    } else {
      setTitle('');
      setAmountInput('6000');
      setSelectedCategory('rent');
      setFrequency('monthly');
      setNextDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('UPI');
    }
  }, [rule, isOpen]);

  const amountPaise = rupeesToPaise(parseFloat(amountInput) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amountPaise <= 0 || isSaving) return;

    setIsSaving(true);
    try {
      const user = await userRepository.getCurrentUser();
      const userId = user?.id || 'default_user';

      if (rule) {
        await recurringRepository.update(rule.id, {
          title: title.trim(),
          amount: amountPaise,
          category_id: selectedCategory,
          frequency,
          next_date: nextDate,
          payment_method: paymentMethod,
        });
      } else {
        await recurringRepository.create({
          user_id: userId,
          title: title.trim(),
          amount: amountPaise,
          category_id: selectedCategory,
          frequency,
          next_date: nextDate,
          payment_method: paymentMethod,
          active: true,
        });
      }

      onRuleSaved();
      onClose();
    } catch (err) {
      console.error('Failed to save recurring expense:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={rule ? 'Edit Recurring Expense' : 'New Recurring Expense'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            Title
          </label>
          <input
            type="text"
            placeholder="e.g. Rent, Netflix, Wifi Bill"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            autoFocus
          />
        </div>

        {/* Amount Input */}
        <AmountInput value={amountInput} onChange={setAmountInput} />

        {/* Frequency Selector */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
            Recurrence Frequency
          </label>
          <div className="flex flex-wrap gap-1.5">
            {FREQUENCY_OPTIONS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFrequency(f.id)}
                className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                  frequency === f.id
                    ? 'border-emerald-500 bg-emerald-600 text-white font-bold shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Grid */}
        <CategoryGrid
          categories={categories}
          selectedCategoryId={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onAddCustomCategoryClick={() => {}}
          type="expense"
        />

        {/* Payment Selector */}
        <PaymentSelector selectedPayment={paymentMethod} onSelectPayment={setPaymentMethod} />

        {/* Next Date */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            First / Next Due Date
          </label>
          <input
            type="date"
            value={nextDate}
            onChange={(e) => setNextDate(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <Button
          type="submit"
          variant="emerald"
          fullWidth
          size="lg"
          disabled={isSaving || !title.trim() || amountPaise <= 0}
        >
          {isSaving ? 'Saving...' : rule ? 'Save Changes' : 'Create Recurring Expense'}
        </Button>
      </form>
    </Modal>
  );
};
