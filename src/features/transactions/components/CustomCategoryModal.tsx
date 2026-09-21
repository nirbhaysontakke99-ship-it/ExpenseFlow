import React, { useState } from 'react';
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { categoryRepository } from '@/data/repositories/categoryRepository';
import { userRepository } from '@/data/repositories/userRepository';

export interface CustomCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryCreated: () => void;
  defaultType?: 'expense' | 'income';
}

export const CustomCategoryModal: React.FC<CustomCategoryModalProps> = ({
  isOpen,
  onClose,
  onCategoryCreated,
  defaultType = 'expense',
}) => {
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<'expense' | 'income'>(defaultType);
  const [color, setColor] = useState<string>('#10B981');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const colors = ['#10B981', '#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      const user = await userRepository.getCurrentUser();
      await categoryRepository.create({
        user_id: user?.id || 'default_user',
        name: name.trim(),
        icon: 'Tag',
        color,
        type,
        is_default: false,
      });

      setName('');
      onCategoryCreated();
      onClose();
    } catch (err) {
      console.error('Failed to create custom category:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Custom Category">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            Category Name
          </label>
          <input
            type="text"
            placeholder="e.g. Subscriptions, Gym"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none"
            autoFocus
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
            Category Type
          </label>
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-1.5 rounded-lg ${type === 'expense' ? 'bg-white dark:bg-slate-900 text-red-600' : 'text-slate-500'}`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-1.5 rounded-lg ${type === 'income' ? 'bg-white dark:bg-slate-900 text-emerald-600' : 'text-slate-500'}`}
            >
              Income
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
            Color Accent
          </label>
          <div className="flex gap-2">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-transform ${color === c ? 'scale-110 ring-2 ring-emerald-500' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <Button variant="emerald" fullWidth type="submit" disabled={isSaving || !name.trim()}>
          {isSaving ? 'Creating...' : 'Create Category'}
        </Button>
      </form>
    </Modal>
  );
};
