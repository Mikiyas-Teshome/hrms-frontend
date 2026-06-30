'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useMyEmployeeProfile } from '@/features/employee/hooks/useEmployee';
import { useOperationalDashboardStats } from './use-operational-dashboard-stats';

export function usePersonalHomeInitialLoading({
  showOperationalCards,
  showPersonalStats,
}: {
  showOperationalCards: boolean;
  showPersonalStats: boolean;
}) {
  const { isInitializing } = useAuth();
  const {
    companyOuId,
    canReadLeaveRequests,
    canReadEmployees,
    isLeaveStatsLoading,
    isEmployeesLoading,
    isAttendanceStatsLoading,
    showAttendanceStats,
  } = useOperationalDashboardStats();

  const { isLoading: isEmployeeProfileLoading } = useMyEmployeeProfile({
    enabled: showPersonalStats,
  });

  if (isInitializing) {
    return true;
  }

  const isOperationalLoading =
    showOperationalCards &&
    ((canReadLeaveRequests && !!companyOuId && isLeaveStatsLoading) ||
      (canReadEmployees && isEmployeesLoading) ||
      (showAttendanceStats && isAttendanceStatsLoading));

  const isPersonalStatsLoading = showPersonalStats && isEmployeeProfileLoading;

  return isOperationalLoading || isPersonalStatsLoading;
}
