import type { ThemeMode } from '@/core/theme/tokens';

export interface User {
  id: string;
  name: string;
  email: string;
  currency: string;
  monthly_income: number; // in paise
  theme: ThemeMode;
  onboarding_completed?: boolean;
  setup_step?: number;
  income_source?: string;
  main_financial_goal?: string;
  created_at: string;
  updated_at: string;
}

export type CreateUserInput = Omit<User, 'id' | 'created_at' | 'updated_at'>;
export type UpdateUserInput = Partial<Omit<User, 'id' | 'created_at'>>;
