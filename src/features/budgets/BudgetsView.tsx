import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { userRepository } from '@/data/repositories/userRepository';
import { categoryRepository } from '@/data/repositories/categoryRepository';
import { getOverallBudgetDetail, getCategoryBudgetDetails, type CategoryBudgetDetail } from '@/services/budgetService';
import { BudgetMonthSelector } from './components/BudgetMonthSelector';
import { OverallBudgetCard } from './components/OverallBudgetCard';
import { CategoryBudgetCard } from './components/CategoryBudgetCard';
import { BudgetModal } from './components/BudgetModal';
import { DeleteBudgetDialog } from './components/DeleteBudgetDialog';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Plus, PieChart } from 'lucide-react';

export const BudgetsView: React.FC = () => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalCategoryId, setModalCategoryId] = useState<string | null>(null);
  const [modalAmountPaise, setModalAmountPaise] = useState<number>(0);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [deleteBudgetId, setDeleteBudgetId] = useState<string | undefined>(undefined);
  const [deleteBudgetName, setDeleteBudgetName] = useState<string>('');

  // Live IndexedDB query for selected month & year
  const data = useLiveQuery(async () => {
    const user = await userRepository.getCurrentUser();
    if (!user) return null;

    const categories = await categoryRepository.getAll(user.id);
    const overallDetail = await getOverallBudgetDetail(user.id, selectedMonth, selectedYear);
    const categoryDetails = await getCategoryBudgetDetails(user.id, selectedMonth, selectedYear);

    return { user, categories, overallDetail, categoryDetails };
  }, [selectedMonth, selectedYear]);

  if (!data) return null;

  const { user, categories, overallDetail, categoryDetails } = data;

  const budgetedCategories = categoryDetails.filter((c) => c.hasBudget);
  const unbudgetedCategories = categoryDetails.filter((c) => !c.hasBudget);

  const handleOpenCreateCategoryBudget = (catId?: string) => {
    setModalCategoryId(catId || 'food');
    setModalAmountPaise(0);
    setIsModalOpen(true);
  };

  const handleOpenEditCategoryBudget = (detail: CategoryBudgetDetail) => {
    setModalCategoryId(detail.categoryId);
    setModalAmountPaise(detail.budgetPaise);
    setIsModalOpen(true);
  };

  const handleOpenDeleteBudget = (detail: CategoryBudgetDetail) => {
    setDeleteBudgetId(detail.budgetId);
    setDeleteBudgetName(detail.categoryName);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="flex-1 p-4 space-y-4 pb-24 max-w-md mx-auto w-full animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Budget Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Control limits & category caps
          </p>
        </div>
        <Button
          variant="emerald"
          size="sm"
          onClick={() => handleOpenCreateCategoryBudget()}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Budget
        </Button>
      </div>

      {/* Month Selector */}
      <BudgetMonthSelector
        month={selectedMonth}
        year={selectedYear}
        onMonthChange={(m, y) => {
          setSelectedMonth(m);
          setSelectedYear(y);
        }}
      />

      {/* Overall Monthly Budget Card */}
      <OverallBudgetCard
        overallDetail={overallDetail}
        currencyCode={user.currency}
        onEditClick={() => {
          setModalCategoryId(null);
          setModalAmountPaise(overallDetail.budgetPaise);
          setIsModalOpen(true);
        }}
        onCreateClick={() => {
          setModalCategoryId(null);
          setModalAmountPaise(0);
          setIsModalOpen(true);
        }}
      />

      {/* Category Budgets Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Category Spending Limits ({budgetedCategories.length})
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">Ranked by urgency</span>
        </div>

        {budgetedCategories.length === 0 ? (
          <Card variant="flat" className="py-6 text-center space-y-2">
            <PieChart className="w-8 h-8 text-slate-400 mx-auto opacity-70" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">No category budgets set</h4>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              Set specific budget caps for Food, Transport, Shopping to avoid overspending.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenCreateCategoryBudget()}
              leftIcon={<Plus className="w-3.5 h-3.5 text-emerald-600" />}
            >
              Set Category Budget
            </Button>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {budgetedCategories.map((detail) => (
              <CategoryBudgetCard
                key={detail.categoryId}
                detail={detail}
                currencyCode={user.currency}
                onEditClick={handleOpenEditCategoryBudget}
                onDeleteClick={handleOpenDeleteBudget}
                onCreateClick={handleOpenCreateCategoryBudget}
              />
            ))}
          </div>
        )}
      </div>

      {/* Unbudgeted Spending Section */}
      {unbudgetedCategories.length > 0 && (
        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Unbudgeted Category Spending ({unbudgetedCategories.length})
          </h3>
          <div className="space-y-2">
            {unbudgetedCategories.map((detail) => (
              <CategoryBudgetCard
                key={detail.categoryId}
                detail={detail}
                currencyCode={user.currency}
                onEditClick={handleOpenEditCategoryBudget}
                onDeleteClick={handleOpenDeleteBudget}
                onCreateClick={handleOpenCreateCategoryBudget}
              />
            ))}
          </div>
        </div>
      )}

      {/* Budget Modal */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categories={categories}
        initialCategoryId={modalCategoryId}
        initialAmountPaise={modalAmountPaise}
        month={selectedMonth}
        year={selectedYear}
        onBudgetSaved={() => {}}
      />

      {/* Delete Budget Dialog */}
      <DeleteBudgetDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        budgetId={deleteBudgetId}
        budgetName={deleteBudgetName}
        onBudgetDeleted={() => {}}
      />
    </div>
  );
};
