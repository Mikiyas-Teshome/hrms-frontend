import { OrganizationUnitType } from './organization.types';

export function findOrganizationUnitById(
    units: OrganizationUnitType[],
    id: string,
): OrganizationUnitType | null {
    for (const unit of units) {
        if (unit.id === id) {
            return unit;
        }
        if (unit.children?.length) {
            const found = findOrganizationUnitById(unit.children, id);
            if (found) {
                return found;
            }
        }
    }
    return null;
}

export type OrganizationUnitOption = {
    id: string;
    name: string;
    label: string;
};

const INDENT = '  ';

export function buildOrganizationUnitOptions(
    units: OrganizationUnitType[],
    depth = 0,
): OrganizationUnitOption[] {
    const options: OrganizationUnitOption[] = [];

    for (const unit of units) {
        if (unit.type === 'GROUP') {
            if (unit.children?.length) {
                options.push(...buildOrganizationUnitOptions(unit.children, depth));
            }
            continue;
        }

        options.push({
            id: unit.id,
            name: unit.name,
            label: `${INDENT.repeat(depth)}${unit.name}`,
        });

        if (unit.children?.length) {
            options.push(...buildOrganizationUnitOptions(unit.children, depth + 1));
        }
    }

    return options;
}

export function buildOrganizationUnitOptionsForCompany(
    hierarchy: OrganizationUnitType[],
    companyOuId: string,
): OrganizationUnitOption[] {
    const company = findOrganizationUnitById(hierarchy, companyOuId);
    if (!company?.children?.length) {
        return [];
    }
    return buildOrganizationUnitOptions(company.children, 0);
}

export function buildCompanyNameByOuIdMap(
    companies: ReadonlyArray<{ id: string; name?: string | null; legalName?: string | null }>,
): Map<string, string> {
    const map = new Map<string, string>();
    for (const company of companies) {
        map.set(company.id, company.name || company.legalName || company.id);
    }
    return map;
}

export function collectOrganizationDepartments(
    units: OrganizationUnitType[],
): Array<{ id: string; name: string }> {
    const departments: Array<{ id: string; name: string }> = [];

    for (const unit of units) {
        if (unit.type === 'DEPARTMENT') {
            departments.push({ id: unit.id, name: unit.name });
        }
        if (unit.children?.length) {
            departments.push(...collectOrganizationDepartments(unit.children));
        }
    }

    return departments;
}

const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function resolveDepartmentDisplayName(
    department: string | null | undefined,
    departmentNameById: ReadonlyMap<string, string>,
    fallback = 'General',
): string {
    const value = department?.trim();
    if (!value || value === 'N/A') {
        return fallback;
    }
    if (UUID_PATTERN.test(value)) {
        return departmentNameById.get(value) ?? fallback;
    }
    return value;
}

export function resolveCompanyLabel(
    ouId: string | null | undefined,
    companyNameByOuId: Map<string, string>,
    fallback?: string,
): string {
    if (!ouId) {
        return fallback?.trim() || '—';
    }
    return companyNameByOuId.get(ouId) ?? (fallback?.trim() || ouId);
}
