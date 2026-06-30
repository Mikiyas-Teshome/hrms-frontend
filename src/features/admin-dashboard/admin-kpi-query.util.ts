import type { AdminKpiSlug } from './admin-dashboard.types';

const LEAVE_STAT_SLUGS: AdminKpiSlug[] = [
  'pending_approve',
  'pending_leave_requests',
  'approved_leave_requests',
  'rejected_leave_requests',
  'total_leave_requests',
];

const TODAY_ATTENDANCE_SLUGS: AdminKpiSlug[] = [
  'active_employees',
  'on_leave_today',
  'attendance_rate',
];

const OVERTIME_ATTENDANCE_SLUGS: AdminKpiSlug[] = [
  'pending_approve',
  'pending_overtime',
  'approved_overtime',
  'total_overtime_hours',
  'overtime_employees',
];

const WORKFORCE_LIST_SLUGS: AdminKpiSlug[] = ['new_hires', 'attrition_rate'];

const PAYROLL_RUN_SLUGS: AdminKpiSlug[] = [
  'draft_payroll_runs',
  'pending_payroll_runs',
  'paid_payroll_runs',
];

const COMPLIANCE_SLUGS: AdminKpiSlug[] = [
  'compliance_percentage',
  'fully_compliant_employees',
  'non_compliant_employees',
  'expiring_documents',
];

export function needsEmployeeCountQuery(slugs: AdminKpiSlug[]): boolean {
  return slugs.includes('total_employees');
}

export function needsEmployeeListQuery(slugs: AdminKpiSlug[]): boolean {
  return slugs.some((slug) => WORKFORCE_LIST_SLUGS.includes(slug));
}

export function needsLeaveStatsQuery(slugs: AdminKpiSlug[]): boolean {
  return slugs.some((slug) => LEAVE_STAT_SLUGS.includes(slug));
}

export function needsTodayAttendanceQuery(slugs: AdminKpiSlug[]): boolean {
  return slugs.some((slug) => TODAY_ATTENDANCE_SLUGS.includes(slug));
}

export function needsOvertimeAttendanceQuery(slugs: AdminKpiSlug[]): boolean {
  return slugs.some((slug) => OVERTIME_ATTENDANCE_SLUGS.includes(slug));
}

export function needsUpcomingPayrollQuery(slugs: AdminKpiSlug[]): boolean {
  return slugs.includes('upcoming_payroll');
}

export function needsPayrollRunsQuery(slugs: AdminKpiSlug[]): boolean {
  return slugs.some((slug) => PAYROLL_RUN_SLUGS.includes(slug));
}

export function needsPayslipsQuery(slugs: AdminKpiSlug[]): boolean {
  return slugs.includes('total_payslips');
}

export function needsLeaveBalanceQuery(slugs: AdminKpiSlug[]): boolean {
  return slugs.includes('leave_days_remaining');
}

export function needsLeavePolicyQuery(slugs: AdminKpiSlug[]): boolean {
  return slugs.includes('active_leave_policies');
}

export function needsComplianceQuery(slugs: AdminKpiSlug[]): boolean {
  return slugs.some((slug) => COMPLIANCE_SLUGS.includes(slug));
}
