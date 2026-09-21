import React from 'react';
import { Card } from '@/shared/components/Card';
import type { ReportInsightItem } from '@/services/reportInsightService';
import { Lightbulb, AlertTriangle, TrendingUp, TrendingDown, PieChart, Calendar } from 'lucide-react';

export interface ReportInsightsCardProps {
  insights: ReportInsightItem[];
}

export const ReportInsightsCard: React.FC<ReportInsightsCardProps> = ({ insights }) => {
  if (insights.length === 0) return null;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'AlertTriangle':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'TrendingUp':
        return <TrendingUp className="w-4 h-4 text-amber-500" />;
      case 'TrendingDown':
        return <TrendingDown className="w-4 h-4 text-emerald-500" />;
      case 'PieChart':
        return <PieChart className="w-4 h-4 text-blue-500" />;
      case 'Calendar':
        return <Calendar className="w-4 h-4 text-purple-500" />;
      default:
        return <Lightbulb className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <Card variant="default" className="space-y-3">
      <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
        <Lightbulb className="w-4 h-4 text-amber-500" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Financial Insights
        </h3>
      </div>

      <div className="space-y-2">
        {insights.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-start gap-2.5"
          >
            <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-2xs shrink-0 mt-0.5">
              {getIcon(item.icon)}
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {item.title}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
