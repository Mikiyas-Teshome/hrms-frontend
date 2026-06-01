import { OrganizationUnitType } from './organization.types';

export function applyRolledUpEmployeeCounts(
    units: OrganizationUnitType[],
): OrganizationUnitType[] {
    return units.map(rollupOrganizationUnitEmployeeCount);
}

function rollupOrganizationUnitEmployeeCount(
    unit: OrganizationUnitType,
): OrganizationUnitType {
    const children = (unit.children ?? []).map(rollupOrganizationUnitEmployeeCount);
    const directCount = unit.employeeCount ?? 0;
    const descendantCount = children.reduce(
        (sum, child) => sum + (child.employeeCount ?? 0),
        0,
    );

    return {
        ...unit,
        children,
        employeeCount: directCount + descendantCount,
    };
}
