import React, { useState } from 'react';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';
import { toPaise, formatCurrency } from '@/core/utils/currencyUtils';
import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY, type CurrencyConfig } from '@/core/constants/currency';
import { ArrowLeft, Check, Sparkles, User as UserIcon, Wallet, DollarSign, Target, PieChart } from 'lucide-react';
import { userRepository } from '@/data/repositories/userRepository';
import { budgetRepository } from '@/data/repositories/budgetRepository';

export interface SetupWizardProps {
  initialStep?: number;
  initialData?: {
    name?: string;
    monthly_income?: number;
    currency?: string;
    income_source?: string;
    main_financial_goal?: string;
  };
  onComplete: () => void;
}

export const SetupWizard: React.FC<SetupWizardProps> = ({
  initialStep = 1,
  initialData = {},
  onComplete,
}) => {
  const [step, setStep] = useState<number>(initialStep);

  // Form State
  const [name, setName] = useState<string>(initialData.name || '');
  const [incomeInput, setIncomeInput] = useState<string>(
    initialData.monthly_income ? (initialData.monthly_income / 100).toString() : '25000'
  );
  const [incomeSource, setIncomeSource] = useState<string>(initialData.income_source || 'Pocket Money');
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyConfig>(DEFAULT_CURRENCY);
  const [financialGoal, setFinancialGoal] = useState<string>(initialData.main_financial_goal || 'Save money');
  
  // Budget options: 'income' | 'custom' | 'skip'
  const [budgetOption, setBudgetOption] = useState<'income' | 'custom' | 'skip'>('income');
  const [customBudgetInput, setCustomBudgetInput] = useState<string>('20000');
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const parsedIncomePaise = incomeInput ? toPaise(parseFloat(incomeInput) || 0) : 0;
  const parsedBudgetPaise =
    budgetOption === 'income'
      ? parsedIncomePaise
      : budgetOption === 'custom'
      ? toPaise(parseFloat(customBudgetInput) || 0)
      : 0;

  const incomeSources = ['Salary', 'Pocket Money', 'Freelance', 'Business', 'Other'];
  const goalOptions = [
    { id: 'Save money', label: 'Save money', icon: '💰' },
    { id: 'Control spending', label: 'Control spending', icon: '📊' },
    { id: 'Manage student expenses', label: 'Manage student expenses', icon: '🎓' },
    { id: 'Build emergency fund', label: 'Build emergency fund', icon: '🛟' },
    { id: 'Reach a specific goal', label: 'Reach a specific goal', icon: '🎯' },
    { id: 'Other', label: 'Other', icon: '✨' },
  ];

  const handleNextStep = () => {
    setErrorMsg(null);

    // Step validations
    if (step === 2 && incomeInput) {
      const val = parseFloat(incomeInput);
      if (isNaN(val) || val < 0) {
        setErrorMsg('Please enter a valid non-negative income amount.');
        return;
      }
    }

    if (step === 5 && budgetOption === 'custom') {
      const val = parseFloat(customBudgetInput);
      if (isNaN(val) || val <= 0) {
        setErrorMsg('Please enter a valid budget amount.');
        return;
      }
    }

    if (step < 6) {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setErrorMsg(null);
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const handleFinishSetup = async () => {
    setIsSubmitting(true);
    try {
      // Create or update user profile in IndexedDB
      const existingUser = await userRepository.getCurrentUser();
      let userId: string;

      if (existingUser) {
        const updated = await userRepository.update(existingUser.id, {
          name: name.trim() || 'ExpenseFlow User',
          currency: selectedCurrency.code,
          monthly_income: parsedIncomePaise,
          income_source: incomeSource,
          main_financial_goal: financialGoal,
          onboarding_completed: true,
          setup_step: 6,
        });
        userId = updated?.id || existingUser.id;
      } else {
        const newUser = await userRepository.create({
          name: name.trim() || 'ExpenseFlow User',
          email: 'user@expenseflow.app',
          currency: selectedCurrency.code,
          monthly_income: parsedIncomePaise,
          income_source: incomeSource,
          main_financial_goal: financialGoal,
          theme: 'system',
          onboarding_completed: true,
          setup_step: 6,
        });
        userId = newUser.id;
      }

      // Upsert monthly budget if provided
      if (parsedBudgetPaise > 0) {
        const now = new Date();
        await budgetRepository.upsertBudget({
          user_id: userId,
          category_id: null, // Overall monthly budget
          amount: parsedBudgetPaise,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        });
      }

      onComplete();
    } catch (err) {
      console.error('Setup error:', err);
      setErrorMsg('Unable to save setup data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col justify-between p-6 max-w-md mx-auto w-full">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pt-2 mb-4">
          {step > 1 && step < 6 ? (
            <button
              onClick={handlePrevStep}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-9 h-9" />
          )}

          <Badge variant="healthy" size="sm">
            Step {step} of 5
          </Badge>

          {step < 6 ? (
            <button
              onClick={handleNextStep}
              className="text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-3 py-1.5 rounded-lg"
            >
              Skip
            </button>
          ) : (
            <div className="w-9 h-9" />
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-6">
          <div
            className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${(Math.min(step, 5) / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Step Content */}
      <div className="my-auto py-4 space-y-6">
        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-300 font-medium">
            {errorMsg}
          </div>
        )}

        {/* STEP 1 — Name */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="space-y-2 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <UserIcon className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                What should we call you?
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personalize your ExpenseFlow experience.
              </p>
            </div>

            <Card variant="default" className="p-4">
              <input
                type="text"
                placeholder="Enter your name (e.g. Nirbhay)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                autoFocus
              />
            </Card>
          </div>
        )}

        {/* STEP 2 — Monthly Income */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="space-y-2 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <Wallet className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Monthly Available Income
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                How much money do you receive or have available each month?
              </p>
            </div>

            <Card variant="default" className="p-4 space-y-4 text-center">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Monthly Amount</label>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-3xl font-extrabold text-slate-400">
                    {selectedCurrency.symbol}
                  </span>
                  <input
                    type="number"
                    placeholder="25000"
                    value={incomeInput}
                    onChange={(e) => setIncomeInput(e.target.value)}
                    className="text-3xl font-black text-slate-900 dark:text-white w-48 text-center bg-transparent border-b-2 border-emerald-500 focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                  Income Source
                </label>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {incomeSources.map((src) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setIncomeSource(src)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                        incomeSource === src
                          ? 'border-emerald-500 bg-emerald-600 text-white font-semibold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {src}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* STEP 3 — Currency */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="space-y-2 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <DollarSign className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Choose Currency
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Default for students and young adults in India.
              </p>
            </div>

            <div className="space-y-2">
              {SUPPORTED_CURRENCIES.map((curr) => (
                <Card
                  key={curr.code}
                  variant={selectedCurrency.code === curr.code ? 'default' : 'flat'}
                  clickable
                  onClick={() => setSelectedCurrency(curr)}
                  className={`p-3.5 flex items-center justify-between border ${
                    selectedCurrency.code === curr.code
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40'
                      : 'border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{curr.code === 'INR' ? '🇮🇳' : '🌐'}</span>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        {curr.name} ({curr.symbol})
                      </span>
                      <span className="text-[10px] text-slate-400">{curr.code}</span>
                    </div>
                  </div>
                  {selectedCurrency.code === curr.code && (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4 — Financial Goal */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="space-y-2 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <Target className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Main Financial Goal
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                What do you want to achieve with ExpenseFlow?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {goalOptions.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setFinancialGoal(g.id)}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all ${
                    financialGoal === g.id
                      ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900'
                  }`}
                >
                  <span className="text-2xl">{g.icon}</span>
                  <span className="text-xs font-bold leading-snug">{g.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5 — Monthly Budget */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="space-y-2 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <PieChart className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Monthly Spending Budget
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Set a cap to stay within budget every month.
              </p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setBudgetOption('income')}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  budgetOption === 'income'
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/60'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Use Monthly Income ({formatCurrency(parsedIncomePaise, selectedCurrency)})
                  </span>
                  <span className="text-[10px] text-slate-400">Cap monthly budget to total available income</span>
                </div>
                {budgetOption === 'income' && <Check className="w-4 h-4 text-emerald-600" />}
              </button>

              <button
                type="button"
                onClick={() => setBudgetOption('custom')}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  budgetOption === 'custom'
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/60'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Custom Budget</span>
                  <span className="text-[10px] text-slate-400">Enter a specific target limit</span>
                </div>
                {budgetOption === 'custom' && <Check className="w-4 h-4 text-emerald-600" />}
              </button>

              {budgetOption === 'custom' && (
                <div className="pt-2 px-2">
                  <div className="flex items-center justify-center gap-1 p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-500">
                    <span className="text-xl font-bold text-slate-400">{selectedCurrency.symbol}</span>
                    <input
                      type="number"
                      value={customBudgetInput}
                      onChange={(e) => setCustomBudgetInput(e.target.value)}
                      className="text-2xl font-black text-slate-900 dark:text-white w-36 text-center bg-transparent focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setBudgetOption('skip')}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  budgetOption === 'skip'
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/60'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Skip Budget for Now</span>
                  <span className="text-[10px] text-slate-400">You can set up budgets anytime later</span>
                </div>
                {budgetOption === 'skip' && <Check className="w-4 h-4 text-emerald-600" />}
              </button>
            </div>
          </div>
        )}

        {/* STEP 6 — Summary / Ready Screen */}
        {step === 6 && (
          <div className="space-y-6 animate-in zoom-in-95 duration-300">
            <div className="space-y-2 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                <Sparkles className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                You're Ready! 🎉
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Here is a quick summary of your financial setup.
              </p>
            </div>

            <Card variant="default" className="divide-y divide-slate-100 dark:divide-slate-800 space-y-0">
              <div className="py-2.5 flex justify-between text-xs">
                <span className="font-semibold text-slate-500">Name</span>
                <span className="font-bold text-slate-900 dark:text-white">{name || 'Nirbhay'}</span>
              </div>
              <div className="py-2.5 flex justify-between text-xs">
                <span className="font-semibold text-slate-500">Monthly Income</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {parsedIncomePaise > 0 ? formatCurrency(parsedIncomePaise, selectedCurrency) : 'Skipped'}
                </span>
              </div>
              <div className="py-2.5 flex justify-between text-xs">
                <span className="font-semibold text-slate-500">Monthly Budget</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {parsedBudgetPaise > 0 ? formatCurrency(parsedBudgetPaise, selectedCurrency) : 'None set'}
                </span>
              </div>
              <div className="py-2.5 flex justify-between text-xs">
                <span className="font-semibold text-slate-500">Currency</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedCurrency.name} ({selectedCurrency.symbol})
                </span>
              </div>
              <div className="py-2.5 flex justify-between text-xs">
                <span className="font-semibold text-slate-500">Main Goal</span>
                <span className="font-bold text-slate-900 dark:text-white">{financialGoal}</span>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="pb-6">
        {step < 6 ? (
          <Button variant="emerald" fullWidth size="lg" onClick={handleNextStep}>
            {step === 5 ? 'Review Setup' : 'Continue'}
          </Button>
        ) : (
          <Button
            variant="emerald"
            fullWidth
            size="lg"
            disabled={isSubmitting}
            onClick={handleFinishSetup}
          >
            {isSubmitting ? 'Saving Profile...' : 'Start Tracking'}
          </Button>
        )}
      </div>
    </div>
  );
};
