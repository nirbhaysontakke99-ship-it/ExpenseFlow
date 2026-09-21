import type { TransactionType } from './Transaction';

export interface Category {
  id: string;
  user_id?: string | null; // null for system defaults
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  is_default: boolean;
  created_at: string;
}

export type CreateCategoryInput = Omit<Category, 'id' | 'created_at'>;
