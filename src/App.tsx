import { useState, useEffect } from 'react';
import { ThemeProvider } from '@/core/theme/ThemeContext';
import { PrivacyProvider } from '@/core/privacy/PrivacyContext';
import { ViewContainer } from '@/features/navigation/ViewContainer';
import { HeaderNav } from '@/features/navigation/HeaderNav';
import { BottomNav, type TabType } from '@/features/navigation/BottomNav';
import { DashboardView } from '@/features/dashboard/DashboardView';
import { ReportsView } from '@/features/reports/ReportsView';
import { TransactionsView } from '@/features/transactions/TransactionsView';
import { BudgetsView } from '@/features/budgets/BudgetsView';
import { RecurringView } from '@/features/recurring/RecurringView';
import { GoalsView } from '@/features/goals/GoalsView';
import { SettingsView } from '@/features/settings/SettingsView';
import { PinLockScreen } from '@/features/settings/components/PinLockScreen';
import { AddModal } from '@/features/add/AddModal';
import { SplashScreen } from '@/features/onboarding/SplashScreen';
import { OnboardingSlides } from '@/features/onboarding/OnboardingSlides';
import { SetupWizard } from '@/features/onboarding/SetupWizard';
import { seedDefaultCategories } from '@/data/seed/defaultCategoriesSeed';
import { userRepository } from '@/data/repositories/userRepository';
import { isPinLockEnabled } from '@/services/securityService';
import type { User } from '@/data/models/User';

type AppStage = 'splash' | 'onboarding' | 'setup' | 'main';

export function AppContent() {
  const [stage, setStage] = useState<AppStage>('splash');
  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [reportsSubView, setReportsSubView] = useState<'analytics' | 'transactions' | 'budgets' | 'recurring'>('analytics');
  const [isMobileFrameMode, setIsMobileFrameMode] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(() => isPinLockEnabled());

  useEffect(() => {
    async function initApp() {
      await seedDefaultCategories().catch(console.error);
      const user = await userRepository.getCurrentUser();
      setCurrentUser(user);
    }
    initApp();
  }, []);

  const handleSplashFinish = () => {
    if (currentUser?.onboarding_completed) {
      setStage('main');
    } else if (currentUser && !currentUser.onboarding_completed) {
      setStage('setup');
    } else {
      setStage('onboarding');
    }
  };

  const handleOnboardingComplete = () => {
    setStage('setup');
  };

  const handleSetupComplete = async () => {
    const updatedUser = await userRepository.getCurrentUser();
    setCurrentUser(updatedUser);
    setStage('main');
  };

  const handleDataReset = () => {
    setStage('onboarding');
    setCurrentUser(undefined);
    setIsLocked(false);
    setActiveTab('home');
  };

  if (isLocked) {
    return <PinLockScreen onUnlocked={() => setIsLocked(false)} />;
  }

  if (stage === 'splash') {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  if (stage === 'onboarding') {
    return (
      <ViewContainer isMobileFrameMode={isMobileFrameMode}>
        <OnboardingSlides
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingComplete}
        />
      </ViewContainer>
    );
  }

  if (stage === 'setup') {
    return (
      <ViewContainer isMobileFrameMode={isMobileFrameMode}>
        <SetupWizard
          initialStep={currentUser?.setup_step || 1}
          initialData={
            currentUser
              ? {
                  name: currentUser.name,
                  monthly_income: currentUser.monthly_income,
                  currency: currentUser.currency,
                  income_source: currentUser.income_source,
                  main_financial_goal: currentUser.main_financial_goal,
                }
              : {}
          }
          onComplete={handleSetupComplete}
        />
      </ViewContainer>
    );
  }

  return (
    <ViewContainer isMobileFrameMode={isMobileFrameMode}>
      <HeaderNav
        isMobileFrameMode={isMobileFrameMode}
        onToggleFrameMode={() => setIsMobileFrameMode((prev) => !prev)}
      />

      <main className="flex-1 flex flex-col">
        {activeTab === 'home' && (
          <DashboardView
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onNavigateSetup={() => setStage('setup')}
          />
        )}

        {activeTab === 'reports' && (
          <div className="flex-1 flex flex-col">
            {/* View Sub-selector for Reports Tab */}
            <div className="px-4 pt-3 pb-1 max-w-md mx-auto w-full">
              <div className="grid grid-cols-4 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setReportsSubView('analytics')}
                  className={`py-1.5 rounded-lg transition-all truncate px-1 ${
                    reportsSubView === 'analytics'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                      : 'text-slate-500'
                  }`}
                >
                  Analytics
                </button>
                <button
                  onClick={() => setReportsSubView('transactions')}
                  className={`py-1.5 rounded-lg transition-all truncate px-1 ${
                    reportsSubView === 'transactions'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                      : 'text-slate-500'
                  }`}
                >
                  History
                </button>
                <button
                  onClick={() => setReportsSubView('budgets')}
                  className={`py-1.5 rounded-lg transition-all truncate px-1 ${
                    reportsSubView === 'budgets'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                      : 'text-slate-500'
                  }`}
                >
                  Budgets
                </button>
                <button
                  onClick={() => setReportsSubView('recurring')}
                  className={`py-1.5 rounded-lg transition-all truncate px-1 ${
                    reportsSubView === 'recurring'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                      : 'text-slate-500'
                  }`}
                >
                  Recurring
                </button>
              </div>
            </div>

            {reportsSubView === 'analytics' && (
              <ReportsView onOpenAddModal={() => setIsAddModalOpen(true)} />
            )}
            {reportsSubView === 'transactions' && (
              <TransactionsView onOpenAddModal={() => setIsAddModalOpen(true)} />
            )}
            {reportsSubView === 'budgets' && <BudgetsView />}
            {reportsSubView === 'recurring' && <RecurringView />}
          </div>
        )}

        {activeTab === 'goals' && <GoalsView />}
        {activeTab === 'settings' && <SettingsView onDataReset={handleDataReset} />}
      </main>

      <AddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab !== 'add') setActiveTab(tab);
        }}
        onAddClick={() => setIsAddModalOpen(true)}
      />
    </ViewContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <PrivacyProvider>
        <AppContent />
      </PrivacyProvider>
    </ThemeProvider>
  );
}
