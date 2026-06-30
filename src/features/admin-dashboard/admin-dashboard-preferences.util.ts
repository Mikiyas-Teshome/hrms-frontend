import {
  DEFAULT_ADMIN_KPI_SLUGS,
} from '@/features/admin-dashboard/admin-kpi-catalog.constants';
import {
  DEFAULT_ADMIN_WIDGET_SLUGS,
} from '@/features/admin-dashboard/admin-widget-catalog.constants';
import type {
  AdminDashboardLayout,
  AdminKpiSlug,
  AdminWidgetSlug,
  DashboardSectionId,
} from '@/features/admin-dashboard/admin-dashboard.types';
import { normalizeWidgetConfigs } from '@/features/admin-dashboard/admin-widget-structure.util';
import { buildDefaultSectionOrder } from '@/features/admin-dashboard/admin-widget-groups.constants';
import type { DashboardPreferences } from '@/features/auth/auth.types';

const KPI_SLUG_SET = new Set<string>([
  'total_employees',
  'active_employees',
  'new_hires',
  'attrition_rate',
  'pending_approve',
  'on_leave_today',
  'attendance_rate',
  'pending_overtime',
  'approved_overtime',
  'total_overtime_hours',
  'overtime_employees',
  'pending_leave_requests',
  'approved_leave_requests',
  'rejected_leave_requests',
  'total_leave_requests',
  'leave_days_remaining',
  'active_leave_policies',
  'upcoming_payroll',
  'draft_payroll_runs',
  'pending_payroll_runs',
  'paid_payroll_runs',
  'total_payslips',
  'compliance_percentage',
  'fully_compliant_employees',
  'non_compliant_employees',
  'expiring_documents',
]);

const WIDGET_SLUG_SET = new Set<string>([
  'employee_requests',
  'quick_actions',
  'attendance_rate_chart',
  'employees_insights_chart',
  'recent_activity',
]);

function filterKnownSlugs<T extends string>(slugs: unknown, allowed: Set<string>): T[] {
  if (!Array.isArray(slugs)) {
    return [];
  }

  return slugs.filter((slug): slug is T => typeof slug === 'string' && allowed.has(slug));
}

export function getDefaultAdminDashboardLayout(): AdminDashboardLayout {
  const widgetSlugs = [...DEFAULT_ADMIN_WIDGET_SLUGS];
  return {
    kpiSlugs: [...DEFAULT_ADMIN_KPI_SLUGS],
    widgetSlugs,
    widgetConfigs: {},
    sectionOrder: buildDefaultSectionOrder(widgetSlugs, false),
  };
}

export function resolveAdminDashboardLayout(
  preferences?: DashboardPreferences | null,
): AdminDashboardLayout {
  const layout = preferences?.adminExecutive;
  const kpiSlugs = filterKnownSlugs<AdminKpiSlug>(layout?.kpiSlugs, KPI_SLUG_SET);
  const widgetSlugs = filterKnownSlugs<AdminWidgetSlug>(layout?.widgetSlugs, WIDGET_SLUG_SET);

  return {
    kpiSlugs,
    widgetSlugs,
    widgetConfigs: normalizeWidgetConfigs(widgetSlugs, layout?.widgetConfigs),
    sectionOrder: (layout?.sectionOrder as DashboardSectionId[] | undefined) ?? buildDefaultSectionOrder(widgetSlugs, false),
  };
}
