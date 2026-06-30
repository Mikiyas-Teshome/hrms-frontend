import type { TFunction } from 'i18next';
import { TENANT_KPI_CONFIGS } from './tenant-super-admin-dashboard.constants';
import type { TenantKpiMap, TenantSuperAdminKpiSlug } from './tenant-super-admin-dashboard.types';

export function buildTenantSuperAdminDashboardStats(t: TFunction, kpiMap: TenantKpiMap) {
  const titleBySlug: Record<TenantSuperAdminKpiSlug, string> = {
    total_employees: t('tenantSuperAdmin.stats.totalEmployees', 'Total employees'),
    total_payout: t('tenantSuperAdmin.stats.totalPayout', 'Total payout this month'),
    tax_liability: t('tenantSuperAdmin.stats.taxLiability', 'Tax liability'),
  };

  return TENANT_KPI_CONFIGS.map((kpi, index) => {
    const live = kpiMap[kpi.slug];
    return {
      id: index,
      slug: kpi.slug,
      title: titleBySlug[kpi.slug],
      value: live.value,
      icon: kpi.icon,
      containerClass: kpi.containerClass,
      iconClass: kpi.iconClass,
      trend: live.trend,
      trendValue: live.trendValue,
    };
  });
}