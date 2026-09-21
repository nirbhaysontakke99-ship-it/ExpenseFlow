import React from 'react';
import { cn } from '@/core/utils/cn';

export interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'circle';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className,
  variant = 'text',
}) => {
  const variantStyles = {
    text: 'h-4 w-full rounded-md',
    card: 'h-24 w-full rounded-[20px]',
    circle: 'h-10 w-10 rounded-full',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-slate-200/80 dark:bg-slate-800/80',
        variantStyles[variant],
        className
      )}
    />
  );
};
