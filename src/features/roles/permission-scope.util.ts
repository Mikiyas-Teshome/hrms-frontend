import { PermissionScope } from './roles.types';

export const SCOPE_PRIORITY: PermissionScope[] = [
    PermissionScope.OWN,
    PermissionScope.DEPARTMENT,
    PermissionScope.COMPANY,
    PermissionScope.ALL,
];

const SCOPE_BY_KEY: Record<string, PermissionScope> = {
    own: PermissionScope.OWN,
    department: PermissionScope.DEPARTMENT,
    company: PermissionScope.COMPANY,
    all: PermissionScope.ALL,
    OWN: PermissionScope.OWN,
    DEPARTMENT: PermissionScope.DEPARTMENT,
    COMPANY: PermissionScope.COMPANY,
    ALL: PermissionScope.ALL,
};

export function scopeRank(scope: PermissionScope | string): number {
    const normalized = normalizePermissionScope(scope);
    if (!normalized) return -1;
    return SCOPE_PRIORITY.indexOf(normalized);
}

export function normalizePermissionScope(scope?: string | null): PermissionScope | null {
    if (!scope) return null;
    const trimmed = scope.trim();
    return SCOPE_BY_KEY[trimmed] ?? SCOPE_BY_KEY[trimmed.toLowerCase()] ?? null;
}

export function capPermissionScope(
    requested: PermissionScope,
    maxScope: PermissionScope | null | undefined,
): PermissionScope {
    if (!maxScope) return requested;
    return scopeRank(requested) > scopeRank(maxScope) ? maxScope : requested;
}

export function buildCallerScopeByAction(
    grants: Array<{ scope?: string | null; permission?: { action?: string | null } | null }>,
): Map<string, PermissionScope> {
    const scopeByAction = new Map<string, PermissionScope>();
    for (const grant of grants) {
        const action = grant.permission?.action;
        const scope = normalizePermissionScope(grant.scope);
        if (!action || !scope) continue;
        const existing = scopeByAction.get(action);
        if (!existing || scopeRank(scope) > scopeRank(existing)) {
            scopeByAction.set(action, scope);
        }
    }
    return scopeByAction;
}
