'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { X, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next';
import {
    getLeaveBalanceSchema,
    type LeaveBalanceFormValues,
} from '../schemas/leave-balance.schema';
import { LeaveBalance } from '@/types/leave-balances';
import { cn } from '@/lib/utils';

interface EditLeaveBalanceSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    balance?: LeaveBalance | null;
}

const SectionCard = ({
    title,
    children,
    className,
}: {
    title: string;
    children: React.ReactNode;
    className?: string;
}) => (
    <div
        className={cn(
            'bg-white border border-[rgba(229,229,229,0.8)] shadow-[0px_1px_3px_rgba(0,0,0,0.04),0px_1px_2px_-1px_rgba(0,0,0,0.04)] rounded-xl pb-6 overflow-hidden',
            className,
        )}
    >
        <div className="bg-[#F8F8F8] h-12.5 px-6 flex items-center mb-6">
            <h3 className="font-semibold text-sm text-foreground leading-3.5">{title}</h3>
        </div>
        <div className="px-6 space-y-6">{children}</div>
    </div>
);

const EditLeaveBalanceSheet: React.FC<EditLeaveBalanceSheetProps> = ({
    open,
    onOpenChange,
    balance,
}) => {
    const { t, i18n } = useTranslation('dashboard');
    const isRTL = i18n.language === 'ar';

    const form = useForm<LeaveBalanceFormValues>({
        resolver: zodResolver(getLeaveBalanceSchema(t)) as any,
        defaultValues: {
            employeeName: '',
            leaveType: '',
            year: '',
            allocatedDays: 0,
            usedDays: 0,
            remainingDays: 0,
            carryForwardDays: 0,
            reason: '',
        },
    });

    useEffect(() => {
        if (balance) {
            form.reset({
                employeeName: balance.name,
                leaveType: balance.leaveType,
                year: balance.year.toString(),
                allocatedDays: balance.allocated,
                usedDays: balance.used,
                remainingDays: balance.remaining,
                carryForwardDays: balance.carriedForward,
                reason: '',
            });
        }
    }, [balance, form]);

    const onSubmit = () => {
        // Here you would call your API
        onOpenChange(false);
        form.reset();
    };


    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side={isRTL ? 'left' : 'right'}
                showCloseButton={false}
                className="w-full sm:max-w-200 px-10 py-6 gap-6 flex flex-col h-full border-0 shadow-2xl bg-white"
            >
                <SheetHeader className="flex flex-row items-center justify-between space-y-0">
                    <SheetTitle className="text-2xl font-bold text-[#0F172A] leading-8">
                        {t('leaveBalances.edit.title', 'Edit leave balance')}
                    </SheetTitle>
                    <SheetClose className="text-foreground/80 hover:text-foreground transition-colors rounded-lg border border-border h-9 w-[44px] flex justify-center items-center">
                        <X className="h-5 w-5" strokeWidth={1.33} />
                        <span className="sr-only">{t('leaveRequests.review.close', 'Close')}</span>
                    </SheetClose>
                </SheetHeader>
                <Separator className="bg-border" />

                <div className="flex-1 overflow-y-auto no-scrollbar py-2">
                    <Form {...form}>
                        <form
                            id="edit-leave-balance-form"
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-8"
                        >
                            {/* Balance Info */}
                            <SectionCard
                                title={t('leaveBalances.edit.balanceInfo', 'Balance info')}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="employeeName"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-sm font-medium text-foreground">
                                                    {t('leaveBalances.edit.employee', 'Employee')}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        className="h-9 border-border focus:border-brand-600 shadow-sm bg-white"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="leaveType"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-sm font-medium text-foreground">
                                                    {t(
                                                        'leaveBalances.edit.leaveType',
                                                        'Leave type',
                                                    )}
                                                </FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="h-9 border-border bg-white shadow-sm">
                                                            <SelectValue
                                                                placeholder={t(
                                                                    'leaveBalances.edit.leaveType',
                                                                    'Leave type',
                                                                )}
                                                            />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Annual leave">
                                                            {t('leaveTypes.types.Annual leave')}
                                                        </SelectItem>
                                                        <SelectItem value="Sick leave">
                                                            {t('leaveTypes.types.Sick leave')}
                                                        </SelectItem>
                                                        <SelectItem value="Paternity leave">
                                                            {t('leaveTypes.types.Paternity leave')}
                                                        </SelectItem>
                                                        <SelectItem value="Emergency leave">
                                                            {t('leaveTypes.types.Emergency leave')}
                                                        </SelectItem>
                                                        <SelectItem value="Bereavement leave">
                                                            {t(
                                                                'leaveTypes.types.Bereavement leave',
                                                            )}
                                                        </SelectItem>
                                                        <SelectItem value="Study leave">
                                                            {t('leaveTypes.types.Study leave')}
                                                        </SelectItem>
                                                        <SelectItem value="Compensatory leave">
                                                            {t(
                                                                'leaveTypes.types.Compensatory leave',
                                                            )}
                                                        </SelectItem>
                                                        <SelectItem value="Personal leave">
                                                            {t('leaveTypes.types.Personal leave')}
                                                        </SelectItem>
                                                        <SelectItem value="Marriage leave">
                                                            {t('leaveTypes.types.Marriage leave')}
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </SectionCard>

                            {/* Balance Details */}
                            <SectionCard
                                title={t('leaveBalances.edit.balanceDetails', 'Balance details')}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="year"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-sm font-medium text-foreground">
                                                    {t('leaveBalances.edit.year', 'Year')}
                                                </FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="h-9 border-border bg-white shadow-sm">
                                                            <SelectValue
                                                                placeholder={t(
                                                                    'leaveBalances.edit.year',
                                                                    'Year',
                                                                )}
                                                            />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {[
                                                            2023, 2024, 2025, 2026, 2027, 2028,
                                                            2029, 2030,
                                                        ].map((year) => (
                                                            <SelectItem
                                                                key={year}
                                                                value={year.toString()}
                                                            >
                                                                {year}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="allocatedDays"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-sm font-medium text-foreground">
                                                    {t(
                                                        'leaveBalances.edit.allocatedDays',
                                                        'Allocated days',
                                                    )}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        className="h-9 border-border focus:border-brand-600 shadow-sm bg-white"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="usedDays"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-sm font-medium text-foreground">
                                                    {t('leaveBalances.edit.usedDays', 'Used days')}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        className="h-9 border-border focus:border-brand-600 shadow-sm bg-white"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="remainingDays"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-sm font-medium text-foreground">
                                                    {t(
                                                        'leaveBalances.edit.remainingDays',
                                                        'Remaining days',
                                                    )}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        className="h-9 border-border focus:border-brand-600 shadow-sm bg-white"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="carryForwardDays"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-sm font-medium text-foreground">
                                                    {t(
                                                        'leaveBalances.edit.carryForwardDays',
                                                        'Carry forward days',
                                                    )}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        className="h-9 border-border focus:border-brand-600 shadow-sm bg-white"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="reason"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-sm font-medium text-foreground">
                                                {t('leaveBalances.edit.reason', 'Reason for edit')}
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <Textarea
                                                        placeholder={t(
                                                            'leaveBalances.edit.placeholderReason',
                                                            'Add reason',
                                                        )}
                                                        {...field}
                                                        className="min-h-27.5 resize-none border-border shadow-sm focus-visible:ring-0 focus:border-brand-600"
                                                    />
                                                    <div className="absolute bottom-2 right-2 flex gap-2">
                                                        <div className="h-7 border border-border rounded px-3 flex items-center bg-white text-xs font-medium text-foreground">
                                                            B
                                                        </div>
                                                        <div className="h-7 border border-border rounded px-3 flex items-center bg-white text-xs font-medium text-foreground">
                                                            I
                                                        </div>
                                                        <div className="h-7 bg-brand-600 rounded px-3 flex items-center text-white text-xs font-medium">
                                                            AI
                                                        </div>
                                                    </div>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </SectionCard>

                            {/* Footer Buttons */}
                            <div className="flex flex-row items-center justify-end gap-6 pt-4 pb-10 w-full">
                                <SheetClose asChild>
                                    <Button
                                        variant="outline"
                                        className="h-9 min-w-25 border-[#5185F2] text-primary font-medium rounded-lg shadow-sm hover:bg-[#EFF3FA]/50"
                                    >
                                        {t('attendance.cancel', 'Cancel')}
                                    </Button>
                                </SheetClose>
                                <Button
                                    type="submit"
                                    disabled={form.formState.isSubmitting}
                                    className="h-9 min-w-36 px-4 font-medium rounded-lg bg-primary hover:bg-primary/90 text-[#FAFAFA] shadow-sm"
                                >
                                    {form.formState.isSubmitting && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    {t('leaveBalances.edit.saveButton', 'Save changes')}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default EditLeaveBalanceSheet;
