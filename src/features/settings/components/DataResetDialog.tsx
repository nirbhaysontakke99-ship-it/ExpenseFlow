import React, { useState } from 'react';
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { resetAllLocalData } from '@/services/settingsService';
import { AlertTriangle } from 'lucide-react';

export interface DataResetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDataResetCompleted: () => void;
}

export const DataResetDialog: React.FC<DataResetDialogProps> = ({
  isOpen,
  onClose,
  onDataResetCompleted,
}) => {
  const [confirmText, setConfirmText] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleConfirmReset = async () => {
    if (confirmText.toUpperCase() !== 'DELETE' || isDeleting) return;
    setIsDeleting(true);

    try {
      await resetAllLocalData();
      onDataResetCompleted();
      onClose();
    } catch (err) {
      console.error('Reset failed:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reset All Local Data">
      <div className="py-4 space-y-4 text-xs">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="text-center space-y-1">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Delete all locally stored ExpenseFlow data?
          </h4>
          <p className="text-slate-500">
            This will permanently remove your transactions, budgets, goals, recurring rules, and local preferences from this device.
          </p>
        </div>

        <div className="p-3 bg-red-50 dark:bg-red-950/50 rounded-xl border border-red-200 dark:border-red-900 font-semibold text-red-800 dark:text-red-300">
          Type <span className="font-extrabold uppercase font-mono">DELETE</span> below to confirm.
        </div>

        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="Type DELETE"
          className="w-full px-3 py-2 text-center text-sm font-mono tracking-widest rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none"
        />

        <div className="flex gap-2 pt-2">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            fullWidth
            onClick={handleConfirmReset}
            disabled={confirmText.toUpperCase() !== 'DELETE' || isDeleting}
          >
            {isDeleting ? 'Resetting...' : 'Delete Everything'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
