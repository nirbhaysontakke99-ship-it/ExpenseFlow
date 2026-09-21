import React, { useState, useEffect } from 'react';
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { AmountInput } from '@/features/transactions/components/AmountInput';
import { goalRepository } from '@/data/repositories/goalRepository';
import { userRepository } from '@/data/repositories/userRepository';
import { rupeesToPaise } from '@/core/utils/currencyUtils';
import type { Goal } from '@/data/models/Goal';
import { Laptop, Smartphone, Headphones, Bike, Plane, GraduationCap, Home, ShieldAlert, PiggyBank, Gamepad2, Car, Gift } from 'lucide-react';

export interface GoalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal?: Goal | null;
  onGoalSaved: () => void;
}

export const GOAL_ICONS = [
  { id: 'Headphones', label: 'Headphones', icon: <Headphones className="w-4 h-4" /> },
  { id: 'Phone', label: 'Phone', icon: <Smartphone className="w-4 h-4" /> },
  { id: 'Laptop', label: 'Laptop', icon: <Laptop className="w-4 h-4" /> },
  { id: 'Bike', label: 'Bike', icon: <Bike className="w-4 h-4" /> },
  { id: 'Travel', label: 'Travel', icon: <Plane className="w-4 h-4" /> },
  { id: 'Education', label: 'Education', icon: <GraduationCap className="w-4 h-4" /> },
  { id: 'Home', label: 'Home', icon: <Home className="w-4 h-4" /> },
  { id: 'Emergency', label: 'Emergency', icon: <ShieldAlert className="w-4 h-4" /> },
  { id: 'Savings', label: 'Savings', icon: <PiggyBank className="w-4 h-4" /> },
  { id: 'Gaming', label: 'Gaming', icon: <Gamepad2 className="w-4 h-4" /> },
  { id: 'Car', label: 'Car', icon: <Car className="w-4 h-4" /> },
  { id: 'Gift', label: 'Gift', icon: <Gift className="w-4 h-4" /> },
];

export const GoalFormModal: React.FC<GoalFormModalProps> = ({
  isOpen,
  onClose,
  goal,
  onGoalSaved,
}) => {
  const [name, setName] = useState<string>('');
  const [targetAmountInput, setTargetAmountInput] = useState<string>('');
  const [currentAmountInput, setCurrentAmountInput] = useState<string>('0');
  const [targetDate, setTargetDate] = useState<string>('');
  const [icon, setIcon] = useState<string>('Headphones');
  const [description, setDescription] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (goal) {
      setName(goal.name);
      setTargetAmountInput((goal.target_amount / 100).toString());
      setCurrentAmountInput((goal.current_amount / 100).toString());
      setTargetDate(goal.target_date);
      setIcon(goal.icon);
      setDescription(goal.description || '');
    } else {
      setName('');
      setTargetAmountInput('8000');
      setCurrentAmountInput('0');
      // Default target date: 3 months from now
      const defaultDate = new Date();
      defaultDate.setMonth(defaultDate.getMonth() + 3);
      setTargetDate(defaultDate.toISOString().split('T')[0]);
      setIcon('Headphones');
      setDescription('');
    }
  }, [goal, isOpen]);

  const targetPaise = rupeesToPaise(parseFloat(targetAmountInput) || 0);
  const currentPaise = rupeesToPaise(parseFloat(currentAmountInput) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || targetPaise <= 0 || isSaving) return;

    setIsSaving(true);
    try {
      const user = await userRepository.getCurrentUser();
      const userId = user?.id || 'default_user';

      if (goal) {
        await goalRepository.update(goal.id, {
          name: name.trim(),
          target_amount: targetPaise,
          current_amount: currentPaise,
          target_date: targetDate,
          icon,
          description: description.trim() || undefined,
          status: currentPaise >= targetPaise ? 'completed' : 'active',
        });
      } else {
        await goalRepository.create({
          user_id: userId,
          name: name.trim(),
          target_amount: targetPaise,
          current_amount: currentPaise,
          target_date: targetDate,
          icon,
          description: description.trim() || undefined,
          status: currentPaise >= targetPaise ? 'completed' : 'active',
        });
      }

      onGoalSaved();
      onClose();
    } catch (err) {
      console.error('Failed to save goal:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={goal ? 'Edit Savings Goal' : 'New Savings Goal'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Goal Name */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            Goal Name
          </label>
          <input
            type="text"
            placeholder="e.g. New Headphones, Trip to Goa"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            autoFocus
          />
        </div>

        {/* Target Amount */}
        <AmountInput value={targetAmountInput} onChange={setTargetAmountInput} />

        {/* Initial Saved Amount */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            Already Saved (optional starting balance)
          </label>
          <input
            type="number"
            placeholder="0"
            value={currentAmountInput}
            onChange={(e) => setCurrentAmountInput(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        {/* Target Date */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            Target Date
          </label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        {/* Icon Picker */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
            Choose Icon
          </label>
          <div className="grid grid-cols-6 gap-1.5 max-h-32 overflow-y-auto pr-1">
            {GOAL_ICONS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setIcon(item.id)}
                className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                  icon === item.id
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300'
                }`}
              >
                {item.icon}
              </button>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          variant="emerald"
          fullWidth
          size="lg"
          disabled={isSaving || !name.trim() || targetPaise <= 0}
        >
          {isSaving ? 'Saving...' : goal ? 'Save Changes' : 'Create Goal'}
        </Button>
      </form>
    </Modal>
  );
};
