'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfDay, endOfDay } from 'date-fns';
import { useProfile } from '@/features/auth/hooks/useAuth';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { useLeaveCompanyOuId } from '@/features/leave/hooks/useLeaveCompanyOuId';
import { usePaginatedEmployees } from '@/features/employee/hooks/useEmployee';
import { useLeaveRequestStats } from '@/features/leave-request/hooks/useLeaveRequest';
import { useAttendanceOverviewStats } from '@/features/attendance/hooks/useAttendance';
import { useUpcomingPayrollDate, usePayrollRunsPaginated, usePayslipsPaginated } from '@/features/payroll/hooks/usePayroll';
import { useLeaveBalanceStats } from '@/features/leave-balance/hooks/useLeaveBalance';
import { useLeavePolicyStats } from '@/features/leave-policy/hooks/useLeavePolicy';
import { fetchComplianceDashboardStats } from '@/features/documents/documents.actions';
import { complianceQueryKeys } from '@/features/documents/hooks/useComplianceTracking';
import { PayrollRunListSortOrder, PayrollRunSortBy, PayrollRunStatusFilter } from '@/features/payroll/payroll.types';
import { DEFAULT_ADMIN_KPI_SLUGS } from '../admin-kpi-catalog.constants';
import {
  needsComplianceQuery,
  needsEmployeeCountQuery,
  needsEmployeeListQuery,
  needsLeaveBalanceQuery,
  needsLeavePolicyQuery,
  needsLeaveStatsQuery,
  needsOvertimeAttendanceQuery,
  needsPayrollRunsQuery,
  needsPayslipsQuery,
  needsTodayAttendanceQuery,
  needsUpcomingPayrollQuery,
} from '../admin-kpi-query.util';
import { calculateAttritionRate, countNewHiresThisMonth } from '../admin-kpi-workforce.util';
import { fetchAllPaginatedEmployees } from '../fetch-all-paginated-employees';
import type { AdminKpiDisplay, AdminKpiMap, AdminKpiSlug } from '../admin-dashboard.types';

const PLACEHOLDER = '—';
const LOADING = '…';

function loadingKpi(): AdminKpiDisplay {
  return { value: LOADING, isLoading: true };
}

function staticKpi(value: string, subText?: string): AdminKpiDisplay {
  return { value, subText, isLoading: false };
}

function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

function formatHours(value: number): string {
  if (value < 1) {
    return `${Math.round(value * 60)}m`;
  }
  return `${value.toFixed(1)}h`;
}

export function useAdminDashboardKpis(
  enabled = true,
  activeSlugs: AdminKpiSlug[] = DEFAULT_ADMIN_KPI_SLUGS,
  companyOuIdOverride?: string,
) {
  const { data: profile } = useProfile();
  const { hasPermission } = usePermissions();
  const { companyOuId: derivedCompanyOuId } = useLeaveCompanyOuId();
  const companyOuId = companyOuIdOverride ?? derivedCompanyOuId;

  const companyId = profile?.companyId ?? '';
  const canReadEmployees = hasPermission('employees:read');
  const canReadLeaveRequests = hasPermission('leave_requests:read');
  const canReadAttendance = hasPermission('attendance:read');
  const canReadPayrollRuns = hasPermission('payroll_runs:read');
  const canReadPayslips = hasPermission('payslips:read');
  const canReadLeaveBalances = hasPermission('leave_balances:read');
  const canReadLeavePolicies = hasPermission('leave_policies:read');
  const canReadCompliance = hasPermission('compliance:read');

  const scopeReady = enabled && !!companyOuId && !!companyId;
  const slugs = activeSlugs;
  const complianceQueryEnabled = scopeReady && canReadCompliance && needsComplianceQuery(slugs);

  const { data: employeesPage, isLoading: isEmployeesLoading } = usePaginatedEmployees(
    { page: 1, size: 1 },
    { companyOuId },
    { enabled: scopeReady && canReadEmployees && needsEmployeeCountQuery(slugs) },
  );

  const { data: employeeList = [], isLoading: isEmployeeListLoading } = useQuery({
    queryKey: ['admin-dashboard', 'employee-list', companyOuId],
    queryFn: () => fetchAllPaginatedEmployees({ companyOuId }),
    enabled: scopeReady && canReadEmployees && needsEmployeeListQuery(slugs),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const { data: leaveStats, isLoading: isLeaveStatsLoading } = useLeaveRequestStats(
    scopeReady && canReadLeaveRequests && needsLeaveStatsQuery(slugs) ? companyOuId : undefined,
  );

  const todayStart = startOfDay(new Date()).toISOString();
  const todayEnd = endOfDay(new Date()).toISOString();

  const { data: todayAttendance, isLoading: isTodayAttendanceLoading } = useAttendanceOverviewStats(
    todayStart,
    todayEnd,
    false,
    scopeReady && canReadAttendance && needsTodayAttendanceQuery(slugs),
  );

  const { data: overtimeAttendance, isLoading: isOvertimeAttendanceLoading } =
    useAttendanceOverviewStats(
      todayStart,
      todayEnd,
      true,
      scopeReady && canReadAttendance && needsOvertimeAttendanceQuery(slugs),
    );

  const { data: upcomingPayroll, isLoading: isPayrollLoading } = useUpcomingPayrollDate(
    scopeReady && canReadPayrollRuns && needsUpcomingPayrollQuery(slugs) ? companyId : undefined,
  );

  const { data: payrollRunsPage, isLoading: isPayrollRunsLoading } = usePayrollRunsPaginated(
    scopeReady && canReadPayrollRuns && needsPayrollRunsQuery(slugs) ? companyId : undefined,
    {
      sortBy: PayrollRunSortBy.START_DATE,
      sortOrder: PayrollRunListSortOrder.DESC,
    },
    { page: 1, size: 100 },
  );

  const payslipsQueryEnabled = scopeReady && canReadPayslips && needsPayslipsQuery(slugs);
  const { data: payslipsPage, isLoading: isPayslipsLoading } = usePayslipsPaginated(
    payslipsQueryEnabled ? companyId : undefined,
    undefined,
    { page: 1, size: 1 },
    payslipsQueryEnabled,
  );

  const { data: leaveBalanceStats, isLoading: isLeaveBalanceLoading } = useLeaveBalanceStats(
    scopeReady && canReadLeaveBalances && needsLeaveBalanceQuery(slugs) ? companyOuId : undefined,
  );

  const { data: leavePolicyStats, isLoading: isLeavePolicyLoading } = useLeavePolicyStats(
    scopeReady && canReadLeavePolicies && needsLeavePolicyQuery(slugs) ? companyOuId : undefined,
  );

  const { data: complianceStats, isLoading: isComplianceLoading } = useQuery({
    queryKey: complianceQueryKeys.stats,
    queryFn: () => fetchComplianceDashboardStats(),
    enabled: complianceQueryEnabled,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  return useMemo((): AdminKpiMap => {
    const totalEmployees: AdminKpiDisplay = (() => {
      if (!scopeReady || !canReadEmployees) {
        return staticKpi(PLACEHOLDER);
      }
      if (isEmployeesLoading) {
        return loadingKpi();
      }
      return staticKpi(String(employeesPage?.metaData.total ?? 0));
    })();

    const newHires: AdminKpiDisplay = (() => {
      if (!scopeReady || !canReadEmployees) {
        return staticKpi(PLACEHOLDER);
      }
      if (isEmployeeListLoading) {
        return loadingKpi();
      }
      return staticKpi(String(countNewHiresThisMonth(employeeList)));
    })();

    const attritionRate: AdminKpiDisplay = (() => {
      if (!scopeReady || !canReadEmployees) {
        return staticKpi(PLACEHOLDER);
      }
      if (isEmployeeListLoading) {
        return loadingKpi();
      }
      return staticKpi(formatPercent(calculateAttritionRate(employeeList)));
    })();

    const pendingApprove: AdminKpiDisplay = (() => {
      if (!scopeReady) {
        return staticKpi(PLACEHOLDER);
      }
      const canLeave = canReadLeaveRequests;
      const canOvertime = canReadAttendance;
      if (!canLeave && !canOvertime) {
        return staticKpi(PLACEHOLDER);
      }
      if (
        (canLeave && isLeaveStatsLoading) ||
        (canOvertime && (isTodayAttendanceLoading || isOvertimeAttendanceLoading))
      ) {
        return loadingKpi();
      }
      const leavePending = canLeave ? (leaveStats?.pending ?? 0) : 0;
      const overtimePending = canOvertime ? (overtimeAttendance?.pendingOvertime ?? 0) : 0;
      return staticKpi(String(leavePending + overtimePending));
    })();

    const pendingLeaveRequests: AdminKpiDisplay = (() => {
      if (!scopeReady || !canReadLeaveRequests) {
        return staticKpi(PLACEHOLDER);
      }
      if (isLeaveStatsLoading) {
        return loadingKpi();
      }
      return staticKpi(String(leaveStats?.pending ?? 0));
    })();

    const approvedLeaveRequests: AdminKpiDisplay = (() => {
      if (!scopeReady || !canReadLeaveRequests) {
        return staticKpi(PLACEHOLDER);
      }
      if (isLeaveStatsLoading) {
        return loadingKpi();
      }
      return staticKpi(String(leaveStats?.approved ?? 0));
    })();

    const rejectedLeaveRequests: AdminKpiDisplay = (() => {
      if (!scopeReady || !canReadLeaveRequests) {
        return staticKpi(PLACEHOLDER);
      }
      if (isLeaveStatsLoading) {
        return loadingKpi();
      }
      return staticKpi(String(leaveStats?.rejected ?? 0));
    })();

    const totalLeaveRequests: AdminKpiDisplay = (() => {
      if (!scopeReady || !canReadLeaveRequests) {
        return staticKpi(PLACEHOLDER);
      }
      if (isLeaveStatsLoading) {
        return loadingKpi();
      }
      return staticKpi(String(leaveStats?.total ?? 0));
    })();

    const upcomingPayrollKpi: AdminKpiDisplay = (() => {
      if (!scopeReady || !canReadPayrollRuns) {
        return staticKpi(PLACEHOLDER);
      }
      if (isPayrollLoading) {
        return loadingKpi();
      }
      if (!upcomingPayroll) {
        return staticKpi(PLACEHOLDER);
      }
      const dateLabel = format(new Date(upcomingPayroll.date), 'MMM d, yyyy');
      return staticKpi(String(upcomingPayroll.daysRemaining), dateLabel);
    })();

    const activeEmployees: AdminKpiDisplay = (() => {
      if (!scopeReady || !canReadAttendance) {
        return staticKpi(PLACEHOLDER);
      }
      if (isTodayAttendanceLoading) {
        return loadingKpi();
      }
      return staticKpi(String(todayAttendance?.activeEmployees ?? 0));
    })();

    const onLeaveToday: AdminKpiDisplay = (() => {
      if (!scopeReady || !canReadAttendance) {
        return staticKpi(PLACEHOLDER);
      }
      if (isTodayAttendanceLoading) {
        return loadingKpi();
      }
      return staticKpi(String(todayAttendance?.onLeave ?? 0));
    })();

    const attendanceRate: AdminKpiDisplay = (() => {
      if (!scopeReady || !canReadAttendance) {
        return staticKpi(PLACEHOLDER);
      }
      if (isTodayAttendanceLoading) {
        return loadingKpi();
      }
      const total = todayAttendance?.totalEmployees ?? 0;
      const active = todayAttendance?.activeEmployees ?? 0;
      if (total === 0) {
        return staticKpi(PLACEHOLDER);
      }
      return staticKpi(formatPercent((active / total) * 100));
    })();

    const pendingOvertime: AdminKpiDisplay = (() => {
      if (!scopeReady || !canReadAttendance) {
        return staticKpi(PLACEHOLDER);
      }
      if (isOvertimeAttendanceLoading) {
        return loadingKpi();
      }
      return staticKpi(String(overtimeAttendance?.pendingOvertime ?? 0));
    })();

    const approvedOvertime: AdminKpiDisplay = (() => {
      if (!scopeReady || !canReadAttendance) {
        return staticKpi(PLACEHOLDER);
      }
      if (isOvertimeAttendanceLoading) {
        return loadingKpi();
      }
      return staticKpi(String(overtimeAttendance?.approvedOvertime ?? 0));
    })();

    const totalOvertimeHours: AdminKpiDisplay = (() => {
      if (!scopeReady || !canReadAttendance) {
        return staticKpi(PLACEHOLDER);
      }
      if (isOvertimeAttendanceLoading) {
        return loadingKpi();
      }
      return staticKpi(formatHours(overtimeAttendance?.totalOvertimeHours ?? 0));
    })();

    const overtimeEmployees: AdminKpiDisplay = (() => {
      if (!scopeReady || !canReadAttendance) {
        return staticKpi(PLACEHOLDER);
      }
      if (isOvertimeAttendanceLoading) {
        return loadingKpi();
      }
      return staticKpi(String(overtimeAttendance?.overtimeEmployees ?? 0));
    })();

    const leaveDaysRemaining: AdminKpiDisplay = (() => {
      if (!scopeReady || !canReadLeaveBalances) {
        return staticKpi(PLACEHOLDER);
      }
      if (isLeaveBalanceLoading) {
        return loadingKpi();
      }
      return staticKpi(String(leaveBalanceStats?.totalRemainingDays ?? 0));
    })();

    const activeLeavePolicies: AdminKpiDisplay = (() => {
      if (!scopeReady || !canReadLeavePolicies) {
        return staticKpi(PLACEHOLDER);
      }
      if (isLeavePolicyLoading) {
        return loadingKpi();
      }
      return staticKpi(String(leavePolicyStats?.active ?? 0));
    })();

    const payrollRuns = payrollRunsPage?.data ?? [];
    const countRunsByStatus = (status: PayrollRunStatusFilter) =>
      payrollRuns.filter((run) => run.status.toLowerCase() === status).length;

    const draftPayrollRuns: AdminKpiDisplay = (() => {
      if (!scopeReady || !canReadPayrollRuns) {
        return staticKpi(PLACEHOLDER);
      }
      if (isPayrollRunsLoading) {
        return loadingKpi();
      }
      return staticKpi(String(countRunsByStatus(PayrollRunStatusFilter.DRAFT)));
    })();

    const pendingPayrollRuns: AdminKpiDisplay = (() => {
      if (!scopeReady || !canReadPayrollRuns) {
        return staticKpi(PLACEHOLDER);
      }
      if (isPayrollRunsLoading) {
        return loadingKpi();
      }
      return staticKpi(String(countRunsByStatus(PayrollRunStatusFilter.FINALIZED)));
    })();

    const paidPayrollRuns: AdminKpiDisplay = (() => {
      if (!scopeReady || !canReadPayrollRuns) {
        return staticKpi(PLACEHOLDER);
      }
      if (isPayrollRunsLoading) {
        return loadingKpi();
      }
      return staticKpi(String(countRunsByStatus(PayrollRunStatusFilter.PAID)));
    })();

    const totalPayslips: AdminKpiDisplay = (() => {
      if (!scopeReady || !canReadPayslips) {
        return staticKpi(PLACEHOLDER);
      }
      if (isPayslipsLoading) {
        return loadingKpi();
      }
      return staticKpi(String(payslipsPage?.metaData.total ?? 0));
    })();

    const compliancePercentage: AdminKpiDisplay = (() => {
      if (!complianceQueryEnabled) {
        return staticKpi(PLACEHOLDER);
      }
      if (isComplianceLoading) {
        return loadingKpi();
      }
      return staticKpi(formatPercent(complianceStats?.totalCompliancePercentage ?? 0));
    })();

    const fullyCompliantEmployees: AdminKpiDisplay = (() => {
      if (!complianceQueryEnabled) {
        return staticKpi(PLACEHOLDER);
      }
      if (isComplianceLoading) {
        return loadingKpi();
      }
      return staticKpi(String(complianceStats?.fullyCompliantEmployeesCount ?? 0));
    })();

    const nonCompliantEmployees: AdminKpiDisplay = (() => {
      if (!complianceQueryEnabled) {
        return staticKpi(PLACEHOLDER);
      }
      if (isComplianceLoading) {
        return loadingKpi();
      }
      return staticKpi(String(complianceStats?.nonCompliantEmployeesCount ?? 0));
    })();

    const expiringDocuments: AdminKpiDisplay = (() => {
      if (!complianceQueryEnabled) {
        return staticKpi(PLACEHOLDER);
      }
      if (isComplianceLoading) {
        return loadingKpi();
      }
      return staticKpi(String(complianceStats?.expiringSoonDocumentsCount ?? 0));
    })();

    return {
      total_employees: totalEmployees,
      active_employees: activeEmployees,
      new_hires: newHires,
      attrition_rate: attritionRate,
      pending_approve: pendingApprove,
      on_leave_today: onLeaveToday,
      attendance_rate: attendanceRate,
      pending_overtime: pendingOvertime,
      approved_overtime: approvedOvertime,
      total_overtime_hours: totalOvertimeHours,
      overtime_employees: overtimeEmployees,
      pending_leave_requests: pendingLeaveRequests,
      approved_leave_requests: approvedLeaveRequests,
      rejected_leave_requests: rejectedLeaveRequests,
      total_leave_requests: totalLeaveRequests,
      leave_days_remaining: leaveDaysRemaining,
      active_leave_policies: activeLeavePolicies,
      upcoming_payroll: upcomingPayrollKpi,
      draft_payroll_runs: draftPayrollRuns,
      pending_payroll_runs: pendingPayrollRuns,
      paid_payroll_runs: paidPayrollRuns,
      total_payslips: totalPayslips,
      compliance_percentage: compliancePercentage,
      fully_compliant_employees: fullyCompliantEmployees,
      non_compliant_employees: nonCompliantEmployees,
      expiring_documents: expiringDocuments,
    };
  }, [
    scopeReady,
    canReadEmployees,
    canReadLeaveRequests,
    canReadAttendance,
    canReadPayrollRuns,
    canReadPayslips,
    canReadLeaveBalances,
    canReadLeavePolicies,
    complianceQueryEnabled,
    isEmployeesLoading,
    employeesPage?.metaData,
    isEmployeeListLoading,
    employeeList,
    isLeaveStatsLoading,
    leaveStats,
    isTodayAttendanceLoading,
    todayAttendance,
    isOvertimeAttendanceLoading,
    overtimeAttendance,
    isPayrollLoading,
    upcomingPayroll,
    isPayrollRunsLoading,
    payrollRunsPage?.data,
    isPayslipsLoading,
    payslipsPage?.metaData,
    isLeaveBalanceLoading,
    leaveBalanceStats,
    isLeavePolicyLoading,
    leavePolicyStats,
    isComplianceLoading,
    complianceStats,
  ]);
}
