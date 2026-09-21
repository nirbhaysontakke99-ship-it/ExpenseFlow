import React, { useState } from 'react';
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { AmountInput } from './components/AmountInput';
import { CategoryGrid } from './components/CategoryGrid';
import { PaymentSelector } from './components/PaymentSelector';
import { QuickEntryInput } from './components/QuickEntryInput';
import { CustomCategoryModal } from './components/CustomCategoryModal';
import { useLiveQuery } from 'dexie-react-hooks';
import { categoryRepository } from '@/data/repositories/categoryRepository';
import { userRepository } from '@/data/repositories/userRepository';
import { transactionRepository } from '@/data/repositories/transactionRepository';
import { rupeesToPaise } from '@/core/utils/currencyUtils';
import type { ParsedTransaction } from '@/services/quickEntryService';
import { Check, Sparkles, SlidersHorizontal } from 'lucide-react';

export interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [entryMode, setEntryMode] = useState<'standard' | 'quick'>('standard');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amountInput, setAmountInput] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('food');
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isCustomCatOpen, setIsCustomCatOpen] = useState<boolean>(false);

  // Live categories query from IndexedDB
  const categoriesData = useLiveQuery(async () => {
    const user = await userRepository.getCurrentUser();
    const categories = await categoryRepository.getAll(user?.id);
    const categoriesMap = new Map(categories.map((c) => [c.id, c]));
    return { user, categories, categoriesMap };
  }, []);

  const categories = categoriesData?.categories || [];
  const categoriesMap = categoriesData?.categoriesMap || new Map();
  const user = categoriesData?.user;

  const parsedPaise = rupeesToPaise(parseFloat(amountInput) || 0);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedPaise <= 0 || isSaving) return;

    setIsSaving(true);
    try {
      await transactionRepository.create({
        user_id: user?.id || 'default_user',
        type,
        amount: parsedPaise,
        category_id: selectedCategory,
        note: note.trim() || undefined,
        payment_method: paymentMethod,
        date: date || new Date().toISOString().split('T')[0],
      });

      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        setIsSaving(false);
        setAmountInput('');
        setNote('');
        onClose();
      }, 900);
    } catch (err) {
      console.error('Failed to record transaction:', err);
      setIsSaving(false);
    }
  };

  const handleQuickConfirm = async (parsed: ParsedTransaction) => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await transactionRepository.create({
        user_id: user?.id || 'default_user',
        type: 'expense',
        amount: parsed.amountPaise,
        category_id: parsed.categoryId,
        note: parsed.note,
        payment_method: paymentMethod,
        date: new Date().toISOString().split('T')[0],
      });

      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        setIsSaving(false);
        onClose();
      }, 900);
    } catch (err) {
      console.error('Quick entry save error:', err);
      setIsSaving(false);
    }
  };

  const handleQuickEdit = (parsed: ParsedTransaction) => {
    setAmountInput((parsed.amountPaise / 100).toString());
    setSelectedCategory(parsed.categoryId);
    setNote(parsed.note);
    setEntryMode('standard');
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={type === 'expense' ? 'Add Expense' : 'Add Income'}
      >
        {isSaved ? (
          <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-md">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Transaction Recorded!
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Saved safely to local IndexedDB.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Mode Switcher: Standard vs Smart Quick Entry */}
            <div className="flex justify-between items-center pb-1">
              <div className="grid grid-cols-2 w-36 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`py-1.5 rounded-lg transition-all ${
                    type === 'expense'
                      ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`py-1.5 rounded-lg transition-all ${
                    type === 'income'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Income
                </button>
              </div>

              <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setEntryMode('standard')}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                    entryMode === 'standard'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  <SlidersHorizontal className="w-3 h-3" /> Standard
                </button>
                <button
                  type="button"
                  onClick={() => setEntryMode('quick')}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                    entryMode === 'quick'
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  <Sparkles className="w-3 h-3" /> Quick
                </button>
              </div>
            </div>

            {/* Smart Quick Entry Mode */}
            {entryMode === 'quick' ? (
              <QuickEntryInput
                categoriesMap={categoriesMap}
                onConfirm={handleQuickConfirm}
                onEditManual={handleQuickEdit}
              />
            ) : (
              <form onSubmit={handleSave} className="space-y-4">
                {/* 1. Large Amount Input */}
                <AmountInput value={amountInput} onChange={setAmountInput} />

                {/* 2. Fast Category Selector Grid */}
                <CategoryGrid
                  categories={categories}
                  selectedCategoryId={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  onAddCustomCategoryClick={() => setIsCustomCatOpen(true)}
                  type={type}
                />

                {/* 3. Compact Payment Selector */}
                <PaymentSelector
                  selectedPayment={paymentMethod}
                  onSelectPayment={setPaymentMethod}
                />

                {/* 4. Optional Note & Date inputs */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                      Note (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dinner"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="emerald"
                  fullWidth
                  size="lg"
                  disabled={isSaving || parsedPaise <= 0}
                >
                  {isSaving ? 'Saving...' : type === 'expense' ? 'Save Expense' : 'Save Income'}
                </Button>
              </form>
            )}
          </div>
        )}
      </Modal>

      {/* Custom Category Modal */}
      <CustomCategoryModal
        isOpen={isCustomCatOpen}
        onClose={() => setIsCustomCatOpen(false)}
        onCategoryCreated={() => {}}
        defaultType={type}
      />
    </>
  );
};
