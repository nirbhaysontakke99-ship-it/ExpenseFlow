import React from 'react';
import { Card } from '@/shared/components/Card';
import { Lightbulb } from 'lucide-react';

export interface InsightCardProps {
  insight: {
    title: string;
    description: string;
    type: 'info' | 'warning' | 'positive';
  } | null;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  if (!insight) return null;

  return (
    <Card
      variant="flat"
      className="p-3.5 border border-emerald-200/60 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/30 flex items-start gap-3"
    >
      <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 shrink-0">
        <Lightbulb className="w-4 h-4" />
      </div>
      <div>
        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
          {insight.title}
        </h4>
        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-normal">
          {insight.description}
        </p>
      </div>
    </Card>
  );
};
