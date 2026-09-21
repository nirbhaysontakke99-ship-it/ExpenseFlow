import { db } from '../database/db';
import type { Transaction, CreateTransactionInput, UpdateTransactionInput } from '../models/Transaction';

export const transactionRepository = {
  async getById(id: string): Promise<Transaction | undefined> {
    const tx = await db.transactions.get(id);
    if (tx && tx.deleted_at) return undefined; // Filter soft deleted by default
    return tx;
  },

  async getAllByUserId(userId: string, includeDeleted = false): Promise<Transaction[]> {
    const txs = await db.transactions.where('user_id').equals(userId).toArray();
    if (includeDeleted) return txs;
    return txs.filter((t) => !t.deleted_at);
  },

  async create(input: CreateTransactionInput): Promise<Transaction> {
    const now = new Date().toISOString();
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      ...input,
      deleted_at: input.deleted_at || null,
      created_at: now,
      updated_at: now,
    };

    await db.transactions.add(transaction);
    return transaction;
  },

  async update(id: string, input: UpdateTransactionInput): Promise<Transaction | undefined> {
    const existing = await db.transactions.get(id);
    if (!existing || existing.deleted_at) return undefined;

    const now = new Date().toISOString();
    const updated: Transaction = {
      ...existing,
      ...input,
      updated_at: now,
    };

    await db.transactions.put(updated);
    return updated;
  },

  async softDelete(id: string): Promise<boolean> {
    const existing = await db.transactions.get(id);
    if (!existing) return false;

    const now = new Date().toISOString();
    await db.transactions.update(id, {
      deleted_at: now,
      updated_at: now,
    });
    return true;
  },

  async restore(id: string): Promise<boolean> {
    const existing = await db.transactions.get(id);
    if (!existing) return false;

    const now = new Date().toISOString();
    await db.transactions.update(id, {
      deleted_at: null,
      updated_at: now,
    });
    return true;
  },

  async hardDelete(id: string): Promise<void> {
    await db.transactions.delete(id);
  },

  async getByDateRange(userId: string, startDate: string, endDate: string): Promise<Transaction[]> {
    const all = await this.getAllByUserId(userId);
    return all.filter((t) => t.date >= startDate && t.date <= endDate);
  },

  async getMonthlyTotals(userId: string, month: number, year: number) {
    const all = await this.getAllByUserId(userId);
    const monthly = all.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    });

    const incomePaise = monthly
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expensePaise = monthly
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      incomePaise,
      expensePaise,
      remainingPaise: incomePaise - expensePaise,
    };
  },
};
