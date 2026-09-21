import { db } from '../database/db';
import type { Budget, CreateBudgetInput, UpdateBudgetInput } from '../models/Budget';

export const budgetRepository = {
  async getOverallBudget(userId: string, month: number, year: number): Promise<Budget | undefined> {
    const budgets = await db.budgets
      .where('[user_id+month+year]')
      .equals([userId, month, year])
      .toArray();

    return budgets.find((b) => !b.category_id || b.category_id === 'overall');
  },

  async getCategoryBudgets(userId: string, month: number, year: number): Promise<Budget[]> {
    const budgets = await db.budgets
      .where('[user_id+month+year]')
      .equals([userId, month, year])
      .toArray();

    return budgets.filter((b) => b.category_id && b.category_id !== 'overall');
  },

  async upsertBudget(input: CreateBudgetInput): Promise<Budget> {
    const now = new Date().toISOString();
    const existing = await db.budgets
      .where('[user_id+month+year]')
      .equals([input.user_id, input.month, input.year])
      .toArray();

    const match = existing.find((b) => (b.category_id || 'overall') === (input.category_id || 'overall'));

    if (match) {
      const updated: Budget = {
        ...match,
        amount: input.amount,
        updated_at: now,
      };
      await db.budgets.put(updated);
      return updated;
    }

    const newBudget: Budget = {
      id: crypto.randomUUID(),
      ...input,
      created_at: now,
      updated_at: now,
    };
    await db.budgets.add(newBudget);
    return newBudget;
  },

  async update(id: string, input: UpdateBudgetInput): Promise<Budget | undefined> {
    const existing = await db.budgets.get(id);
    if (!existing) return undefined;

    const now = new Date().toISOString();
    const updated: Budget = {
      ...existing,
      ...input,
      updated_at: now,
    };
    await db.budgets.put(updated);
    return updated;
  },

  async getByUserId(userId: string): Promise<Budget[]> {
    return await db.budgets.where('user_id').equals(userId).toArray();
  },

  async delete(id: string): Promise<void> {
    await db.budgets.delete(id);
  },
};
