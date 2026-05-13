type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

const TEAM_TITLE_KEYS: Record<string, string> = {
  'Design operations': 'teams.designOperations',
  Development: 'teams.development',
};

const DEPARTMENT_KEYS: Record<string, string> = {
  Engineering: 'departments.engineering',
  Sales: 'departments.sales',
  Marketing: 'departments.marketing',
  Design: 'departments.design',
};

const ROLE_KEYS: Record<string, string> = {
  Designer: 'roles.designer',
  Developer: 'roles.developer',
  'Sales manager': 'roles.salesManager',
  Sales: 'roles.sales',
  Manager: 'roles.manager',
  Member: 'roles.member',
};

function translateLabel(
  t: TranslateFn,
  value: string,
  mapping: Record<string, string>,
): string {
  const translationKey = mapping[value];
  return translationKey ? t(translationKey) : value;
}

export function translateTeamTitle(t: TranslateFn, value: string): string {
  return translateLabel(t, value, TEAM_TITLE_KEYS);
}

export function translateDepartment(t: TranslateFn, value: string): string {
  return translateLabel(t, value, DEPARTMENT_KEYS);
}

export function translateRole(t: TranslateFn, value: string): string {
  return translateLabel(t, value, ROLE_KEYS);
}