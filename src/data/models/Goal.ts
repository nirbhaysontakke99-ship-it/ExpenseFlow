export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number; // in integer paise
  current_amount: number; // in integer paise
  target_date: string; // ISO date string
  icon: string;
  description?: string;
  status?: 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
}

export type CreateGoalInput = Omit<Goal, 'id' | 'created_at' | 'updated_at'>;
export type UpdateGoalInput = Partial<Omit<Goal, 'id' | 'user_id' | 'created_at'>>;
