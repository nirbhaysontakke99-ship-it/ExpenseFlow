import React from 'react';
import { cn } from '@/core/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'flat' | 'emerald' | 'outlined' | 'glass';
  className?: string;
  onClick?: () => void;
  clickable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className,
  onClick,
  clickable = false,
  ...props
}) => {
  const baseStyles = 'rounded-[20px] p-5 transition-all duration-200';
  
  const variantStyles = {
    default: 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md dark:shadow-none',
    flat: 'bg-slate-50 dark:bg-slate-800/60 border border-transparent',
    emerald: 'bg-gradient-to-br from-emerald-800 via-emerald-900 to-emerald-950 text-white shadow-lg shadow-emerald-900/20 border border-emerald-700/30',
    outlined: 'bg-transparent border border-slate-200 dark:border-slate-800',
    glass: 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 dark:border-slate-800/50 shadow-sm',
  };

  const interactiveStyles = (clickable || onClick)
    ? 'cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]'
    : '';

  return (
    <div
      className={cn(baseStyles, variantStyles[variant], interactiveStyles, className)}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};
