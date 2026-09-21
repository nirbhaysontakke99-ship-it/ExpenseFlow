import { describe, it, expect } from 'vitest';
import { parseQuickEntry } from './quickEntryService';
import { filterTransactions, groupTransactionsByDate } from './transactionService';
import type { Transaction } from '@/data/models/Transaction';
import type { Category } from '@/data/models/Category';
import { toPaise } from '@/core/utils/currencyUtils';

describe('Phase 5 Transaction Engine & Quick Entry', () => {
  it('1. Parses natural language quick entry inputs correctly', () => {
    // "₹250 dinner"
    const p1 = parseQuickEntry('₹250 dinner');
    expect(p1?.amountPaise).toBe(25000);
    expect(p1?.categoryId).toBe('food');
    expect(p1?.note).toBe('dinner');

    // "120 auto to college"
    const p2 = parseQuickEntry('120 auto to college');
    expect(p2?.amountPaise).toBe(12000);
    expect(p2?.categoryId).toBe('transport');
    expect(p2?.note).toContain('auto to college');

    // "500 groceries"
    const p3 = parseQuickEntry('500 groceries');
    expect(p3?.amountPaise).toBe(50000);
    expect(p3?.categoryId).toBe('groceries');

    // Invalid text
    expect(parseQuickEntry('no amount text')).toBeNull();
  });

  it('2. Filters transactions by category, payment method, and search query', () => {
    const mockTxs: Transaction[] = [
      {
        id: '1',
        user_id: 'u1',
        type: 'expense',
        amount: toPaise(250),
        category_id: 'food',
        note: 'Dinner with friends',
        date: '2026-08-16',
        payment_method: 'UPI',
        created_at: '2026-08-16T10:00:00Z',
        updated_at: '2026-08-16T10:00:00Z',
      },
      {
        id: '2',
        user_id: 'u1',
        type: 'expense',
        amount: toPaise(120),
        category_id: 'transport',
        note: 'Auto to college',
        date: '2026-08-16',
        payment_method: 'Cash',
        created_at: '2026-08-16T11:00:00Z',
        updated_at: '2026-08-16T11:00:00Z',
      },
    ];

    const catMap = new Map<string, Category>([
      ['food', { id: 'food', name: 'Food & Dining', icon: 'Utensils', color: '#EF4444', type: 'expense', is_default: true, created_at: '' }],
      ['transport', { id: 'transport', name: 'Transport', icon: 'Car', color: '#3B82F6', type: 'expense', is_default: true, created_at: '' }],
    ]);

    // Search query "Dinner"
    const searchRes = filterTransactions(mockTxs, catMap, { query: 'Dinner' });
    expect(searchRes.length).toBe(1);
    expect(searchRes[0].id).toBe('1');

    // Payment method "UPI"
    const upiRes = filterTransactions(mockTxs, catMap, { paymentMethod: 'UPI' });
    expect(upiRes.length).toBe(1);
    expect(upiRes[0].payment_method).toBe('UPI');
  });

  it('3. Groups transactions into TODAY, YESTERDAY, and earlier date buckets', () => {
    const aug16 = new Date(2026, 7, 16);
    const mockTxs: Transaction[] = [
      {
        id: '1',
        user_id: 'u1',
        type: 'expense',
        amount: toPaise(250),
        category_id: 'food',
        date: '2026-08-16',
        payment_method: 'UPI',
        created_at: '2026-08-16T10:00:00Z',
        updated_at: '2026-08-16T10:00:00Z',
      },
      {
        id: '2',
        user_id: 'u1',
        type: 'expense',
        amount: toPaise(740),
        category_id: 'groceries',
        date: '2026-08-15',
        payment_method: 'UPI',
        created_at: '2026-08-15T10:00:00Z',
        updated_at: '2026-08-15T10:00:00Z',
      },
    ];

    const groups = groupTransactionsByDate(mockTxs, aug16);
    expect(groups.length).toBe(2);
    expect(groups[0].groupTitle).toBe('TODAY');
    expect(groups[1].groupTitle).toBe('YESTERDAY');
  });
});
