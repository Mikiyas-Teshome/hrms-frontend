export function formatEmployeeRoleName(roleName?: string | null): string {
  if (!roleName?.trim()) {
    return '—';
  }

  return roleName
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}
