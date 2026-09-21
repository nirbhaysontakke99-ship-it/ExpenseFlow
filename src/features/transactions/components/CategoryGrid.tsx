import React from 'react';
import type { Category } from '@/data/models/Category';
import { Plus } from 'lucide-react';

export interface CategoryGridProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  onAddCustomCategoryClick: () => void;
  type?: 'expense' | 'income';
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onAddCustomCategoryClick,
  type = 'expense',
}) => {
  const filtered = categories.filter((c) => c.type === type);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Category
        </label>
        <button
          type="button"
          onClick={onAddCustomCategoryClick}
          className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
        >
          <Plus className="w-3.5 h-3.5" /> Custom
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
        {filtered.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`p-2 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <span className="text-[11px] font-medium truncate w-full leading-tight">
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
