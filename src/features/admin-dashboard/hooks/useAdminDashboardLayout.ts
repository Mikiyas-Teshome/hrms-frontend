'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { mergeUniqueSlugs } from '@/features/admin-dashboard/admin-kpi-catalog.util';
import { DEFAULT_ADMIN_KPI_SLUGS } from '@/features/admin-dashboard/admin-kpi-catalog.constants';
import { DEFAULT_ADMIN_WIDGET_SLUGS } from '@/features/admin-dashboard/admin-widget-catalog.constants';
import { MAX_ADMIN_KPI_CARDS } from '@/features/admin-dashboard/admin-kpi-catalog.constants';
import { MAX_ADMIN_WIDGET_CARDS } from '@/features/admin-dashboard/admin-widget-catalog.constants';
import { normalizeWidgetConfigs } from '@/features/admin-dashboard/admin-widget-structure.util';
import {
  useExecutiveDashboard,
  useUpdateExecutiveDashboard,
} from '@/features/admin-dashboard/hooks/useExecutiveDashboard';
import type {
  AdminDashboardLayout,
  AdminKpiSlug,
  AdminWidgetSlug,
  DashboardSectionId,
  WidgetCardStructure,
} from '@/features/admin-dashboard/admin-dashboard.types';
import { buildDefaultSectionOrder, getGroupForSlug } from '@/features/admin-dashboard/admin-widget-groups.constants';

function resolveLayoutFromExecutiveDashboard(
  data: ReturnType<typeof useExecutiveDashboard>['data'],
  defaultKpiSlugs: AdminKpiSlug[] = DEFAULT_ADMIN_KPI_SLUGS,
  defaultWidgetSlugs: AdminWidgetSlug[] = DEFAULT_ADMIN_WIDGET_SLUGS,
): AdminDashboardLayout {
  if (!data?.eligible) {
    const widgetSlugs = [...defaultWidgetSlugs];
    return {
      kpiSlugs: [...defaultKpiSlugs],
      widgetSlugs,
      widgetConfigs: {},
      sectionOrder: buildDefaultSectionOrder(widgetSlugs, false),
    };
  }

  const allowedKpiSet = new Set(data.allowedKpiSlugs);
  const allowedWidgetSet = new Set(data.allowedWidgetSlugs);
  const kpiSlugs = data.layout.kpiSlugs.filter((slug) => allowedKpiSet.has(slug));
  const widgetSlugs = data.layout.widgetSlugs.filter((slug) => allowedWidgetSet.has(slug));
  const resolvedSlugs =
    widgetSlugs.length > 0 ? widgetSlugs : [...defaultWidgetSlugs];
  const resolvedKpis = kpiSlugs.length > 0 ? kpiSlugs : [...defaultKpiSlugs];

  return {
    kpiSlugs: resolvedKpis,
    widgetSlugs: resolvedSlugs,
    widgetConfigs: normalizeWidgetConfigs(resolvedSlugs, data.layout.widgetConfigs),
    sectionOrder: data.layout.sectionOrder ?? buildDefaultSectionOrder(resolvedSlugs, true),
  };
}

export function useAdminDashboardLayout(
  isEditing: boolean,
  enabled = true,
  defaultKpiSlugs: AdminKpiSlug[] = DEFAULT_ADMIN_KPI_SLUGS,
  defaultWidgetSlugs: AdminWidgetSlug[] = DEFAULT_ADMIN_WIDGET_SLUGS,
) {
  const { data: executiveDashboard } = useExecutiveDashboard(enabled);
  const updateExecutiveDashboard = useUpdateExecutiveDashboard();

  const savedLayout = useMemo(
    () => resolveLayoutFromExecutiveDashboard(executiveDashboard, defaultKpiSlugs, defaultWidgetSlugs),
    [executiveDashboard, defaultKpiSlugs, defaultWidgetSlugs],
  );

  const [draftKpiSlugs, setDraftKpiSlugs] = useState<AdminKpiSlug[]>(
    [...defaultKpiSlugs],
  );
  const [draftWidgetSlugs, setDraftWidgetSlugs] = useState<AdminWidgetSlug[]>(
    [...defaultWidgetSlugs],
  );
  const [draftWidgetConfigs, setDraftWidgetConfigs] = useState<
    Partial<Record<AdminWidgetSlug, WidgetCardStructure>>
  >({});
  const [draftSectionOrder, setDraftSectionOrder] = useState<DashboardSectionId[]>([]);

  useEffect(() => {
    setDraftKpiSlugs(savedLayout.kpiSlugs);
    setDraftWidgetSlugs(savedLayout.widgetSlugs);
    setDraftWidgetConfigs(savedLayout.widgetConfigs);
    setDraftSectionOrder(savedLayout.sectionOrder ?? []);
  }, [savedLayout]);

  const visibleKpiSlugs = isEditing ? draftKpiSlugs : savedLayout.kpiSlugs;
  const visibleWidgetSlugs = isEditing ? draftWidgetSlugs : savedLayout.widgetSlugs;
  const visibleWidgetConfigs = isEditing ? draftWidgetConfigs : savedLayout.widgetConfigs;
  const visibleSectionOrder = isEditing ? draftSectionOrder : (savedLayout.sectionOrder ?? []);

  const allowedKpiSlugs = executiveDashboard?.allowedKpiSlugs ?? [];
  const allowedWidgetSlugs = executiveDashboard?.allowedWidgetSlugs ?? [];

  const addKpiSlugs = useCallback((slugs: AdminKpiSlug[]) => {
    setDraftKpiSlugs((prev) =>
      mergeUniqueSlugs(prev, slugs).slice(0, MAX_ADMIN_KPI_CARDS),
    );
  }, []);

  const removeKpiSlug = useCallback((slug: AdminKpiSlug) => {
    setDraftKpiSlugs((prev) => prev.filter((item) => item !== slug));
  }, []);

  const addWidgetSlugs = useCallback(
    (
      slugs: AdminWidgetSlug[],
      configs: Partial<Record<AdminWidgetSlug, WidgetCardStructure>>,
    ) => {
      setDraftWidgetSlugs((prev) => {
        const merged = [...prev];
        for (const slug of slugs) {
          if (!merged.includes(slug)) {
            merged.push(slug);
          }
        }
        return merged.slice(0, MAX_ADMIN_WIDGET_CARDS);
      });

      setDraftSectionOrder((prev) => {
        const next = [...prev];
        for (const slug of slugs) {
          const groupId = getGroupForSlug(slug);
          if (groupId && !next.includes(groupId as DashboardSectionId)) {
            next.push(groupId as DashboardSectionId);
          }
        }
        return next;
      });

      if (Object.keys(configs).length > 0) {
        setDraftWidgetConfigs((prev) => ({
          ...prev,
          ...configs,
        }));
      }
    },
    [],
  );

  const removeWidgetSlug = useCallback((slug: AdminWidgetSlug) => {
    setDraftWidgetSlugs((prev) => {
      const next = prev.filter((item) => item !== slug);
      const groupId = getGroupForSlug(slug);
      if (groupId) {
        const remaining = next.filter((s) => getGroupForSlug(s) === groupId);
        if (remaining.length === 0) {
          setDraftSectionOrder((order) => order.filter((id) => id !== groupId));
        }
      }
      return next;
    });
    setDraftWidgetConfigs((prev) => {
      const next = { ...prev };
      delete next[slug];
      return next;
    });
  }, []);

  const reorderWidgetSlug = useCallback((fromIndex: number, toIndex: number) => {
    setDraftWidgetSlugs((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  const replaceWidgetSlugs = useCallback((slugs: AdminWidgetSlug[]) => {
    setDraftWidgetSlugs(slugs);
  }, []);

  const reorderSection = useCallback((fromIndex: number, toIndex: number) => {
    setDraftSectionOrder((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  const updateWidgetConfig = useCallback(
    (slug: AdminWidgetSlug, config: WidgetCardStructure) => {
      setDraftWidgetConfigs((prev) => ({
        ...prev,
        [slug]: config,
      }));
    },
    [],
  );

  const resetDraft = useCallback(() => {
    setDraftKpiSlugs(savedLayout.kpiSlugs);
    setDraftWidgetSlugs(savedLayout.widgetSlugs);
    setDraftWidgetConfigs(savedLayout.widgetConfigs);
    setDraftSectionOrder(savedLayout.sectionOrder ?? []);
  }, [savedLayout]);

  const saveLayout = useCallback(async () => {
    const activeConfigs = draftWidgetSlugs.reduce<
      Partial<Record<AdminWidgetSlug, WidgetCardStructure>>
    >((acc, slug) => {
      const config = draftWidgetConfigs[slug];
      if (config) {
        acc[slug] = config;
      }
      return acc;
    }, {});

    await updateExecutiveDashboard.mutateAsync({
      kpiSlugs: draftKpiSlugs,
      widgetSlugs: draftWidgetSlugs,
      widgetConfigs: activeConfigs,
    });
  }, [
    draftKpiSlugs,
    draftWidgetSlugs,
    draftWidgetConfigs,
    updateExecutiveDashboard,
  ]);

  return {
    eligible: executiveDashboard?.eligible ?? false,
    scope: executiveDashboard?.scope ?? null,
    allowedKpiSlugs,
    allowedWidgetSlugs,
    visibleKpiSlugs,
    visibleWidgetSlugs,
    visibleWidgetConfigs,
    visibleSectionOrder,
    addKpiSlugs,
    removeKpiSlug,
    addWidgetSlugs,
    removeWidgetSlug,
    reorderWidgetSlug,
    replaceWidgetSlugs,
    reorderSection,
    updateWidgetConfig,
    resetDraft,
    saveLayout,
    isSaving: updateExecutiveDashboard.isPending,
    isLoading: !executiveDashboard && enabled,
    isLayoutReady: Boolean(executiveDashboard),
  };
}
