export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  minorUnitRatio: number; // 100 paise = 1 INR
  locale: string;
}

export const DEFAULT_CURRENCY: CurrencyConfig = {
  code: 'INR',
  symbol: '₹',
  name: 'Indian Rupee',
  minorUnitRatio: 100,
  locale: 'en-IN',
};

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  DEFAULT_CURRENCY,
  {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    minorUnitRatio: 100,
    locale: 'en-US',
  },
  {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    minorUnitRatio: 100,
    locale: 'de-DE',
  },
  {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    minorUnitRatio: 100,
    locale: 'en-GB',
  },
];
