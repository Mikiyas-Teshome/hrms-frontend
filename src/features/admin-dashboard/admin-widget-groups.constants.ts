import type { AdminWidgetSlug, DashboardSectionId } from './admin-dashboard.types';

export interface WidgetGroupDefinition {
  id: string;
  slugs: AdminWidgetSlug[];
}

export const WIDGET_GROUPS: WidgetGroupDefinition[] = [
  {
    id: 'requests-actions',
    slugs: ['employee_requests', 'quick_actions'],
  },
  {
    id: 'charts',
    slugs: ['attendance_rate_chart', 'employees_insights_chart'],
  },
  {
    id: 'activity',
    slugs: ['recent_activity'],
  },
];

export const STATIC_SECTION_IDS: DashboardSectionId[] = [
  'payroll-trends',
  'company-matrix',
];

export function resolveWidgetGroups(
  visibleSlugs: AdminWidgetSlug[],
): WidgetGroupDefinition[] {
  const visibleSet = new Set(visibleSlugs);
  return WIDGET_GROUPS.map((group) => ({
    id: group.id,
    slugs: group.slugs.filter((slug) => visibleSet.has(slug)),
  })).filter((group) => group.slugs.length > 0);
}

export function getGroupForSlug(slug: AdminWidgetSlug): string | null {
  for (const group of WIDGET_GROUPS) {
    if (group.slugs.includes(slug)) {
      return group.id;
    }
  }
  return null;
}

export function buildDefaultSectionOrder(
  widgetSlugs: AdminWidgetSlug[],
  includeStaticSections: boolean,
): DashboardSectionId[] {
  const groups = resolveWidgetGroups(widgetSlugs);
  const order: DashboardSectionId[] = groups.map((g) => g.id as DashboardSectionId);
  if (includeStaticSections) {
    order.push(...STATIC_SECTION_IDS);
  }
  return order;
}
