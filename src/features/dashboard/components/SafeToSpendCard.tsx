import React from 'react';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { usePrivacyMode } from '@/core/privacy/PrivacyContext';
import { type SafeToSpendResult } from '@/services/safeToSpendService';
import { Sparkles, AlertTriangle, ArrowRight, ShieldCheck, Wallet } from 'lucide-react';
import { DEFAULT_CURRENCY } from '@/core/constants/currency';

export interface SafeToSpendCardProps {
  safeToSpend: SafeToSpendResult;
  currencyCode?: string;
  onSetIncomeClick?: () => void;
}

export const SafeToSpendCard: React.FC<SafeToSpendCardProps> = ({
  safeToSpend,
  currencyCode = 'INR',
  onSetIncomeClick,
}) => {
  const { formatSensitive } = usePrivacyMode();
  const currencyConfig = { ...DEFAULT_CURRENCY, code: currencyCode };
  const {
    safeDailySpendPaise,
    daysRemaining,
    status,
    statusText,
    overAmountPaise,
    isEstimate,
  } = safeToSpend;

  // Render Case 5: No Income Configured
  if (status === 'no_income') {
    return (
      <Card variant="flat" className="p-5 border border-dashed border-emerald-300 dark:border-emerald-800 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
          <Wallet className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Set your income to unlock Safe-To-Spend
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ExpenseFlow calculates how much you can safely spend each day based on your monthly income.
          </p>
        </div>
        {onSetIncomeClick && (
          <Button variant="emerald" size="sm" onClick={onSetIncomeClick} rightIcon={<ArrowRight className="w-4 h-4" />}>
            Set Income
          </Button>
        )}
      </Card>
    );
  }

  // Card Variant & Badge Styling based on status
  const cardVariant = status === 'overspending' ? 'default' : 'emerald';

  return (
    <Card
      variant={cardVariant}
      className={`relative overflow-hidden ${
        status === 'overspending'
          ? 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60'
          : ''
      }`}
      aria-label={`Safe to spend: ${formatSensitive(safeDailySpendPaise, currencyConfig)} per day. ${daysRemaining} days remaining.`}
    >
      {/* Glow background accent */}
      {status !== 'overspending' && (
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
            status === 'overspending'
              ? 'text-red-700 dark:text-red-300'
              : 'text-emerald-200/90'
          }`}
        >
          {status === 'overspending' ? (
            <AlertTriangle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          )}
          {isEstimate ? 'Estimated Safe Daily Spend' : 'Safe To Spend Today'}
        </span>

        <span
          className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${
            status === 'overspending'
              ? 'bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-200 border-red-300/50'
              : 'bg-emerald-950/60 text-emerald-200 border-emerald-700/40'
          }`}
        >
          {daysRemaining} {daysRemaining === 1 ? 'day remaining' : 'days remaining'}
        </span>
      </div>

      {/* Amount Display */}
      <div className="my-3">
        {status === 'overspending' ? (
          <div className="text-3xl font-black text-red-600 dark:text-red-400 tracking-tight">
            {formatSensitive(0, currencyConfig)}
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 ml-2">
              ({formatSensitive(overAmountPaise, currencyConfig)} over budget)
            </span>
          </div>
        ) : (
          <div className="text-4xl font-black text-white tracking-tight">
            {formatSensitive(safeDailySpendPaise, currencyConfig)}
            <span className="text-base font-medium text-emerald-200/80 ml-1">/day</span>
          </div>
        )}
      </div>

      {/* Status Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-white/10 dark:border-slate-800">
        <span
          className={`text-xs font-semibold flex items-center gap-1.5 ${
            status === 'overspending'
              ? 'text-red-600 dark:text-red-300'
              : status === 'caution'
              ? 'text-amber-200'
              : 'text-emerald-100'
          }`}
        >
          {status === 'healthy' && <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />}
          {statusText}
        </span>
      </div>
    </Card>
  );
};
