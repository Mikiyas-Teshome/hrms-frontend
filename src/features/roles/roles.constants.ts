export const HIDDEN_ROLE_NAMES = new Set(['SYSTEM_ADMIN', 'TENANT_SUPER_ADMIN']);

export function isVisibleRoleName(name: string): boolean {
  return !HIDDEN_ROLE_NAMES.has(name);
}
