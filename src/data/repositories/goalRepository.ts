import { db } from '../database/db';
import type { Goal, CreateGoalInput, UpdateGoalInput } from '../models/Goal';
import type { GoalContribution, CreateGoalContributionInput } from '../models/GoalContribution';

export const goalRepository = {
  async getByUserId(userId: string): Promise<Goal[]> {
    return await db.goals.where('user_id').equals(userId).toArray();
  },

  async getById(id: string): Promise<Goal | undefined> {
    return await db.goals.get(id);
  },

  async create(input: CreateGoalInput): Promise<Goal> {
    const now = new Date().toISOString();
    const goal: Goal = {
      id: crypto.randomUUID(),
      ...input,
      created_at: now,
      updated_at: now,
    };
    await db.goals.add(goal);
    return goal;
  },

  async update(id: string, input: UpdateGoalInput): Promise<Goal | undefined> {
    const existing = await db.goals.get(id);
    if (!existing) return undefined;

    const now = new Date().toISOString();
    const updated: Goal = {
      ...existing,
      ...input,
      updated_at: now,
    };
    await db.goals.put(updated);
    return updated;
  },

  async delete(id: string): Promise<void> {
    await db.transaction('rw', [db.goals, db.goal_contributions], async () => {
      await db.goals.delete(id);
      await db.goal_contributions.where('goal_id').equals(id).delete();
    });
  },

  async addContribution(input: CreateGoalContributionInput): Promise<GoalContribution> {
    const now = new Date().toISOString();
    const contribution: GoalContribution = {
      id: crypto.randomUUID(),
      ...input,
      created_at: now,
    };

    await db.transaction('rw', [db.goals, db.goal_contributions], async () => {
      await db.goal_contributions.add(contribution);
      const goal = await db.goals.get(input.goal_id);
      if (goal) {
        await db.goals.update(input.goal_id, {
          current_amount: goal.current_amount + input.amount,
          updated_at: now,
        });
      }
    });

    return contribution;
  },

  async getContributions(goalId: string): Promise<GoalContribution[]> {
    return await db.goal_contributions.where('goal_id').equals(goalId).toArray();
  },

  async updateContribution(id: string, input: Partial<GoalContribution>): Promise<void> {
    await db.goal_contributions.update(id, input);
  },

  async deleteContribution(id: string): Promise<void> {
    await db.goal_contributions.delete(id);
  },
};
