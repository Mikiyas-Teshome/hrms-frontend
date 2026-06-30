import type { TFunction } from 'i18next';
import {
  ADMIN_WIDGET_CATALOG_BY_SLUG,
  ADMIN_WIDGET_SHEET_CATEGORY_ORDER,
  type AdminWidgetCatalogEntry,
} from '@/features/admin-dashboard/admin-widget-catalog.constants';
import type {
  AdminWidgetSheetCategory,
  AdminWidgetSlug,
  WidgetCardStructure,
  WidgetVisualization,
} from '@/features/admin-dashboard/admin-dashboard.types';
import { resolveWidgetStructure } from '@/features/admin-dashboard/admin-widget-structure.util';

export function getResolvedWidgetVisualization(
  slug: AdminWidgetSlug,
  configs: Partial<Record<AdminWidgetSlug, WidgetCardStructure>>,
): WidgetVisualization {
  const entry = ADMIN_WIDGET_CATALOG_BY_SLUG[slug];
  return resolveWidgetStructure(entry, configs[slug]).visualization;
}

export function filterWidgetCatalogByCategory(
  catalog: AdminWidgetCatalogEntry[],
  category: AdminWidgetSheetCategory,
): AdminWidgetCatalogEntry[] {
  return catalog.filter((entry) => entry.category === category);
}

export function filterWidgetCatalogByPermission(
  catalog: AdminWidgetCatalogEntry[],
  hasPermission: (permission: string) => boolean,
): AdminWidgetCatalogEntry[] {
  return catalog.filter((entry) => hasPermission(entry.permission));
}

export function filterWidgetCatalogByAllowedSlugs(
  catalog: AdminWidgetCatalogEntry[],
  allowedSlugs: AdminWidgetSlug[],
): AdminWidgetCatalogEntry[] {
  if (allowedSlugs.length === 0) {
    return [];
  }

  const allowed = new Set(allowedSlugs);
  return catalog.filter((entry) => allowed.has(entry.slug));
}

export function getWidgetSheetCategoriesWithCards(
  catalog: AdminWidgetCatalogEntry[],
): AdminWidgetSheetCategory[] {
  const populated = new Set(catalog.map((entry) => entry.category));
  return ADMIN_WIDGET_SHEET_CATEGORY_ORDER.filter((category) => populated.has(category));
}

export function searchWidgetCatalogEntries(
  catalog: AdminWidgetCatalogEntry[],
  query: string,
  t: TFunction<'dashboard'>,
): AdminWidgetCatalogEntry[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return catalog;
  }

  return catalog.filter((entry) => {
    const title = t(entry.titleKey).toLowerCase();
    const description = t(entry.descKey).toLowerCase();
    return title.includes(normalized) || description.includes(normalized);
  });
}

export function getWidgetCategorySectionTitleKey(
  category: AdminWidgetSheetCategory,
): string {
  if (category === 'workforce') {
    return 'edit.workforceCards';
  }

  return `edit.categories.${category}`;
}

export function isCatalogEntryAdded(
  entry: AdminWidgetCatalogEntry,
  existingSlugs: AdminWidgetSlug[],
): boolean {
  return existingSlugs.includes(entry.slug);
}
