import React, { useState } from 'react';
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { AmountInput } from '@/features/transactions/components/AmountInput';
import { addContributionToGoal } from '@/services/goalService';
import { rupeesToPaise } from '@/core/utils/currencyUtils';

export interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalId: string;
  goalName: string;
  onContributionAdded: () => void;
}

export const ContributionModal: React.FC<ContributionModalProps> = ({
  isOpen,
  onClose,
  goalId,
  goalName,
  onContributionAdded,
}) => {
  const [amountInput, setAmountInput] = useState<string>('500');
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const amountPaise = rupeesToPaise(parseFloat(amountInput) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amountPaise <= 0 || isSaving) return;

    setIsSaving(true);
    try {
      await addContributionToGoal(goalId, amountPaise, note.trim() || undefined, date);
      setAmountInput('500');
      setNote('');
      onContributionAdded();
      onClose();
    } catch (err) {
      console.error('Failed to add contribution:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Add Money to ${goalName}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <AmountInput value={amountInput} onChange={setAmountInput} />

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            Note (optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Saved from this week's pocket money"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <Button
          type="submit"
          variant="emerald"
          fullWidth
          size="lg"
          disabled={isSaving || amountPaise <= 0}
        >
          {isSaving ? 'Saving...' : 'Add Contribution'}
        </Button>
      </form>
    </Modal>
  );
};
