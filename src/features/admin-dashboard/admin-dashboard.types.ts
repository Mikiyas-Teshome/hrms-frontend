export type AdminKpiCategory = 'workforce' | 'attendance' | 'leave' | 'payroll' | 'compliance';

export type AdminWidgetSheetCategory =
  | 'workforce'
  | 'attendanceAndTime'
  | 'leave'
  | 'payroll'
  | 'documentsAndCompliance'
  | 'benefits'
  | 'notifications'
  | 'actions'
  | 'reportsAndInsights'
  | 'others';

export type WidgetVisualization = 'table' | 'pie_chart' | 'line_chart' | 'bar_chart' | 'area_chart';

export interface WidgetCardStructure {
  dataCategory: AdminWidgetSheetCategory;
  visualization: WidgetVisualization;
}

export type AdminWidgetSlug =
  | 'employee_requests'
  | 'quick_actions'
  | 'attendance_rate_chart'
  | 'employees_insights_chart'
  | 'recent_activity';

export type DashboardSectionId =
  | 'requests-actions'
  | 'charts'
  | 'activity'
  | 'payroll-trends'
  | 'company-matrix';

export interface AdminDashboardLayout {
  kpiSlugs: AdminKpiSlug[];
  widgetSlugs: AdminWidgetSlug[];
  widgetConfigs: Partial<Record<AdminWidgetSlug, WidgetCardStructure>>;
  sectionOrder?: DashboardSectionId[];
}

export interface DashboardPreferences {
  version: number;
  adminExecutive: AdminDashboardLayout;
}

export type AdminKpiSlug =
  | 'total_employees'
  | 'active_employees'
  | 'new_hires'
  | 'attrition_rate'
  | 'pending_approve'
  | 'on_leave_today'
  | 'attendance_rate'
  | 'pending_overtime'
  | 'approved_overtime'
  | 'total_overtime_hours'
  | 'overtime_employees'
  | 'pending_leave_requests'
  | 'approved_leave_requests'
  | 'rejected_leave_requests'
  | 'total_leave_requests'
  | 'leave_days_remaining'
  | 'active_leave_policies'
  | 'upcoming_payroll'
  | 'draft_payroll_runs'
  | 'pending_payroll_runs'
  | 'paid_payroll_runs'
  | 'total_payslips'
  | 'compliance_percentage'
  | 'fully_compliant_employees'
  | 'non_compliant_employees'
  | 'expiring_documents';

export interface AdminKpiDisplay {
  value: string;
  subText?: string;
  isLoading: boolean;
}

export type AdminKpiMap = Record<AdminKpiSlug, AdminKpiDisplay>;
