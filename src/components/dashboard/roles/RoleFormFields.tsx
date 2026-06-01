'use client';

import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormSection } from '@/components/ui/form-section';
import type { UseFormReturn } from 'react-hook-form';
import type { RoleFormValues } from '../schemas/role.schema';
import { useTranslation } from 'react-i18next';

interface RoleFormFieldsProps {
    form: UseFormReturn<RoleFormValues>;
}

export function RoleFormFields({ form }: RoleFormFieldsProps) {
    const { t } = useTranslation('roles');
    return (
        <div className="space-y-8">
            <FormSection title={t('roleInfo')}>
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel className="text-sm font-medium text-foreground">
                                {t('roleName')}
                            </FormLabel>
                            <FormControl>
                                <Input
                                    placeholder={t('roleNamePlaceholder')}
                                    {...field}
                                    className="h-9 border-border focus:border-primary shadow-[0_1px_2px_rgba(0,0,0,0.05)] "
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel className="text-sm font-medium text-foreground ">
                                {t('description')}
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder={t('descriptionPlaceholder')}
                                    {...field}
                                    className="min-h-27.5 resize-none border-border shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </FormSection>

        </div>
    );
}
