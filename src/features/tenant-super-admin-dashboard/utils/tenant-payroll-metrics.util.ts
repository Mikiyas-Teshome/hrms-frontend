import type { PayrollRunResponse } from '@/features/payroll/payroll.types';
import type { CompanyPayrollStatus } from '../tenant-super-admin-dashboard.types';
import type { CalendarMonthBounds } from './tenant-payroll-period.util';
import { isRunInCalendarMonth } from './tenant-payroll-period.util';

const COUNTABLE_STATUSES = new Set(['finalized', 'paid']);

export function filterRunsForMonth(
  runs: PayrollRunResponse[],
  bounds: CalendarMonthBounds,
): PayrollRunResponse[] {
  return runs.filter(
    (run) =>
      isRunInCalendarMonth(run.startDate, bounds) && COUNTABLE_STATUSES.has(run.status),
  );
}

export function sumRunGrossPay(runs: PayrollRunResponse[]): number {
  return runs.reduce((sum, run) => sum + Number(run.grossPay ?? 0), 0);
}

export function sumRunNetPay(runs: PayrollRunResponse[]): number {
  return runs.reduce((sum, run) => sum + Number(run.netPay ?? 0), 0);
}

export function resolveLatestRunStatus(
  runs: PayrollRunResponse[],
): CompanyPayrollStatus {
  if (!runs.length) {
    return 'pending';
  }
  const sorted = [...runs].sort(
    (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime(),
  );
  const latest = sorted[0];
  if (latest.status === 'paid') {
    return 'paid';
  }
  return 'pending';
}

export function computeTrendPercent(current: number, previous: number): {
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
} {
  if (previous === 0) {
    if (current === 0) {
      return { trend: 'neutral', trendValue: '0%' };
    }
    return { trend: 'up', trendValue: '+100%' };
  }
  const delta = ((current - previous) / previous) * 100;
  const rounded = Math.round(delta * 10) / 10;
  const sign = rounded > 0 ? '+' : '';
  const trend = rounded > 0 ? 'up' : rounded < 0 ? 'down' : 'neutral';
  return { trend, trendValue: `${sign}${rounded}%` };
}
