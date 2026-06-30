'use client';

import { useTranslation } from 'react-i18next';
import { StatCard } from '@/components/dashboard/main/stat-card';
import { TenantPayrollTrendsChart } from '@/components/dashboard/main/tenant-payroll-trends-chart';
import { CompanyPerformanceMatrix } from '@/components/dashboard/main/company-performance-matrix';
import { buildTenantSuperAdminDashboardStats } from '@/features/tenant-super-admin-dashboard/tenant-super-admin-dashboard.data';
import { useTenantDashboardKpis } from '@/features/tenant-super-admin-dashboard/hooks/useTenantDashboardKpis';
import { useProfile } from '@/features/auth/hooks/useAuth';
import { TenantSuperAdminHomeSkeleton } from '@/components/dashboard/layout/dashboard-skeleton';
import { SummaryStatCardSkeleton } from '@/components/common/SummaryStatSkeleton';

export function TenantSuperAdminDashboardView() {
  const { t } = useTranslation('dashboard');
  const { data: profile } = useProfile();
  const firstName = profile?.firstName ?? profile?.fullName?.split(' ')[0] ?? '';
  const { kpiMap, isInitialLoading } = useTenantDashboardKpis();
  const stats = buildTenantSuperAdminDashboardStats(t, kpiMap);

  if (isInitialLoading) {
    return <TenantSuperAdminHomeSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t('header.welcome', { name: firstName, defaultValue: `Welcome back, ${firstName}` })}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t(
            'tenantSuperAdmin.subtitle',
            "Here's what's happening with your organization today.",
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const live = kpiMap[stat.slug];
          if (live?.isLoading) {
            return <SummaryStatCardSkeleton key={stat.slug} />;
          }
          return (
            <StatCard
              key={stat.slug}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              iconContainerClassName={stat.containerClass}
              iconClassName={stat.iconClass}
              trend={stat.trend}
              trendValue={stat.trendValue}
            />
          );
        })}
      </div>

      <TenantPayrollTrendsChart />
      <CompanyPerformanceMatrix />
    </div>
  );
}
