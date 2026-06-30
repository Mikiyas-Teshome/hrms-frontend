import type { TFunction } from 'i18next';
import type { DashboardNavigationItemConfig } from '@/components/dashboard/layout/dashboard-navigation.types';
import type { OrganizationLabelType, OUType } from './organization.types';
import {
    buildOrganizationSidebarSubItems,
    getOrganizationLevelLabel,
} from './organization-sidebar.util';

const ORG_NAV_LEVEL_TYPES: OUType[] = ['COMPANY', 'DIVISION', 'SUB_DIVISION', 'DEPARTMENT'];

const ORG_NAV_LEVEL_CONFIG: Record<
    OUType,
    { titleKey: string; url: string; keywords: string[] }
> = {
    GROUP: { titleKey: '', url: '', keywords: [] },
    COMPANY: {
        titleKey: 'sidebar.organization.company',
        url: '/dashboard/organization/company',
        keywords: ['organization', 'company'],
    },
    DIVISION: {
        titleKey: 'sidebar.organization.division',
        url: '/dashboard/organization/division',
        keywords: ['organization', 'division'],
    },
    SUB_DIVISION: {
        titleKey: 'sidebar.organization.subDivision',
        url: '/dashboard/organization/sub-division',
        keywords: ['organization', 'sub-division', 'subdivision'],
    },
    DEPARTMENT: {
        titleKey: 'sidebar.organization.department',
        url: '/dashboard/organization/department',
        keywords: ['organization', 'department'],
    },
};

export function applyOrganizationNavigationItems(
    items: DashboardNavigationItemConfig[],
    nomenclature: OrganizationLabelType[] | undefined,
    t: TFunction,
): DashboardNavigationItemConfig[] {
    const sidebarSubItems = buildOrganizationSidebarSubItems(nomenclature, t);

    return items.map((item) => {
        if (item.url !== '/dashboard/organization') {
            return item;
        }

        const hierarchyItem = item.items?.find(
            (subItem) => subItem.url === '/dashboard/organization/hierarchy',
        );

        const dynamicItems = sidebarSubItems
            .filter((subItem) => subItem.url !== '/dashboard/organization/hierarchy')
            .map((subItem) => {
                const levelType = ORG_NAV_LEVEL_TYPES.find(
                    (type) => ORG_NAV_LEVEL_CONFIG[type].url === subItem.url,
                );

                if (!levelType) {
                    return {
                        titleKey: subItem.title,
                        title: subItem.title,
                        url: subItem.url,
                        module: subItem.module,
                        keywords: [subItem.title.toLowerCase()],
                    };
                }

                const config = ORG_NAV_LEVEL_CONFIG[levelType];
                return {
                    titleKey: config.titleKey,
                    title: getOrganizationLevelLabel(levelType, nomenclature),
                    url: config.url,
                    module: 'org_hierarchy',
                    keywords: [...config.keywords, subItem.title.toLowerCase()],
                };
            });

        return {
            ...item,
            items: [
                {
                    titleKey: hierarchyItem?.titleKey ?? 'sidebar.organization.hierarchy',
                    url: '/dashboard/organization/hierarchy',
                    module: 'org_hierarchy',
                    keywords: hierarchyItem?.keywords ?? [
                        'organization',
                        'hierarchy',
                        'structure',
                    ],
                },
                ...dynamicItems,
            ],
        };
    });
}
