'use client';

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
    DASHBOARD_FOOTER_NAV_CONFIG,
    DASHBOARD_PLATFORM_NAV_CONFIG,
    DASHBOARD_SYSTEM_NAV_CONFIG,
} from '@/components/dashboard/layout/dashboard-navigation.config';
import type { DashboardNavigationActionHandlers } from '@/components/dashboard/layout/dashboard-navigation.types';
import {
    filterDashboardNavigationItems,
    resolveDashboardNavigationItems,
} from '@/components/dashboard/layout/dashboard-navigation.util';
import { canAccessSettings } from '@/features/settings/settings-navigation.util';
import { useOrganizationNomenclature } from '@/features/organization/hooks/useOrganization';
import { applyOrganizationNavigationItems } from '@/features/organization/organization-navigation.util';

type UseDashboardNavigationOptions = {
    actionHandlers?: DashboardNavigationActionHandlers;
};

export function useDashboardNavigation(options: UseDashboardNavigationOptions = {}) {
    const { t } = useTranslation('dashboard');
    const pathname = usePathname();
    const { permissionsMap, isInitializing } = useAuth();
    const { data: organizationNomenclature } = useOrganizationNomenclature();
    const { actionHandlers = {} } = options;

    const platformItems = useMemo(() => {
        const configuredItems = applyOrganizationNavigationItems(
            DASHBOARD_PLATFORM_NAV_CONFIG,
            organizationNomenclature,
            t,
        );

        return filterDashboardNavigationItems(configuredItems, permissionsMap, isInitializing);
    }, [organizationNomenclature, permissionsMap, isInitializing, t]);

    const menuItems = useMemo(
        () => resolveDashboardNavigationItems(platformItems, t, actionHandlers, pathname),
        [platformItems, t, actionHandlers, pathname],
    );

    const systemItems = useMemo(() => {
        const filteredItems = filterDashboardNavigationItems(
            DASHBOARD_SYSTEM_NAV_CONFIG.filter(
                (item) => !item.requiresSettingsAccess || canAccessSettings(permissionsMap),
            ),
            permissionsMap,
            isInitializing,
        );

        return resolveDashboardNavigationItems(filteredItems, t, actionHandlers, pathname);
    }, [permissionsMap, isInitializing, t, actionHandlers, pathname]);

    const footerItems = useMemo(
        () => resolveDashboardNavigationItems(DASHBOARD_FOOTER_NAV_CONFIG, t, actionHandlers, pathname),
        [t, actionHandlers, pathname],
    );

    return {
        menuItems,
        systemItems,
        footerItems,
        isInitializing,
    };
}
