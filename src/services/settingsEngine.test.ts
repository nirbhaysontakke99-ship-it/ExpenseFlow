import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '@/data/database/db';
import { hashPin, setPinLock, verifyPin, disablePinLock, isPinLockEnabled } from './securityService';
import { escapeCSVCell, generateExportCSV } from './exportService';
import { resetAllLocalData } from './settingsService';
import { userRepository } from '@/data/repositories/userRepository';
import { transactionRepository } from '@/data/repositories/transactionRepository';
import { seedDefaultCategories } from '@/data/seed/defaultCategoriesSeed';
import { toPaise } from '@/core/utils/currencyUtils';

describe('Phase 12 Settings, Security & Data Management Engine', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
    await seedDefaultCategories();
    disablePinLock();
  });

  it('1. Hashes and verifies 4-6 digit numeric PIN using Web Crypto SHA-256', async () => {
    const hash = await hashPin('1234');
    expect(hash).toBeTruthy();
    expect(hash.length).toBe(64); // SHA-256 hex string length

    await setPinLock('1234');
    expect(isPinLockEnabled()).toBe(true);

    const isMatch = await verifyPin('1234');
    expect(isMatch).toBe(true);

    const isWrongMatch = await verifyPin('9999');
    expect(isWrongMatch).toBe(false);
  });

  it('2. Escapes CSV cells and generates formatted export dataset', async () => {
    expect(escapeCSVCell('Dinner, "Special"')).toBe('"Dinner, ""Special"""');

    const user = await userRepository.create({
      name: 'Export User',
      email: 'expuser@example.com',
      currency: 'INR',
      monthly_income: toPaise(50000),
      theme: 'light',
    });

    await transactionRepository.create({
      user_id: user.id,
      type: 'expense',
      amount: toPaise(250),
      category_id: 'food',
      date: '2026-08-16',
      payment_method: 'UPI',
      note: 'Dinner',
    });

    const csv = await generateExportCSV(user.id);
    expect(csv).toContain('ExpenseFlow Data Export');
    expect(csv).toContain('TRANSACTIONS');
    expect(csv).toContain('250.00');
    expect(csv).toContain('Dinner');
  });

  it('3. Resets all local IndexedDB data and security state', async () => {
    await setPinLock('4321');
    expect(isPinLockEnabled()).toBe(true);

    await resetAllLocalData();
    expect(isPinLockEnabled()).toBe(false);
  });
});
