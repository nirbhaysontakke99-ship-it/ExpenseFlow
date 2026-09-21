import React from 'react';
import { Badge } from '@/shared/components/Badge';

export interface GreetingHeaderProps {
  userName: string;
  currentDate?: Date;
}

export const GreetingHeader: React.FC<GreetingHeaderProps> = ({
  userName,
  currentDate = new Date(),
}) => {
  const hour = currentDate.getHours();
  let greeting = 'Good morning 👋';

  if (hour >= 12 && hour < 17) {
    greeting = 'Good afternoon 👋';
  } else if (hour >= 17 && hour < 22) {
    greeting = 'Good evening 👋';
  } else if (hour >= 22 || hour < 5) {
    greeting = 'Good night 👋';
  }

  const formattedDate = currentDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {greeting.replace('👋', '')} <span className="capitalize">{userName}</span> 👋
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {formattedDate}
        </p>
      </div>
      <Badge variant="healthy" size="sm">
        Budget Active
      </Badge>
    </div>
  );
};
