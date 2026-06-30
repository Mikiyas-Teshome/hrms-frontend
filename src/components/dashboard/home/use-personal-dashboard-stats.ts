'use client';

import { useMemo } from 'react';
import { startOfMonth, endOfMonth } from 'date-fns';
import { useMyEmployeeProfile } from '@/features/employee/hooks/useEmployee';
import { useLeaveRequestsByEmployee } from '@/features/leave-request/hooks/useLeaveRequest';
import { usePaginatedAttendanceRecords } from '@/features/attendance/hooks/useAttendance';
import { usePayslipsPaginated } from '@/features/payroll/hooks/usePayroll';
import { useDisplayCurrency } from '@/features/settings/hooks/useDisplayCurrency';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { useProfile } from '@/features/auth/hooks/useAuth';
import { AttendanceStatus } from '@/features/attendance/attendance.types';

function formatHours(totalMinutes: number): string {
  const hours = totalMinutes / 60;
  if (hours < 1) {
    return `${Math.round(totalMinutes)}m`;
  }
  return `${hours.toFixed(1)}h`;
}

const ATTENDED_STATUSES = new Set<AttendanceStatus>([
  AttendanceStatus.PRESENT,
  AttendanceStatus.LATE,
  AttendanceStatus.HALF_DAY,
  AttendanceStatus.ACTIVE,
]);

export function usePersonalDashboardStats() {
  const { hasPermission } = usePermissions();
  const canReadAttendance = hasPermission('attendance:read');
  const canReadPayslips = hasPermission('payslips:read');
  const { data: profile } = useProfile();
  const companyId = profile?.companyId;

  const { data: employeeProfile } = useMyEmployeeProfile();
  const employeeId = employeeProfile?.id ?? '';
  const employeeUserId = employeeProfile?.userId ?? '';

  const { data: leaveRequests = [], isLoading: isLeaveLoading } = useLeaveRequestsByEmployee(employeeId);

  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());

  const attendanceFilter = useMemo(
    () => ({
      startDate: monthStart.toISOString(),
      endDate: monthEnd.toISOString(),
    }),
    [monthStart, monthEnd],
  );

  const { data: attendancePage, isLoading: isAttendanceLoading } = usePaginatedAttendanceRecords(
    1,
    100,
    attendanceFilter,
    canReadAttendance && !!employeeUserId,
  );

  const { data: payslipsPage, isLoading: isPayslipLoading } = usePayslipsPaginated(
    companyId,
    { employeeId },
    undefined,
    canReadPayslips && !!employeeId,
  );
  const payslips = useMemo(() => payslipsPage?.data ?? [], [payslipsPage?.data]);
  const { formatAmount } = useDisplayCurrency(employeeProfile?.orgUnit?.orgUnitId);

  const ownRecords = useMemo(() => {
    if (!canReadAttendance) {
      return [];
    }
    const records = attendancePage?.data ?? [];
    if (!employeeUserId) {
      return records;
    }
    return records.filter((record) => record.userId === employeeUserId);
  }, [attendancePage?.data, employeeUserId, canReadAttendance]);

  const pendingLeaveCount = leaveRequests.filter(
    (request) => request.status === 'pending' || request.displayStatus === 'Pending',
  ).length;

  const totalMinutes = ownRecords.reduce((sum, record) => sum + (record.totalMinutes ?? 0), 0);

  const attendanceRate = useMemo(() => {
    if (ownRecords.length === 0) {
      return null;
    }
    const attended = ownRecords.filter((record) => ATTENDED_STATUSES.has(record.status)).length;
    return Math.round((attended / ownRecords.length) * 100);
  }, [ownRecords]);

  const latestPayslip = useMemo(() => {
    if (payslips.length === 0) {
      return null;
    }
    return [...payslips].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0];
  }, [payslips]);

  const overtimeSummary = useMemo(() => {
    const withOvertime = ownRecords.filter((record) => (record.overtimeMinutes ?? 0) > 0);
    let approvedMinutes = 0;
    let pendingMinutes = 0;

    for (const record of withOvertime) {
      const minutes = record.overtimeMinutes ?? 0;
      const status = (record.overtimeStatus ?? 'PENDING').toUpperCase();
      if (status === 'APPROVED') {
        approvedMinutes += minutes;
      } else if (status === 'PENDING' || status === 'SUBMITTED') {
        pendingMinutes += minutes;
      }
    }

    return {
      approvedHours: formatHours(approvedMinutes),
      pendingHours: formatHours(pendingMinutes),
      totalHours: formatHours(approvedMinutes + pendingMinutes),
      hasData: withOvertime.length > 0,
    };
  }, [ownRecords]);

  return {
    pendingLeaveCount,
    isLeaveLoading,
    showTotalTime: canReadAttendance && !!employeeUserId,
    totalTimeValue: formatHours(totalMinutes),
    isAttendanceLoading: canReadAttendance && isAttendanceLoading,
    showAttendanceRate: canReadAttendance && !!employeeUserId,
    attendanceRateValue: attendanceRate !== null ? `${attendanceRate}%` : '—',
    showNetSalary: canReadPayslips && !!employeeId,
    netSalaryValue: latestPayslip ? formatAmount(latestPayslip.netPay) : '—',
    isPayslipLoading: canReadPayslips && isPayslipLoading,
    overtimeSummary,
    showOvertime: canReadAttendance && !!employeeUserId,
    canViewOvertimePage: hasPermission('overtime:read') || canReadAttendance,
  };
}
