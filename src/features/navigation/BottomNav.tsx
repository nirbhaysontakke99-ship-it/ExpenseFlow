import React from 'react';
import { Home, PieChart, Plus, Target, Settings } from 'lucide-react';
import { cn } from '@/core/utils/cn';

export type TabType = 'home' | 'reports' | 'add' | 'goals' | 'settings';

export interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onAddClick: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onAddClick,
}) => {
  const navItems = [
    { id: 'home' as TabType, label: 'Home', icon: Home },
    { id: 'reports' as TabType, label: 'Reports', icon: PieChart },
    { id: 'add' as TabType, label: 'Add', icon: Plus, isProminent: true },
    { id: 'goals' as TabType, label: 'Goals', icon: Target },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 px-3 pb-safe pt-1.5 max-w-md mx-auto"
      aria-label="Bottom Navigation Bar"
    >
      <div className="flex items-center justify-around h-14 relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (item.isProminent) {
            return (
              <div key={item.id} className="relative -top-5 flex justify-center items-center">
                <button
                  onClick={() => {
                    onAddClick();
                    onTabChange('add');
                  }}
                  className={cn(
                    'w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400',
                    'text-white shadow-lg shadow-emerald-600/35 border-4 border-slate-50 dark:border-slate-950',
                    'flex items-center justify-center transition-transform duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500',
                    activeTab === 'add' && 'ring-2 ring-emerald-500/50 scale-105'
                  )}
                  aria-label="Add New Expense or Income Transaction"
                >
                  <Plus className="w-7 h-7 stroke-[2.5]" />
                </button>
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-500',
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              <Icon className={cn('w-5 h-5 transition-transform duration-150', isActive && 'scale-110')} />
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
