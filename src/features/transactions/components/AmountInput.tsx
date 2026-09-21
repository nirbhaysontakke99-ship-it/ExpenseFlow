import React from 'react';

export interface AmountInputProps {
  value: string;
  onChange: (val: string) => void;
  currencySymbol?: string;
  autoFocus?: boolean;
}

export const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChange,
  currencySymbol = '₹',
  autoFocus = true,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow non-negative numbers with up to 2 decimal places
    if (val === '' || /^\d+(\.\d{0,2})?$/.test(val)) {
      onChange(val);
    }
  };

  return (
    <div className="text-center py-3">
      <label className="text-xs font-semibold text-slate-400 block mb-1">
        Enter Amount
      </label>
      <div className="flex items-center justify-center gap-1">
        <span className="text-3xl font-extrabold text-slate-400 select-none">
          {currencySymbol}
        </span>
        <input
          type="number"
          step="any"
          placeholder="0.00"
          value={value}
          onChange={handleChange}
          className="text-4xl font-black text-slate-900 dark:text-white w-48 text-center bg-transparent border-b-2 border-emerald-500 focus:outline-none tracking-tight"
          autoFocus={autoFocus}
        />
      </div>
    </div>
  );
};

