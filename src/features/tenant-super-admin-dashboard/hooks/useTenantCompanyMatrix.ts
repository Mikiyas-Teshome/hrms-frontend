'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPaginatedEmployees } from '@/features/employee/employee.actions';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { useCompanyOptions } from '@/features/organization/hooks/useOrganization';
import type { CompanyPerformanceRow } from '../tenant-super-admin-dashboard.types';
import { resolveOrgScope } from '../scope/resolve-org-scope';
import { ALL_COMPANIES_VALUE } from '../tenant-super-admin-dashboard.constants';
import { useTenantSuperAdminDashboardFilters } from '@/components/dashboard/layout/tenant-super-admin-dashboard-provider';
import { useTenantPayrollSnapshot } from './useTenantPayrollSnapshot';
import { useTenantAddressFallback } from './useTenantAddressFallback';

const STALE_TIME_MS = 60_000;

export function useTenantCompanyMatrix(enabled = true) {
  const { hasPermission } = usePermissions();
  const canReadEmployees = hasPermission('employees:read');
  const { selectedCompanyId } = useTenantSuperAdminDashboardFilters();
  const { companies, isLoading: isLoadingCompanies } = useCompanyOptions();
  const tenantAddressFallback = useTenantAddressFallback();
  const { snapshot, isLoading: isPayrollLoading, scopeReady: payrollScopeReady } =
    useTenantPayrollSnapshot(enabled);

  const listScope = useMemo(
    () => resolveOrgScope(ALL_COMPANIES_VALUE, companies, tenantAddressFallback),
    [companies, tenantAddressFallback],
  );

  const { data: headcounts, isLoading: isHeadcountLoading } = useQuery({
    queryKey: ['tenant-dashboard', 'matrix-headcounts', listScope?.scopeKey],
    queryFn: async () => {
      if (!listScope) {
        return new Map<string, number>();
      }
      const entries = await Promise.all(
        listScope.targets.map(async (target) => {
          const page = await fetchPaginatedEmployees(
            { page: 1, size: 1 },
            { companyOuId: target.companyOuId },
          );
          return [target.companyOuId, page.metaData.total ?? 0] as const;
        }),
      );
      return new Map(entries);
    },
    enabled: enabled && !!listScope && canReadEmployees,
    staleTime: STALE_TIME_MS,
  });

  const rows = useMemo((): CompanyPerformanceRow[] => {
    if (!listScope) {
      return [];
    }

    const payrollStatus = snapshot?.payrollStatus ?? 'pending';
    const netSpend = snapshot?.netSpendFormatted ?? '—';

    return listScope.targets
      .filter((target) => {
        if (selectedCompanyId === ALL_COMPANIES_VALUE) {
          return true;
        }
        return target.companyOuId === selectedCompanyId;
      })
      .map((target) => ({
        id: target.companyOuId,
        companyUnit: target.name,
        region: target.regionLabel,
        payrollStatus,
        headcount: headcounts?.get(target.companyOuId) ?? 0,
        netSpend,
      }));
  }, [headcounts, listScope, selectedCompanyId, snapshot]);

  const isLoading =
    isLoadingCompanies || isHeadcountLoading || isPayrollLoading || !payrollScopeReady;

  return {
    rows,
    isLoading: enabled && isLoading,
    scopeReady: !!listScope && payrollScopeReady,
  };
}
