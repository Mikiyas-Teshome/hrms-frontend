'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfDay, endOfDay } from 'date-fns';
import { fetchPaginatedEmployees } from '@/features/employee/employee.actions';
import { fetchLeaveRequestStats } from '@/features/leave-request/leave-request.actions';
import { getAttendanceOverviewStats } from '@/features/attendance/attendance.actions';
import { fetchUpcomingPayrollDate, fetchPayrollRunsPaginated, fetchPayslipsPaginated } from '@/features/payroll/payroll.actions';
import { fetchLeaveBalanceStats } from '@/features/leave-balance/leave-balance.actions';
import { fetchLeavePolicyStats } from '@/features/leave-policy/leave-policy.actions';
import { fetchComplianceDashboardStats } from '@/features/documents/documents.actions';
import { PayrollRunListSortOrder, PayrollRunSortBy, PayrollRunStatusFilter } from '@/features/payroll/payroll.types';
import { needsComplianceQuery, needsEmployeeCountQuery, needsLeaveBalanceQuery, needsLeavePolicyQuery, needsLeaveStatsQuery, needsOvertimeAttendanceQuery, needsPayrollRunsQuery, needsPayslipsQuery, needsTodayAttendanceQuery, needsUpcomingPayrollQuery } from '../admin-kpi-query.util';
import type { AdminKpiDisplay, AdminKpiMap, AdminKpiSlug } from '../admin-dashboard.types';

const PLACEHOLDER = '—';
const STALE_TIME_MS = 60_000;

interface AggregatedData {
  totalEmployees: number;
  leaveStats: { pending: number; approved: number; rejected: number; total: number } | null;
  todayAttendance: { totalEmployees: number; activeEmployees: number; onLeave: number } | null;
  overtimeAttendance: { pendingOvertime: number; approvedOvertime: number; totalOvertimeHours: number; overtimeEmployees: number } | null;
  upcomingPayroll: { daysRemaining: number; date: string } | null;
  draftPayrollRuns: number;
  pendingPayrollRuns: number;
  paidPayrollRuns: number;
  totalPayslips: number;
  leaveBalanceStats: { totalRemainingDays: number } | null;
  leavePolicyStats: { active: number } | null;
  complianceStats: { totalCompliancePercentage: number; fullyCompliantEmployeesCount: number; nonCompliantEmployeesCount: number; expiringSoonDocumentsCount: number } | null;
}

async function fetchAggregatedData(
  companyOuIds: string[],
  activeSlugs: AdminKpiSlug[],
  companyId: string,
): Promise<AggregatedData> {
  const todayStart = startOfDay(new Date()).toISOString();
  const todayEnd = endOfDay(new Date()).toISOString();
  const currentYear = new Date().getFullYear();

  const needsEmployees = needsEmployeeCountQuery(activeSlugs);
  const needsLeave = needsLeaveStatsQuery(activeSlugs);
  const needsTodayAtt = needsTodayAttendanceQuery(activeSlugs);
  const needsOvertime = needsOvertimeAttendanceQuery(activeSlugs);
  const needsUpcoming = needsUpcomingPayrollQuery(activeSlugs);
  const needsPayrollRuns = needsPayrollRunsQuery(activeSlugs);
  const needsPayslips = needsPayslipsQuery(activeSlugs);
  const needsLeaveBal = needsLeaveBalanceQuery(activeSlugs);
  const needsLeavePol = needsLeavePolicyQuery(activeSlugs);
  const needsCompliance = needsComplianceQuery(activeSlugs);

  const [employeeResults, leaveResults, attendanceResult, overtimeResult, complianceResult] = await Promise.all([
    needsEmployees
      ? Promise.all(companyOuIds.map((id) => fetchPaginatedEmployees({ page: 1, size: 1 }, { companyOuId: id })))
      : Promise.resolve([]),
    needsLeave
      ? Promise.all(companyOuIds.map((id) => fetchLeaveRequestStats(id)))
      : Promise.resolve([]),
    needsTodayAtt || needsOvertime
      ? getAttendanceOverviewStats(todayStart, todayEnd, false)
      : Promise.resolve(null),
    needsOvertime
      ? getAttendanceOverviewStats(todayStart, todayEnd, true)
      : Promise.resolve(null),
    needsCompliance
      ? fetchComplianceDashboardStats()
      : Promise.resolve(null),
  ]);

  const totalEmployees = employeeResults.reduce((sum, page) => sum + (page.metaData.total ?? 0), 0);

  const leaveStats = needsLeave && leaveResults.length > 0
    ? leaveResults.reduce(
        (acc, stat) => ({
          pending: acc.pending + stat.pending,
          approved: acc.approved + stat.approved,
          rejected: acc.rejected + stat.rejected,
          total: acc.total + stat.total,
        }),
        { pending: 0, approved: 0, rejected: 0, total: 0 },
      )
    : null;

  const todayAttendance = attendanceResult?.success ? attendanceResult.data : null;
  const overtimeAttendance = overtimeResult?.success ? overtimeResult.data : null;

  let upcomingPayroll = null;
  let draftPayrollRuns = 0;
  let pendingPayrollRuns = 0;
  let paidPayrollRuns = 0;
  let totalPayslips = 0;

  if (needsUpcoming && companyId) {
    const result = await fetchUpcomingPayrollDate(companyId);
    upcomingPayroll = result;
  }

  if ((needsPayrollRuns || needsPayslips) && companyId) {
    const [runsPage, payslipsPage] = await Promise.all([
      needsPayrollRuns
        ? fetchPayrollRunsPaginated(companyId, {
            sortBy: PayrollRunSortBy.START_DATE,
            sortOrder: PayrollRunListSortOrder.DESC,
          }, { page: 1, size: 100 })
        : Promise.resolve(null),
      needsPayslips
        ? fetchPayslipsPaginated(companyId, undefined, { page: 1, size: 1 })
        : Promise.resolve(null),
    ]);

    if (runsPage) {
      const runs = runsPage.data ?? [];
      draftPayrollRuns = runs.filter((r) => r.status.toLowerCase() === PayrollRunStatusFilter.DRAFT).length;
      pendingPayrollRuns = runs.filter((r) => r.status.toLowerCase() === PayrollRunStatusFilter.FINALIZED).length;
      paidPayrollRuns = runs.filter((r) => r.status.toLowerCase() === PayrollRunStatusFilter.PAID).length;
    }

    totalPayslips = payslipsPage?.metaData?.total ?? 0;
  }

  let leaveBalanceStats = null;
  if (needsLeaveBal && companyOuIds.length > 0) {
    const results = await Promise.all(companyOuIds.map((id) => fetchLeaveBalanceStats(id, currentYear)));
    leaveBalanceStats = {
      totalRemainingDays: results.reduce((sum, r) => sum + (r?.totalRemainingDays ?? 0), 0),
    };
  }

  let leavePolicyStats = null;
  if (needsLeavePol && companyOuIds.length > 0) {
    const results = await Promise.all(companyOuIds.map((id) => fetchLeavePolicyStats(id)));
    leavePolicyStats = {
      active: results.reduce((sum, r) => sum + (r?.active ?? 0), 0),
    };
  }

  const complianceStats = complianceResult
    ? {
        totalCompliancePercentage: complianceResult.totalCompliancePercentage,
        fullyCompliantEmployeesCount: complianceResult.fullyCompliantEmployeesCount,
        nonCompliantEmployeesCount: complianceResult.nonCompliantEmployeesCount,
        expiringSoonDocumentsCount: complianceResult.expiringSoonDocumentsCount,
      }
    : null;

  return {
    totalEmployees,
    leaveStats,
    todayAttendance,
    overtimeAttendance,
    upcomingPayroll,
    draftPayrollRuns,
    pendingPayrollRuns,
    paidPayrollRuns,
    totalPayslips,
    leaveBalanceStats,
    leavePolicyStats,
    complianceStats,
  };
}

function staticKpi(value: string, subText?: string): AdminKpiDisplay {
  return { value, subText, isLoading: false };
}

function loadingKpi(): AdminKpiDisplay {
  return { value: '…', isLoading: true };
}

function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

function formatHours(value: number): string {
  if (value < 1) return `${Math.round(value * 60)}m`;
  return `${value.toFixed(1)}h`;
}

function buildKpiMap(
  data: AggregatedData | undefined,
  activeSlugs: AdminKpiSlug[],
  isLoading: boolean,
): AdminKpiMap {
  const map: AdminKpiMap = {} as AdminKpiMap;

  if (!data) {
    for (const slug of activeSlugs) {
      (map as any)[slug] = isLoading ? loadingKpi() : staticKpi(PLACEHOLDER);
    }
    return map;
  }

  const slugSet = new Set(activeSlugs);

  if (slugSet.has('total_employees')) {
    map.total_employees = staticKpi(String(data.totalEmployees));
  }

  if (slugSet.has('active_employees')) {
    map.active_employees = data.todayAttendance
      ? staticKpi(String(data.todayAttendance.activeEmployees))
      : staticKpi(PLACEHOLDER);
  }

  if (slugSet.has('on_leave_today')) {
    map.on_leave_today = data.todayAttendance
      ? staticKpi(String(data.todayAttendance.onLeave))
      : staticKpi(PLACEHOLDER);
  }

  if (slugSet.has('attendance_rate')) {
    if (data.todayAttendance && data.todayAttendance.totalEmployees > 0) {
      const rate = (data.todayAttendance.activeEmployees / data.todayAttendance.totalEmployees) * 100;
      map.attendance_rate = staticKpi(formatPercent(rate));
    } else {
      map.attendance_rate = staticKpi(PLACEHOLDER);
    }
  }

  if (slugSet.has('pending_approve')) {
    const leavePending = data.leaveStats?.pending ?? 0;
    const overtimePending = data.overtimeAttendance?.pendingOvertime ?? 0;
    map.pending_approve = staticKpi(String(leavePending + overtimePending));
  }

  if (slugSet.has('pending_leave_requests')) {
    map.pending_leave_requests = staticKpi(String(data.leaveStats?.pending ?? PLACEHOLDER));
  }

  if (slugSet.has('approved_leave_requests')) {
    map.approved_leave_requests = staticKpi(String(data.leaveStats?.approved ?? PLACEHOLDER));
  }

  if (slugSet.has('rejected_leave_requests')) {
    map.rejected_leave_requests = staticKpi(String(data.leaveStats?.rejected ?? PLACEHOLDER));
  }

  if (slugSet.has('total_leave_requests')) {
    map.total_leave_requests = staticKpi(String(data.leaveStats?.total ?? PLACEHOLDER));
  }

  if (slugSet.has('pending_overtime')) {
    map.pending_overtime = staticKpi(String(data.overtimeAttendance?.pendingOvertime ?? PLACEHOLDER));
  }

  if (slugSet.has('approved_overtime')) {
    map.approved_overtime = staticKpi(String(data.overtimeAttendance?.approvedOvertime ?? PLACEHOLDER));
  }

  if (slugSet.has('total_overtime_hours')) {
    map.total_overtime_hours = staticKpi(formatHours(data.overtimeAttendance?.totalOvertimeHours ?? 0));
  }

  if (slugSet.has('overtime_employees')) {
    map.overtime_employees = staticKpi(String(data.overtimeAttendance?.overtimeEmployees ?? PLACEHOLDER));
  }

  if (slugSet.has('upcoming_payroll')) {
    if (data.upcomingPayroll) {
      const dateLabel = format(new Date(data.upcomingPayroll.date), 'MMM d, yyyy');
      map.upcoming_payroll = staticKpi(String(data.upcomingPayroll.daysRemaining), dateLabel);
    } else {
      map.upcoming_payroll = staticKpi(PLACEHOLDER);
    }
  }

  if (slugSet.has('draft_payroll_runs')) {
    map.draft_payroll_runs = staticKpi(String(data.draftPayrollRuns));
  }

  if (slugSet.has('pending_payroll_runs')) {
    map.pending_payroll_runs = staticKpi(String(data.pendingPayrollRuns));
  }

  if (slugSet.has('paid_payroll_runs')) {
    map.paid_payroll_runs = staticKpi(String(data.paidPayrollRuns));
  }

  if (slugSet.has('total_payslips')) {
    map.total_payslips = staticKpi(String(data.totalPayslips));
  }

  if (slugSet.has('leave_days_remaining')) {
    map.leave_days_remaining = staticKpi(String(data.leaveBalanceStats?.totalRemainingDays ?? PLACEHOLDER));
  }

  if (slugSet.has('active_leave_policies')) {
    map.active_leave_policies = staticKpi(String(data.leavePolicyStats?.active ?? PLACEHOLDER));
  }

  if (slugSet.has('compliance_percentage')) {
    map.compliance_percentage = data.complianceStats
      ? staticKpi(formatPercent(data.complianceStats.totalCompliancePercentage))
      : staticKpi(PLACEHOLDER);
  }

  if (slugSet.has('fully_compliant_employees')) {
    map.fully_compliant_employees = data.complianceStats
      ? staticKpi(String(data.complianceStats.fullyCompliantEmployeesCount))
      : staticKpi(PLACEHOLDER);
  }

  if (slugSet.has('non_compliant_employees')) {
    map.non_compliant_employees = data.complianceStats
      ? staticKpi(String(data.complianceStats.nonCompliantEmployeesCount))
      : staticKpi(PLACEHOLDER);
  }

  if (slugSet.has('expiring_documents')) {
    map.expiring_documents = data.complianceStats
      ? staticKpi(String(data.complianceStats.expiringSoonDocumentsCount))
      : staticKpi(PLACEHOLDER);
  }

  return map;
}

export function useAggregatedAdminKpis(
  enabled = true,
  activeSlugs: AdminKpiSlug[],
  companyOuIds: string[],
  companyId: string,
) {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard', 'aggregated-kpis', companyOuIds, activeSlugs],
    queryFn: () => fetchAggregatedData(companyOuIds, activeSlugs, companyId),
    enabled: enabled && companyOuIds.length > 0 && !!companyId,
    staleTime: STALE_TIME_MS,
  });

  const kpiMap = useMemo(
    () => buildKpiMap(data, activeSlugs, isLoading),
    [data, activeSlugs, isLoading],
  );

  return kpiMap;
}
