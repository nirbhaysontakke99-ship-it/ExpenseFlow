export type FrequencyType = 'daily' | 'weekly' | '28_days' | 'monthly' | 'yearly';

export interface RecurringTransaction {
  id: string;
  user_id: string;
  title: string;
  amount: number; // in integer paise
  category_id: string;
  frequency: FrequencyType;
  next_date: string; // ISO date string
  payment_method: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type CreateRecurringTransactionInput = Omit<RecurringTransaction, 'id' | 'created_at' | 'updated_at'>;
export type UpdateRecurringTransactionInput = Partial<Omit<RecurringTransaction, 'id' | 'user_id' | 'created_at'>>;
