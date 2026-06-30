import type { TFunction } from 'i18next';
import { emptyOrgStructureValues } from '@/data/org-structure-defaults';
import type { OrganizationLabelType, OUType } from './organization.types';

const ORG_LEVEL_ORDER: OUType[] = [
    'GROUP',
    'COMPANY',
    'DIVISION',
    'SUB_DIVISION',
    'DEPARTMENT',
];

const ORG_LEVEL_URL: Partial<Record<OUType, string>> = {
    COMPANY: '/dashboard/organization/company',
    DIVISION: '/dashboard/organization/division',
    SUB_DIVISION: '/dashboard/organization/sub-division',
    DEPARTMENT: '/dashboard/organization/department',
};

export type OrganizationSidebarSubItem = {
    title: string;
    url: string;
    module: string;
};

export function getActiveOrganizationLevelTypes(
    nomenclature?: OrganizationLabelType[] | null,
): OUType[] {
    if (!nomenclature?.length) {
        return ORG_LEVEL_ORDER.filter(
            (_, index) =>
                index === 0 || emptyOrgStructureValues.hierarchyLevels[index]?.isActive,
        );
    }

    const activeTypes: OUType[] = [];
    for (const type of ORG_LEVEL_ORDER) {
        if (nomenclature.some((entry) => entry.type === type)) {
            activeTypes.push(type);
        } else {
            break;
        }
    }

    return activeTypes;
}

export function getOrganizationLevelLabel(
    type: OUType,
    nomenclature?: OrganizationLabelType[] | null,
): string {
    const override = nomenclature?.find((entry) => entry.type === type)?.label;
    if (override) {
        return override;
    }

    const defaultLevel = emptyOrgStructureValues.hierarchyLevels.find(
        (level) => level.type === type,
    );
    return defaultLevel?.name ?? type;
}

export function buildOrganizationSidebarSubItems(
    nomenclature: OrganizationLabelType[] | undefined,
    t: TFunction,
): OrganizationSidebarSubItem[] {
    const sidebarLevels = getActiveOrganizationLevelTypes(nomenclature).filter(
        (type) => type !== 'GROUP',
    );

    const items: OrganizationSidebarSubItem[] = [
        {
            title: t('sidebar.organization.hierarchy'),
            url: '/dashboard/organization/hierarchy',
            module: 'org_hierarchy',
        },
    ];

    for (const type of sidebarLevels) {
        const url = ORG_LEVEL_URL[type];
        if (!url) {
            continue;
        }

        items.push({
            title: getOrganizationLevelLabel(type, nomenclature),
            url,
            module: 'org_hierarchy',
        });
    }

    return items;
}
