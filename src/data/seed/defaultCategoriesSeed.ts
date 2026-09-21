import { db } from '../database/db';
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '@/core/constants/defaultCategories';
import type { Category } from '../models/Category';

/**
 * Idempotently seeds default expense and income categories into IndexedDB.
 * Running this function multiple times will not produce duplicate categories.
 */
export async function seedDefaultCategories(): Promise<Category[]> {
  const existingCategories = await db.categories.toArray();
  const existingMap = new Map(existingCategories.map((c) => [c.id, c]));

  const now = new Date().toISOString();
  const categoriesToInsert: Category[] = [];

  // Prepare expense categories
  for (const catDef of DEFAULT_EXPENSE_CATEGORIES) {
    if (!existingMap.has(catDef.id)) {
      categoriesToInsert.push({
        id: catDef.id,
        user_id: null,
        name: catDef.name,
        icon: catDef.iconName,
        color: catDef.color,
        type: 'expense',
        is_default: true,
        created_at: now,
      });
    }
  }

  // Prepare income categories
  for (const catDef of DEFAULT_INCOME_CATEGORIES) {
    if (!existingMap.has(catDef.id)) {
      categoriesToInsert.push({
        id: catDef.id,
        user_id: null,
        name: catDef.name,
        icon: catDef.iconName,
        color: catDef.color,
        type: 'income',
        is_default: true,
        created_at: now,
      });
    }
  }

  if (categoriesToInsert.length > 0) {
    await db.categories.bulkAdd(categoriesToInsert);
  }

  return await db.categories.toArray();
}
