import { PermissionScope } from '@/features/roles/roles.types';

type ScopeChecker = (resource: string, action: string, scope: string) => boolean;

export const isDocumentsOwnScopeOnly = (
    hasScope: ScopeChecker,
    isSystemAdmin: boolean,
): boolean => {
    if (isSystemAdmin) {
        return false;
    }
    return (
        hasScope('documents', 'read', PermissionScope.OWN) &&
        !hasScope('documents', 'read', PermissionScope.DEPARTMENT) &&
        !hasScope('documents', 'read', PermissionScope.COMPANY) &&
        !hasScope('documents', 'read', PermissionScope.ALL)
    );
};

export const canUploadDocumentsForOthers = (
    hasScope: ScopeChecker,
    isSystemAdmin: boolean,
): boolean => {
    if (isSystemAdmin) {
        return true;
    }
    return (
        hasScope('documents', 'create', PermissionScope.COMPANY) ||
        hasScope('documents', 'create', PermissionScope.DEPARTMENT) ||
        hasScope('documents', 'create', PermissionScope.ALL)
    );
};

export const canCreateEmployeeDocument = (
    hasPermission: (action: string) => boolean,
    hasScope: ScopeChecker,
    isSystemAdmin: boolean,
): boolean => {
    if (isSystemAdmin) {
        return true;
    }
    if (hasPermission('documents:create')) {
        return true;
    }
    return (
        hasScope('documents', 'create', PermissionScope.OWN) ||
        hasScope('documents', 'create', PermissionScope.DEPARTMENT) ||
        hasScope('documents', 'create', PermissionScope.COMPANY) ||
        hasScope('documents', 'create', PermissionScope.ALL)
    );
};
