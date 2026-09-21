export interface GoalContribution {
  id: string;
  goal_id: string;
  amount: number; // in integer paise
  date: string; // ISO date string
  note?: string;
  created_at: string;
}

export type CreateGoalContributionInput = Omit<GoalContribution, 'id' | 'created_at'>;
