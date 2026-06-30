import type { OrganizationUnitType } from '@/features/organization/organization.types';

export function collectDepartmentsUnderCompany(
  hierarchy: OrganizationUnitType[],
  companyOuId: string,
): { id: string; name: string }[] {
  const result: { id: string; name: string }[] = [];

  const walk = (nodes: OrganizationUnitType[], underCompany: boolean) => {
    for (const node of nodes) {
      const isCompany = node.id === companyOuId;
      const scoped = underCompany || isCompany;
      if (scoped && node.type === 'DEPARTMENT') {
        result.push({ id: node.id, name: node.name });
      }
      if (node.children?.length) {
        walk(node.children, scoped);
      }
    }
  };

  walk(hierarchy, false);
  return result;
}
