import type { OrganizationUnitType } from './organization.types';

const isChild = (parent: OrganizationUnitType, childId: string): boolean =>
    (parent.children || []).some((c) => c.id === childId || isChild(c, childId));

export function findCompanyForUnit(
    unitId: string,
    nodes: OrganizationUnitType[],
): OrganizationUnitType | null {
    for (const node of nodes) {
        if (node.type === 'COMPANY') {
            if (node.id === unitId) return node;
            if (isChild(node, unitId)) return node;
        }
        if (node.children) {
            const found = findCompanyForUnit(unitId, node.children);
            if (found) return found;
        }
    }
    return null;
}
