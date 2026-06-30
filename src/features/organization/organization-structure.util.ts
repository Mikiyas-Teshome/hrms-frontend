import type { OrgStructureValues } from '@/components/onboarding/schemas/org-structure';
import { emptyOrgStructureValues } from '@/data/org-structure-defaults';
import { OUType } from '@/types/domain';
import type { OrganizationLabelType, OrganizationUnitType } from './organization.types';
import {
    getActiveOrganizationLevelTypes,
    getOrganizationLevelLabel,
} from './organization-sidebar.util';

export function buildHierarchyLevelsFromNomenclature(
    nomenclature?: OrganizationLabelType[] | null,
): OrgStructureValues['hierarchyLevels'] {
    if (!nomenclature?.length) {
        return emptyOrgStructureValues.hierarchyLevels;
    }

    const activeTypes = new Set(getActiveOrganizationLevelTypes(nomenclature));

    return emptyOrgStructureValues.hierarchyLevels.map((level, index) => ({
        ...level,
        name: getOrganizationLevelLabel(level.type as OUType, nomenclature),
        isActive: index === 0 ? true : activeTypes.has(level.type as OUType),
    }));
}

export function flattenHierarchyToFormUnits(
    hierarchy: OrganizationUnitType[],
): OrgStructureValues['units'] {
    const root = hierarchy[0];
    if (!root) {
        return [];
    }

    const units: OrgStructureValues['units'] = [];

    const traverse = (nodes: OrganizationUnitType[], parentId: string) => {
        for (const node of nodes) {
            units.push({
                id: node.id,
                name: node.name,
                type: node.type as OUType,
                parentId,
                industry: node.companyProfile?.industry ?? undefined,
                address: node.companyProfile?.address ?? undefined,
                legalName: node.companyProfile?.legalName ?? undefined,
                taxId: node.companyProfile?.taxId ?? undefined,
                registrationNumber: node.companyProfile?.registrationNumber ?? undefined,
                tradeLicenseNumber: node.companyProfile?.tradeLicenseNumber ?? undefined,
                currency: node.companyProfile?.currency ?? undefined,
                timezone: node.companyProfile?.timezone ?? undefined,
                themeColor: node.companyProfile?.themeColor ?? undefined,
                dunsNumber: node.companyProfile?.dunsNumber ?? undefined,
            });

            if (node.children?.length) {
                traverse(node.children, node.id);
            }
        }
    };

    traverse(root.children ?? [], root.id);
    return units;
}
