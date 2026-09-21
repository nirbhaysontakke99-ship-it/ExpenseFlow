import { describe, it, expect } from 'vitest';
import { getCategoryIconComponent } from './categoryIconUtils';
import {
  Utensils,
  ShoppingCart,
  Plane,
  Car,
  ShoppingBag,
  Film,
  Receipt,
  BookOpen,
  HeartPulse,
  House,
  Smartphone,
  MoreHorizontal,
  Briefcase,
  Wallet,
} from 'lucide-react';

describe('categoryIconUtils', () => {
  it('maps standard expense category IDs to correct Lucide icons', () => {
    expect(getCategoryIconComponent('food')).toBe(Utensils);
    expect(getCategoryIconComponent('groceries')).toBe(ShoppingCart);
    expect(getCategoryIconComponent('travel')).toBe(Plane);
    expect(getCategoryIconComponent('transport')).toBe(Car);
    expect(getCategoryIconComponent('shopping')).toBe(ShoppingBag);
    expect(getCategoryIconComponent('entertainment')).toBe(Film);
    expect(getCategoryIconComponent('bills')).toBe(Receipt);
    expect(getCategoryIconComponent('education')).toBe(BookOpen);
    expect(getCategoryIconComponent('health')).toBe(HeartPulse);
    expect(getCategoryIconComponent('rent')).toBe(House);
    expect(getCategoryIconComponent('recharge')).toBe(Smartphone);
    expect(getCategoryIconComponent('other_exp')).toBe(MoreHorizontal);
  });

  it('maps category names to correct Lucide icons', () => {
    expect(getCategoryIconComponent('Food & Dining')).toBe(Utensils);
    expect(getCategoryIconComponent('Grocery')).toBe(ShoppingCart);
    expect(getCategoryIconComponent('Travel')).toBe(Plane);
    expect(getCategoryIconComponent('Transport & Auto')).toBe(Car);
    expect(getCategoryIconComponent('Shopping')).toBe(ShoppingBag);
    expect(getCategoryIconComponent('Entertainment')).toBe(Film);
    expect(getCategoryIconComponent('Bills & Utilities')).toBe(Receipt);
    expect(getCategoryIconComponent('Education & Books')).toBe(BookOpen);
    expect(getCategoryIconComponent('Health & Medical')).toBe(HeartPulse);
    expect(getCategoryIconComponent('Rent & Hostel')).toBe(House);
    expect(getCategoryIconComponent('Mobile & Wifi')).toBe(Smartphone);
    expect(getCategoryIconComponent('Other Expense')).toBe(MoreHorizontal);
  });

  it('maps Category objects dynamically', () => {
    expect(
      getCategoryIconComponent({
        id: 'cat_custom_food',
        name: 'Fine Dining & Cafe',
        icon: 'Utensils',
        color: '#EF4444',
        type: 'expense',
        is_default: false,
        created_at: '',
      })
    ).toBe(Utensils);

    expect(
      getCategoryIconComponent({
        id: 'salary',
        name: 'Salary',
        icon: 'Briefcase',
        color: '#10B981',
        type: 'income',
        is_default: true,
        created_at: '',
      })
    ).toBe(Briefcase);

    expect(
      getCategoryIconComponent({
        id: 'pocket_money',
        name: 'Pocket Money',
        icon: 'Wallet',
        color: '#3B82F6',
        type: 'income',
        is_default: true,
        created_at: '',
      })
    ).toBe(Wallet);
  });

  it('safely handles unknown and custom categories with fallback icon', () => {
    expect(getCategoryIconComponent('unknown_custom_category')).toBe(MoreHorizontal);
    expect(getCategoryIconComponent(null)).toBe(MoreHorizontal);
    expect(getCategoryIconComponent(undefined)).toBe(MoreHorizontal);
    expect(
      getCategoryIconComponent({
        id: 'custom_99',
        name: 'Arbitrary Tag',
        icon: 'unknown_icon',
        color: '#123456',
        type: 'expense',
        is_default: false,
        created_at: '',
      })
    ).toBe(MoreHorizontal);
  });
});
