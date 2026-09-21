import React from 'react';
import { Modal } from '@/shared/components/Modal';
import { userRepository } from '@/data/repositories/userRepository';

export interface CurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCurrency: string;
  onCurrencyChanged: (currency: string) => void;
}

export const SUPPORTED_CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham' },
];

export const CurrencyModal: React.FC<CurrencyModalProps> = ({
  isOpen,
  onClose,
  currentCurrency,
  onCurrencyChanged,
}) => {
  const handleSelect = async (code: string) => {
    try {
      const user = await userRepository.getCurrentUser();
      if (user) {
        await userRepository.update(user.id, { currency: code });
      }
      onCurrencyChanged(code);
      onClose();
    } catch (err) {
      console.error('Failed to change currency:', err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Currency">
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {SUPPORTED_CURRENCIES.map((c) => (
          <div
            key={c.code}
            onClick={() => handleSelect(c.code)}
            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
              currentCurrency === c.code
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 font-bold'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-900 dark:text-white">
                {c.symbol}
              </span>
              <div>
                <span className="font-extrabold block">{c.name}</span>
                <span className="text-[10px] text-slate-400 block">{c.code}</span>
              </div>
            </div>

            {currentCurrency === c.code && (
              <span className="text-xs font-bold text-emerald-600">Selected</span>
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
};
