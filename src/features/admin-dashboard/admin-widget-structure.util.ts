import type { AdminWidgetCatalogEntry } from '@/features/admin-dashboard/admin-widget-catalog.constants';
import { ADMIN_WIDGET_SHEET_CATEGORY_ORDER } from '@/features/admin-dashboard/admin-widget-catalog.constants';
import type {
  AdminWidgetSheetCategory,
  WidgetCardStructure,
  WidgetVisualization,
} from '@/features/admin-dashboard/admin-dashboard.types';

export const WIDGET_DATA_CATEGORIES = ADMIN_WIDGET_SHEET_CATEGORY_ORDER;

export function getDefaultWidgetStructure(
  entry: AdminWidgetCatalogEntry,
): WidgetCardStructure {
  return {
    dataCategory: entry.category,
    visualization: entry.defaultVisualization,
  };
}

export function resolveWidgetStructure(
  entry: AdminWidgetCatalogEntry,
  saved?: WidgetCardStructure | null,
): WidgetCardStructure {
  const defaults = getDefaultWidgetStructure(entry);

  if (!saved) {
    return defaults;
  }

  return {
    dataCategory: isWidgetDataCategory(saved.dataCategory)
      ? saved.dataCategory
      : defaults.dataCategory,
    visualization: entry.allowedVisualizations.includes(saved.visualization)
      ? saved.visualization
      : defaults.visualization,
  };
}

export function isWidgetVisualization(value: string): value is WidgetVisualization {
  return ['table', 'pie_chart', 'line_chart', 'bar_chart', 'area_chart'].includes(value);
}

export function isWidgetDataCategory(value: string): value is AdminWidgetSheetCategory {
  return WIDGET_DATA_CATEGORIES.includes(value as AdminWidgetSheetCategory);
}

export function normalizeWidgetConfigs(
  widgetSlugs: string[],
  value: unknown,
): Record<string, WidgetCardStructure> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  const allowed = new Set(widgetSlugs);
  const result: Record<string, WidgetCardStructure> = {};

  for (const [slug, config] of Object.entries(value as Record<string, unknown>)) {
    if (!allowed.has(slug) || !config || typeof config !== 'object' || Array.isArray(config)) {
      continue;
    }

    const record = config as Record<string, unknown>;
    const visualization =
      typeof record.visualization === 'string' ? record.visualization : '';
    const dataCategory =
      typeof record.dataCategory === 'string' ? record.dataCategory : '';

    if (!isWidgetVisualization(visualization) || !isWidgetDataCategory(dataCategory)) {
      continue;
    }

    result[slug] = {
      dataCategory,
      visualization,
    };
  }

  return result;
}
