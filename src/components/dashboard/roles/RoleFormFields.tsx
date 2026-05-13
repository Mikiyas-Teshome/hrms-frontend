'use client';

import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        name="level"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className="text-sm font-medium text-foreground ">
                                    {t('level')}
                                </FormLabel>
                                <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={field.value?.toString()}>
                                    <FormControl>
                                        <SelectTrigger className="h-9 border-border w-full bg-background shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                                            <SelectValue placeholder={t('selectLevel')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="1">{t('level')} 1</SelectItem>
                                        <SelectItem value="2">{t('level')} 2</SelectItem>
                                        <SelectItem value="3">{t('level')} 3</SelectItem>
                                        <SelectItem value="4">{t('level')} 4</SelectItem>
                                        <SelectItem value="5">{t('level')} 5</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-muted-foreground ">
                                    {t('roleTierLevel')}
                                </p>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
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
