import { db } from '../database/db';
import type { Category, CreateCategoryInput } from '../models/Category';

export const categoryRepository = {
  async getAll(userId?: string): Promise<Category[]> {
    const all = await db.categories.toArray();
    return all.filter((c) => c.is_default || (userId && c.user_id === userId));
  },

  async getById(id: string): Promise<Category | undefined> {
    return await db.categories.get(id);
  },

  async create(input: CreateCategoryInput): Promise<Category> {
    const category: Category = {
      id: crypto.randomUUID(),
      ...input,
      is_default: false,
      created_at: new Date().toISOString(),
    };
    await db.categories.add(category);
    return category;
  },

  async delete(id: string): Promise<boolean> {
    const cat = await db.categories.get(id);
    if (!cat || cat.is_default) return false; // Prevent deleting system defaults
    await db.categories.delete(id);
    return true;
  },
};
