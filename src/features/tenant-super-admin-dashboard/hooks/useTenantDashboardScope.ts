'use client';

import { useMemo } from 'react';
import { useProfile } from '@/features/auth/hooks/useAuth';
import { useCompanyOptions } from '@/features/organization/hooks/useOrganization';
import { useTenantSuperAdminDashboardFilters } from '@/components/dashboard/layout/tenant-super-admin-dashboard-provider';
import { resolveOrgScope } from '../scope/resolve-org-scope';
import { resolvePayrollScope } from '../scope/resolve-payroll-scope';
import { useTenantAddressFallback } from './useTenantAddressFallback';

export function useTenantDashboardScope(enabled = true) {
  const { data: profile } = useProfile();
  const { selectedCompanyId } = useTenantSuperAdminDashboardFilters();
  const { companies, isLoading: isLoadingCompanies } = useCompanyOptions();
  const tenantAddressFallback = useTenantAddressFallback();

  const orgScope = useMemo(() => {
    if (!enabled || isLoadingCompanies) {
      return null;
    }
    return resolveOrgScope(selectedCompanyId, companies, tenantAddressFallback);
  }, [enabled, isLoadingCompanies, selectedCompanyId, companies, tenantAddressFallback]);

  const payrollScope = useMemo(() => {
    if (!enabled) {
      return null;
    }
    return resolvePayrollScope(profile?.companyId);
  }, [enabled, profile?.companyId]);

  const scopeReady = enabled && !isLoadingCompanies && !!orgScope && !!payrollScope;

  return {
    scopeReady,
    orgScope,
    payrollScope,
    orgScopeKey: orgScope?.scopeKey ?? '',
    payrollCompanyId: payrollScope?.payrollCompanyId ?? '',
  };
}
