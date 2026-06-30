import type { UserResponse } from '@/features/auth/auth.types';
import type { Role } from '@/features/roles/roles.types';

function hasResolvedPermissions(roleProfile?: Role | null): boolean {
    if (!roleProfile?.permissionsMap) {
        return false;
    }

    return Object.keys(roleProfile.permissionsMap).length > 0;
}

export function mergeAuthProfileUpdate(
    previous: UserResponse | undefined,
    next: UserResponse,
): UserResponse {
    if (!previous?.roleProfile) {
        return next;
    }

    const nextRole = next.roleProfile;
    if (!nextRole || hasResolvedPermissions(nextRole)) {
        return next;
    }

    const previousRole = previous.roleProfile;

    return {
        ...next,
        roleProfile: {
            ...previousRole,
            ...nextRole,
            permissionsMap: previousRole.permissionsMap ?? nextRole.permissionsMap,
            permissionGrants: previousRole.permissionGrants ?? nextRole.permissionGrants,
            permissions: previousRole.permissions ?? nextRole.permissions,
        },
    };
}
