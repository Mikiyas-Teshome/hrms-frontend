'use client';

import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FormSelect } from '@/components/ui/FormSelect';
import { FormSection } from '@/components/ui/form-section';
import { useTranslation } from 'react-i18next';
import type { UseFormReturn } from 'react-hook-form';
import * as z from 'zod';
import { employeeSchema } from '../schemas/employee.schema';
import { useProfile } from '@/features/auth/hooks/useAuth';
import { useOrganizationLeafOptions } from '@/features/organization/hooks/useOrganization';
import { useRoles } from '@/features/roles/hooks/useRoles';


export type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeFormFieldsProps {
    form: UseFormReturn<EmployeeFormValues>;
}

export function EmployeeFormFields({ form }: EmployeeFormFieldsProps) {
    const { t } = useTranslation('employees');
    const { data: profile } = useProfile();
    const { leafOptions, isLoading: hierarchyLoading } = useOrganizationLeafOptions();
    const { data: roles, isLoading: rolesLoading } = useRoles(profile?.companyId);

    const ouOptions = leafOptions.map(u => ({ label: u.name, value: u.id }));
    const roleOptions = roles?.filter(role => !!role.id).map(role => ({ label: role.name, value: role.id! })) || [];

    return (
        <div className="space-y-8 pb-8">
            {/* Basic Info */}
            <FormSection title={t('basicInfo')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className="text-sm font-medium">{t('firstName')}</FormLabel>
                                <FormControl>
                                    <Input placeholder={t('firstName')} {...field} className="h-9" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className="text-sm font-medium">{t('lastName')}</FormLabel>
                                <FormControl>
                                    <Input placeholder={t('lastName')} {...field} className="h-9" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className="text-sm font-medium">{t('email')}</FormLabel>
                                <FormControl>
                                    <Input placeholder={t('email')} {...field} className="h-9" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="gccid"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className="text-sm font-medium">{t('gccid', 'GCC ID')}</FormLabel>
                                <FormControl>
                                    <Input placeholder={t('gccidPlaceholder', 'Enter GCC ID')} {...field} className="h-9" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </FormSection>

            <FormSection title={t('assignment', 'Assignment')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormSelect
                        id="ouId"
                        label="Organization Unit"
                        placeholder={hierarchyLoading ? "Loading..." : "Select unit"}
                        control={form.control}
                        name="ouId"
                        options={ouOptions}
                        t={t}
                        error={form.formState.errors.ouId}
                        disabled={hierarchyLoading}
                    />
                    <FormSelect
                        id="role"
                        label={t('role')}
                        placeholder={rolesLoading ? "Loading..." : t('role')}
                        control={form.control}
                        name="role"
                        options={roleOptions}
                        t={t}
                        error={form.formState.errors.role}
                        disabled={rolesLoading}
                    />
                </div>
            </FormSection>
        </div>
    );
}
