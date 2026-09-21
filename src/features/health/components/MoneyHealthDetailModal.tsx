import React from 'react';
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import type { MoneyHealthResult } from '@/services/moneyHealthService';
import { CheckCircle2, AlertCircle, Lightbulb } from 'lucide-react';

export interface MoneyHealthDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  healthResult: MoneyHealthResult | null;
}

export const MoneyHealthDetailModal: React.FC<MoneyHealthDetailModalProps> = ({
  isOpen,
  onClose,
  healthResult,
}) => {
  if (!healthResult) return null;

  const { totalScore, healthLevel, hasSufficientData, factors, whatsGoingWell, opportunities, howToImprove } = healthResult;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ExpenseFlow Money Health">
      <div className="space-y-4">
        {/* Score Ring Hero */}
        <div className="text-center py-6 px-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <path
                className="text-slate-200 dark:text-slate-700"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500 transition-all duration-500"
                strokeDasharray={`${hasSufficientData ? totalScore : 100}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-2xl font-black text-slate-900 dark:text-white">
              {hasSufficientData ? totalScore : '--'}
            </span>
          </div>

          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {hasSufficientData ? healthLevel : 'Building Your Score'}
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-0.5">
              A simple snapshot of your recent money habits. Not a credit score.
            </p>
          </div>
        </div>

        {/* 5 Factors Breakdown */}
        {hasSufficientData && factors.length > 0 && (
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Score Breakdown Factors
            </h4>

            <div className="space-y-2">
              {factors.map((factor) => (
                <div
                  key={factor.name}
                  className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {factor.name} ({factor.weight}%)
                    </span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                      {factor.score}/100
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${factor.score}%` }}
                    />
                  </div>

                  <span className="text-[10px] text-slate-400 font-medium block">
                    {factor.statusText}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Explanations & Advice */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {whatsGoingWell.length > 0 && (
            <div className="space-y-1">
              <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-1 text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" /> What's Going Well
              </h5>
              {whatsGoingWell.map((w, idx) => (
                <p key={idx} className="text-slate-600 dark:text-slate-300 pl-4">
                  {w}
                </p>
              ))}
            </div>
          )}

          {opportunities.length > 0 && (
            <div className="space-y-1">
              <h5 className="font-bold text-amber-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Opportunity
              </h5>
              {opportunities.map((o, idx) => (
                <p key={idx} className="text-slate-600 dark:text-slate-300 pl-4">
                  {o}
                </p>
              ))}
            </div>
          )}

          {howToImprove.length > 0 && (
            <div className="space-y-1">
              <h5 className="font-bold text-blue-600 flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5" /> How to Improve
              </h5>
              {howToImprove.map((h, idx) => (
                <p key={idx} className="text-slate-600 dark:text-slate-300 pl-4">
                  {h}
                </p>
              ))}
            </div>
          )}
        </div>

        <Button variant="secondary" fullWidth onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
};
