import React, { useState } from 'react';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { parseQuickEntry, type ParsedTransaction } from '@/services/quickEntryService';
import { formatCurrency } from '@/core/utils/currencyUtils';
import type { Category } from '@/data/models/Category';
import { Sparkles, Check, Edit3 } from 'lucide-react';

export interface QuickEntryInputProps {
  categoriesMap: Map<string, Category>;
  onConfirm: (parsed: ParsedTransaction) => void;
  onEditManual: (parsed: ParsedTransaction) => void;
}

export const QuickEntryInput: React.FC<QuickEntryInputProps> = ({
  categoriesMap,
  onConfirm,
  onEditManual,
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [parsed, setParsed] = useState<ParsedTransaction | null>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputText(text);
    const result = parseQuickEntry(text);
    setParsed(result);
  };

  const matchedCatName = parsed
    ? categoriesMap.get(parsed.categoryId)?.name || 'General Expense'
    : '';

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Smart Quick Entry
        </label>
        <input
          type="text"
          placeholder="Try typing: ₹250 dinner or 120 auto"
          value={inputText}
          onChange={handleTextChange}
          className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        />
      </div>

      {parsed && parsed.amountPaise > 0 && (
        <Card variant="flat" className="p-3 space-y-2 border border-emerald-200 dark:border-emerald-900">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-500">Live Smart Preview</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
              High Confidence
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <div>
              <span className="text-base font-black text-slate-900 dark:text-white block">
                {formatCurrency(parsed.amountPaise)}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {matchedCatName} • Note: "{parsed.note}"
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              variant="emerald"
              size="sm"
              fullWidth
              onClick={() => {
                onConfirm(parsed);
                setInputText('');
                setParsed(null);
              }}
              leftIcon={<Check className="w-4 h-4" />}
            >
              Quick Save
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditManual(parsed)}
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
            >
              Edit
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
