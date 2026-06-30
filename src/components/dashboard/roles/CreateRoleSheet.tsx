'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
    SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Loader2, Info } from 'lucide-react';
import PermissionGroup, { PERMISSION_SCOPE_DISPLAY_ORDER } from './PermissionGroup';
import { RoleFormFields } from './RoleFormFields';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next';
import { Role, PermissionScope } from '@/features/roles/roles.types';
import {
    createRole,
    updateRole,
    fetchPermissions,
    fetchProfileWithPermissionSets,
} from '@/features/roles/roles.actions';
import {
    buildCallerScopeByAction,
    capPermissionScope,
    normalizePermissionScope,
    scopeRank,
} from '@/features/roles/permission-scope.util';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useMemo, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { roleSchema, type RoleFormValues } from '@/features/roles/schemas/role.schema';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { filterGrantablePermissions, getAllowedGrantScopesForAction } from '@/features/roles/grantable-permissions.util';

interface CreateRoleSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    role?: Role | null;
    onSuccess?: () => void;
}

const CreateRoleSheet: React.FC<CreateRoleSheetProps> = ({
    open,
    onOpenChange,
    role,
    onSuccess,
}) => {
    const { t } = useTranslation('roles');
    const { toast } = useToast();
    const { user, permissionsMap } = useAuth();
    const { hasPermission, isSystemAdmin } = usePermissions();
    const canCreateRole = hasPermission('roles:create');
    const canUpdateRole = hasPermission('roles:update');
    const isEditing = Boolean(role?.id);
    const canSaveRole = isEditing ? canUpdateRole : canCreateRole;
    const form = useForm<RoleFormValues>({
        resolver: zodResolver(roleSchema),
        defaultValues: {
            name: '',
            description: '',
            permissions: [],
            scope: PermissionScope.COMPANY,
            permissionScopes: {},
        },
    });

    const [permissionModules, setPermissionModules] = useState<
        {
            id: string;
            name: string;
            permissions: { id: string; label: string; action: string }[];
        }[]
    >([]);
    const [callerScopeByAction, setCallerScopeByAction] = useState<Map<string, PermissionScope>>(
        new Map(),
    );
    const [callerMaxGrantScope, setCallerMaxGrantScope] = useState<PermissionScope>(
        PermissionScope.COMPANY,
    );
    useEffect(() => {
        const loadPermissions = async () => {
            try {
                const perms = await fetchPermissions();
                const grantablePerms = filterGrantablePermissions(
                    perms,
                    permissionsMap,
                    isSystemAdmin,
                );
                const grouped = grantablePerms.reduce(
                    (acc, p) => {
                        const actionStr = p.action || '';
                        let verb = '';
                        let resource = '';

                        if (actionStr.includes(':')) {
                            const parts = actionStr.split(':');
                            resource = parts[0];
                            verb = parts.slice(1).join(':') || 'manage';
                        } else if (actionStr.includes('_')) {
                            const parts = actionStr.split('_');
                            resource = parts[0];
                            verb = parts.slice(1).join('_') || 'manage';
                        } else if (actionStr.includes('-')) {
                            const parts = actionStr.split('-');
                            resource = parts[0];
                            verb = parts.slice(1).join('-') || 'manage';
                        } else {
                            resource = actionStr || 'general';
                            verb = 'manage';
                        }

                        const formatTitleCase = (s: string) =>
                            s
                                .replace(/[_-]/g, ' ')
                                .split(' ')
                                .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                                .join(' ');

                        const moduleName = formatTitleCase(resource);
                        const verbFormatted =
                            verb.toLowerCase() === 'read'
                                ? 'View'
                                : verb.charAt(0).toUpperCase() + verb.slice(1).toLowerCase();
                        const labelName = `${verbFormatted} ${formatTitleCase(resource)}`;
                        const groupId = resource.toLowerCase().replace(/\s/g, '');

                        let group = acc.find((g) => g.id === groupId);
                        if (!group) {
                            group = { id: groupId, name: moduleName, permissions: [] };
                            acc.push(group);
                        }
                        group.permissions.push({
                            id: p.id,
                            label: labelName,
                            action: actionStr,
                        });
                        return acc;
                    },
                    [] as {
                        id: string;
                        name: string;
                        permissions: { id: string; label: string; action: string }[];
                    }[],
                );

                setPermissionModules(grouped);
            } catch (error) {
                console.error('Failed to load permissions', error);
            }
        };

        if (open) {
            loadPermissions();
        }
    }, [open, permissionsMap, isSystemAdmin]);

    useEffect(() => {
        const loadCallerScopes = async () => {
            try {
                const response = await fetchProfileWithPermissionSets();
                const grants = response?.profileWithPermissionSets?.user?.roleProfile?.permissionGrants ?? [];
                const scopeByAction = buildCallerScopeByAction(grants);
                setCallerScopeByAction(scopeByAction);

                const createScope =
                    scopeByAction.get('roles:create') ??
                    scopeByAction.get('roles:update') ??
                    PermissionScope.COMPANY;
                setCallerMaxGrantScope(createScope);

                if (!role) {
                    form.setValue('scope', createScope, { shouldDirty: false });
                }
            } catch (error) {
                console.error('Failed to load caller permission scopes', error);
                setCallerScopeByAction(new Map());
                setCallerMaxGrantScope(PermissionScope.COMPANY);
            }
        };

        if (open) {
            loadCallerScopes();
        }
    }, [open, role, form]);

    useEffect(() => {
        if (open) {
            if (role) {
                const permissionIds =
                    (role.permissionGrants
                        ?.map((pg) => pg.permissionId || pg.permission?.id)
                        .filter(Boolean) as string[]) ||
                    role.permissions?.map((p) => p.id) ||
                    [];

                const permissionScopes: Record<string, PermissionScope> = {};
                role.permissionGrants?.forEach((pg) => {
                    const permissionId = pg.permissionId || pg.permission?.id;
                    const normalizedScope = normalizePermissionScope(pg.scope);
                    if (permissionId && normalizedScope) {
                        permissionScopes[permissionId] = normalizedScope;
                    }
                });

                form.reset({
                    name: role.name,
                    description: role.description || '',
                    permissions: permissionIds,
                    scope:
                        normalizePermissionScope((role as { scope?: string }).scope) ||
                        callerMaxGrantScope,
                    permissionScopes,
                });
            } else {
                form.reset({
                    name: '',
                    description: '',
                    permissions: [],
                    scope: callerMaxGrantScope,
                    permissionScopes: {},
                });
            }
        }
    }, [open, role, form, callerMaxGrantScope]);

    const resolveCallerScopeForPermission = (permissionId: string): PermissionScope | null => {
        const permission = permissionModules
            .flatMap((module) => module.permissions)
            .find((entry) => entry.id === permissionId);
        if (!permission?.action) return null;
        return callerScopeByAction.get(permission.action) ?? null;
    };

    const resolveModuleMaxScope = (moduleId: string): PermissionScope => {
        const permModule = permissionModules.find((module) => module.id === moduleId);
        if (!permModule) return callerMaxGrantScope;

        let maxScope: PermissionScope | null = null;
        for (const permission of permModule.permissions) {
            const callerScope = resolveCallerScopeForPermission(permission.id);
            if (!callerScope) continue;
            if (!maxScope || scopeRank(callerScope) > scopeRank(maxScope)) {
                maxScope = callerScope;
            }
        }

        return maxScope ?? callerMaxGrantScope;
    };

    const grantablePermissionIds = useMemo(
        () => new Set(permissionModules.flatMap((module) => module.permissions.map((p) => p.id))),
        [permissionModules],
    );

    const selectedPermissions = form.watch('permissions');
    const totalPermissions = permissionModules.reduce(
        (acc, mod) => acc + mod.permissions.length,
        0,
    );
    const hasGrantablePermissions = totalPermissions > 0;
    const isSubmitDisabled =
        !canSaveRole ||
        form.formState.isSubmitting ||
        (!isEditing && !hasGrantablePermissions);
    const allPermissionsChecked =
        selectedPermissions.length === totalPermissions && totalPermissions > 0;
    const somePermissionsChecked = selectedPermissions.length > 0 && !allPermissionsChecked;

    const resolveDefaultScopeForPermission = (permissionId: string): PermissionScope => {
        const callerScope = resolveCallerScopeForPermission(permissionId);
        return capPermissionScope(
            form.getValues('scope') || callerMaxGrantScope,
            callerScope ?? callerMaxGrantScope,
        );
    };

    const ensurePermissionScopes = (permissionIds: string[]) => {
        const currentScopes = form.getValues('permissionScopes') || {};
        const nextScopes = { ...currentScopes };
        let changed = false;

        permissionIds.forEach((permissionId) => {
            if (!nextScopes[permissionId]) {
                nextScopes[permissionId] = resolveDefaultScopeForPermission(permissionId);
                changed = true;
            }
        });

        if (changed) {
            form.setValue('permissionScopes', nextScopes, {
                shouldDirty: true,
                shouldValidate: true,
            });
        }
    };

    const handleToggleModule = (moduleId: string, checked: boolean) => {
        const permModule = permissionModules.find((m) => m.id === moduleId);
        if (!permModule) return;

        const modulePermIds = permModule.permissions.map((p) => p.id);
        const currentSelected = form.getValues('permissions');

        if (checked) {
            form.setValue(
                'permissions',
                Array.from(new Set([...currentSelected, ...modulePermIds])),
                {
                    shouldValidate: true,
                    shouldDirty: true,
                },
            );
            ensurePermissionScopes(modulePermIds);
        } else {
            form.setValue(
                'permissions',
                currentSelected.filter((id) => !modulePermIds.includes(id)),
                { shouldValidate: true, shouldDirty: true },
            );
        }
    };

    const handleTogglePermission = (id: string, checked: boolean) => {
        const currentSelected = form.getValues('permissions');
        if (checked) {
            form.setValue('permissions', [...currentSelected, id], {
                shouldValidate: true,
                shouldDirty: true,
            });
            ensurePermissionScopes([id]);
        } else {
            form.setValue(
                'permissions',
                currentSelected.filter((pId) => pId !== id),
                { shouldValidate: true, shouldDirty: true },
            );
        }
    };

    const handleToggleAll = (checked: boolean) => {
        if (checked) {
            const allIds = permissionModules.flatMap((m) => m.permissions.map((p) => p.id));
            form.setValue('permissions', allIds, { shouldValidate: true, shouldDirty: true });
            ensurePermissionScopes(allIds);
        } else {
            form.setValue('permissions', [], { shouldValidate: true, shouldDirty: true });
        }
    };

    const onSubmit = async (data: RoleFormValues) => {
        try {
            if (role && !role.id) {
                throw new Error('Role ID is missing');
            }

            const visiblePermissionGrants = data.permissions
                .filter((permissionId) => grantablePermissionIds.has(permissionId))
                .map((permissionId) => {
                    const permission = permissionModules
                        .flatMap((module) => module.permissions)
                        .find((entry) => entry.id === permissionId);
                    const requestedScope =
                        data.permissionScopes?.[permissionId] ||
                        data.scope ||
                        callerMaxGrantScope;
                    const callerScope = permission?.action
                        ? getAllowedGrantScopesForAction(
                              permissionsMap,
                              permission.action,
                              isSystemAdmin,
                          ).at(-1) ?? callerMaxGrantScope
                        : resolveCallerScopeForPermission(permissionId) ?? callerMaxGrantScope;
                    const scope = capPermissionScope(requestedScope, callerScope);
                    return { permissionId, scope };
                });

            const preservedPermissionGrants =
                role?.permissionGrants
                    ?.filter((grant) => {
                        const permissionId = grant.permissionId || grant.permission?.id;
                        return permissionId && !grantablePermissionIds.has(permissionId);
                    })
                    .map((grant) => ({
                        permissionId: grant.permissionId || grant.permission?.id || '',
                        scope:
                            normalizePermissionScope(grant.scope) || PermissionScope.COMPANY,
                    }))
                    .filter((grant) => grant.permissionId) || [];

            const permissionGrants = [...preservedPermissionGrants, ...visiblePermissionGrants];

            const result = await (role && role.id
                ? updateRole(role.id, {
                      name: data.name,
                      description: data.description,
                      permissionGrants,
                  })
                : createRole({
                      name: data.name,
                      description: data.description || '',
                      companyId: user?.companyId || '',
                      permissionGrants,
                  }));

            if (!result.success) throw new Error(result.error);

            toast({
                title: role ? t('updateSuccess') : t('createSuccess'),
                description: role ? t('updateSuccessDesc') : t('createSuccessDesc'),
                variant: 'success',
            });

            onSuccess?.();
            onOpenChange(false);
            form.reset();
        } catch (error: any) {
            console.error('Failed to save role:', error);
            toast({
                title: t('saveError'),
                description: error.message || t('saveErrorDesc'),
                variant: 'destructive',
            });
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                showCloseButton={false}
                className="sm:max-w-200 px-10 py-6 gap-6 flex flex-col h-full border-0 shadow-2xl bg-background"
            >
                <SheetHeader className="flex flex-row items-center justify-between">
                    <SheetTitle className="text-2xl font-bold text-foreground">
                        {role ? t('editRole') : t('addRole')}
                    </SheetTitle>
                    <SheetClose className="text-foreground/80 hover:text-foreground transition-colors rounded-lg cursor-pointer">
                        <X className="h-5 w-5" strokeWidth={1.33} />
                        <span className="sr-only">{t('cancel')}</span>
                    </SheetClose>
                </SheetHeader>
                <Separator />
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    <Form {...form}>
                        <form
                            id="role-form"
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-8"
                        >
                            <RoleFormFields form={form} />

                            <section className="space-y-8">
                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex gap-3">
                                    <div className="bg-blue-500/20 rounded-full h-fit p-1">
                                        <Info className="text-blue-500 h-4 w-4" />
                                    </div>
                                    <p className="text-blue-700 dark:text-blue-300 text-sm font-medium leading-relaxed">
                                        {t('scopeInfo')}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <h3 className="text-[18px] font-bold text-foreground ">
                                        {t('managePermissions')}
                                    </h3>
                                    <p className="text-sm text-muted-foreground ">
                                        {t('managePermissionsDesc')}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between px-6 py-4 bg-muted/30 border border-border/80 rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_-1px_rgba(0,0,0,0.04)]">
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            id="select-all-global"
                                            checked={
                                                allPermissionsChecked ||
                                                (somePermissionsChecked ? 'indeterminate' : false)
                                            }
                                            onCheckedChange={(checked) =>
                                                handleToggleAll(!!checked)
                                            }
                                            className="rounded-lg border-border shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                                        />
                                        <label
                                            htmlFor="select-all-global"
                                            className="text-sm font-semibold text-foreground cursor-pointer "
                                        >
                                            {t('selectAll')}
                                        </label>
                                    </div>
                                    <span className="text-sm text-muted-foreground ">
                                        {t('selectedOf', {
                                            selected: selectedPermissions.length,
                                            total: totalPermissions,
                                        })}
                                    </span>
                                </div>

                                <div className="space-y-6">
                                    {permissionModules.map((permModule) => (
                                        <PermissionGroup
                                            key={permModule.id}
                                            title={permModule.name}
                                            permissions={permModule.permissions}
                                            selectedIds={selectedPermissions}
                                            onToggleAll={(checked) =>
                                                handleToggleModule(permModule.id, checked)
                                            }
                                            onTogglePermission={handleTogglePermission}
                                            permissionScopes={form.watch('permissionScopes') || {}}
                                            defaultScope={capPermissionScope(
                                                form.watch('scope') || callerMaxGrantScope,
                                                resolveModuleMaxScope(permModule.id),
                                            )}
                                            resolveAllowedScopes={(permissionId) => {
                                                const permission = permModule.permissions.find(
                                                    (entry) => entry.id === permissionId,
                                                );
                                                if (!permission?.action) {
                                                    return [...PERMISSION_SCOPE_DISPLAY_ORDER];
                                                }
                                                return getAllowedGrantScopesForAction(
                                                    permissionsMap,
                                                    permission.action,
                                                    isSystemAdmin,
                                                );
                                            }}
                                            onPermissionScopeChange={(permissionId, scope) => {
                                                const permission = permModule.permissions.find(
                                                    (entry) => entry.id === permissionId,
                                                );
                                                const callerScope = permission?.action
                                                    ? getAllowedGrantScopesForAction(
                                                          permissionsMap,
                                                          permission.action,
                                                          isSystemAdmin,
                                                      ).at(-1) ?? callerMaxGrantScope
                                                    : callerMaxGrantScope;
                                                const cappedScope = capPermissionScope(scope, callerScope);
                                                const currentScopes =
                                                    form.getValues('permissionScopes') || {};
                                                form.setValue(
                                                    'permissionScopes',
                                                    {
                                                        ...currentScopes,
                                                        [permissionId]: cappedScope,
                                                    },
                                                    { shouldDirty: true, shouldValidate: true },
                                                );
                                            }}
                                        />
                                    ))}
                                </div>
                            </section>
                        </form>
                    </Form>
                </div>

                <SheetFooter className="border-t border-border mt-auto shrink-0">
                    <div className="flex justify-end gap-3 w-full sm:w-auto">
                        <SheetClose asChild>
                            <Button
                                variant="outline"
                                className="h-9 min-w-25 px-4 font-medium rounded-lg border-muted-foreground/20 text-foreground/80 hover:bg-muted flex-1 sm:flex-none"
                            >
                                {t('cancel')}
                            </Button>
                        </SheetClose>
                        <Button
                            type="submit"
                            form="role-form"
                            disabled={isSubmitDisabled}
                            className="h-9 min-w-25 px-4 font-medium rounded-lg bg-primary hover:bg-primary/80 text-[#FAFAFA]  flex-1 sm:flex-none"
                        >
                            {form.formState.isSubmitting && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {t('saveRole')}
                        </Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};

export default CreateRoleSheet;
