'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { X, Plus } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
    SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField as CustomFormField } from '@/components/ui/FormField';
import { FormSelect } from '@/components/ui/FormSelect';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const contractTypeSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Contract name is required'),
    status: z.string().min(1, 'Status is required'),
    description: z.string().optional(),
    duration: z.string().optional(),
    probation: z.string().optional(),
    isPermanent: z.boolean(),
    isRenewable: z.boolean(),
});

export type ContractTypeValues = z.infer<typeof contractTypeSchema>;

interface AddContractSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: ContractTypeValues) => void;
    initialData?: ContractTypeValues | null;
}

export function AddContractSheet({ open, onOpenChange, onSubmit, initialData }: AddContractSheetProps) {
    const { t, i18n } = useTranslation(['contracts', 'employees', 'dashboard']);
    const isRtl = i18n.language === 'ar';

    const defaultValues: ContractTypeValues = {
        name: '',
        status: 'Active',
        description: '',
        duration: '',
        probation: '',
        isPermanent: false,
        isRenewable: false,
    };

    const { 
        register, 
        control, 
        handleSubmit, 
        reset, 
        watch,
        formState: { errors } 
    } = useForm<ContractTypeValues>({
        resolver: zodResolver(contractTypeSchema),
        defaultValues,
    });

    // Reset form when initialData changes or sheet opens
    useEffect(() => {
        if (open) {
            if (initialData) {
                reset(initialData);
            } else {
                reset(defaultValues);
            }
        }
    }, [open, initialData, reset]);

    const handleFormSubmit = (data: ContractTypeValues) => {
        onSubmit(data);
        onOpenChange(false);
        reset();
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side={isRtl ? 'left' : 'right'}
                className="sm:max-w-[600px] px-10 py-6 flex flex-col h-full border-l border-border/50 overflow-hidden bg-background"
            >
                    <SheetHeader className="flex flex-col gap-6 shrink-0 p-0">
                        <SheetTitle className="text-xl font-bold text-foreground">
                            {initialData ? t('employees:edit') + ' ' + t('title').toLowerCase() : t('addContractType')}
                        </SheetTitle>
                        <div className="h-px bg-border" />
                    </SheetHeader>


                        <form 
                            id="add-contract-form" 
                            onSubmit={handleSubmit(handleFormSubmit)} 
                            className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-8 pb-10 no-scrollbar"
                        >
                            <div className="flex flex-col gap-8">
                                {/* Contract Info Section */}
                                <div className="border border-border rounded-xl overflow-hidden bg-card">
                                    <div className="bg-muted/40 border-b border-border px-4 py-3">
                                        <p className="text-sm font-semibold text-foreground">
                                            {t('contractInfo')}
                                        </p>
                                    </div>
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                            <CustomFormField
                                                id="name"
                                                label={t('contractName')}
                                                name="name"
                                                register={register}
                                                error={errors.name}
                                                t={t}
                                            />
                                            <FormSelect
                                                id="status"
                                                label={t('employees:status')}
                                                name="status"
                                                control={control}
                                                error={errors.status}
                                                options={[
                                                    { label: t('employees:active'), value: 'Active' },
                                                    { label: t('employees:inactive'), value: 'Inactive' },
                                                ]}
                                                t={t}
                                            />
                                            <div className="md:col-span-2 space-y-3">
                                                <Label htmlFor="description" className="text-sm font-medium leading-5 text-foreground block">
                                                    {t('description')}
                                                </Label>
                                                <Textarea 
                                                    id="description"
                                                    placeholder="Add description" 
                                                    className={cn(
                                                        "min-h-[100px] resize-none h-auto rounded-[8px] px-4 py-2 bg-background border border-input focus:border-primary focus:ring-primary/20",
                                                        errors.description ? "border-destructive focus-visible:ring-destructive" : ""
                                                    )}
                                                    {...register('description')} 
                                                />
                                                {errors.description && (
                                                    <p className="text-xs text-destructive rtl:text-end">
                                                        {errors.description.message}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Contract Details Section */}
                                <div className="border border-border rounded-xl overflow-hidden bg-card">
                                    <div className="bg-muted/40 border-b border-border px-4 py-3">
                                        <p className="text-sm font-semibold text-foreground">
                                            {t('contractDetails')}
                                        </p>
                                    </div>
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                            <CustomFormField
                                                id="duration"
                                                label={t('duration')}
                                                name="duration"
                                                register={register}
                                                error={errors.duration}
                                                readOnly={watch('isPermanent')}
                                                t={t}
                                            />
                                            <CustomFormField
                                                id="probation"
                                                label={`${t('probation')} (${t('dashboard:common.table.days')})`}
                                                name="probation"
                                                type="number"
                                                register={register}
                                                error={errors.probation}
                                                t={t}
                                            />
                                            <Controller
                                                name="isPermanent"
                                                control={control}
                                                render={({ field }) => (
                                                    <div className="flex flex-row items-start space-x-3 space-y-0 p-1">
                                                        <Checkbox
                                                            id="isPermanent"
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                        <div className="space-y-1 leading-none">
                                                            <Label htmlFor="isPermanent" className="text-sm font-normal cursor-pointer">
                                                                {t('permanentDuration')}
                                                            </Label>
                                                        </div>
                                                    </div>
                                                )}
                                            />
                                            <Controller
                                                name="isRenewable"
                                                control={control}
                                                render={({ field }) => (
                                                    <div className="flex flex-row items-start space-x-3 space-y-0 p-1">
                                                        <Checkbox
                                                            id="isRenewable"
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                        <div className="space-y-1 leading-none">
                                                            <Label htmlFor="isRenewable" className="text-sm font-normal cursor-pointer">
                                                                {t('renewableContract')}
                                                            </Label>
                                                        </div>
                                                    </div>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Contract Content Section */}
                                <div className="border border-border/80 rounded-xl overflow-hidden bg-background">
                                    <div className="bg-muted/40 border-b border-border px-6 h-[50px] flex items-center">
                                        <p className="text-sm font-semibold text-foreground">
                                            {t('contractContent')}
                                        </p>
                                    </div>
                                    <div className="px-6 py-4">
                                        <div className="flex flex-col items-start gap-4 h-12 justify-center">
                                            <Button 
                                                variant="outline" 
                                                type="button" 
                                                className="h-9 w-[152px] border-primary/20 text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 px-4 py-2 rounded-[8px] font-medium shadow-sm active:scale-[0.98]"
                                            >
                                                <Plus className="h-4 w-4" />
                                                <span className="text-sm">{t('addDocument')}</span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>


                    <SheetFooter className="flex flex-row items-center justify-end gap-4 mt-auto px-0 pt-6 border-t border-border shrink-0">
                        <SheetClose asChild>
                            <Button 
                                type="button" 
                                variant="outline" 
                                className="h-9 px-10 rounded-[8px] border-primary/20 text-primary hover:bg-primary/5 transition-all font-semibold" 
                            >
                                {t('employees:cancel')}
                            </Button>
                        </SheetClose>
                        <Button 
                            type="submit" 
                            form="add-contract-form"
                            className="h-9 px-4 rounded-[8px]"
                        >
                            {t('saveContract')}
                        </Button>
                    </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
