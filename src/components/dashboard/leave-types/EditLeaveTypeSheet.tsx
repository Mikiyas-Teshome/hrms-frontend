'use client';

import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField as OriginalFormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { X, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from 'react-i18next';
import { leaveTypeSchema, type LeaveTypeFormValues } from '../schemas/leave-type.schema';
import { useUpdateLeaveType } from '@/features/leave-type/hooks/useLeaveType';
import { useToast } from '@/hooks/use-toast';
import { useCompanyOptions } from '@/features/organization/hooks/useOrganization';
import { FormSelect } from '@/components/ui/FormSelect';
import { FormField as ReusableFormField } from '@/components/ui/FormField';
import { LeaveType } from '@/types/leave-types';

interface EditLeaveTypeSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData: LeaveType | null;
}

const EditLeaveTypeSheet: React.FC<EditLeaveTypeSheetProps> = ({ open, onOpenChange, initialData }) => {
    const { t } = useTranslation('dashboard');
    const { companies: companiesData, isLoading: isLoadingCompanies } = useCompanyOptions();

    const form = useForm<LeaveTypeFormValues>({
        resolver: zodResolver(leaveTypeSchema) as any,
        defaultValues: {
            code: '',
            name: '',
            status: 'Active',
            condition: 'Paid',
            description: '',
            maxDaysPerYear: undefined,
            carryForwardAllowed: false,
            companyOuId: '',
        },
    });

    useEffect(() => {
        if (open && initialData) {
            form.reset({
                code: initialData.code || initialData.name.toLowerCase().replace(/\s+/g, '-'),
                name: initialData.name,
                status: initialData.status as 'Active' | 'Inactive',
                condition: initialData.condition as 'Paid' | 'Unpaid',
                description: initialData.description || '',
                maxDaysPerYear: initialData.maxDaysPerYear,
                carryForwardAllowed: initialData.carryForwardAllowed || false,
                companyOuId: initialData.companyOuId || '',
            });
        }
    }, [open, initialData, form]);

    const formCompanyOuId = useWatch({
        control: form.control,
        name: 'companyOuId',
    });

    useEffect(() => {
        if (companiesData?.length && !formCompanyOuId) {
            form.setValue('companyOuId', companiesData[0].id, { shouldValidate: true });
        }
    }, [companiesData, formCompanyOuId, form]);

    const { toast } = useToast();
    const { mutateAsync: updateLeaveType, isPending } = useUpdateLeaveType();

    const onSubmit = async (data: LeaveTypeFormValues) => {
        if (!initialData?.id) return;
        try {
            await updateLeaveType({
                id: initialData.id,
                input: {
                    code: data.code,
                    name: data.name,
                    paid: data.condition === 'Paid',
                    maxDaysPerYear: data.maxDaysPerYear ? Number(data.maxDaysPerYear) : 0,
                    carryForwardAllowed: data.carryForwardAllowed ?? false,
                    companyOuId: data.companyOuId,
                }
            });
            toast({
                title: t('leaveTypes.updatedSuccessTitle', 'Success'),
                description: t('leaveTypes.updatedSuccessMsg', 'Leave type updated successfully'),
            });
            onOpenChange(false);
        } catch (error: any) {
            console.error('Failed to update leave type:', error);
            toast({
                title: t('leaveTypes.updateError', 'Error'),
                description: error?.message || 'An unexpected error occurred.',
                variant: 'destructive',
            });
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                showCloseButton={false}
                className="w-full sm:max-w-200 px-10 py-6 gap-6 flex flex-col h-full border-0 shadow-2xl bg-background"
            >
                <SheetHeader className="flex flex-row items-center justify-between">
                    <SheetTitle className="text-2xl font-bold text-foreground">
                        {t('leaveTypes.editLeaveTypeTitle', 'Edit Leave Type')}
                    </SheetTitle>
                    <SheetClose className="text-foreground/80 hover:text-foreground transition-colors rounded-lg border border-muted-foreground border-solid h-9 w-[44px] flex justify-center items-center">
                        <X className="h-5 w-5" strokeWidth={1.33} />
                        <span className="sr-only">{t('leaveTypes.cancel')}</span>
                    </SheetClose>
                </SheetHeader>
                <Separator />
                
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    <Form {...form}>
                        <form
                            id="edit-leave-type-form"
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-6"
                        >
                            <div className="bg-card border border-border shadow-[0px_1px_3px_rgba(0,0,0,0.04),0px_1px_2px_-1px_rgba(0,0,0,0.04)] rounded-xl pb-4">
                                <div className="bg-card-header-background h-12.5 rounded-t-xl px-6 flex items-center mb-4">
                                    <h3 className="font-semibold text-sm text-foreground leading-3.5">
                                        {t('leaveTypes.leaveInfo')}
                                    </h3>
                                </div>
                                
                                <div className="bg-card w-full h-auto p-6 md:p-8 flex flex-col gap-6 rounded-b-[20px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] border-t border-border">
                                <FormSelect
                                    id="companyOuId"
                                    label={t("setup.selectCompany")}
                                    placeholder={isLoadingCompanies ? t("setup.loadingCompanies") : t("setup.selectCompanyPlaceholder")}
                                    control={form.control}
                                    name="companyOuId"
                                    error={form.formState.errors.companyOuId}
                                    options={companiesData?.map(c => ({ label: c.name, value: c.id })) || []}
                                    t={t}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <ReusableFormField
                                            id="code"
                                            label={t('leaveTypes.code')}
                                            placeholder={t('leaveTypes.codePlaceholder')}
                                            register={form.register}
                                            name="code"
                                            error={form.formState.errors.code}
                                            validation={{ maxLength: 10 }}
                                            t={t}
                                        />
                                        <ReusableFormField
                                            id="name"
                                            label={t('leaveTypes.table.name')}
                                            placeholder={t('leaveTypes.namePlaceholder')}
                                            register={form.register}
                                            name="name"
                                            error={form.formState.errors.name}
                                            t={t}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormSelect
                                            id="status"
                                            label={t('leaveTypes.table.status')}
                                            placeholder={t('leaveTypes.filter.allStatus')}
                                            control={form.control}
                                            name="status"
                                            error={form.formState.errors.status}
                                            options={[
                                                { label: t('leaveTypes.status.active', 'Active'), value: 'Active' },
                                                { label: t('leaveTypes.status.inactive', 'Inactive'), value: 'Inactive' }
                                            ]}
                                            t={t}
                                        />

                                        <FormSelect
                                            id="condition"
                                            label={t('leaveTypes.table.condition')}
                                            placeholder={t('leaveTypes.filter.allConditions')}
                                            control={form.control}
                                            name="condition"
                                            error={form.formState.errors.condition}
                                            options={[
                                                { label: t('leaveTypes.condition.paid', 'Paid'), value: 'Paid' },
                                                { label: t('leaveTypes.condition.unpaid', 'Unpaid'), value: 'Unpaid' }
                                            ]}
                                            t={t}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <ReusableFormField
                                            id="maxDaysPerYear"
                                            label={t('leaveTypes.table.maxDays')}
                                            placeholder={t('leaveTypes.maxDaysPlaceholder')}
                                            register={form.register}
                                            name="maxDaysPerYear"
                                            type="number"
                                            error={form.formState.errors.maxDaysPerYear as any}
                                            t={t}
                                        />

                                        <OriginalFormField
                                            control={form.control}
                                            name="carryForwardAllowed"
                                            render={({ field }) => (
                                                <FormItem className="flex items-center gap-3 space-y-0 pt-8">
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                            className="data-[state=checked]:bg-primary"
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="text-sm font-medium text-foreground cursor-pointer">
                                                        {t('leaveTypes.carryForwardAllowed')}
                                                    </FormLabel>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <OriginalFormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-sm font-medium text-foreground">
                                                    {t('leaveTypes.description')}
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder={t('leaveTypes.descriptionPlaceholder')}
                                                        {...field}
                                                        className="min-h-16 resize-none border-border shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                            
                            <div className="flex flex-row items-center justify-end gap-6 pt-2 w-full">
                                <SheetClose asChild>
                                    <Button
                                        variant="outline"
                                        className="h-9 min-w-25 border-[#5185F2] text-primary font-medium rounded-lg shadow-sm"
                                    >
                                        {t('leaveTypes.cancel')}
                                    </Button>
                                </SheetClose>
                                <Button
                                    type="submit"
                                    disabled={isPending}
                                    className="h-9 min-w-33.5 px-4 font-medium rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                                >
                                    {isPending && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    {t('leaveTypes.save', 'Save changes')}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default EditLeaveTypeSheet;
