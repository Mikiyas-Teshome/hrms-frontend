import type { AppPermission } from './roles.types';

const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function buildPermissionIdLookups(permissions: AppPermission[]) {
    const permissionIdByAction = new Map<string, string>();
    const knownPermissionIds = new Set<string>();

    for (const permission of permissions) {
        knownPermissionIds.add(permission.id);
        if (permission.action && !permissionIdByAction.has(permission.action)) {
            permissionIdByAction.set(permission.action, permission.id);
        }
    }

    return { permissionIdByAction, knownPermissionIds };
}

export function resolveCatalogPermissionId(
    permissionId: string | undefined,
    action: string | undefined,
    permissionIdByAction: Map<string, string>,
): string | null {
    if (!permissionId && !action) {
        return null;
    }

    if (permissionId && UUID_PATTERN.test(permissionId)) {
        return permissionId;
    }

    const actionKey = action ?? permissionId;
    if (actionKey && permissionIdByAction.has(actionKey)) {
        return permissionIdByAction.get(actionKey) ?? null;
    }

    return null;
}
