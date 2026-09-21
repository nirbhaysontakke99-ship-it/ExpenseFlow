import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { transactionRepository } from '@/data/repositories/transactionRepository';
import { categoryRepository } from '@/data/repositories/categoryRepository';
import { userRepository } from '@/data/repositories/userRepository';
import { filterTransactions, groupTransactionsByDate, type FilterOptions } from '@/services/transactionService';
import { TransactionFilters } from './components/TransactionFilters';
import { TransactionCard } from './components/TransactionCard';
import { TransactionDetailModal } from './components/TransactionDetailModal';
import { CustomCategoryModal } from './components/CustomCategoryModal';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { formatCurrency } from '@/core/utils/currencyUtils';
import type { Transaction } from '@/data/models/Transaction';
import { Plus, Receipt, SearchX } from 'lucide-react';

export interface TransactionsViewProps {
  onOpenAddModal: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ onOpenAddModal }) => {
  const [filters, setFilters] = useState<FilterOptions>({
    query: '',
    type: 'all',
    categoryId: 'all',
    paymentMethod: 'all',
    dateRange: 'all',
    sortBy: 'newest',
  });

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isCustomCatOpen, setIsCustomCatOpen] = useState<boolean>(false);

  // Live IndexedDB query
  const data = useLiveQuery(async () => {
    const user = await userRepository.getCurrentUser();
    const categories = await categoryRepository.getAll(user?.id);
    const categoriesMap = new Map(categories.map((c) => [c.id, c]));
    const transactions = user
      ? await transactionRepository.getAllByUserId(user.id)
      : [];

    return { user, categories, categoriesMap, transactions };
  }, []);

  if (!data) return null;

  const { user, categories, categoriesMap, transactions } = data;

  const filteredTxs = filterTransactions(transactions, categoriesMap, filters);
  const groupedTxs = groupTransactionsByDate(filteredTxs);

  const totalExpensePaise = filteredTxs
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncomePaise = filteredTxs
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="flex-1 p-4 space-y-4 pb-24 max-w-md mx-auto w-full animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Transactions
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            History & Search Timeline
          </p>
        </div>
        <Button
          variant="emerald"
          size="sm"
          onClick={onOpenAddModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add
        </Button>
      </div>

      {/* Filters & Search bar */}
      <TransactionFilters options={filters} onChange={setFilters} />

      {/* Period Totals Summary Banner */}
      {filteredTxs.length > 0 && (
        <div className="flex items-center justify-between px-3 py-2 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-semibold">
          <span className="text-slate-500">Filtered Result ({filteredTxs.length})</span>
          <div className="flex gap-2">
            <span className="text-emerald-600 dark:text-emerald-400">
              +{formatCurrency(totalIncomePaise, { code: user?.currency || 'INR', symbol: '₹', name: 'INR', minorUnitRatio: 100, locale: 'en-IN' })}
            </span>
            <span className="text-red-600 dark:text-red-400">
              -{formatCurrency(totalExpensePaise, { code: user?.currency || 'INR', symbol: '₹', name: 'INR', minorUnitRatio: 100, locale: 'en-IN' })}
            </span>
          </div>
        </div>
      )}

      {/* Grouped Timeline */}
      {filteredTxs.length === 0 ? (
        <Card variant="flat" className="py-12 text-center space-y-3">
          {filters.query ? (
            <>
              <SearchX className="w-10 h-10 text-slate-400 mx-auto" />
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  No matching transactions
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Try adjusting your search query or filters.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ query: '', type: 'all', categoryId: 'all', paymentMethod: 'all', dateRange: 'all', sortBy: 'newest' })}
              >
                Clear Filters
              </Button>
            </>
          ) : (
            <>
              <Receipt className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto opacity-80" />
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  No transactions recorded yet
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Record your daily expenses in 3 seconds to see your timeline.
                </p>
              </div>
              <Button variant="emerald" size="sm" onClick={onOpenAddModal}>
                Add First Expense
              </Button>
            </>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {groupedTxs.map((group) => (
            <div key={group.groupTitle} className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  {group.groupTitle}
                </span>
                {group.totalExpensePaise > 0 && (
                  <span className="text-[11px] font-bold text-slate-500">
                    -{formatCurrency(group.totalExpensePaise)}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {group.transactions.map((tx) => (
                  <TransactionCard
                    key={tx.id}
                    transaction={tx}
                    category={categoriesMap.get(tx.category_id)}
                    currencyCode={user?.currency || 'INR'}
                    onClick={() => {
                      setSelectedTransaction(tx);
                      setIsDetailOpen(true);
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transaction Detail & Edit Modal */}
      <TransactionDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        transaction={selectedTransaction}
        categories={categories}
        onTransactionUpdated={() => {}}
      />

      {/* Custom Category Modal */}
      <CustomCategoryModal
        isOpen={isCustomCatOpen}
        onClose={() => setIsCustomCatOpen(false)}
        onCategoryCreated={() => {}}
      />
    </div>
  );
};
