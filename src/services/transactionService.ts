import type { Transaction } from '@/data/models/Transaction';
import type { Category } from '@/data/models/Category';

export interface FilterOptions {
  query?: string;
  type?: 'all' | 'expense' | 'income';
  categoryId?: string;
  paymentMethod?: string;
  dateRange?: 'all' | 'today' | 'this_week' | 'this_month' | 'last_month';
  sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest';
}

export interface GroupedTransactions {
  groupTitle: string;
  transactions: Transaction[];
  totalExpensePaise: number;
  totalIncomePaise: number;
}

/**
 * Returns YYYY-MM-DD in local timezone (avoiding UTC timezone shift bugs)
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function filterTransactions(
  transactions: Transaction[],
  categoriesMap: Map<string, Category>,
  options: FilterOptions = {}
): Transaction[] {
  let result = [...transactions];

  const {
    query = '',
    type = 'all',
    categoryId = 'all',
    paymentMethod = 'all',
    dateRange = 'all',
    sortBy = 'newest',
  } = options;

  // 1. Type Filter
  if (type !== 'all') {
    result = result.filter((t) => t.type === type);
  }

  // 2. Category Filter
  if (categoryId !== 'all') {
    result = result.filter((t) => t.category_id === categoryId);
  }

  // 3. Payment Method Filter
  if (paymentMethod !== 'all') {
    result = result.filter((t) => t.payment_method.toLowerCase() === paymentMethod.toLowerCase());
  }

  // 4. Date Range Filter
  if (dateRange !== 'all') {
    const now = new Date();
    const todayStr = getLocalDateString(now);

    if (dateRange === 'today') {
      result = result.filter((t) => t.date.startsWith(todayStr));
    } else if (dateRange === 'this_month') {
      const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      result = result.filter((t) => t.date.startsWith(currentMonthStr));
    } else if (dateRange === 'last_month') {
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthStr = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;
      result = result.filter((t) => t.date.startsWith(lastMonthStr));
    }
  }

  // 5. Search Text Query (Note, Category Name, Payment Method)
  if (query.trim()) {
    const q = query.toLowerCase().trim();
    result = result.filter((t) => {
      const catName = categoriesMap.get(t.category_id)?.name.toLowerCase() || '';
      const note = (t.note || '').toLowerCase();
      const pm = t.payment_method.toLowerCase();
      return note.includes(q) || catName.includes(q) || pm.includes(q);
    });
  }

  // 6. Sorting
  result.sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    if (sortBy === 'oldest') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    if (sortBy === 'highest') {
      return b.amount - a.amount;
    }
    if (sortBy === 'lowest') {
      return a.amount - b.amount;
    }
    return 0;
  });

  return result;
}

export function groupTransactionsByDate(
  transactions: Transaction[],
  now: Date = new Date()
): GroupedTransactions[] {
  const todayStr = getLocalDateString(now);

  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(now.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterdayDate);

  const groupsMap = new Map<string, Transaction[]>();

  transactions.forEach((tx) => {
    let key = tx.date;
    if (tx.date.startsWith(todayStr)) {
      key = 'TODAY';
    } else if (tx.date.startsWith(yesterdayStr)) {
      key = 'YESTERDAY';
    }
    const current = groupsMap.get(key) || [];
    groupsMap.set(key, [...current, tx]);
  });

  const result: GroupedTransactions[] = [];

  groupsMap.forEach((txs, key) => {
    const totalExpensePaise = txs
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalIncomePaise = txs
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    let title = key;
    if (key !== 'TODAY' && key !== 'YESTERDAY') {
      const d = new Date(key);
      title = d.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
    }

    result.push({
      groupTitle: title,
      transactions: txs,
      totalExpensePaise,
      totalIncomePaise,
    });
  });

  return result;
}
