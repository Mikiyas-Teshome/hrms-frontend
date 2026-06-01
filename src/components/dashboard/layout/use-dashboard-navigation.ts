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

type UseDashboardNavigationOptions = {
    actionHandlers?: DashboardNavigationActionHandlers;
};

export function useDashboardNavigation(options: UseDashboardNavigationOptions = {}) {
    const { t } = useTranslation('dashboard');
    const pathname = usePathname();
    const { permissionsMap, isInitializing } = useAuth();
    const { actionHandlers = {} } = options;

    const platformItems = useMemo(
        () => filterDashboardNavigationItems(DASHBOARD_PLATFORM_NAV_CONFIG, permissionsMap, isInitializing),
        [permissionsMap, isInitializing],
    );

    const menuItems = useMemo(
        () => resolveDashboardNavigationItems(platformItems, t, actionHandlers, pathname),
        [platformItems, t, actionHandlers, pathname],
    );

    const systemItems = useMemo(
        () => resolveDashboardNavigationItems(DASHBOARD_SYSTEM_NAV_CONFIG, t, actionHandlers, pathname),
        [t, actionHandlers, pathname],
    );

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
