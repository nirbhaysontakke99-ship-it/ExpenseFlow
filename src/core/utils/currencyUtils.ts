import { DEFAULT_CURRENCY, type CurrencyConfig } from '../constants/currency';

/**
 * Converts major currency unit (e.g. Rupees) to minor integer unit (Paise).
 * e.g., 250.50 -> 25050
 */
export function rupeesToPaise(rupees: number): number {
  if (isNaN(rupees) || !isFinite(rupees)) return 0;
  return Math.round(rupees * 100);
}

export const toPaise = rupeesToPaise;

/**
 * Converts minor integer unit (Paise) to major currency unit (Rupees).
 * e.g., 25050 -> 250.50
 */
export function paiseToRupees(paise: number): number {
  if (isNaN(paise) || !isFinite(paise)) return 0;
  return paise / 100;
}

export const fromPaise = paiseToRupees;

/**
 * Formats a paise integer into a localized currency string.
 * Example: 250000 paise -> "₹2,500" or "₹2,500.00"
 */
export function formatCurrency(
  paise: number,
  currency: CurrencyConfig = DEFAULT_CURRENCY,
  showDecimals: boolean = false
): string {
  const rupees = paiseToRupees(paise);
  const formatter = new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });

  return formatter.format(rupees);
}

/**
 * Formats large amounts into a readable compact notation (e.g. ₹2.5k, ₹1.2L).
 */
export function formatCompactCurrency(
  paise: number,
  currency: CurrencyConfig = DEFAULT_CURRENCY
): string {
  const rupees = paiseToRupees(paise);
  const absRupees = Math.abs(rupees);
  
  if (currency.code === 'INR') {
    if (absRupees >= 10000000) { // 1 Cr+
      return `${currency.symbol}${(rupees / 10000000).toFixed(1)}Cr`;
    }
    if (absRupees >= 100000) { // 1 Lakh+
      return `${currency.symbol}${(rupees / 100000).toFixed(1)}L`;
    }
    if (absRupees >= 1000) { // 1k+
      return `${currency.symbol}${(rupees / 1000).toFixed(1)}k`;
    }
  }

  return formatCurrency(paise, currency, false);
}
