import React from 'react';
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { goalRepository } from '@/data/repositories/goalRepository';
import { AlertTriangle } from 'lucide-react';

export interface DeleteGoalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  goalId?: string;
  goalName: string;
  onGoalDeleted: () => void;
}

export const DeleteGoalDialog: React.FC<DeleteGoalDialogProps> = ({
  isOpen,
  onClose,
  goalId,
  goalName,
  onGoalDeleted,
}) => {
  if (!goalId) return null;

  const handleDelete = async () => {
    try {
      await goalRepository.delete(goalId);
      onGoalDeleted();
      onClose();
    } catch (err) {
      console.error('Failed to delete goal:', err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Savings Goal">
      <div className="py-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Delete {goalName}?
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Your contribution history for this goal will also be removed. Unrelated transaction records remain untouched.
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
