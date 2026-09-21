import { db } from '../database/db';
import type { User, CreateUserInput, UpdateUserInput } from '../models/User';

export const userRepository = {
  async getById(id: string): Promise<User | undefined> {
    return await db.users.get(id);
  },

  async getCurrentUser(): Promise<User | undefined> {
    const users = await db.users.toArray();
    return users[0]; // Return the default active user
  },

  async create(input: CreateUserInput): Promise<User> {
    const now = new Date().toISOString();
    const user: User = {
      id: crypto.randomUUID(),
      ...input,
      created_at: now,
      updated_at: now,
    };
    await db.users.add(user);
    return user;
  },

  async update(id: string, input: UpdateUserInput): Promise<User | undefined> {
    const now = new Date().toISOString();
    const existing = await db.users.get(id);
    if (!existing) return undefined;

    const updated: User = {
      ...existing,
      ...input,
      updated_at: now,
    };
    await db.users.put(updated);
    return updated;
  },

  async delete(id: string): Promise<void> {
    await db.users.delete(id);
  },
};
