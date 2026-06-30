'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { subMonths } from 'date-fns';
import { fetchPayrollRunsPaginated } from '@/features/payroll/payroll.actions';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { useTenantSuperAdminDashboardFilters } from '@/components/dashboard/layout/tenant-super-admin-dashboard-provider';
import {
  PAYROLL_RUNS_ALL_PAGE_SIZE,
  PayrollRunListSortOrder,
  PayrollRunSortBy,
} from '@/features/payroll/payroll.types';
import type { TenantPayrollTrendRange } from '../tenant-super-admin-dashboard.types';
import { buildPayrollTrendSeries } from '../utils/aggregate-runs-by-month.util';
import { useTenantDashboardScope } from './useTenantDashboardScope';

const STALE_TIME_MS = 60_000;

export function useTenantPayrollTrendsChart(enabled = true) {
  const { hasPermission } = usePermissions();
  const canReadPayrollRuns = hasPermission('payroll_runs:read');
  const { scopeReady, payrollCompanyId } = useTenantDashboardScope(enabled);
  const { currency } = useTenantSuperAdminDashboardFilters();
  const [range, setRange] = useState<TenantPayrollTrendRange>('12m');

  const reference = useMemo(() => new Date(), []);
  const years = useMemo(() => {
    const startYear = subMonths(reference, 17).getFullYear();
    const endYear = reference.getFullYear();
    return Array.from(new Set([startYear, endYear])).sort();
  }, [reference]);

  const { data: allRuns = [], isLoading, isFetching } = useQuery({
    queryKey: ['tenant-dashboard', 'payroll-trends-runs', payrollCompanyId, years, currency],
    queryFn: async () => {
      const pages = await Promise.all(
        years.map((year) =>
          fetchPayrollRunsPaginated(
            payrollCompanyId,
            {
              year,
              sortBy: PayrollRunSortBy.START_DATE,
              sortOrder: PayrollRunListSortOrder.DESC,
            },
            { page: 1, size: PAYROLL_RUNS_ALL_PAGE_SIZE },
            currency,
          ),
        ),
      );
      return pages.flatMap((page) => page.data);
    },
    enabled: scopeReady && canReadPayrollRuns && !!payrollCompanyId,
    staleTime: STALE_TIME_MS,
  });

  const chartData = useMemo(
    () => buildPayrollTrendSeries(allRuns, range, reference),
    [allRuns, range, reference],
  );

  const hasData = chartData.some((point) => point.amount > 0);
  const showChart = scopeReady && canReadPayrollRuns && !isLoading && !isFetching && hasData;
  const showEmpty =
    scopeReady && canReadPayrollRuns && !isLoading && !isFetching && !hasData;

  return {
    range,
    setRange,
    chartData,
    currency,
    isLoading: isLoading || isFetching,
    scopeReady,
    canReadPayrollRuns,
    showChart,
    showEmpty,
  };
}
