import type { Category } from '@/data/models/Category';
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
  Laptop,
  TrendingUp,
  Gift,
  PlusCircle,
  Tag,
  type LucideIcon,
} from 'lucide-react';

/**
 * Centralized Category to Lucide Icon mapping.
 * Maps category IDs, normalized names, and icon identifiers to suitable Lucide React icons.
 */
export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  // Food & Dining
  food: Utensils,
  'food & dining': Utensils,
  dining: Utensils,
  restaurant: Utensils,
  cafe: Utensils,
  utensils: Utensils,
  utensilscrossed: Utensils,

  // Groceries
  groceries: ShoppingCart,
  grocery: ShoppingCart,
  supermarket: ShoppingCart,
  shoppingcart: ShoppingCart,

  // Travel
  travel: Plane,
  flight: Plane,
  trip: Plane,
  plane: Plane,
  map: Plane,

  // Transport & Auto
  transport: Car,
  'transport & auto': Car,
  auto: Car,
  car: Car,
  bus: Car,
  cab: Car,
  taxi: Car,
  vehicle: Car,
  fuel: Car,

  // Shopping
  shopping: ShoppingBag,
  shoppingbag: ShoppingBag,
  store: ShoppingBag,
  shirt: ShoppingBag,
  clothes: ShoppingBag,

  // Entertainment
  entertainment: Film,
  movies: Film,
  movie: Film,
  film: Film,
  game: Film,
  gaming: Film,
  gamepad: Film,
  gamepad2: Film,
  tv: Film,

  // Bills & Utilities
  bills: Receipt,
  'bills & utilities': Receipt,
  utilities: Receipt,
  utility: Receipt,
  receipt: Receipt,
  filetext: Receipt,
  electricity: Receipt,
  water: Receipt,
  zap: Receipt,

  // Education & Books
  education: BookOpen,
  'education & books': BookOpen,
  books: BookOpen,
  book: BookOpen,
  bookopen: BookOpen,
  study: BookOpen,
  college: BookOpen,
  school: BookOpen,
  graduationcap: BookOpen,

  // Health & Medical
  health: HeartPulse,
  'health & medical': HeartPulse,
  medical: HeartPulse,
  doctor: HeartPulse,
  medicine: HeartPulse,
  pharmacy: HeartPulse,
  hospital: HeartPulse,
  heartpulse: HeartPulse,
  heart: HeartPulse,
  activity: HeartPulse,

  // Rent & Hostel
  rent: House,
  'rent & hostel': House,
  hostel: House,
  house: House,
  home: House,
  building: House,
  building2: House,

  // Mobile & Wifi
  recharge: Smartphone,
  mobile: Smartphone,
  'mobile & wifi': Smartphone,
  wifi: Smartphone,
  phone: Smartphone,
  smartphone: Smartphone,
  internet: Smartphone,

  // Other Expense
  other_exp: MoreHorizontal,
  other: MoreHorizontal,
  'other expense': MoreHorizontal,
  'other expenses': MoreHorizontal,
  misc: MoreHorizontal,
  miscellaneous: MoreHorizontal,
  morehorizontal: MoreHorizontal,

  // Income categories
  salary: Briefcase,
  briefcase: Briefcase,
  income: Wallet,
  pocket_money: Wallet,
  'pocket money': Wallet,
  wallet: Wallet,
  freelance: Laptop,
  laptop: Laptop,
  business: TrendingUp,
  trendingup: TrendingUp,
  gift: Gift,
  'gift / allowance': Gift,
  allowance: Gift,
  other_inc: PlusCircle,
  'other income': PlusCircle,
  pluscircle: PlusCircle,
  tag: Tag,
};

/**
 * Returns the resolved Lucide Icon component for a given category object, ID, or name.
 * Provides a safe fallback icon (MoreHorizontal) for custom/unknown categories.
 */
export function getCategoryIconComponent(
  category?: Category | string | null,
  fallback: LucideIcon = MoreHorizontal
): LucideIcon {
  if (!category) return fallback;

  // If passed a Category object
  if (typeof category === 'object') {
    const idKey = category.id?.toLowerCase().trim();
    if (idKey && CATEGORY_ICON_MAP[idKey]) {
      return CATEGORY_ICON_MAP[idKey];
    }

    const iconKey = category.icon?.toLowerCase().trim();
    if (iconKey && CATEGORY_ICON_MAP[iconKey]) {
      return CATEGORY_ICON_MAP[iconKey];
    }

    const nameKey = category.name?.toLowerCase().trim();
    if (nameKey && CATEGORY_ICON_MAP[nameKey]) {
      return CATEGORY_ICON_MAP[nameKey];
    }

    // Keyword match on category name
    if (nameKey) {
      if (nameKey.includes('food') || nameKey.includes('din')) return Utensils;
      if (nameKey.includes('grocer')) return ShoppingCart;
      if (nameKey.includes('travel') || nameKey.includes('flight')) return Plane;
      if (nameKey.includes('transport') || nameKey.includes('car') || nameKey.includes('auto')) return Car;
      if (nameKey.includes('shop')) return ShoppingBag;
      if (nameKey.includes('entertain') || nameKey.includes('movie') || nameKey.includes('game')) return Film;
      if (nameKey.includes('bill') || nameKey.includes('utilit')) return Receipt;
      if (nameKey.includes('educat') || nameKey.includes('book')) return BookOpen;
      if (nameKey.includes('health') || nameKey.includes('medic')) return HeartPulse;
      if (nameKey.includes('rent') || nameKey.includes('hostel') || nameKey.includes('house')) return House;
      if (nameKey.includes('mobil') || nameKey.includes('wifi') || nameKey.includes('recharg')) return Smartphone;
      if (nameKey.includes('salar')) return Briefcase;
      if (nameKey.includes('pocket') || nameKey.includes('wallet')) return Wallet;
      if (nameKey.includes('freelanc')) return Laptop;
      if (nameKey.includes('business')) return TrendingUp;
      if (nameKey.includes('gift')) return Gift;
    }

    return fallback;
  }

  // If passed a string (ID, name, or icon name)
  const strKey = category.toLowerCase().trim();
  if (CATEGORY_ICON_MAP[strKey]) {
    return CATEGORY_ICON_MAP[strKey];
  }

  // Partial match on string
  if (strKey.includes('food') || strKey.includes('din')) return Utensils;
  if (strKey.includes('grocer')) return ShoppingCart;
  if (strKey.includes('travel') || strKey.includes('flight')) return Plane;
  if (strKey.includes('transport') || strKey.includes('car') || strKey.includes('auto')) return Car;
  if (strKey.includes('shop')) return ShoppingBag;
  if (strKey.includes('entertain') || strKey.includes('movie') || strKey.includes('game')) return Film;
  if (strKey.includes('bill') || strKey.includes('utilit')) return Receipt;
  if (strKey.includes('educat') || strKey.includes('book')) return BookOpen;
  if (strKey.includes('health') || strKey.includes('medic')) return HeartPulse;
  if (strKey.includes('rent') || strKey.includes('hostel') || strKey.includes('house')) return House;
  if (strKey.includes('mobil') || strKey.includes('wifi') || strKey.includes('recharg')) return Smartphone;
  if (strKey.includes('salar')) return Briefcase;
  if (strKey.includes('pocket') || strKey.includes('wallet')) return Wallet;
  if (strKey.includes('freelanc')) return Laptop;
  if (strKey.includes('business')) return TrendingUp;
  if (strKey.includes('gift')) return Gift;

  return fallback;
}
