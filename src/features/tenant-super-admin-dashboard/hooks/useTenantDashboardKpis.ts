'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPaginatedEmployees } from '@/features/employee/employee.actions';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { formatIntlCurrency } from '@/lib/currency';
import { useTenantSuperAdminDashboardFilters } from '@/components/dashboard/layout/tenant-super-admin-dashboard-provider';
import type { TenantKpiDisplay, TenantKpiMap } from '../tenant-super-admin-dashboard.types';
import {
  computeTrendPercent,
  filterRunsForMonth,
  sumRunNetPay,
} from '../utils/tenant-payroll-metrics.util';
import {
  getCalendarMonthBounds,
  getPreviousCalendarMonthBounds,
} from '../utils/tenant-payroll-period.util';
import { sumTaxForRuns } from '../utils/fetch-tenant-payroll-tax.util';
import { useTenantDashboardScope } from './useTenantDashboardScope';
import { useTenantPayrollRunsQuery } from './useTenantPayrollRunsQuery';

const PLACEHOLDER = '—';
const LOADING = '…';
const STALE_TIME_MS = 60_000;

function loadingKpi(): TenantKpiDisplay {
  return { value: LOADING, isLoading: true };
}

function staticKpi(
  value: string,
  trend?: TenantKpiDisplay['trend'],
  trendValue?: string,
): TenantKpiDisplay {
  return { value, trend, trendValue, isLoading: false };
}

async function fetchEmployeeTotal(companyOuId: string): Promise<number> {
  const page = await fetchPaginatedEmployees({ page: 1, size: 1 }, { companyOuId });
  return page.metaData.total ?? 0;
}

export function useTenantDashboardKpis(enabled = true) {
  const { hasPermission } = usePermissions();
  const { currency } = useTenantSuperAdminDashboardFilters();
  const { scopeReady, orgScope, payrollCompanyId, orgScopeKey } = useTenantDashboardScope(enabled);

  const canReadEmployees = hasPermission('employees:read');
  const canReadPayrollRuns = hasPermission('payroll_runs:read');

  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;
  const currentMonth = useMemo(() => getCalendarMonthBounds(), []);
  const previousMonth = useMemo(() => getPreviousCalendarMonthBounds(), []);

  const { data: employeesData, isLoading: isEmployeesLoading } = useQuery({
    queryKey: ['tenant-dashboard', 'employee-totals', orgScopeKey],
    queryFn: async () => {
      if (!orgScope) {
        return 0;
      }
      const totals = await Promise.all(
        orgScope.targets.map((target) => fetchEmployeeTotal(target.companyOuId)),
      );
      return totals.reduce((sum, count) => sum + count, 0);
    },
    enabled: scopeReady && canReadEmployees,
    staleTime: STALE_TIME_MS,
  });

  const { data: currentRunsPage, isLoading: isCurrentRunsLoading } = useTenantPayrollRunsQuery(
    payrollCompanyId,
    currentYear,
    scopeReady && canReadPayrollRuns,
  );

  const needsPreviousYear =
    previousMonth.year !== currentYear && scopeReady && canReadPayrollRuns;

  const { data: previousRunsPage, isLoading: isPreviousRunsLoading } = useTenantPayrollRunsQuery(
    payrollCompanyId,
    previousYear,
    needsPreviousYear,
  );

  const { data: taxData, isLoading: isTaxLoading } = useQuery({
    queryKey: [
      'tenant-dashboard',
      'payroll-tax',
      payrollCompanyId,
      currency,
      currentMonth.key,
      previousMonth.key,
    ],
    queryFn: async () => {
      const currentRuns = currentRunsPage?.data ?? [];
      const extraRuns = previousRunsPage?.data ?? [];
      const allRuns = needsPreviousYear
        ? [...currentRuns, ...extraRuns]
        : currentRuns;

      const currentMonthRuns = filterRunsForMonth(allRuns, currentMonth);
      const previousMonthRuns = filterRunsForMonth(allRuns, previousMonth);

      const [currentTax, previousTax] = await Promise.all([
        sumTaxForRuns(payrollCompanyId, currentMonthRuns, currency),
        sumTaxForRuns(payrollCompanyId, previousMonthRuns, currency),
      ]);

      return { currentTax, previousTax };
    },
    enabled:
      scopeReady &&
      canReadPayrollRuns &&
      !!currentRunsPage &&
      (!needsPreviousYear || !!previousRunsPage),
    staleTime: STALE_TIME_MS,
  });

  const kpiMap = useMemo((): TenantKpiMap => {
    const formatMoney = (amount: number) => formatIntlCurrency(amount, currency);

    const totalEmployees: TenantKpiDisplay = (() => {
      if (!scopeReady || !canReadEmployees) {
        return staticKpi(PLACEHOLDER);
      }
      if (isEmployeesLoading) {
        return loadingKpi();
      }
      const count = employeesData ?? 0;
      return staticKpi(String(count));
    })();

    const totalPayout: TenantKpiDisplay = (() => {
      if (!scopeReady || !canReadPayrollRuns) {
        return staticKpi(PLACEHOLDER);
      }
      if (isCurrentRunsLoading || isPreviousRunsLoading) {
        return loadingKpi();
      }
      const currentRuns = currentRunsPage?.data ?? [];
      const extraRuns = previousRunsPage?.data ?? [];
      const allRuns = needsPreviousYear
        ? [...currentRuns, ...extraRuns]
        : currentRuns;
      const currentMonthRuns = filterRunsForMonth(allRuns, currentMonth);
      const previousMonthRuns = filterRunsForMonth(allRuns, previousMonth);
      const current = sumRunNetPay(currentMonthRuns);
      const previous = sumRunNetPay(previousMonthRuns);
      const { trend, trendValue } = computeTrendPercent(current, previous);
      return staticKpi(formatMoney(current), trend, trendValue);
    })();

    const taxLiability: TenantKpiDisplay = (() => {
      if (!scopeReady || !canReadPayrollRuns) {
        return staticKpi(PLACEHOLDER);
      }
      if (isCurrentRunsLoading || isPreviousRunsLoading || isTaxLoading) {
        return loadingKpi();
      }
      if (!taxData) {
        return staticKpi(PLACEHOLDER);
      }
      const { trend, trendValue } = computeTrendPercent(taxData.currentTax, taxData.previousTax);
      return staticKpi(formatMoney(taxData.currentTax), trend, trendValue);
    })();

    return {
      total_employees: totalEmployees,
      total_payout: totalPayout,
      tax_liability: taxLiability,
    };
  }, [
    canReadEmployees,
    canReadPayrollRuns,
    currentMonth,
    currentRunsPage?.data,
    currency,
    employeesData,
    isCurrentRunsLoading,
    isEmployeesLoading,
    isPreviousRunsLoading,
    isTaxLoading,
    needsPreviousYear,
    previousMonth,
    previousRunsPage?.data,
    scopeReady,
    taxData,
  ]);

  const isInitialLoading =
    !scopeReady ||
    (canReadEmployees && isEmployeesLoading) ||
    (canReadPayrollRuns &&
      (isCurrentRunsLoading || isPreviousRunsLoading || isTaxLoading));

  return { kpiMap, isInitialLoading };
}
