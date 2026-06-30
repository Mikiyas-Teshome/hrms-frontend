import type { AdminKpiSlug, AdminWidgetSlug, WidgetCardStructure, DashboardSectionId } from './admin-dashboard.types';

export interface ExecutiveDashboardLayout {
  kpiSlugs: AdminKpiSlug[];
  widgetSlugs: AdminWidgetSlug[];
  widgetConfigs?: Partial<Record<AdminWidgetSlug, WidgetCardStructure>>;
  sectionOrder: DashboardSectionId[];
}

export interface ExecutiveDashboardResponse {
  eligible: boolean;
  scope?: string | null;
  layout: ExecutiveDashboardLayout;
  allowedKpiSlugs: AdminKpiSlug[];
  allowedWidgetSlugs: AdminWidgetSlug[];
}

export interface UpdateExecutiveDashboardInput {
  kpiSlugs: AdminKpiSlug[];
  widgetSlugs: AdminWidgetSlug[];
  widgetConfigs?: Partial<Record<AdminWidgetSlug, WidgetCardStructure>>;
  sectionOrder?: DashboardSectionId[];
}
