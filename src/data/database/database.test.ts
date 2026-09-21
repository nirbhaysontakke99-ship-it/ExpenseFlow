import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from './db';
import { seedDefaultCategories } from '../seed/defaultCategoriesSeed';
import { userRepository } from '../repositories/userRepository';
import { transactionRepository } from '../repositories/transactionRepository';
import { categoryRepository } from '../repositories/categoryRepository';
import { budgetRepository } from '../repositories/budgetRepository';
import { goalRepository } from '../repositories/goalRepository';
import { toPaise, fromPaise, formatCurrency } from '@/core/utils/currencyUtils';

describe('ExpenseFlow Database & Repositories (Phase 2)', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  it('1. Correctly converts rupees to integer paise and formats currency', () => {
    const rupees = 250.5;
    const paise = toPaise(rupees);
    expect(paise).toBe(25050);
    expect(fromPaise(paise)).toBe(250.5);
    expect(formatCurrency(paise, undefined, true)).toContain('250.50');
  });

  it('2. Idempotently seeds default categories without duplicates', async () => {
    const run1 = await seedDefaultCategories();
    expect(run1.length).toBeGreaterThan(10);

    const run2 = await seedDefaultCategories();
    expect(run2.length).toBe(run1.length); // Idempotent check

    const categoriesInDb = await categoryRepository.getAll();
    expect(categoriesInDb.length).toBe(run1.length);
  });

  it('3. Performs User CRUD operations', async () => {
    const newUser = await userRepository.create({
      name: 'Aarav Sharma',
      email: 'aarav@example.com',
      currency: 'INR',
      monthly_income: toPaise(40000),
      theme: 'system',
    });

    expect(newUser.id).toBeDefined();
    expect(newUser.monthly_income).toBe(4000000);

    const fetched = await userRepository.getById(newUser.id);
    expect(fetched?.name).toBe('Aarav Sharma');

    const updated = await userRepository.update(newUser.id, {
      monthly_income: toPaise(50000),
    });
    expect(updated?.monthly_income).toBe(5000000);
  });

  it('4. Performs Transaction CRUD & Soft-Delete operations', async () => {
    const user = await userRepository.create({
      name: 'Priya',
      email: 'priya@example.com',
      currency: 'INR',
      monthly_income: toPaise(25000),
      theme: 'light',
    });

    // Create Expense Transaction
    const tx = await transactionRepository.create({
      user_id: user.id,
      type: 'expense',
      amount: toPaise(250), // ₹250.00
      category_id: 'food',
      note: 'Dinner at cafe',
      date: '2026-08-16',
      payment_method: 'UPI',
    });

    expect(tx.id).toBeDefined();
    expect(tx.amount).toBe(25000);

    // Read
    const fetchedTx = await transactionRepository.getById(tx.id);
    expect(fetchedTx?.note).toBe('Dinner at cafe');

    // Update
    const updatedTx = await transactionRepository.update(tx.id, {
      amount: toPaise(300),
      note: 'Dinner at cafe (with tip)',
    });
    expect(updatedTx?.amount).toBe(30000);

    // Get active user transactions
    const activeTxs = await transactionRepository.getAllByUserId(user.id);
    expect(activeTxs.length).toBe(1);

    // Soft-delete
    const deleted = await transactionRepository.softDelete(tx.id);
    expect(deleted).toBe(true);

    const afterSoftDelete = await transactionRepository.getAllByUserId(user.id);
    expect(afterSoftDelete.length).toBe(0);

    const includeDeleted = await transactionRepository.getAllByUserId(user.id, true);
    expect(includeDeleted.length).toBe(1);
    expect(includeDeleted[0].deleted_at).toBeDefined();

    // Restore
    await transactionRepository.restore(tx.id);
    const restoredTxs = await transactionRepository.getAllByUserId(user.id);
    expect(restoredTxs.length).toBe(1);
  });

  it('5. Handles Budgets and Savings Goals correctly', async () => {
    const user = await userRepository.create({
      name: 'Rohan',
      email: 'rohan@example.com',
      currency: 'INR',
      monthly_income: toPaise(30000),
      theme: 'dark',
    });

    // Budget creation
    const budget = await budgetRepository.upsertBudget({
      user_id: user.id,
      category_id: 'food',
      amount: toPaise(5000),
      month: 8,
      year: 2026,
    });
    expect(budget.amount).toBe(500000);

    // Goal creation & contribution
    const goal = await goalRepository.create({
      user_id: user.id,
      name: 'Wireless Headphones',
      target_amount: toPaise(8000),
      current_amount: toPaise(2000),
      target_date: '2026-09-30',
      icon: 'Headphones',
    });

    await goalRepository.addContribution({
      goal_id: goal.id,
      amount: toPaise(1000),
      date: '2026-08-16',
      note: 'Weekly savings contribution',
    });

    const updatedGoal = await goalRepository.getById(goal.id);
    expect(updatedGoal?.current_amount).toBe(toPaise(3000));
  });
});
