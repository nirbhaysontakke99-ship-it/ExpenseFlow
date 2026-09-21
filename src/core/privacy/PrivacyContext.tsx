import React, { createContext, useContext, useState, useEffect } from 'react';
import { formatCurrency } from '@/core/utils/currencyUtils';
import type { CurrencyConfig } from '@/core/constants/currency';

export interface PrivacyContextType {
  isPrivacyMode: boolean;
  togglePrivacyMode: () => void;
  setPrivacyMode: (value: boolean) => void;
  formatSensitive: (amountPaise: number, currencyConfig?: CurrencyConfig) => string;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

const STORAGE_KEY = 'ef_privacy_mode';

export const PrivacyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPrivacyMode, setIsPrivacyMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(isPrivacyMode));
    }
  }, [isPrivacyMode]);

  const togglePrivacyMode = () => setIsPrivacyMode((prev) => !prev);
  const setPrivacyMode = (value: boolean) => setIsPrivacyMode(value);

  const formatSensitive = (amountPaise: number, currencyConfig?: CurrencyConfig): string => {
    if (isPrivacyMode) {
      return '••••••';
    }
    return formatCurrency(amountPaise, currencyConfig);
  };

  return (
    <PrivacyContext.Provider
      value={{
        isPrivacyMode,
        togglePrivacyMode,
        setPrivacyMode,
        formatSensitive,
      }}
    >
      {children}
    </PrivacyContext.Provider>
  );
};

export function usePrivacyMode(): PrivacyContextType {
  const context = useContext(PrivacyContext);
  if (!context) {
    throw new Error('usePrivacyMode must be used within a PrivacyProvider');
  }
  return context;
}
