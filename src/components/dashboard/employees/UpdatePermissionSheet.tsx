'use client';

import React, { useEffect, useState } from 'react';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { X, Loader2, Info } from 'lucide-react';
import PermissionGroup from '../roles/PermissionGroup';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next';
import { Role, PermissionScope } from '@/features/roles/roles.types';
import { normalizePermissionScope } from '@/features/roles/permission-scope.util';
import { fetchPermissions, fetchRoles, setUserPermissionOverrides, fetchProfileWithPermissionSets } from '@/features/roles/roles.actions';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { roleSchema, type RoleFormValues } from '../schemas/role.schema';
import { Employee } from '@/types/employee';
import { FormSection } from '@/components/ui/form-section';

interface UpdatePermissionSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employee: Employee | null;
    onSuccess?: () => void;
}

const UpdatePermissionSheet: React.FC<UpdatePermissionSheetProps> = ({ open, onOpenChange, employee, onSuccess }) => {
    const { t } = useTranslation('roles');
    const { toast } = useToast();
    const { user } = useAuth();
    const form = useForm<RoleFormValues>({
        resolver: zodResolver(roleSchema),
        defaultValues: {
            name: '',
            description: '',
            permissions: [],
            scope: PermissionScope.ALL,
            moduleScopes: {},
        },
    });

    const [permissionModules, setPermissionModules] = useState<{ id: string, name: string, permissions: { id: string, label: string }[] }[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [perms, fetchedRoles] = await Promise.all([
                    fetchPermissions(),
                    fetchRoles(user?.companyId || '')
                ]);
                
                setRoles(fetchedRoles);

                const formatTitleCase = (s: string) => 
                    s.replace(/[_-]/g, ' ')
                     .split(' ')
                     .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                     .join(' ');

                const grouped = perms.reduce((acc, p) => {
                    const actionStr = p.action || '';
                    let resource = '';
                    let verb = '';
                    
                    if (actionStr.includes(':')) {
                        const parts = actionStr.split(':');
                        resource = parts[0];
                        verb = parts.slice(1).join(':') || 'manage';
                    } else {
                        resource = actionStr || 'general';
                        verb = 'manage';
                    }
                    
                    const moduleName = formatTitleCase(resource);
                    const verbFormatted = verb.toLowerCase() === 'read' ? 'View' : verb.charAt(0).toUpperCase() + verb.slice(1).toLowerCase();
                    const labelName = `${verbFormatted} ${formatTitleCase(resource)}`;
                    const groupId = resource.toLowerCase().replace(/\s/g, '');
                    
                    let group = acc.find(g => g.id === groupId);
                    if (!group) {
                        group = { id: groupId, name: moduleName, permissions: [] };
                        acc.push(group);
                    }
                    group.permissions.push({ id: p.id, label: labelName });
                    return acc;
                }, [] as { id: string, name: string, permissions: { id: string, label: string }[] }[]);
                
                setPermissionModules(grouped);
            } catch (error) {
                console.error("Failed to load data", error);
            }
        };

        if (open) {
            loadInitialData();
        }
    }, [open, user?.companyId]);

    const [isFetchingPermissions, setIsFetchingPermissions] = useState(false);
    const [initialGrants, setInitialGrants] = useState<{ permissionId: string, scope: string }[]>([]);

    useEffect(() => {
        const loadEmployeePermissions = async () => {
            if (!employee) return;
            
            setIsFetchingPermissions(true);
            try {
                const response = await fetchProfileWithPermissionSets(employee.userId || employee.id);
                
                if (response?.profileWithPermissionSets?.user) {
                    const userData = response.profileWithPermissionSets.user;
                    const roleProfile = userData.roleProfile;
                    
                    const grants = roleProfile?.permissionGrants || [];
                    setInitialGrants(grants.map(g => ({ 
                        permissionId: g.permissionId, 
                        scope: (g.scope as string).toLowerCase() 
                    })));
                    
                    const permissionIds = grants.map(pg => pg.permissionId);
                    
                    // Map permissions back to modules to restore module scopes
                    const restoredModuleScopes: Record<string, PermissionScope> = {};
                    grants.forEach(grant => {
                        const permId = grant.permissionId;
                        const scope = normalizePermissionScope(grant.scope as string);
                        
                        const mod = permissionModules.find(m => m.permissions.some(p => p.id === permId));
                        if (mod && scope) {
                            restoredModuleScopes[mod.id] = scope;
                        }
                    });

                    // Find the role name that matches case-insensitively
                    const roleName = userData.role || employee.role;
                    const matchingRole = roles.find(r => r.name.toLowerCase() === roleName.toLowerCase());
                    const finalRoleName = matchingRole ? matchingRole.name : roleName;
                    
                    form.reset({
                        name: finalRoleName,
                        description: roleProfile?.description || '',
                        permissions: permissionIds,
                        scope: normalizePermissionScope(roleProfile?.permissionGrants?.[0]?.scope as string) || PermissionScope.ALL,
                        moduleScopes: restoredModuleScopes,
                    });
                } else {
                    // Fallback if fetch fails
                    setInitialGrants([]);
                    form.reset({
                        name: employee.role,
                        description: '',
                        permissions: [],
                        scope: PermissionScope.ALL,
                        moduleScopes: {},
                    });
                }
            } catch (error) {
                console.error("Failed to load employee permissions", error);
                toast({
                    title: t("error", "Error"),
                    description: t("fetchError", "Failed to load employee permissions"),
                    variant: "destructive",
                });
            } finally {
                setIsFetchingPermissions(false);
            }
        };

        if (open && employee) {
            loadEmployeePermissions();
        }
    }, [open, employee, form, toast, roles, permissionModules, t]);

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
                { shouldValidate: true, shouldDirty: true },
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
            form.setValue('permissions', [...currentSelected, id], { shouldValidate: true, shouldDirty: true });
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
        if (!employee) return;
        try {
            // 2. Set Permission Overrides
            const currentPermissions = data.permissions;
            
            // Helper to find scope for a permission
            const getScopeForPermission = (permId: string) => {
                const mod = permissionModules.find(m => m.permissions.some(p => p.id === permId));
                return (mod ? data.moduleScopes?.[mod.id] : null) || data.scope || PermissionScope.ALL;
            };

            const overrides: any[] = [];

            // Identify removals: things in initialGrants but not in currentPermissions or with different scope
            initialGrants.forEach(initial => {
                const stillSelected = currentPermissions.includes(initial.permissionId);
                
                if (!stillSelected) {
                    // If it was there but now it's not, we explicitly DENY it
                    overrides.push({
                        userId: employee.userId || employee.id,
                        permissionId: initial.permissionId,
                        effect: 'DENY',
                        scope: initial.scope.toLowerCase(),
                        description: t('denyingPermission', 'Permission explicitly denied')
                    });
                }
            });

            // Identify additions/updates: everything currently selected
            currentPermissions.forEach(permId => {
                const scope = getScopeForPermission(permId);
                // We always 'ALLOW' to ensure the current scope is set
                overrides.push({
                    userId: employee.userId || employee.id,
                    permissionId: permId,
                    effect: 'ALLOW',
                    scope: scope.toLowerCase(),
                    description: data.description || t("permissionOverrideDesc", "Employee permission override")
                });
            });

            if (overrides.length > 0) {
                const result = await setUserPermissionOverrides({ overrides });
                if (!result.success) throw new Error(result.error);
            }

            toast({
                title: t("permissionUpdateSuccess", "Permission updated"),
                description: t("permissionUpdateSuccessDesc", "The permissions have been successfully updated."),
                variant: "success",
            });

            onSuccess?.();
            onOpenChange(false);
            form.reset();
        } catch (error: any) {
            console.error('Failed to update permissions:', error);
            toast({
                title: t("saveError"),
                description: error.message || t("saveErrorDesc"),
                variant: "destructive",
            });
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                showCloseButton={false}
                className="sm:max-w-200 px-10 py-6 gap-6 flex flex-col h-full border-0 shadow-2xl bg-background overflow-hidden"
            >
                <SheetHeader className="flex flex-row items-center justify-between">
                    <SheetTitle className="text-2xl font-bold text-foreground">
                        {t('updateEmployeePermission', "Update {{name}}'s permission", { name: employee?.name })}
                    </SheetTitle>
                    <SheetClose className="text-foreground/80 hover:text-foreground transition-colors rounded-lg cursor-pointer">
                        <X className="h-5 w-5" strokeWidth={1.33} />
                        <span className="sr-only">{t('cancel')}</span>
                    </SheetClose>
                </SheetHeader>
                <Separator />
                
                <div className="flex-1 overflow-y-auto no-scrollbar pr-2">
                    <Form {...form}>
                    <form
                        id="user-permission-form"
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8 flex-1 relative"
                    >
                        {isFetchingPermissions && (
                            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl">
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <p className="text-sm font-medium text-muted-foreground">{t('loadingPermissions', "Loading permissions...")}</p>
                                </div>
                            </div>
                        )}
                        <FormSection title={t('permissionInfo', "Permission info")}>
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel className="text-sm font-medium text-foreground">{t('role', "Role")}</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-9 border-border w-full bg-background shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                                                    <SelectValue placeholder={t('selectRole', "Select role")} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {roles.map(role => (
                                                    <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem className="space-y-3 mt-6">
                                        <FormLabel className="text-sm font-medium text-foreground">{t('description', "Description")}</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder={t('descriptionPlaceholder', "Enter description regarding the customized permissions...")}
                                                {...field}
                                                className="min-h-27.5 resize-none border-border shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                                            />
                                        </FormControl>
                                        <p className="text-[13px] text-muted-foreground">
                                            {t('descriptionHelp', "Brief explanation of why these permissions are being updated.")}
                                        </p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </FormSection>

                        <section className="space-y-8">
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex gap-3">
                                <div className="bg-blue-500/20 rounded-full h-fit p-1">
                                    <Info className="text-blue-500 h-4 w-4" />
                                </div>
                                <p className="text-blue-700 dark:text-blue-300 text-sm font-medium leading-relaxed">
                                    {t('scopeInfo', "Only permissions in the scope selected are visible.")}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-[18px] font-bold text-foreground ">{t('managePermissions', "Manage permissions")}</h3>
                                <p className="text-sm text-muted-foreground ">
                                    {t('managePermissionsDesc', "Select permissions for this employee. You can select all permissions at once or manage them by module.")}
                                </p>
                            </div>

                            <div className="flex items-center justify-between px-6 py-4 bg-muted/30 border border-border/80 rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_-1px_rgba(0,0,0,0.04)]">
                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        id="select-all-user"
                                        checked={allPermissionsChecked || (somePermissionsChecked ? 'indeterminate' : false)}
                                        onCheckedChange={(checked: boolean) => handleToggleAll(!!checked)}
                                        className="rounded-lg border-border shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                                    />
                                    <label htmlFor="select-all-user" className="text-sm font-semibold text-foreground cursor-pointer">
                                        {t('selectAllPermissions', "Select all permissions")}
                                    </label>
                                </div>
                                <span className="text-sm text-muted-foreground ">
                                    {t('selectedCount', "{{count}} of {{total}} selected", { count: selectedPermissions.length, total: totalPermissions })}
                                </span>
                            </div>

                            <div className="space-y-6">
                                {permissionModules.map((permModule) => (
                                    <PermissionGroup
                                        key={permModule.id}
                                        title={permModule.name}
                                        permissions={permModule.permissions}
                                        selectedIds={selectedPermissions}
                                        onToggleAll={(checked: boolean) => handleToggleModule(permModule.id, checked)}
                                        onTogglePermission={(id: string, checked: boolean) => handleTogglePermission(id, checked)}
                                        scope={form.watch('moduleScopes')?.[permModule.id] || PermissionScope.ALL}
                                        onScopeChange={(scope: PermissionScope) => {
                                            const currentScopes = form.getValues('moduleScopes') || {};
                                            form.setValue('moduleScopes', {
                                                ...currentScopes,
                                                [permModule.id]: scope
                                            }, { shouldDirty: true, shouldValidate: true });
                                        }}
                                    />
                                ))}
                            </div>
                        </section>
                    </form>
                </Form>
                </div>

                <SheetFooter className="border-t border-border mt-auto pt-6 pb-2 shrink-0 bg-background">
                    <div className="flex justify-end gap-3 w-full sm:w-auto">
                        <SheetClose asChild>
                            <Button
                                variant="outline"
                                className="h-9 min-w-25 px-4 font-medium rounded-lg border-muted-foreground/20 text-foreground/80 hover:bg-muted flex-1 sm:flex-none"
                            >
                                {t('cancel', "Cancel")}
                            </Button>
                        </SheetClose>
                        <Button
                            type="submit"
                            form="user-permission-form"
                            disabled={form.formState.isSubmitting}
                            className="h-9 min-w-25 px-4 font-medium rounded-lg bg-primary hover:bg-primary/80 text-[#FAFAFA]  flex-1 sm:flex-none"
                        >
                            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('saveChanges', "Save changes")}
                        </Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};

export default UpdatePermissionSheet;
