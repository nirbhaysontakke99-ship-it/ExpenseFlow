import { db } from '../database/db';
import type {
  RecurringTransaction,
  CreateRecurringTransactionInput,
  UpdateRecurringTransactionInput,
} from '../models/RecurringTransaction';

export const recurringRepository = {
  async getByUserId(userId: string): Promise<RecurringTransaction[]> {
    return await db.recurring_transactions.where('user_id').equals(userId).toArray();
  },

  async getById(id: string): Promise<RecurringTransaction | undefined> {
    return await db.recurring_transactions.get(id);
  },

  async create(input: CreateRecurringTransactionInput): Promise<RecurringTransaction> {
    const now = new Date().toISOString();
    const recurring: RecurringTransaction = {
      id: crypto.randomUUID(),
      ...input,
      created_at: now,
      updated_at: now,
    };
    await db.recurring_transactions.add(recurring);
    return recurring;
  },

  async update(id: string, input: UpdateRecurringTransactionInput): Promise<RecurringTransaction | undefined> {
    const existing = await db.recurring_transactions.get(id);
    if (!existing) return undefined;

    const now = new Date().toISOString();
    const updated: RecurringTransaction = {
      ...existing,
      ...input,
      updated_at: now,
    };
    await db.recurring_transactions.put(updated);
    return updated;
  },

  async delete(id: string): Promise<void> {
    await db.recurring_transactions.delete(id);
  },

  async toggleActive(id: string, active: boolean): Promise<void> {
    const now = new Date().toISOString();
    await db.recurring_transactions.update(id, { active, updated_at: now });
  },
};
