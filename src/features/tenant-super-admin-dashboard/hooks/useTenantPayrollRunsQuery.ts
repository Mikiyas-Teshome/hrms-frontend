'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchPayrollRunsPaginated } from '@/features/payroll/payroll.actions';
import { useTenantSuperAdminDashboardFilters } from '@/components/dashboard/layout/tenant-super-admin-dashboard-provider';
import {
  PAYROLL_RUNS_ALL_PAGE_SIZE,
  PayrollRunListSortOrder,
  PayrollRunSortBy,
} from '@/features/payroll/payroll.types';

const STALE_TIME_MS = 60_000;

export function useTenantPayrollRunsQuery(
  payrollCompanyId: string,
  year: number,
  enabled: boolean,
) {
  const { currency } = useTenantSuperAdminDashboardFilters();

  return useQuery({
    queryKey: ['tenant-dashboard', 'payroll-runs', payrollCompanyId, year, currency],
    queryFn: () =>
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
    enabled: enabled && !!payrollCompanyId,
    staleTime: STALE_TIME_MS,
  });
}
