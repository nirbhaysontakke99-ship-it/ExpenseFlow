import React from 'react';
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { recurringRepository } from '@/data/repositories/recurringRepository';
import { AlertTriangle } from 'lucide-react';

export interface DeleteRecurringDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ruleId?: string;
  ruleTitle: string;
  onRuleDeleted: () => void;
}

export const DeleteRecurringDialog: React.FC<DeleteRecurringDialogProps> = ({
  isOpen,
  onClose,
  ruleId,
  ruleTitle,
  onRuleDeleted,
}) => {
  if (!ruleId) return null;

  const handleDelete = async () => {
    try {
      await recurringRepository.delete(ruleId);
      onRuleDeleted();
      onClose();
    } catch (err) {
      console.error('Failed to delete recurring rule:', err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Recurring Expense">
      <div className="py-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Delete recurring rule for {ruleTitle}?
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Existing historical transactions generated from this rule will remain completely untouched.
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" fullWidth onClick={handleDelete}>
            Confirm Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};
