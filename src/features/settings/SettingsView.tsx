import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { userRepository } from '@/data/repositories/userRepository';
import { useTheme } from '@/core/theme/ThemeContext';
import { usePrivacyMode } from '@/core/privacy/PrivacyContext';
import { isPinLockEnabled } from '@/services/securityService';
import { SettingsSection } from './components/SettingsSection';
import { SettingsRow } from './components/SettingsRow';
import { CurrencyModal } from './components/CurrencyModal';
import { PinLockModal } from './components/PinLockModal';
import { ExportDataModal } from './components/ExportDataModal';
import { DataResetDialog } from './components/DataResetDialog';
import { SyncStatusIndicator } from '@/shared/components/SyncStatusIndicator';
import {
  User,
  Sun,
  Moon,
  Globe,
  Eye,
  EyeOff,
  Lock,
  Bell,
  Download,
  Trash2,
  RefreshCw,
  Info,
} from 'lucide-react';

export interface SettingsViewProps {
  onDataReset?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onDataReset }) => {
  const { theme, setTheme } = useTheme();
  const { isPrivacyMode, togglePrivacyMode } = usePrivacyMode();
  const [hasPin, setHasPin] = useState<boolean>(() => isPinLockEnabled());

  // Notification Toggles (Persisted in state for Phase 12 preference system)
  const [budgetAlerts, setBudgetAlerts] = useState<boolean>(true);
  const [recurringReminders, setRecurringReminders] = useState<boolean>(true);
  const [goalReminders, setGoalReminders] = useState<boolean>(true);

  // Modal States
  const [isCurrencyOpen, setIsCurrencyOpen] = useState<boolean>(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isResetOpen, setIsResetOpen] = useState<boolean>(false);

  const currentUser = useLiveQuery(() => userRepository.getCurrentUser(), []);

  const handleNameChange = async () => {
    if (!currentUser) return;
    const newName = window.prompt('Enter your name:', currentUser.name);
    if (newName && newName.trim()) {
      await userRepository.update(currentUser.id, { name: newName.trim() });
    }
  };

  return (
    <div className="flex-1 p-4 space-y-4 pb-24 max-w-md mx-auto w-full animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Settings</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Preferences, security, privacy & data.
        </p>
      </div>

      {/* 1. Profile Section */}
      <SettingsSection title="Profile">
        <SettingsRow
          icon={<User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
          title="Account Name"
          subtitle={currentUser?.name || 'Guest User'}
          onClick={handleNameChange}
        />
      </SettingsSection>

      {/* 2. Appearance Section */}
      <SettingsSection title="Appearance">
        <SettingsRow
          icon={theme === 'dark' ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
          title="Theme"
          subtitle={theme === 'system' ? 'System Theme' : theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          value={
            <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-[11px] font-bold">
              <button
                onClick={() => setTheme('light')}
                className={`px-2 py-0.5 rounded-lg ${
                  theme === 'light' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-xs' : 'text-slate-400'
                }`}
              >
                Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`px-2 py-0.5 rounded-lg ${
                  theme === 'dark' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-xs' : 'text-slate-400'
                }`}
              >
                Dark
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`px-2 py-0.5 rounded-lg ${
                  theme === 'system' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-xs' : 'text-slate-400'
                }`}
              >
                Auto
              </button>
            </div>
          }
        />
      </SettingsSection>

      {/* 3. Currency Section */}
      <SettingsSection title="Currency & Region">
        <SettingsRow
          icon={<Globe className="w-4 h-4 text-blue-500" />}
          title="Display Currency"
          subtitle={currentUser?.currency || 'INR (₹)'}
          onClick={() => setIsCurrencyOpen(true)}
        />
      </SettingsSection>

      {/* 4. Privacy & Security Section */}
      <SettingsSection title="Privacy & Security">
        <SettingsRow
          icon={isPrivacyMode ? <EyeOff className="w-4 h-4 text-purple-500" /> : <Eye className="w-4 h-4 text-purple-500" />}
          title="Privacy Mode"
          subtitle="Mask financial balances across all screens"
          onClick={togglePrivacyMode}
          value={
            <input
              type="checkbox"
              checked={isPrivacyMode}
              onChange={togglePrivacyMode}
              className="accent-emerald-600 w-4 h-4 rounded cursor-pointer"
            />
          }
        />

        <SettingsRow
          icon={<Lock className="w-4 h-4 text-emerald-500" />}
          title="App PIN Lock"
          subtitle={hasPin ? 'Active (SHA-256 Secured)' : 'Off (Protect app on launch)'}
          onClick={() => setIsPinModalOpen(true)}
          value={
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
              hasPin ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-500'
            }`}>
              {hasPin ? 'ENABLED' : 'OFF'}
            </span>
          }
        />
      </SettingsSection>

      {/* 5. Notification Preferences */}
      <SettingsSection title="Notification Preferences">
        <SettingsRow
          icon={<Bell className="w-4 h-4 text-amber-500" />}
          title="Budget Alerts"
          subtitle="Notify when approaching 80%+ budget"
          onClick={() => setBudgetAlerts((prev) => !prev)}
          value={
            <input
              type="checkbox"
              checked={budgetAlerts}
              onChange={(e) => setBudgetAlerts(e.target.checked)}
              className="accent-emerald-600 w-4 h-4 rounded cursor-pointer"
            />
          }
        />
        <SettingsRow
          icon={<RefreshCw className="w-4 h-4 text-blue-500" />}
          title="Recurring Reminders"
          subtitle="Notify when upcoming bills are due"
          onClick={() => setRecurringReminders((prev) => !prev)}
          value={
            <input
              type="checkbox"
              checked={recurringReminders}
              onChange={(e) => setRecurringReminders(e.target.checked)}
              className="accent-emerald-600 w-4 h-4 rounded cursor-pointer"
            />
          }
        />
        <SettingsRow
          icon={<Bell className="w-4 h-4 text-purple-500" />}
          title="Goal Progress Updates"
          subtitle="Celebrate savings milestones"
          onClick={() => setGoalReminders((prev) => !prev)}
          value={
            <input
              type="checkbox"
              checked={goalReminders}
              onChange={(e) => setGoalReminders(e.target.checked)}
              className="accent-emerald-600 w-4 h-4 rounded cursor-pointer"
            />
          }
        />
      </SettingsSection>

      {/* 6. Data & Cloud Sync */}
      <SettingsSection title="Data & Cloud Sync">
        <SettingsRow
          icon={<RefreshCw className="w-4 h-4 text-blue-500" />}
          title="Cloud Sync Status"
          subtitle="Supabase Local-First Sync Engine"
          value={<SyncStatusIndicator showLabel={true} />}
        />
        <SettingsRow
          icon={<Download className="w-4 h-4 text-emerald-600" />}
          title="Export My Data (CSV)"
          subtitle="Download human-readable CSV dataset"
          onClick={() => setIsExportOpen(true)}
        />
        <SettingsRow
          icon={<Trash2 className="w-4 h-4 text-red-500" />}
          title="Reset Local Data"
          subtitle="Wipe local database and settings"
          isDanger
          onClick={() => setIsResetOpen(true)}
        />
      </SettingsSection>

      {/* 7. About Section */}
      <SettingsSection title="About ExpenseFlow">
        <SettingsRow
          icon={<Info className="w-4 h-4 text-slate-500" />}
          title="ExpenseFlow Mobile"
          subtitle="Track. Understand. Improve."
          value={<span className="font-mono text-slate-500">v1.0.0</span>}
        />
      </SettingsSection>

      {/* Modals */}
      <CurrencyModal
        isOpen={isCurrencyOpen}
        onClose={() => setIsCurrencyOpen(false)}
        currentCurrency={currentUser?.currency || 'INR'}
        onCurrencyChanged={() => {}}
      />

      <PinLockModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onPinStateChanged={() => setHasPin(isPinLockEnabled())}
      />

      <ExportDataModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      <DataResetDialog
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        onDataResetCompleted={() => {
          if (onDataReset) onDataReset();
          else window.location.reload();
        }}
      />
    </div>
  );
};
