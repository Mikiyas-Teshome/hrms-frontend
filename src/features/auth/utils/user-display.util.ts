import type { TFunction } from 'i18next';
import type { UserResponse } from '@/features/auth/auth.types';

function humanizeRoleEnum(role: string): string {
  return role
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}

export function getUserDisplayName(user: UserResponse | null | undefined): string {
  if (!user) {
    return 'User';
  }
  const fromFull = user.fullName?.trim();
  if (fromFull) {
    return fromFull;
  }
  const fromParts = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  if (fromParts) {
    return fromParts;
  }
  if (user.email?.trim()) {
    return user.email.trim();
  }
  return 'User';
}

export function getUserInitials(user: UserResponse | null | undefined): string {
  if (!user) {
    return 'U';
  }
  const first = user.firstName?.[0]?.toUpperCase() ?? '';
  const last = user.lastName?.[0]?.toUpperCase() ?? '';
  const combined = `${first}${last}`;
  if (combined) {
    return combined;
  }
  const emailChar = user.email?.[0]?.toUpperCase();
  return emailChar || 'U';
}

export function getUserRoleLabel(
  user: UserResponse | null | undefined,
  t: TFunction,
): string {
  if (!user?.role) {
    return 'Employee';
  }
  if (user.role === 'TENANT_SUPER_ADMIN') {
    const profileName = user.roleProfile?.name?.trim();
    if (profileName) {
      return humanizeRoleEnum(profileName);
    }
    return t('tenantSuperAdmin.roleLabel', 'Tenant Super Admin');
  }
  const profileName = user.roleProfile?.name?.trim();
  if (profileName) {
    return humanizeRoleEnum(profileName);
  }
  return humanizeRoleEnum(user.role);
}
