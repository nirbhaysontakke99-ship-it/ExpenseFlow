import React from 'react';
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { budgetRepository } from '@/data/repositories/budgetRepository';
import { AlertTriangle } from 'lucide-react';

export interface DeleteBudgetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  budgetId?: string;
  budgetName: string;
  onBudgetDeleted: () => void;
}

export const DeleteBudgetDialog: React.FC<DeleteBudgetDialogProps> = ({
  isOpen,
  onClose,
  budgetId,
  budgetName,
  onBudgetDeleted,
}) => {
  if (!budgetId) return null;

  const handleDelete = async () => {
    try {
      await budgetRepository.delete(budgetId);
      onBudgetDeleted();
      onClose();
    } catch (err) {
      console.error('Failed to delete budget:', err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Budget">
      <div className="py-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Delete budget for {budgetName}?
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Your transactions remain completely untouched. Only the budget limit will be removed.
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
