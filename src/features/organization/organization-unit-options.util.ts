import { OrganizationUnitType } from './organization.types';

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
