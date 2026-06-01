'use client';

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import {
    DASHBOARD_FOOTER_NAV_CONFIG,
    DASHBOARD_PLATFORM_NAV_CONFIG,
    DASHBOARD_SYSTEM_NAV_CONFIG,
} from '@/components/dashboard/layout/dashboard-navigation.config';
import {
    buildDashboardQuickSearchItems,
    filterDashboardNavigationItems,
} from '@/components/dashboard/layout/dashboard-navigation.util';

export function useDashboardQuickSearch() {
    const { t } = useTranslation('dashboard');
    const { permissionsMap, isInitializing } = useAuth();

    const items = useMemo(() => {
        const platformItems = filterDashboardNavigationItems(
            DASHBOARD_PLATFORM_NAV_CONFIG,
            permissionsMap,
            isInitializing,
        );

        return buildDashboardQuickSearchItems(
            platformItems,
            DASHBOARD_SYSTEM_NAV_CONFIG,
            DASHBOARD_FOOTER_NAV_CONFIG,
            t,
        );
    }, [permissionsMap, isInitializing, t]);

    const groupedItems = useMemo(() => {
        const groups = new Map<string, typeof items>();

        items.forEach((item) => {
            const existing = groups.get(item.group) ?? [];
            existing.push(item);
            groups.set(item.group, existing);
        });

        return Array.from(groups.entries()).map(([group, groupItems]) => ({
            group,
            items: groupItems,
        }));
    }, [items]);

    return {
        items,
        groupedItems,
        isReady: !isInitializing && !!permissionsMap,
    };
}
