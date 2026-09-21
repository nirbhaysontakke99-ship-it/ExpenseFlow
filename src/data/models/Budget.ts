export interface Budget {
  id: string;
  user_id: string;
  category_id?: string | null; // null or 'overall' for overall monthly budget limit
  amount: number; // in integer paise
  month: number; // 1 - 12
  year: number; // e.g. 2026
  created_at: string;
  updated_at: string;
}

export type CreateBudgetInput = Omit<Budget, 'id' | 'created_at' | 'updated_at'>;
export type UpdateBudgetInput = Partial<Omit<Budget, 'id' | 'user_id' | 'created_at'>>;
