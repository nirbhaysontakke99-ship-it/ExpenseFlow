import React from 'react';
import type { Category } from '@/data/models/Category';
import { MoreHorizontal, type LucideIcon } from 'lucide-react';
import { getCategoryIconComponent } from '@/core/utils/categoryIconUtils';

export interface CategoryIconProps {
  category?: Category | string | null;
  className?: string;
  size?: number | string;
  color?: string;
  style?: React.CSSProperties;
  fallbackIcon?: LucideIcon;
}

/**
 * Reusable Category Icon component that renders the appropriate Lucide icon
 * for any given category, with safe fallback and customizable styling.
 */
export const CategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  className = 'w-4 h-4',
  size,
  color,
  style,
  fallbackIcon = MoreHorizontal,
}) => {
  const IconComponent = getCategoryIconComponent(category, fallbackIcon);
  const resolvedColor = color || (typeof category === 'object' && category?.color ? category.color : undefined);

  return (
    <IconComponent
      className={className}
      size={size}
      style={{ ...(resolvedColor ? { color: resolvedColor } : {}), ...style }}
    />
  );
};
