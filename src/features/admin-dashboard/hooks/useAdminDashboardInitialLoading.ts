'use client';

import { useProfile } from '@/features/auth/hooks/useAuth';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { useLeaveCompanyOuId } from '@/features/leave/hooks/useLeaveCompanyOuId';
import { useAdminAttendanceRateChart } from './useAdminAttendanceRateChart';
import { useAdminDashboardKpis } from './useAdminDashboardKpis';
import { useAdminEmployeeRequests } from './useAdminEmployeeRequests';
import { useAdminEmployeesInsightsChart } from './useAdminEmployeesInsightsChart';

export function useAdminDashboardInitialLoading(enabled = true) {
  const { data: profile } = useProfile();
  const { hasPermission } = usePermissions();
  const { companyOuId, isLoadingCompanies } = useLeaveCompanyOuId();
  const companyId = profile?.companyId ?? '';

  const scopeReady = enabled && !!companyOuId && !!companyId;
  const scopePending = enabled && !!companyId && !companyOuId && isLoadingCompanies;

  const adminKpis = useAdminDashboardKpis(enabled);
  const isKpisLoading = scopeReady && Object.values(adminKpis).some((kpi) => kpi.isLoading);

  const canLoadRequests =
    hasPermission('leave_requests:read') || hasPermission('attendance:read');
  const { isLoading: isRequestsLoading } = useAdminEmployeeRequests(
    companyOuId,
    'all',
    scopeReady && canLoadRequests,
  );

  const { isLoading: isAttendanceChartLoading } = useAdminAttendanceRateChart(
    companyOuId,
    scopeReady,
  );
  const { isLoading: isInsightsChartLoading } = useAdminEmployeesInsightsChart(
    companyOuId,
    scopeReady,
  );

  return (
    scopePending ||
    isKpisLoading ||
    (scopeReady && canLoadRequests && isRequestsLoading) ||
    (scopeReady && isAttendanceChartLoading) ||
    (scopeReady && isInsightsChartLoading)
  );
}
