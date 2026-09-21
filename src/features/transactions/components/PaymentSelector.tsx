import React from 'react';

export interface PaymentSelectorProps {
  selectedPayment: string;
  onSelectPayment: (method: string) => void;
}

export const PAYMENT_METHODS = [
  'UPI',
  'Cash',
  'Debit Card',
  'Credit Card',
  'Bank Transfer',
  'Other',
];

export const PaymentSelector: React.FC<PaymentSelectorProps> = ({
  selectedPayment,
  onSelectPayment,
}) => {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
        Payment Method
      </label>
      <div className="flex flex-wrap gap-1.5">
        {PAYMENT_METHODS.map((pm) => {
          const isSelected = selectedPayment === pm;
          return (
            <button
              key={pm}
              type="button"
              onClick={() => onSelectPayment(pm)}
              className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {pm}
            </button>
          );
        })}
      </div>
    </div>
  );
};
