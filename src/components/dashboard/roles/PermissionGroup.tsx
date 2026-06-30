'use client';

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PermissionScope } from '@/features/roles/roles.types';
import { capPermissionScope, SCOPE_PRIORITY } from '@/features/roles/permission-scope.util';

export const PERMISSION_SCOPE_DISPLAY_ORDER: PermissionScope[] = [
    PermissionScope.ALL,
    PermissionScope.COMPANY,
    PermissionScope.DEPARTMENT,
    PermissionScope.OWN,
];

export interface Permission {
    id: string;
    label: string;
}

interface PermissionGroupProps {
    title: string;
    permissions: Permission[];
    selectedIds: string[];
    onToggleAll: (checked: boolean) => void;
    onTogglePermission: (id: string, checked: boolean) => void;
    permissionScopes?: Record<string, PermissionScope>;
    defaultScope?: PermissionScope;
    resolveAllowedScopes?: (permissionId: string) => PermissionScope[];
    onPermissionScopeChange?: (permissionId: string, scope: PermissionScope) => void;
    className?: string;
}

const PermissionGroup: React.FC<PermissionGroupProps> = ({
    title,
    permissions,
    selectedIds,
    onToggleAll,
    onTogglePermission,
    permissionScopes = {},
    defaultScope = PermissionScope.COMPANY,
    resolveAllowedScopes,
    onPermissionScopeChange,
    className,
}) => {
    const { t } = useTranslation('roles');
    const scopeLabels: Record<PermissionScope, string> = {
        [PermissionScope.ALL]: t('scopeAll'),
        [PermissionScope.COMPANY]: t('scopeCompany'),
        [PermissionScope.DEPARTMENT]: t('scopeDepartment'),
        [PermissionScope.OWN]: t('scopeOwn'),
    };
    const allChecked =
        permissions.length > 0 && permissions.every((p) => selectedIds.includes(p.id));
    const someChecked = permissions.some((p) => selectedIds.includes(p.id)) && !allChecked;
    const selectedCount = permissions.filter((p) => selectedIds.includes(p.id)).length;

    const scopeOptionsForPermission = (permissionId: string) => {
        const allowedScopes =
            resolveAllowedScopes?.(permissionId) ?? [...PERMISSION_SCOPE_DISPLAY_ORDER];
        return PERMISSION_SCOPE_DISPLAY_ORDER.filter((scope) => allowedScopes.includes(scope)).map(
            (scope) => ({
                id: scope,
                label: scopeLabels[scope],
            }),
        );
    };

    const maxScopeForPermission = (permissionId: string) => {
        const allowedScopes =
            resolveAllowedScopes?.(permissionId) ?? [...PERMISSION_SCOPE_DISPLAY_ORDER];
        return allowedScopes.reduce<PermissionScope | null>((maxScope, scope) => {
            if (!maxScope || SCOPE_PRIORITY.indexOf(scope) > SCOPE_PRIORITY.indexOf(maxScope)) {
                return scope;
            }
            return maxScope;
        }, null);
    };

    return (
        <div
            className={cn(
                'border border-border/80 rounded-[12px] overflow-hidden bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_-1px_rgba(0,0,0,0.04)]',
                className,
            )}
        >
            <div className="flex items-center justify-between px-6 py-4 bg-muted/50 border-b border-border/80">
                <div className="flex items-center gap-3">
                    <Checkbox
                        id={`group-${title}`}
                        checked={allChecked || (someChecked ? 'indeterminate' : false)}
                        onCheckedChange={(checked) => onToggleAll(!!checked)}
                        className="rounded-[4px] cursor-pointer w-4 h-4 border-border shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                    />
                    <label
                        htmlFor={`group-${title}`}
                        className="text-sm font-semibold text-foreground cursor-pointer "
                    >
                        {title}
                    </label>
                </div>
                <span className="text-sm text-muted-foreground">
                    {t('selectedOf', { selected: selectedCount, total: permissions.length })}
                </span>
            </div>

            <div className="p-6 space-y-4">
                {permissions.map((permission) => {
                    const isSelected = selectedIds.includes(permission.id);
                    const maxScope = maxScopeForPermission(permission.id) ?? PermissionScope.ALL;
                    const scopeOptions = scopeOptionsForPermission(permission.id);
                    const currentScope = capPermissionScope(
                        permissionScopes[permission.id] ?? defaultScope,
                        maxScope,
                    );

                    return (
                        <div
                            key={permission.id}
                            className={cn(
                                'rounded-lg border border-border/50 overflow-hidden',
                                isSelected ? 'bg-muted/20' : 'bg-transparent',
                            )}
                        >
                            <div className="flex items-center gap-3 px-4 py-3">
                                <Checkbox
                                    id={permission.id}
                                    checked={isSelected}
                                    onCheckedChange={(checked) =>
                                        onTogglePermission(permission.id, !!checked)
                                    }
                                    className="rounded-[4px] cursor-pointer w-4 h-4 border-border shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                                />
                                <label
                                    htmlFor={permission.id}
                                    className="text-sm text-foreground font-medium leading-none cursor-pointer "
                                >
                                    {permission.label}
                                </label>
                            </div>

                            {isSelected && onPermissionScopeChange && scopeOptions.length > 0 && (
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 px-4 pb-4 pt-0 ml-7 overflow-x-auto no-scrollbar">
                                    <span className="text-xs font-semibold text-foreground shrink-0">
                                        {t('permissionScope')}
                                    </span>
                                    <RadioGroup
                                        value={currentScope}
                                        onValueChange={(value) =>
                                            onPermissionScopeChange(
                                                permission.id,
                                                capPermissionScope(value as PermissionScope, maxScope),
                                            )
                                        }
                                        className="flex flex-wrap items-center gap-4 sm:gap-6"
                                    >
                                        {scopeOptions.map((option) => (
                                            <div key={option.id} className="flex items-center gap-2">
                                                <RadioGroupItem
                                                    value={option.id}
                                                    id={`${permission.id}-${option.id}`}
                                                    className="w-4 h-4 border-primary text-primary focus-visible:ring-primary"
                                                />
                                                <label
                                                    htmlFor={`${permission.id}-${option.id}`}
                                                    className="text-sm font-medium text-foreground/90 cursor-pointer whitespace-nowrap"
                                                >
                                                    {option.label}
                                                </label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PermissionGroup;
