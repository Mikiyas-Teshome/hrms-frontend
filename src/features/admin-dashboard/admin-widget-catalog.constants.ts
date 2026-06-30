import type { LucideIcon } from 'lucide-react';
import {
  ClipboardList,
  Zap,
  LineChart,
  Activity,
} from 'lucide-react';
import type {
  AdminWidgetSheetCategory,
  AdminWidgetSlug,
  WidgetVisualization,
} from './admin-dashboard.types';

export interface AdminWidgetCatalogEntry {
  slug: AdminWidgetSlug;
  category: AdminWidgetSheetCategory;
  permission: string;
  supportsStructureEdit: boolean;
  defaultVisualization: WidgetVisualization;
  allowedVisualizations: WidgetVisualization[];
  icon: LucideIcon;
  iconColor: string;
  titleKey: string;
  descKey: string;
  typeKey: string;
}

export const DEFAULT_ADMIN_WIDGET_SLUGS: AdminWidgetSlug[] = [
  'employee_requests',
  'quick_actions',
  'attendance_rate_chart',
  'employees_insights_chart',
  'recent_activity',
];

export const MAX_ADMIN_WIDGET_CARDS = 8;

export const ADMIN_WIDGET_SHEET_CATEGORY_ORDER: AdminWidgetSheetCategory[] = [
  'workforce',
  'attendanceAndTime',
  'leave',
  'notifications',
  'actions',
];

export const ADMIN_WIDGET_CATALOG: AdminWidgetCatalogEntry[] = [
  {
    slug: 'employees_insights_chart',
    category: 'workforce',
    permission: 'employees:read',
    supportsStructureEdit: true,
    defaultVisualization: 'line_chart',
    allowedVisualizations: ['table', 'pie_chart', 'line_chart', 'bar_chart'],
    icon: LineChart,
    iconColor: '#10B981',
    titleKey: 'edit.dashboardCards.newHiresExits.title',
    descKey: 'edit.dashboardCards.newHiresExits.desc',
    typeKey: 'edit.dashboardCards.newHiresExits.type',
  },
  {
    slug: 'attendance_rate_chart',
    category: 'attendanceAndTime',
    permission: 'attendance:read',
    supportsStructureEdit: true,
    defaultVisualization: 'area_chart',
    allowedVisualizations: ['area_chart', 'table', 'pie_chart', 'line_chart', 'bar_chart'],
    icon: LineChart,
    iconColor: '#0D9488',
    titleKey: 'charts.attendanceRate',
    descKey: 'edit.widgets.attendanceRateChart.desc',
    typeKey: 'edit.widgets.types.lineChart',
  },
  {
    slug: 'employee_requests',
    category: 'leave',
    permission: 'leave_requests:read',
    supportsStructureEdit: false,
    defaultVisualization: 'table',
    allowedVisualizations: ['table'],
    icon: ClipboardList,
    iconColor: '#2563EB',
    titleKey: 'employeeRequests.title',
    descKey: 'edit.widgets.employeeRequests.desc',
    typeKey: 'edit.widgets.types.table',
  },
  {
    slug: 'recent_activity',
    category: 'notifications',
    permission: 'announcements:read',
    supportsStructureEdit: false,
    defaultVisualization: 'table',
    allowedVisualizations: ['table'],
    icon: Activity,
    iconColor: '#7C3AED',
    titleKey: 'recentActivity.title',
    descKey: 'edit.widgets.recentActivity.desc',
    typeKey: 'edit.widgets.types.table',
  },
  {
    slug: 'quick_actions',
    category: 'actions',
    permission: 'employees:create',
    supportsStructureEdit: false,
    defaultVisualization: 'table',
    allowedVisualizations: ['table'],
    icon: Zap,
    iconColor: '#D97706',
    titleKey: 'quickActions.title',
    descKey: 'edit.widgets.quickActions.desc',
    typeKey: 'edit.widgets.types.actions',
  },
];

export const ADMIN_WIDGET_CATALOG_BY_SLUG: Record<AdminWidgetSlug, AdminWidgetCatalogEntry> =
  ADMIN_WIDGET_CATALOG.reduce(
    (acc, entry) => {
      acc[entry.slug] = entry;
      return acc;
    },
    {} as Record<AdminWidgetSlug, AdminWidgetCatalogEntry>,
  );
