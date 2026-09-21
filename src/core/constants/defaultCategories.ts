export interface CategoryDefinition {
  id: string;
  name: string;
  iconName: string;
  color: string;
  type: 'expense' | 'income';
  isDefault: boolean;
}

export const DEFAULT_EXPENSE_CATEGORIES: CategoryDefinition[] = [
  { id: 'food', name: 'Food & Dining', iconName: 'Utensils', color: '#EF4444', type: 'expense', isDefault: true },
  { id: 'transport', name: 'Transport & Auto', iconName: 'Car', color: '#3B82F6', type: 'expense', isDefault: true },
  { id: 'groceries', name: 'Groceries', iconName: 'ShoppingCart', color: '#10B981', type: 'expense', isDefault: true },
  { id: 'rent', name: 'Rent & Hostel', iconName: 'House', color: '#8B5CF6', type: 'expense', isDefault: true },
  { id: 'bills', name: 'Bills & Utilities', iconName: 'Receipt', color: '#F59E0B', type: 'expense', isDefault: true },
  { id: 'recharge', name: 'Mobile & Wifi', iconName: 'Smartphone', color: '#06B6D4', type: 'expense', isDefault: true },
  { id: 'education', name: 'Education & Books', iconName: 'BookOpen', color: '#6366F1', type: 'expense', isDefault: true },
  { id: 'shopping', name: 'Shopping', iconName: 'ShoppingBag', color: '#EC4899', type: 'expense', isDefault: true },
  { id: 'entertainment', name: 'Entertainment', iconName: 'Film', color: '#A855F7', type: 'expense', isDefault: true },
  { id: 'health', name: 'Health & Medical', iconName: 'HeartPulse', color: '#14B8A6', type: 'expense', isDefault: true },
  { id: 'travel', name: 'Travel', iconName: 'Plane', color: '#F97316', type: 'expense', isDefault: true },
  { id: 'other_exp', name: 'Other Expense', iconName: 'MoreHorizontal', color: '#6B7280', type: 'expense', isDefault: true },
];

export const DEFAULT_INCOME_CATEGORIES: CategoryDefinition[] = [
  { id: 'salary', name: 'Salary', iconName: 'Briefcase', color: '#10B981', type: 'income', isDefault: true },
  { id: 'pocket_money', name: 'Pocket Money', iconName: 'Wallet', color: '#3B82F6', type: 'income', isDefault: true },
  { id: 'freelance', name: 'Freelance', iconName: 'Laptop', color: '#8B5CF6', type: 'income', isDefault: true },
  { id: 'business', name: 'Business', iconName: 'TrendingUp', color: '#F59E0B', type: 'income', isDefault: true },
  { id: 'gift', name: 'Gift / Allowance', iconName: 'Gift', color: '#EC4899', type: 'income', isDefault: true },
  { id: 'other_inc', name: 'Other Income', iconName: 'PlusCircle', color: '#6B7280', type: 'income', isDefault: true },
];
