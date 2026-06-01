import type { TFunction } from 'i18next';
import type { PermissionsMap } from '@/features/roles/roles.types';
import type {
    DashboardNavigationActionHandlers,
    DashboardNavigationItem,
    DashboardNavigationItemConfig,
    DashboardNavigationSubItem,
    DashboardNavigationSubItemConfig,
    DashboardQuickSearchItem,
} from '@/components/dashboard/layout/dashboard-navigation.types';

const resolveTitle = (
    t: TFunction,
    titleKey: string,
    titleDefault?: string,
): string => {
    if (titleDefault) {
        return t(titleKey, { defaultValue: titleDefault });
    }

    return t(titleKey);
};

export const checkDashboardModulePermission = (
    permissionsMap: PermissionsMap | null | undefined,
    module?: string,
    action: string = 'read',
): boolean => {
    if (!module) {
        return false;
    }

    if (!permissionsMap) {
        return false;
    }

    if (permissionsMap.all?.manage) {
        return true;
    }

    const modulePermissions = permissionsMap[module];
    if (!modulePermissions) {
        return false;
    }

    return (
        !!modulePermissions[action] ||
        !!modulePermissions.manage ||
        (action === 'read' && Object.keys(modulePermissions).length > 0)
    );
};

export const checkDashboardModulePermissions = (
    permissionsMap: PermissionsMap | null | undefined,
    module?: string,
    actions: string[] = ['read'],
): boolean => {
    if (!module || actions.length === 0) {
        return false;
    }

    return actions.every((action) =>
        checkDashboardModulePermission(permissionsMap, module, action),
    );
};

const filterSubItems = (
    subItems: DashboardNavigationSubItemConfig[] | undefined,
    permissionsMap: PermissionsMap | null | undefined,
): DashboardNavigationSubItemConfig[] | undefined => {
    return subItems?.filter((subItem) => {
        if (!subItem.module) {
            return true;
        }

        if (!permissionsMap) {
            return false;
        }

        if (permissionsMap.all?.manage) {
            return true;
        }

        if (subItem.actions?.length) {
            return checkDashboardModulePermissions(permissionsMap, subItem.module, subItem.actions);
        }

        const action = subItem.action || 'read';
        return checkDashboardModulePermission(permissionsMap, subItem.module, action);
    });
};

const isNavigableUrl = (url: string): boolean => {
    return url !== '#' && url.length > 0;
};

const buildSearchValue = (
    title: string,
    group: string,
    keywords: string[] = [],
    url = '',
): string => {
    return [title, group, ...keywords, url.replace(/^\//, '').replace(/\//g, ' ')]
        .join(' ')
        .toLowerCase();
};

export const filterDashboardNavigationItems = (
    items: DashboardNavigationItemConfig[],
    permissionsMap: PermissionsMap | null | undefined,
    isInitializing: boolean,
): DashboardNavigationItemConfig[] => {
    const hasResolvedPermissions = Boolean(
        permissionsMap && Object.keys(permissionsMap).length > 0,
    );

    if ((isInitializing && !hasResolvedPermissions) || !permissionsMap) {
        return [];
    }

    return items
        .map((item) => ({
            ...item,
            items: filterSubItems(item.items, permissionsMap),
        }))
        .filter((item) => {
            if (permissionsMap.all?.manage) {
                return true;
            }

            const parentAllowed = !item.module || checkDashboardModulePermission(permissionsMap, item.module);
            const hasVisibleChildren = !!item.items?.length;

            return parentAllowed || hasVisibleChildren;
        });
};

export const resolveDashboardNavigationItems = (
    items: DashboardNavigationItemConfig[],
    t: TFunction,
    actionHandlers: DashboardNavigationActionHandlers = {},
    pathname?: string,
): DashboardNavigationItem[] => {
    return items.map((item) => {
        const resolvedSubItems = item.items?.map((subItem) => {
            const subItemResult: DashboardNavigationSubItem = {
                title: resolveTitle(t, subItem.titleKey, subItem.titleDefault),
                url: subItem.url,
                module: subItem.module,
                action: subItem.action,
            };

            if (subItem.actionId && actionHandlers[subItem.actionId]) {
                subItemResult.onClick = actionHandlers[subItem.actionId];
            }

            return subItemResult;
        });

        const resolvedItem: DashboardNavigationItem = {
            title: resolveTitle(t, item.titleKey, item.titleDefault),
            url: item.url,
            icon: item.icon,
            module: item.module,
            action: item.action,
            items: resolvedSubItems,
            isActive: pathname ? pathname === item.url : undefined,
        };

        return resolvedItem;
    });
};

export const buildDashboardQuickSearchItems = (
    platformItems: DashboardNavigationItemConfig[],
    systemItems: DashboardNavigationItemConfig[],
    footerItems: DashboardNavigationItemConfig[],
    t: TFunction,
): DashboardQuickSearchItem[] => {
    const results: DashboardQuickSearchItem[] = [];

    const appendItem = (
        config: DashboardNavigationItemConfig | DashboardNavigationSubItemConfig,
        group: string,
        icon?: DashboardNavigationItemConfig['icon'],
    ) => {
        if (config.searchable === false || !isNavigableUrl(config.url)) {
            return;
        }

        const title = resolveTitle(t, config.titleKey, config.titleDefault);
        const id = `${group}-${config.url}-${title}`;

        results.push({
            id,
            title,
            url: config.url,
            group,
            icon,
            searchValue: buildSearchValue(title, group, config.keywords, config.url),
        });
    };

    platformItems.forEach((item) => {
        const groupTitle = resolveTitle(t, item.titleKey, item.titleDefault);

        if (item.items?.length) {
            item.items.forEach((subItem) => {
                appendItem(subItem, groupTitle, item.icon);
            });
            return;
        }

        appendItem(item, groupTitle, item.icon);
    });

    [...systemItems, ...footerItems.filter((item) => item.searchable !== false)].forEach((item) => {
        const groupTitle = t('sidebar.system');
        appendItem(item, groupTitle, item.icon);
    });

    return results;
};
