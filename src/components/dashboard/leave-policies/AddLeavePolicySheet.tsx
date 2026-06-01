'use client';

import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { X, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next';
import { leavePolicySchema, type LeavePolicyFormValues } from '../schemas/leave-policy.schema';
import { useCreateLeavePolicy } from '@/features/leave-policy/hooks/useLeavePolicy';
import { useLeaveTypes } from '@/features/leave-type/hooks/useLeaveType';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AddLeavePolicySheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-card border border-border shadow-[0px_1px_3px_rgba(0,0,0,0.04),0px_1px_2px_-1px_rgba(0,0,0,0.04)] rounded-xl pb-6">
        <div className="bg-card-header-background h-12.5 rounded-t-xl px-6 flex items-center mb-6">
            <h3 className="font-semibold text-sm text-foreground leading-3.5">
                {title}
            </h3>
        </div>
        <div className="px-6 space-y-6">
            {children}
        </div>
    </div>
);

const AddLeavePolicySheet: React.FC<AddLeavePolicySheetProps> = ({ open, onOpenChange }) => {
    const { t, i18n } = useTranslation('dashboard');
    const isRTL = i18n.language === 'ar';

    const form = useForm<LeavePolicyFormValues>({
        resolver: zodResolver(leavePolicySchema) as any,
        defaultValues: {
            policyName: '',
            leaveType: '',
            description: '',
            maxDaysPerYear: 0,
            accrualMethod: 'Yearly allocation',
            accrualRate: 1,
            carryForward: false,
            managerApproval: true,
            hrApproval: true,
            probationRequired: false,
            applyTo: 'All departments',
            requireAttachment: false,
            paidLeave: true,
            payType: 'Full pay',
            deductFromSalary: 'Deduct',
        },
    });

    const paidLeave = useWatch({
        control: form.control,
        name: 'paidLeave',
    });

    const payType = useWatch({
        control: form.control,
        name: 'payType',
    });

    const { toast } = useToast();
    const { mutateAsync: createLeavePolicy, isPending } = useCreateLeavePolicy();
    const { data: leaveTypes } = useLeaveTypes();

    const onSubmit = async (data: LeavePolicyFormValues) => {
        try {
            await createLeavePolicy({
                leaveTypeId: data.leaveType, // Now a real UUID from the API-driven dropdown
                accrualMethod: data.accrualMethod,
                accrualRate: Number(data.accrualRate) || 0,
                maxBalance: Number(data.maxDaysPerYear) || 0,
                probationRequired: data.probationRequired ?? false,
            });
            
            toast({
                title: t('addLeavePolicy.createdSuccessTitle'),
                description: t('addLeavePolicy.createdSuccessMsg'),
            });
            onOpenChange(false);
            form.reset();
        } catch (error: any) {
            console.error('Failed to create leave policy:', error);
            toast({
                title: t('addLeavePolicy.createError'),
                description: error?.message || 'An unexpected error occurred.',
                variant: 'destructive',
            });
        }
    };


    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side={isRTL ? 'left' : 'right'}
                showCloseButton={false}
                className="w-full sm:max-w-200 px-10 py-6 gap-6 flex flex-col h-full border-0 shadow-2xl bg-background"
            >
                <SheetHeader className="flex flex-row items-center justify-between">
                    <SheetTitle className="text-2xl font-bold text-foreground">
                        {t('addLeavePolicy.title')}
                    </SheetTitle>
                    <SheetClose className="text-foreground/80 hover:text-foreground transition-colors rounded-lg border border-foreground/80 border-solid h-9 w-[44px] flex justify-center items-center">
                        <X className="h-5 w-5" strokeWidth={1.33} />
                        <span className="sr-only">{t('leaveRequests.review.close', 'Close')}</span>
                    </SheetClose>
                </SheetHeader>
                <Separator />

                <div className="flex-1 overflow-y-auto no-scrollbar">
                    <Form {...form}>
                        <form
                            id="leave-policy-form"
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-8"
                        >
                            {/* Policy Info Section */}
                            <SectionCard title={t('addLeavePolicy.sections.policyInfo')}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="policyName"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-sm font-medium text-foreground">
                                                    {t('addLeavePolicy.fields.policyName')}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder={t('addLeavePolicy.placeholders.policyName')}
                                                        {...field}
                                                        className="h-9 border-border focus:border-brand-600 shadow-sm bg-background"
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
                                                    {t('addLeavePolicy.fields.leaveType')}
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-9 border-border bg-background shadow-sm">
                                                            <SelectValue placeholder={t('addLeavePolicy.fields.leaveType')} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {(leaveTypes || []).map((lt) => (
                                                            <SelectItem key={lt.id} value={lt.id}>
                                                                {lt.name}
                                                            </SelectItem>
                                                        ))}
                                                        {(!leaveTypes || leaveTypes.length === 0) && (
                                                            <SelectItem value="none" disabled>{t('addLeavePolicy.options.noLeaveTypes')}</SelectItem>
                                                        )}
                                                    </SelectContent>
                                                </Select>
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
                                            <FormLabel className="text-sm font-medium text-foreground">
                                                {t('addLeavePolicy.fields.description')}
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder={t('addLeavePolicy.placeholders.description')}
                                                    {...field}
                                                    className="min-h-[110px] resize-none border-border shadow-sm"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </SectionCard>

                            {/* Entitlement Rules Section */}
                            <SectionCard title={t('addLeavePolicy.sections.entitlementRules')}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="maxDaysPerYear"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-sm font-medium text-foreground">
                                                    {t('addLeavePolicy.fields.maxDays')}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        className="h-9 border-border focus:border-brand-600 shadow-sm bg-background"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="accrualMethod"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-sm font-medium text-foreground">
                                                    {t('addLeavePolicy.fields.accrualMethod')}
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-9 border-border bg-background shadow-sm">
                                                            <SelectValue placeholder="Yearly allocation" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Yearly allocation">{t('addLeavePolicy.options.yearlyAllocation')}</SelectItem>
                                                        <SelectItem value="Monthly accrual">{t('addLeavePolicy.options.monthlyAccrual')}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="accrualRate"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-sm font-medium text-foreground">
                                                    {t('addLeavePolicy.fields.accrualRate')}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.1"
                                                        min="0"
                                                        {...field}
                                                        className="h-9 border-border focus:border-brand-600 shadow-sm bg-background"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="maxCarryForwardDays"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-sm font-medium text-foreground">
                                                    {t('addLeavePolicy.fields.maxCarryForward')}
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-9 border-border bg-background shadow-sm">
                                                            <SelectValue placeholder="Designer" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="5">{t('addLeavePolicy.options.days5')}</SelectItem>
                                                        <SelectItem value="10">{t('addLeavePolicy.options.days10')}</SelectItem>
                                                        <SelectItem value="15">{t('addLeavePolicy.options.days15')}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="expiryPeriod"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-sm font-medium text-foreground">
                                                    {t('addLeavePolicy.fields.expiryPeriod')}
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-9 border-border bg-background shadow-sm">
                                                            <SelectValue placeholder="3 months" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="3 months">{t('addLeavePolicy.options.months3')}</SelectItem>
                                                        <SelectItem value="6 months">{t('addLeavePolicy.options.months6')}</SelectItem>
                                                        <SelectItem value="12 months">{t('addLeavePolicy.options.months12')}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="carryForward"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center gap-3 space-y-0">
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    className="data-[state=checked]:bg-primary"
                                                />
                                            </FormControl>
                                            <FormLabel className="text-sm font-medium text-foreground cursor-pointer">
                                                {t('addLeavePolicy.fields.carryForward')}
                                            </FormLabel>
                                        </FormItem>
                                    )}
                                />
                            </SectionCard>

                            {/* Request Rules Section */}
                            <SectionCard title={t('addLeavePolicy.sections.requestRules')}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="minDaysPerRequest"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-sm font-medium text-foreground">
                                                    {t('addLeavePolicy.fields.minDayPerRequest')}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        className="h-9 border-border shadow-sm bg-background"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="maxDaysPerRequest"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-sm font-medium text-foreground">
                                                    {t('addLeavePolicy.fields.maxDaysPerRequest')}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        className="h-9 border-border shadow-sm bg-background"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="noticePeriod"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-sm font-medium text-foreground">
                                                {t('addLeavePolicy.fields.noticePeriod')}
                                            </FormLabel>
                                            <div className="relative">
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        className={cn(
                                                            "h-9 border-border shadow-sm bg-background pr-20",
                                                            isRTL ? "pl-20 pr-3" : "pr-20 pl-3"
                                                        )}
                                                    />
                                                </FormControl>
                                                <div className={cn(
                                                    "absolute inset-y-0 flex items-center px-4 pointer-events-none text-xs text-muted-foreground bg-border border-y border-border rounded-r-lg",
                                                    isRTL ? "left-0 rounded-l-lg rounded-r-none border-l" : "right-0 rounded-r-lg rounded-l-none border-r"
                                                )}>
                                                    {t('addLeavePolicy.placeholders.noticePeriod')}
                                                </div>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </SectionCard>

                            {/* Approval Flow Section */}
                            <SectionCard title={t('addLeavePolicy.sections.approvalFlow')}>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-12">
                                    <FormField
                                        control={form.control}
                                        name="managerApproval"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center gap-3 space-y-0">
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        className="data-[state=checked]:bg-primary"
                                                    />
                                                </FormControl>
                                                <FormLabel className="text-sm font-medium text-foreground cursor-pointer">
                                                    {t('addLeavePolicy.fields.managerApproval')}
                                                </FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="hrApproval"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center gap-3 space-y-0">
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        className="data-[state=checked]:bg-primary"
                                                    />
                                                </FormControl>
                                                <FormLabel className="text-sm font-medium text-foreground cursor-pointer">
                                                    {t('addLeavePolicy.fields.hrApproval')}
                                                </FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="probationRequired"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center gap-3 space-y-0">
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        className="data-[state=checked]:bg-primary"
                                                    />
                                                </FormControl>
                                                <FormLabel className="text-sm font-medium text-foreground cursor-pointer">
                                                    {t('addLeavePolicy.fields.probationRequired')}
                                                </FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="applyTo"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-sm font-medium text-foreground">
                                                {t('addLeavePolicy.fields.applyTo')}
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-9 border-border bg-background shadow-sm">
                                                        <SelectValue placeholder="All department" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="All departments">{t('addLeavePolicy.options.allDepartments')}</SelectItem>
                                                    <SelectItem value="Specific departments">{t('addLeavePolicy.options.specificDepartments')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </SectionCard>

                            {/* Documentation Section */}
                            <SectionCard title={t('addLeavePolicy.sections.documentation')}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end pb-2">
                                    <FormField
                                        control={form.control}
                                        name="requireAttachment"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center gap-3 space-y-0 h-9">
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        className="data-[state=checked]:bg-primary"
                                                    />
                                                </FormControl>
                                                <FormLabel className="text-sm font-medium text-foreground cursor-pointer">
                                                    {t('addLeavePolicy.fields.requireAttachment')}
                                                </FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="attachmentCondition"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-sm font-medium text-foreground">
                                                    {t('addLeavePolicy.fields.condition')}
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-9 border-border bg-background shadow-sm">
                                                            <SelectValue placeholder="Always require" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Always require">{t('addLeavePolicy.options.alwaysRequire')}</SelectItem>
                                                        <SelectItem value="When duration > 3 days">{t('addLeavePolicy.options.whenDurationGt3')}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </SectionCard>

                            {/* Payroll Impact Section */}
                            <SectionCard title={t('addLeavePolicy.sections.payrollImpact')}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end pb-2">
                                    <FormField
                                        control={form.control}
                                        name="paidLeave"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center gap-3 space-y-0 h-9">
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        className="data-[state=checked]:bg-primary"
                                                    />
                                                </FormControl>
                                                <FormLabel className="text-sm font-medium text-foreground cursor-pointer">
                                                    {t('addLeavePolicy.fields.paidLeave')}
                                                </FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                    
                                    {paidLeave ? (
                                        <FormField
                                            control={form.control}
                                            name="payType"
                                            render={({ field }) => (
                                                <FormItem className="space-y-3">
                                                    <FormLabel className="text-sm font-medium text-foreground">
                                                        {t('addLeavePolicy.fields.payType')}
                                                    </FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-9 border-border bg-background shadow-sm">
                                                                <SelectValue placeholder="Full pay" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="Full pay">{t('addLeavePolicy.options.fullPay')}</SelectItem>
                                                            <SelectItem value="Partial pay">{t('addLeavePolicy.options.partialPay')}</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    ) : (
                                        <FormField
                                            control={form.control}
                                            name="deductFromSalary"
                                            render={({ field }) => (
                                                <FormItem className="space-y-3">
                                                    <FormLabel className="text-sm font-medium text-foreground">
                                                        {t('addLeavePolicy.fields.deductFromSalary')}
                                                    </FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-9 border-border bg-background shadow-sm">
                                                                <SelectValue placeholder="Deduct" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="Deduct">{t('addLeavePolicy.options.deduct')}</SelectItem>
                                                            <SelectItem value="No deduction">{t('addLeavePolicy.options.noDeduction')}</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                </div>

                                {paidLeave && payType === 'Partial pay' && (
                                    <div className="border border-border rounded-lg p-3 space-y-4">
                                        <h4 className="text-sm font-semibold text-foreground/80">
                                            {t('addLeavePolicy.fields.setTierRules')}
                                        </h4>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <FormField
                                                control={form.control}
                                                name="fullPayDays"
                                                render={({ field }) => (
                                                    <FormItem className="flex-1 space-y-3">
                                                        <FormLabel className="text-sm font-medium text-foreground">
                                                            {t('addLeavePolicy.fields.fullPay')}
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder={t('addLeavePolicy.placeholders.first15Days')}
                                                                {...field}
                                                                className="h-9 border-border bg-background shadow-sm"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="halfPayDays"
                                                render={({ field }) => (
                                                    <FormItem className="flex-1 space-y-3">
                                                        <FormLabel className="text-sm font-medium text-foreground">
                                                            {t('addLeavePolicy.fields.halfPay')}
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder={t('addLeavePolicy.placeholders.thirtyDays')}
                                                                {...field}
                                                                className="h-9 border-border bg-background shadow-sm"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="noPayDays"
                                                render={({ field }) => (
                                                    <FormItem className="flex-1 space-y-3">
                                                        <FormLabel className="text-sm font-medium text-foreground">
                                                            {t('addLeavePolicy.fields.noPay')}
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder={t('addLeavePolicy.placeholders.afterThirtyDays')}
                                                                {...field}
                                                                className="h-9 border-border bg-background shadow-sm"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                )}
                            </SectionCard>

                            {/* Footer Buttons */}
                            <div className="flex flex-row items-center justify-end gap-6 pt-4 pb-10 w-full">
                                <SheetClose asChild>
                                    <Button
                                        variant="outline"
                                        className="h-9 min-w-[100px] border-[#5185F2] text-primary font-medium rounded-lg shadow-sm"
                                    >
                                        {t('leaveTypes.cancel', 'Cancel')}
                                    </Button>
                                </SheetClose>
                                <Button
                                    type="submit"
                                    disabled={isPending}
                                    className="h-9 min-w-[144px] px-4 font-medium rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                                >
                                    {isPending && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    {t('addLeavePolicy.save')}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default AddLeavePolicySheet;
