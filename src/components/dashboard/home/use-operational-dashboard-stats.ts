'use client';

import { useMemo } from 'react';
import { startOfMonth, endOfMonth } from 'date-fns';
import { useLeaveRequestStats } from '@/features/leave-request/hooks/useLeaveRequest';
import { useLeaveCompanyOuId } from '@/features/leave/hooks/useLeaveCompanyOuId';
import { useEmployees } from '@/features/employee/hooks/useEmployee';
import { useAttendanceOverviewStats } from '@/features/attendance/hooks/useAttendance';
import { usePermissions } from '@/features/auth/hooks/usePermissions';

export function useOperationalDashboardStats() {
  const { hasPermission } = usePermissions();
  const canReadLeaveRequests = hasPermission('leave_requests:read');
  const canReadEmployees = hasPermission('employees:read');
  const canReadAttendance = hasPermission('attendance:read');

  const { companyOuId } = useLeaveCompanyOuId();

  const { data: leaveStats, isLoading: isLeaveStatsLoading } = useLeaveRequestStats(
    canReadLeaveRequests ? companyOuId : undefined,
  );

  const { data: employees = [], isLoading: isEmployeesLoading } = useEmployees(
    {},
    { enabled: canReadEmployees },
  );
  const employeeCount = canReadEmployees ? employees.length : null;

  const monthStart = startOfMonth(new Date()).toISOString();
  const monthEnd = endOfMonth(new Date()).toISOString();

  const { data: attendanceStats, isLoading: isAttendanceStatsLoading } = useAttendanceOverviewStats(
    monthStart,
    monthEnd,
    false,
    canReadAttendance,
  );

  const showAttendanceStats = canReadAttendance;

  return useMemo(
    () => ({
      companyOuId,
      canReadLeaveRequests,
      canReadEmployees,
      pendingApprovals: leaveStats?.pending ?? 0,
      isLeaveStatsLoading,
      employeeCount,
      isEmployeesLoading,
      onLeaveCount: showAttendanceStats ? (attendanceStats?.onLeave ?? 0) : null,
      isAttendanceStatsLoading: showAttendanceStats && isAttendanceStatsLoading,
      showAttendanceStats,
    }),
    [
      companyOuId,
      canReadLeaveRequests,
      canReadEmployees,
      leaveStats?.pending,
      isLeaveStatsLoading,
      employeeCount,
      isEmployeesLoading,
      showAttendanceStats,
      attendanceStats?.onLeave,
      isAttendanceStatsLoading,
    ],
  );
}
