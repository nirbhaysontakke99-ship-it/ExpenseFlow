import { getLocalDateString } from './transactionService';

export type PeriodType = '7d' | '30d' | 'this_month' | 'last_month' | 'custom';

export interface DateRangeResult {
  startDateStr: string;
  endDateStr: string;
  totalDays: number;
  label: string;
}

export function getPeriodDateRange(
  period: PeriodType,
  customStart?: string,
  customEnd?: string,
  now: Date = new Date()
): DateRangeResult {
  const current = new Date(now);

  if (period === '7d') {
    const start = new Date(current);
    start.setDate(current.getDate() - 6);
    const startDateStr = getLocalDateString(start);
    const endDateStr = getLocalDateString(current);
    return {
      startDateStr,
      endDateStr,
      totalDays: 7,
      label: 'Last 7 Days',
    };
  }

  if (period === '30d') {
    const start = new Date(current);
    start.setDate(current.getDate() - 29);
    const startDateStr = getLocalDateString(start);
    const endDateStr = getLocalDateString(current);
    return {
      startDateStr,
      endDateStr,
      totalDays: 30,
      label: 'Last 30 Days',
    };
  }

  if (period === 'last_month') {
    const lastMonthDate = new Date(current.getFullYear(), current.getMonth() - 1, 1);
    const year = lastMonthDate.getFullYear();
    const month = lastMonthDate.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const start = new Date(year, month, 1);
    const end = new Date(year, month, totalDays);

    const label = start.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

    return {
      startDateStr: getLocalDateString(start),
      endDateStr: getLocalDateString(end),
      totalDays,
      label,
    };
  }

  if (period === 'custom' && customStart && customEnd) {
    const s = new Date(customStart);
    const e = new Date(customEnd);
    const diffTime = Math.abs(e.getTime() - s.getTime());
    const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

    return {
      startDateStr: customStart,
      endDateStr: customEnd,
      totalDays,
      label: `${customStart} to ${customEnd}`,
    };
  }

  // Default: 'this_month'
  const year = current.getFullYear();
  const month = current.getMonth();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const start = new Date(year, month, 1);
  const end = new Date(year, month, totalDays);
  const label = start.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  return {
    startDateStr: getLocalDateString(start),
    endDateStr: getLocalDateString(end),
    totalDays,
    label,
  };
}
