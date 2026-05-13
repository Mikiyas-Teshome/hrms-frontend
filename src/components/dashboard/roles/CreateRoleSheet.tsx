/* eslint-disable @typescript-eslint/no-explicit-any */
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
import PermissionGroup from './PermissionGroup';
import { RoleFormFields } from './RoleFormFields';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next';
import { Role, PermissionScope } from '@/features/roles/roles.types';
import { createRole, updateRole, fetchPermissions } from '@/features/roles/roles.actions';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { roleSchema, type RoleFormValues } from '../schemas/role.schema';

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
    const { user } = useAuth();
    const form = useForm<RoleFormValues>({
        resolver: zodResolver(roleSchema),
        defaultValues: {
            name: '',
            level: 1,
            description: '',
            permissions: [],
            scope: PermissionScope.ALL,
            moduleScopes: {},
        },
    });

    const [permissionModules, setPermissionModules] = useState<
        { id: string; name: string; permissions: { id: string; label: string }[] }[]
    >([]);

    useEffect(() => {
        const loadPermissions = async () => {
            try {
                const perms = await fetchPermissions();
                const grouped = perms.reduce(
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
                        group.permissions.push({ id: p.id, label: labelName });
                        return acc;
                    },
                    [] as {
                        id: string;
                        name: string;
                        permissions: { id: string; label: string }[];
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
    }, [open]);

    useEffect(() => {
        if (open) {
            if (role) {
                const permissionIds =
                    (role.permissionGrants
                        ?.map((pg) => pg.permissionId || pg.permission?.id)
                        .filter(Boolean) as string[]) ||
                    role.permissions?.map((p) => p.id) ||
                    [];

                const moduleScopes: Record<string, PermissionScope> = {};
                role.permissionGrants?.forEach((pg) => {
                    const moduleId = pg.permission?.module || pg.permission?.action?.split(':')[0];
                    if (moduleId && pg.scope) {
                        moduleScopes[moduleId.toLowerCase().replace(/\s/g, '')] =
                            pg.scope as PermissionScope;
                    }
                });

                form.reset({
                    name: role.name,
                    level: role.level || 1,
                    description: role.description || '',
                    permissions: permissionIds,
                    scope: (role as any).scope || PermissionScope.ALL,
                    moduleScopes: moduleScopes,
                });
            } else {
                form.reset({
                    name: '',
                    level: 1,
                    description: '',
                    permissions: [],
                    scope: PermissionScope.ALL,
                    moduleScopes: {},
                });
            }
        }
    }, [open, role, form]);

    const selectedPermissions = form.watch('permissions');
    const totalPermissions = permissionModules.reduce(
        (acc, mod) => acc + mod.permissions.length,
        0,
    );
    const allPermissionsChecked =
        selectedPermissions.length === totalPermissions && totalPermissions > 0;
    const somePermissionsChecked = selectedPermissions.length > 0 && !allPermissionsChecked;

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
        } else {
            form.setValue('permissions', [], { shouldValidate: true, shouldDirty: true });
        }
    };

    const onSubmit = async (data: RoleFormValues) => {
        try {
            if (role && !role.id) {
                throw new Error('Role ID is missing');
            }

            const permissionGrants = data.permissions.map((permissionId) => {
                const mod = permissionModules.find((m) =>
                    m.permissions.some((p) => p.id === permissionId),
                );
                const scope = mod
                    ? data.moduleScopes?.[mod.id] || data.scope || PermissionScope.ALL
                    : data.scope || PermissionScope.ALL;
                return { permissionId, scope };
            });

            const result = await (role && role.id
                ? updateRole(role.id, {
                      name: data.name,
                      description: data.description,
                      level: data.level,
                      permissionGrants,
                  })
                : createRole({
                      name: data.name,
                      description: data.description || '',
                      level: data.level,
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
                            {/* Role Info & Scope Fields */}
                            <RoleFormFields form={form} />

                            {/* Manage Permissions Section */}
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

                                {/* Select All Permissions Row */}
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

                                {/* Permission Modules List */}
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
                                            scope={
                                                form.watch('moduleScopes')?.[permModule.id] ||
                                                PermissionScope.ALL
                                            }
                                            onScopeChange={(scope) => {
                                                const currentScopes =
                                                    form.getValues('moduleScopes') || {};
                                                form.setValue(
                                                    'moduleScopes',
                                                    {
                                                        ...currentScopes,
                                                        [permModule.id]: scope as PermissionScope,
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
                            disabled={form.formState.isSubmitting}
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
