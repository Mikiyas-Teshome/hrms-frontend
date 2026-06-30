import { format, startOfMonth, subMonths } from 'date-fns';
import type { PayrollRunResponse } from '@/features/payroll/payroll.types';
import type {
  TenantPayrollTrendPoint,
  TenantPayrollTrendRange,
} from '../tenant-super-admin-dashboard.types';
import { filterRunsForMonth, sumRunGrossPay } from './tenant-payroll-metrics.util';
import { getCalendarMonthBounds } from './tenant-payroll-period.util';

const RANGE_MONTHS: Record<TenantPayrollTrendRange, number> = {
  '6m': 6,
  '12m': 12,
  '18m': 18,
};

export function buildPayrollTrendSeries(
  runs: PayrollRunResponse[],
  range: TenantPayrollTrendRange,
  reference: Date = new Date(),
): TenantPayrollTrendPoint[] {
  const monthCount = RANGE_MONTHS[range];
  const points: TenantPayrollTrendPoint[] = [];

  for (let i = monthCount - 1; i >= 0; i -= 1) {
    const monthStart = startOfMonth(subMonths(reference, i));
    const bounds = getCalendarMonthBounds(monthStart);
    const monthRuns = filterRunsForMonth(runs, bounds);
    points.push({
      label: format(monthStart, 'MMM yyyy'),
      amount: sumRunGrossPay(monthRuns),
    });
  }

  return points;
}
