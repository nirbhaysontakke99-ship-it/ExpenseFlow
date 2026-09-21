import React, { useState } from 'react';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';
import { Sparkles, Utensils, Car, ArrowRight, ArrowLeft, Target } from 'lucide-react';

export interface OnboardingSlidesProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingSlides: React.FC<OnboardingSlidesProps> = ({
  onComplete,
  onSkip,
}) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  const slides = [
    {
      id: 1,
      title: 'Know where your money goes.',
      description: 'Track your daily expenses in seconds and understand your spending habits.',
      renderVisual: () => (
        <Card variant="default" className="w-full space-y-2.5 shadow-md border-emerald-100 dark:border-emerald-950">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Transactions</span>
            <Badge variant="healthy" size="sm">3-Sec Record</Badge>
          </div>
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center">
                <Utensils className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Dinner with Friends</span>
                <span className="text-[10px] text-slate-400">Food & Dining • UPI</span>
              </div>
            </div>
            <span className="text-xs font-extrabold text-red-600 dark:text-red-400">₹250</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Car className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Auto to College</span>
                <span className="text-[10px] text-slate-400">Transport • Cash</span>
              </div>
            </div>
            <span className="text-xs font-extrabold text-red-600 dark:text-red-400">₹120</span>
          </div>
        </Card>
      ),
    },
    {
      id: 2,
      title: 'Know what you can spend.',
      description: 'ExpenseFlow calculates a simple daily spending amount based on your income, expenses, budgets, and goals.',
      renderVisual: () => (
        <Card variant="emerald" className="w-full relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200/90 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Safe To Spend Today
            </span>
            <span className="text-[11px] bg-emerald-950/60 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-700/40">
              18 days left
            </span>
          </div>
          <div className="my-3">
            <div className="text-4xl font-black text-white tracking-tight">
              ₹428<span className="text-base font-medium text-emerald-200/80 ml-1">/day</span>
            </div>
          </div>
          <p className="text-xs text-emerald-100/80 font-medium">
            Calculated automatically from your ₹25,000 monthly allowance.
          </p>
        </Card>
      ),
    },
    {
      id: 3,
      title: 'Give your money a destination.',
      description: 'Create savings goals and see your progress every step of the way.',
      renderVisual: () => (
        <Card variant="default" className="w-full space-y-3 shadow-md border-emerald-100 dark:border-emerald-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Wireless Headphones</h4>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">72%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '72%' }} />
              </div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Saved: ₹5,760</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Target: ₹8,000</span>
          </div>
        </Card>
      ),
    },
  ];

  const current = slides[currentSlide];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col justify-between p-6 max-w-md mx-auto w-full">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between pt-2">
        {currentSlide > 0 ? (
          <button
            onClick={handlePrev}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Previous slide"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-9 h-9" />
        )}

        {/* Progress indicator dots */}
        <div className="flex items-center gap-1.5">
          {slides.map((s, idx) => (
            <div
              key={s.id}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentSlide
                  ? 'w-7 bg-emerald-600 dark:bg-emerald-400'
                  : 'w-2 bg-slate-200 dark:bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Skip button */}
        <button
          onClick={onSkip}
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Main Slide Content */}
      <div className="my-auto py-8 space-y-6 animate-in fade-in duration-300">
        {/* Visual Preview */}
        <div className="min-h-[160px] flex items-center justify-center">
          {current.renderVisual()}
        </div>

        {/* Text */}
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {current.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
            {current.description}
          </p>
        </div>
      </div>

      {/* Bottom Action Button */}
      <div className="pb-6">
        <Button
          variant="emerald"
          fullWidth
          size="lg"
          rightIcon={currentSlide === slides.length - 1 ? undefined : <ArrowRight className="w-5 h-5" />}
          onClick={handleNext}
        >
          {currentSlide === slides.length - 1 ? 'Get Started' : 'Continue'}
        </Button>
      </div>
    </div>
  );
};
