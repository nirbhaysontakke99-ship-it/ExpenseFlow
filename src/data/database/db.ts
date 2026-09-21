import Dexie, { type Table } from 'dexie';
import type { User } from '../models/User';
import type { Transaction } from '../models/Transaction';
import type { Category } from '../models/Category';
import type { Budget } from '../models/Budget';
import type { Goal } from '../models/Goal';
import type { RecurringTransaction } from '../models/RecurringTransaction';
import type { GoalContribution } from '../models/GoalContribution';
import type { SyncQueueItem } from '../models/SyncQueueItem';

export class ExpenseFlowDatabase extends Dexie {
  users!: Table<User, string>;
  transactions!: Table<Transaction, string>;
  categories!: Table<Category, string>;
  budgets!: Table<Budget, string>;
  goals!: Table<Goal, string>;
  recurring_transactions!: Table<RecurringTransaction, string>;
  goal_contributions!: Table<GoalContribution, string>;
  sync_queue!: Table<SyncQueueItem, string>;

  constructor() {
    super('ExpenseFlowDatabase');

    this.version(1).stores({
      users: 'id, email, updated_at',
      transactions: 'id, user_id, type, date, category_id, payment_method, updated_at, deleted_at, [user_id+date], [user_id+type]',
      categories: 'id, user_id, type, is_default, name',
      budgets: 'id, user_id, category_id, month, year, [user_id+month+year], [user_id+category_id+month+year]',
      goals: 'id, user_id, target_date, updated_at',
      recurring_transactions: 'id, user_id, active, next_date, updated_at',
      goal_contributions: 'id, goal_id, date',
      sync_queue: 'id, status, created_at, entity_type',
    });
  }
}

export const db = new ExpenseFlowDatabase();
