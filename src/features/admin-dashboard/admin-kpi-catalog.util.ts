import type { TFunction } from 'i18next';
import {
  ADMIN_KPI_CATALOG,
  ADMIN_KPI_CATALOG_BY_SLUG,
  type AdminKpiCatalogEntry,
} from './admin-kpi-catalog.constants';
import type { AdminKpiDisplay, AdminKpiMap, AdminKpiSlug, AdminKpiCategory } from './admin-dashboard.types';

export function getCatalogEntry(slug: AdminKpiSlug): AdminKpiCatalogEntry {
  return ADMIN_KPI_CATALOG_BY_SLUG[slug];
}

export function filterCatalogByPermission(
  hasPermission: (permission: string) => boolean,
): AdminKpiCatalogEntry[] {
  return ADMIN_KPI_CATALOG.filter((entry) => hasPermission(entry.permission));
}

export function filterCatalogByAllowedSlugs(
  entries: AdminKpiCatalogEntry[],
  allowedSlugs: AdminKpiSlug[],
): AdminKpiCatalogEntry[] {
  if (allowedSlugs.length === 0) {
    return [];
  }

  const allowed = new Set(allowedSlugs);
  return entries.filter((entry) => allowed.has(entry.slug));
}

export function filterCatalogByCategory(
  entries: AdminKpiCatalogEntry[],
  category: AdminKpiCategory,
): AdminKpiCatalogEntry[] {
  return entries.filter((entry) => entry.category === category);
}

export function searchCatalogEntries(
  entries: AdminKpiCatalogEntry[],
  query: string,
  t: TFunction,
): AdminKpiCatalogEntry[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return entries;
  }

  return entries.filter((entry) => {
    const title = t(entry.titleKey).toLowerCase();
    const description = t(entry.descKey).toLowerCase();
    return title.includes(normalized) || description.includes(normalized) || entry.slug.includes(normalized);
  });
}

export interface AdminDashboardStatCardView {
  slug: AdminKpiSlug;
  title: string;
  value: string;
  icon: AdminKpiCatalogEntry['icon'];
  containerClass: string;
  iconClass: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  subText?: string;
  isLoading: boolean;
}

export function buildAdminDashboardStatCards(
  t: TFunction,
  visibleSlugs: AdminKpiSlug[],
  kpiMap: AdminKpiMap,
): AdminDashboardStatCardView[] {
  const cards: AdminDashboardStatCardView[] = [];

  for (const slug of visibleSlugs) {
    const catalog = ADMIN_KPI_CATALOG_BY_SLUG[slug];
    if (!catalog) {
      continue;
    }

    const live: AdminKpiDisplay = kpiMap[slug] ?? {
      value: '—',
      isLoading: false,
    };

    cards.push({
      slug,
      title: t(catalog.statsTitleKey ?? catalog.titleKey),
      value: live.value,
      icon: catalog.icon,
      containerClass: catalog.containerClass,
      iconClass: catalog.iconClass,
      trend: catalog.trend,
      subText: live.subText,
      isLoading: live.isLoading,
    });
  }

  return cards;
}

export function getCategorySectionTitleKey(category: AdminKpiCategory): string {
  switch (category) {
    case 'workforce':
      return 'edit.workforceCards';
    case 'attendance':
      return 'edit.categorySections.attendance';
    case 'leave':
      return 'edit.categorySections.leave';
    case 'payroll':
      return 'edit.categorySections.payroll';
    case 'compliance':
      return 'edit.categorySections.compliance';
    default:
      return 'edit.organizationCards';
  }
}

export function slugSetIncludes(slugs: AdminKpiSlug[], target: AdminKpiSlug): boolean {
  return slugs.includes(target);
}

export function mergeUniqueSlugs(current: AdminKpiSlug[], additions: AdminKpiSlug[]): AdminKpiSlug[] {
  const next = [...current];
  for (const slug of additions) {
    if (!next.includes(slug)) {
      next.push(slug);
    }
  }
  return next;
}
