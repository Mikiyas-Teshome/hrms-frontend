'use client';

import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function usePermissions() {
    const { user, permissionsMap } = useAuth();

    const isSystemAdmin = user?.role === 'ADMIN' || user?.role === 'SYSTEM_ADMIN';
    const isTenantSuperAdmin = user?.role === 'TENANT_SUPER_ADMIN';

    const hasPermission = useCallback(
        (action: string | string[]): boolean => {
            if (isSystemAdmin) return true;
            if (!permissionsMap) return false;

            // Wildcard: all:manage grants everything
            if (permissionsMap?.['all']?.['manage']) return true;

            // Support "resource:action" format
            const actionsToCheck = Array.isArray(action) ? action : [action];
            return actionsToCheck.some((a) => {
                const [resource, act] = a.split(':');
                if (!resource || !act) return false;
                
                // New structure: permissionsMap[resource][action]
                return !!permissionsMap?.[resource]?.[act] || !!permissionsMap?.[resource]?.['manage'];
            });
        },
        [isSystemAdmin, permissionsMap],
    );

    const hasScope = useCallback(
        (resource: string, action: string, scope: string): boolean => {
            if (isSystemAdmin) return true;
            if (!permissionsMap) return false;
            
            const normalizedScope = scope.toUpperCase();
            const actionScope = permissionsMap[resource]?.[action];
            const manageScope = permissionsMap[resource]?.['manage'];
            return (
                actionScope?.toUpperCase() === normalizedScope ||
                manageScope?.toUpperCase() === normalizedScope
            );
        },
        [isSystemAdmin, permissionsMap]
    );

    return {
        permissionsMap,
        roleName: user?.role,
        isSystemAdmin,
        isTenantSuperAdmin,
        hasPermission,
        hasScope,
    };
}
