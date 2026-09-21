export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number; // in integer paise (e.g. 25000 = ₹250.00)
  category_id: string;
  note?: string;
  date: string; // ISO date string or YYYY-MM-DD
  payment_method: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null; // Soft delete support
}

export type CreateTransactionInput = Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'deleted_at'> & {
  deleted_at?: string | null;
};
export type UpdateTransactionInput = Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at'>>;
