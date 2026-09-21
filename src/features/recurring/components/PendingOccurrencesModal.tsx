import React from 'react';
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { formatCurrency } from '@/core/utils/currencyUtils';
import type { PendingOccurrence } from '@/services/recurringExpenseService';
import { recordOccurrence, skipOccurrence } from '@/services/recurringExpenseService';
import { DEFAULT_CURRENCY } from '@/core/constants/currency';
import { Clock, CheckCircle2, SkipForward } from 'lucide-react';

export interface PendingOccurrencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingList: PendingOccurrence[];
  currencyCode?: string;
  onProcessed: () => void;
}

export const PendingOccurrencesModal: React.FC<PendingOccurrencesModalProps> = ({
  isOpen,
  onClose,
  pendingList,
  currencyCode = 'INR',
  onProcessed,
}) => {
  if (pendingList.length === 0) return null;

  const currencyConfig = { ...DEFAULT_CURRENCY, code: currencyCode };

  const handleRecord = async (item: PendingOccurrence) => {
    await recordOccurrence(item.recurringRule.id, item.scheduledDate);
    onProcessed();
  };

  const handleSkip = async (item: PendingOccurrence) => {
    await skipOccurrence(item.recurringRule.id, item.scheduledDate);
    onProcessed();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${pendingList.length} Pending Recurring Payment${pendingList.length > 1 ? 's' : ''}`}
    >
      <div className="space-y-4">
        <div className="p-3 bg-amber-50 dark:bg-amber-950/60 rounded-2xl border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            The following regular payments are due. Choose to record them in ExpenseFlow or skip.
          </span>
        </div>

        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
          {pendingList.map((item) => (
            <div
              key={item.occurrenceId}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                  {item.recurringRule.title}
                </span>
                <span className="text-[11px] text-slate-400 font-semibold mt-0.5 block">
                  {formatCurrency(item.recurringRule.amount, currencyConfig)} • Due {item.scheduledDate}
                </span>
              </div>

              <div className="flex gap-1.5">
                <Button
                  variant="emerald"
                  size="sm"
                  onClick={() => handleRecord(item)}
                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                >
                  Record
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSkip(item)}
                  leftIcon={<SkipForward className="w-3.5 h-3.5" />}
                >
                  Skip
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button variant="secondary" fullWidth onClick={onClose}>
          Dismiss
        </Button>
      </div>
    </Modal>
  );
};
