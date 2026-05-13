'use client';

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PermissionScope } from '@/features/roles/roles.types';

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
    scope?: PermissionScope;
    onScopeChange?: (scope: PermissionScope) => void;
    className?: string;
}

const PermissionGroup: React.FC<PermissionGroupProps> = ({
    title,
    permissions,
    selectedIds,
    onToggleAll,
    onTogglePermission,
    scope = PermissionScope.ALL,
    onScopeChange,
    className,
}) => {
    const { t } = useTranslation('roles');
    const allChecked =
        permissions.length > 0 && permissions.every((p) => selectedIds.includes(p.id));
    const someChecked = permissions.some((p) => selectedIds.includes(p.id)) && !allChecked;
    const selectedCount = permissions.filter((p) => selectedIds.includes(p.id)).length;

    return (
        <div
            className={cn(
                'border border-border/80 rounded-[12px] overflow-hidden bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_-1px_rgba(0,0,0,0.04)]',
                className,
            )}
        >
            {/* Header */}
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

            {/* Body */}
            <div className="p-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-3">
                    {permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center gap-3">
                            <Checkbox
                                id={permission.id}
                                checked={selectedIds.includes(permission.id)}
                                onCheckedChange={(checked) =>
                                    onTogglePermission(permission.id, !!checked)
                                }
                                className="rounded-[4px] cursor-pointer w-4 h-4border-border shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                            />
                            <label
                                htmlFor={permission.id}
                                className="text-sm text-foreground font-medium leading-none cursor-pointer "
                            >
                                {permission.label}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Permission Scope Section */}
            <div className="px-6 pb-6">
                <div className="flex items-center justify-start gap-8 p-3 px-6 bg-muted/30 border border-border/50 rounded-lg self-stretch overflow-x-auto no-scrollbar">
                    <div className="flex items-center min-w-28.75 shrink-0">
                        <span className="text-sm font-semibold text-foreground">
                            {t('permissionScope')}
                        </span>
                    </div>

                    <div className="flex-1">
                        <RadioGroup 
                            value={scope} 
                            onValueChange={(val) => onScopeChange?.(val as PermissionScope)}
                            className="flex items-center gap-6 sm:gap-10"
                        >
                            {[
                                { id: PermissionScope.ALL, label: t('scopeAll') },
                                { id: PermissionScope.COMPANY, label: t('scopeCompany') },
                                { id: PermissionScope.DEPARTMENT, label: t('scopeDepartment') },
                                { id: PermissionScope.OWN, label: t('scopeOwn') }
                            ].map((option) => (
                                <div key={option.id} className="flex items-center gap-3">
                                    <RadioGroupItem 
                                        value={option.id} 
                                        id={`${title}-${option.id}`}
                                        className="w-4 h-4 border-primary text-primary focus-visible:ring-primary"
                                    />
                                    <label
                                        htmlFor={`${title}-${option.id}`}
                                        className="text-sm font-medium text-foreground/90 cursor-pointer whitespace-nowrap"
                                    >
                                        {option.label}
                                    </label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PermissionGroup;
