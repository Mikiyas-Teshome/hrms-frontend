import { ALL_COMPANIES_VALUE } from '../tenant-super-admin-dashboard.constants';

export type TenantOrgScopeMode = 'all' | 'single';

export interface TenantOrgCompanyTarget {
  companyOuId: string;
  name: string;
  regionLabel: string;
}

export interface TenantOrgScope {
  mode: TenantOrgScopeMode;
  scopeKey: string;
  companyOuIds: string[];
  targets: TenantOrgCompanyTarget[];
}

interface CompanyOptionInput {
  id: string;
  name: string;
  companyProfile?: {
    address?: string | null;
    currency?: string | null;
  } | null;
}

export function resolveOrgScope(
  selectedCompanyId: string,
  companies: CompanyOptionInput[],
  tenantAddressFallback?: string | null,
): TenantOrgScope | null {
  if (!companies.length) {
    return null;
  }

  const fallbackLabel = tenantAddressFallback?.trim() || '—';

  const toTarget = (unit: CompanyOptionInput): TenantOrgCompanyTarget => ({
    companyOuId: unit.id,
    name: unit.name,
    regionLabel: unit.companyProfile?.address?.trim() || fallbackLabel,
  });

  if (selectedCompanyId === ALL_COMPANIES_VALUE) {
    const targets = companies.map(toTarget);
    return {
      mode: 'all',
      scopeKey: ALL_COMPANIES_VALUE,
      companyOuIds: targets.map((t) => t.companyOuId),
      targets,
    };
  }

  const match = companies.find((c) => c.id === selectedCompanyId);
  if (!match) {
    return null;
  }

  const target = toTarget(match);
  return {
    mode: 'single',
    scopeKey: selectedCompanyId,
    companyOuIds: [target.companyOuId],
    targets: [target],
  };
}
