import { hasPermission } from '@/features/auth/utils/permissions';
import { AppPermission, PermissionScope, PermissionsMap } from './roles.types';
import {
    SCOPE_PRIORITY,
    capPermissionScope,
    normalizePermissionScope,
    scopeRank,
} from './permission-scope.util';

export function getCallerScopeForAction(
    permissionsMap: PermissionsMap | null | undefined,
    action: string,
    isSystemAdmin = false,
): PermissionScope | null {
    if (isSystemAdmin) return PermissionScope.ALL;
    if (!permissionsMap || !action) return null;

    if (permissionsMap['all']?.['manage']) {
        return normalizePermissionScope(permissionsMap['all']['manage']) ?? PermissionScope.ALL;
    }

    const colonIndex = action.indexOf(':');
    if (colonIndex === -1) return null;

    const resource = action.slice(0, colonIndex);
    const act = action.slice(colonIndex + 1);
    const scopeValue = permissionsMap[resource]?.[act] ?? permissionsMap[resource]?.['manage'];

    return normalizePermissionScope(scopeValue);
}

export function canGrantAction(
    permissionsMap: PermissionsMap | null | undefined,
    action: string,
    isSystemAdmin = false,
): boolean {
    if (isSystemAdmin) return true;
    return getCallerScopeForAction(permissionsMap, action, isSystemAdmin) !== null;
}

export function filterGrantablePermissions(
    permissions: AppPermission[],
    permissionsMap: PermissionsMap | null | undefined,
    isSystemAdmin = false,
): AppPermission[] {
    return permissions.filter((permission) =>
        canGrantAction(permissionsMap, permission.action, isSystemAdmin),
    );
}

export function getAllowedGrantScopesForAction(
    permissionsMap: PermissionsMap | null | undefined,
    action: string,
    isSystemAdmin = false,
): PermissionScope[] {
    const maxScope = getCallerScopeForAction(permissionsMap, action, isSystemAdmin);
    if (!maxScope) return [];
    return SCOPE_PRIORITY.filter((scope) => scopeRank(scope) <= scopeRank(maxScope));
}

export function getAllowedGrantScopesForModule(
    modulePermissions: Array<{ action: string }>,
    permissionsMap: PermissionsMap | null | undefined,
    isSystemAdmin = false,
): PermissionScope[] {
    if (isSystemAdmin) return [...SCOPE_PRIORITY];
    if (modulePermissions.length === 0) return [];

    let allowed = [...SCOPE_PRIORITY];
    for (const permission of modulePermissions) {
        const actionScopes = getAllowedGrantScopesForAction(
            permissionsMap,
            permission.action,
            isSystemAdmin,
        );
        if (actionScopes.length === 0) return [];
        allowed = allowed.filter((scope) => actionScopes.includes(scope));
    }

    return allowed;
}

export function canGrantAnyPermission(
    permissionsMap: PermissionsMap | null | undefined,
    isSystemAdmin = false,
): boolean {
    if (isSystemAdmin) return true;
    if (!permissionsMap) return false;
    if (permissionsMap['all']?.['manage']) return true;
    return Object.values(permissionsMap).some((actions) =>
        Object.values(actions).some((scope) => Boolean(scope)),
    );
}

export function canCreateRoles(permissionsMap: PermissionsMap | null | undefined, isSystemAdmin = false): boolean {
    return isSystemAdmin || hasPermission(permissionsMap, 'roles', 'create');
}

export function canUpdateRoles(permissionsMap: PermissionsMap | null | undefined, isSystemAdmin = false): boolean {
    return isSystemAdmin || hasPermission(permissionsMap, 'roles', 'update');
}

export function canDeleteRoles(permissionsMap: PermissionsMap | null | undefined, isSystemAdmin = false): boolean {
    return isSystemAdmin || hasPermission(permissionsMap, 'roles', 'delete');
}

export function capGrantScopeForAction(
    permissionsMap: PermissionsMap | null | undefined,
    action: string,
    requested: PermissionScope,
    isSystemAdmin = false,
): PermissionScope {
    const maxScope = getCallerScopeForAction(permissionsMap, action, isSystemAdmin);
    return capPermissionScope(requested, maxScope);
}
