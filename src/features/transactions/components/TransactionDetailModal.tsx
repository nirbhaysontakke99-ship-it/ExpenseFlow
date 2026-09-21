import React, { useState, useEffect } from 'react';
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { AmountInput } from './AmountInput';
import { CategoryGrid } from './CategoryGrid';
import { PaymentSelector } from './PaymentSelector';
import type { Transaction } from '@/data/models/Transaction';
import type { Category } from '@/data/models/Category';
import { transactionRepository } from '@/data/repositories/transactionRepository';
import { rupeesToPaise, formatCurrency } from '@/core/utils/currencyUtils';
import { Trash2, Copy, Edit, AlertTriangle } from 'lucide-react';

export interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  categories: Category[];
  onTransactionUpdated: () => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  isOpen,
  onClose,
  transaction,
  categories,
  onTransactionUpdated,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  // Form State
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amountInput, setAmountInput] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('food');
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmountInput((transaction.amount / 100).toString());
      setSelectedCategory(transaction.category_id);
      setPaymentMethod(transaction.payment_method);
      setNote(transaction.note || '');
      setDate(transaction.date);
      setIsEditing(false);
      setShowDeleteConfirm(false);
    }
  }, [transaction]);

  if (!transaction) return null;

  const categoriesMap = new Map(categories.map((c) => [c.id, c]));
  const currentCat = categoriesMap.get(transaction.category_id);

  const parsedPaise = rupeesToPaise(parseFloat(amountInput) || 0);

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedPaise <= 0) return;

    setIsSaving(true);
    try {
      await transactionRepository.update(transaction.id, {
        type,
        amount: parsedPaise,
        category_id: selectedCategory,
        note: note.trim() || undefined,
        payment_method: paymentMethod,
        date: date || transaction.date,
      });

      onTransactionUpdated();
      setIsEditing(false);
      onClose();
    } catch (err) {
      console.error('Failed to update transaction:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSoftDelete = async () => {
    try {
      await transactionRepository.softDelete(transaction.id);
      onTransactionUpdated();
      onClose();
    } catch (err) {
      console.error('Failed to delete transaction:', err);
    }
  };

  const handleDuplicate = async () => {
    try {
      await transactionRepository.create({
        user_id: transaction.user_id,
        type: transaction.type,
        amount: transaction.amount,
        category_id: transaction.category_id,
        note: transaction.note ? `${transaction.note} (Copy)` : undefined,
        payment_method: transaction.payment_method,
        date: new Date().toISOString().split('T')[0],
      });
      onTransactionUpdated();
      onClose();
    } catch (err) {
      console.error('Failed to duplicate transaction:', err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Transaction' : 'Transaction Details'}
    >
      {showDeleteConfirm ? (
        <div className="py-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Delete this transaction?
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {formatCurrency(transaction.amount)} • {currentCat?.name || 'Expense'}
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="secondary" fullWidth onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="danger" fullWidth onClick={handleSoftDelete}>
              Confirm Delete
            </Button>
          </div>
        </div>
      ) : isEditing ? (
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <AmountInput value={amountInput} onChange={setAmountInput} />

          <CategoryGrid
            categories={categories}
            selectedCategoryId={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onAddCustomCategoryClick={() => {}}
            type={type}
          />

          <PaymentSelector selectedPayment={paymentMethod} onSelectPayment={setPaymentMethod} />

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Note
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="secondary" fullWidth type="button" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button variant="emerald" fullWidth type="submit" disabled={isSaving || parsedPaise <= 0}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-5">
          <div className="text-center py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              {transaction.type}
            </span>
            <span
              className={`text-3xl font-black block mt-1 ${
                transaction.type === 'income'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {transaction.type === 'income' ? '+' : '-'}
              {formatCurrency(transaction.amount)}
            </span>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1 block">
              {currentCat?.name || 'General'}
            </span>
          </div>

          <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-800">
            <div className="flex justify-between py-2">
              <span className="text-slate-500 font-semibold">Payment Method</span>
              <span className="font-bold text-slate-900 dark:text-white">{transaction.payment_method}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 font-semibold">Date</span>
              <span className="font-bold text-slate-900 dark:text-white">{transaction.date}</span>
            </div>
            {transaction.note && (
              <div className="flex justify-between py-2">
                <span className="text-slate-500 font-semibold">Note</span>
                <span className="font-bold text-slate-900 dark:text-white">{transaction.note}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              leftIcon={<Edit className="w-3.5 h-3.5" />}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDuplicate}
              leftIcon={<Copy className="w-3.5 h-3.5" />}
            >
              Duplicate
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
