'use client';

import { useMemo } from 'react';
import { formatIntlCurrency } from '@/lib/currency';
import { useTenantSuperAdminDashboardFilters } from '@/components/dashboard/layout/tenant-super-admin-dashboard-provider';
import {
  filterRunsForMonth,
  resolveLatestRunStatus,
  sumRunNetPay,
} from '../utils/tenant-payroll-metrics.util';
import { getCalendarMonthBounds } from '../utils/tenant-payroll-period.util';
import { useTenantDashboardScope } from './useTenantDashboardScope';
import { useTenantPayrollRunsQuery } from './useTenantPayrollRunsQuery';

export function useTenantPayrollSnapshot(enabled = true) {
  const { scopeReady, payrollCompanyId } = useTenantDashboardScope(enabled);
  const { currency } = useTenantSuperAdminDashboardFilters();
  const currentYear = new Date().getFullYear();
  const monthBounds = getCalendarMonthBounds();

  const { data, isLoading, isFetching } = useTenantPayrollRunsQuery(
    payrollCompanyId,
    currentYear,
    scopeReady,
  );

  const snapshot = useMemo(() => {
    const runs = data?.data ?? [];
    const monthRuns = filterRunsForMonth(runs, monthBounds);
    const monthNetPay = sumRunNetPay(monthRuns);
    const statusSource = monthRuns.length > 0 ? monthRuns : runs;
    return {
      payrollStatus: resolveLatestRunStatus(statusSource),
      monthNetPay,
      netSpendFormatted: formatIntlCurrency(monthNetPay, currency),
    };
  }, [currency, data?.data, monthBounds]);

  return {
    snapshot,
    isLoading: isLoading || isFetching,
    scopeReady,
  };
}
