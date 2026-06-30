'use client';

import { FileClock, Timer, CalendarClock, Banknote } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DashboardStatCard } from './dashboard-stat-card';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { usePersonalDashboardStats } from './use-personal-dashboard-stats';

export function PersonalStatsRow() {
  const { t } = useTranslation('dashboard');
  const { hasPermission } = usePermissions();
  const canViewLeaveStats =
    hasPermission('leave_requests:read') || hasPermission('leave_requests:create');
  const {
    pendingLeaveCount,
    isLeaveLoading,
    showTotalTime,
    totalTimeValue,
    isAttendanceLoading,
    showAttendanceRate,
    attendanceRateValue,
    showNetSalary,
    netSalaryValue,
    isPayslipLoading,
  } = usePersonalDashboardStats();

  const stats = [
    {
      key: 'pending-leave',
      show: canViewLeaveStats,
      icon: FileClock,
      iconColor: '#D97706',
      iconBg: 'rgba(217,119,6,0.05)',
      label: t('employeeDashboard.pendingLeaveRequests', 'Pending Leave Requests'),
      value: String(pendingLeaveCount),
      isLoading: isLeaveLoading,
    },
    {
      key: 'total-time',
      show: showTotalTime,
      icon: Timer,
      iconColor: '#04A4C4',
      iconBg: 'rgba(4,164,196,0.05)',
      label: t('employeeDashboard.totalTime', 'Total Time'),
      value: totalTimeValue,
      isLoading: isAttendanceLoading,
    },
    {
      key: 'attendance-rate',
      show: showAttendanceRate,
      icon: CalendarClock,
      iconColor: '#22C55E',
      iconBg: 'rgba(34,197,94,0.05)',
      label: t('employeeDashboard.attendanceRate', 'Attendance Rate'),
      value: attendanceRateValue,
      isLoading: isAttendanceLoading,
    },
    {
      key: 'net-salary',
      show: showNetSalary,
      icon: Banknote,
      iconColor: '#8A38F5',
      iconBg: 'rgba(138,56,245,0.05)',
      label: t('employeeDashboard.netSalary', 'Net Salary'),
      value: netSalaryValue,
      isLoading: isPayslipLoading,
    },
  ].filter((stat) => stat.show);

  if (stats.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 w-full">
      {stats.map((stat) => (
        <DashboardStatCard
          key={stat.key}
          icon={stat.icon}
          iconColor={stat.iconColor}
          iconBg={stat.iconBg}
          label={stat.label}
          value={stat.value}
          isLoading={stat.isLoading}
        />
      ))}
    </div>
  );
}
