/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { AlertCircle, Edit2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card';
import { PayrollCycleModal } from '@/components/onboarding/payroll/payroll-cycle-modal';
import {
    PayrollComponentsModal,
    type PayrollComponent,
} from '@/components/onboarding/payroll/payroll-components-modal';
import {
    PayrollOvertimeModal,
    type OvertimeRules,
} from '@/components/onboarding/payroll/payroll-overtime-modal';
import {
    usePayrollConfig,
    useUpdatePayrollConfig,
    useUpsertPayrollComponents,
} from '@/features/payroll/hooks/usePayroll';
import { useProfile, useUpdateOnboardingComplete } from '@/features/auth/hooks/useAuth';
import { PayrollComponentType, PayrollCycle } from '@/features/payroll/payroll.types';
import { useAllowances } from '@/features/allowance/hooks/useAllowance';
import { useDeductions } from '@/features/deduction/hooks/useDeduction';
import { useToast } from '@/hooks/use-toast';
import { getCurrencySymbol } from '@/lib/currency';
import { useSelectedCompany } from '@/features/organization/hooks/useOrganization';
import {
    useCreateOvertimePoliciesBatch,
    useOvertimePolicies,
} from '@/features/overtime-policy/hooks/useOvertimePolicy';
import { OvertimeType } from '@/features/overtime-policy/overtime-policy.types';
import { cn } from '@/lib/utils';

export function PayrollOfficerStructure() {
    const { t } = useTranslation('payrollOfficerStructure');
    const router = useRouter();
    const { toast } = useToast();
    const { data: profile } = useProfile();
    const companyId = profile?.companyId;

    const { data: config, isLoading: isLoadingConfig } = usePayrollConfig(companyId);
    const { data: allowancesData = [], isLoading: isLoadingAllowances } = useAllowances(companyId);
    const { data: deductionsData = [], isLoading: isLoadingDeductions } = useDeductions(companyId);
    const { data: overtimePolicies, isLoading: isLoadingOvertime } = useOvertimePolicies(companyId);
    const { company: selectedCompany } = useSelectedCompany(companyId);
    const currencySymbol = getCurrencySymbol(selectedCompany?.companyProfile?.currency);

    const { mutateAsync: updateConfig } = useUpdatePayrollConfig();
    const { mutateAsync: upsertComponents } = useUpsertPayrollComponents();
    const { mutateAsync: createOvertimeBatch } = useCreateOvertimePoliciesBatch();
    const { mutateAsync: updateOnboarding } = useUpdateOnboardingComplete();

    const [isCycleModalOpen, setIsCycleModalOpen] = useState(false);
    const [isComponentsModalOpen, setIsComponentsModalOpen] = useState(false);
    const [isOvertimeModalOpen, setIsOvertimeModalOpen] = useState(false);

    const cycleData = useMemo(
        () => ({
            cycle: config?.cycleType?.toLowerCase() || 'monthly',
            processingDay: config?.payDay
                ? `${config.payDay}${t('cycle.thDay', { defaultValue: 'th of the month' })}`
                : t('cycle.value25th'),
        }),
        [config, t],
    );

    const allowances = useMemo<PayrollComponent[]>(() => {
        return allowancesData.map((a) => ({
            id: a.id,
            name: a.name,
            desc:
                a.description ||
                (a.type === 'percentage' ? `${a.value}%` : `${currencySymbol}${a.value}`),
            enabled: a.isActive,
        }));
    }, [allowancesData, currencySymbol]);

    const deductions = useMemo<PayrollComponent[]>(() => {
        return deductionsData.map((d) => ({
            id: d.id,
            name: d.name,
            desc:
                d.description ||
                (d.type === 'percentage' ? `${d.value}%` : `${currencySymbol}${d.value}`),
            enabled: d.isActive,
        }));
    }, [deductionsData, currencySymbol]);

    const overtimeRules = useMemo<OvertimeRules>(() => {
        if (!overtimePolicies || overtimePolicies.length === 0) {
            return {
                standard: '1.5',
                weekend: '2.0',
                holiday: '2.0',
                nightShiftEnabled: true,
            };
        }

        // Map existing policies to the UI structure (finding by name or assuming order)
        const standard =
            overtimePolicies
                .find((p) => p.name.toLowerCase().includes('standard'))
                ?.rateValue.toString() || '1.5';
        const weekend =
            overtimePolicies
                .find((p) => p.name.toLowerCase().includes('weekend'))
                ?.rateValue.toString() || '2.0';
        const holiday =
            overtimePolicies
                .find(
                    (p) =>
                        p.name.toLowerCase().includes('holiday') ||
                        p.name.toLowerCase().includes('public'),
                )
                ?.rateValue.toString() || '2.0';

        return {
            standard,
            weekend,
            holiday,
            nightShiftEnabled: true, // Assuming default or could be stored in metadata
        };
    }, [overtimePolicies]);

    if (isLoadingConfig || isLoadingAllowances || isLoadingDeductions || isLoadingOvertime) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-4xl space-y-8">
            {/* Alert Banner */}
            <div className="flex gap-4 rounded-xl border border-amber-500/35 bg-amber-500/10 p-4 rtl:flex-row-reverse">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-500 dark:bg-amber-400/20 dark:text-amber-300">
                    <AlertCircle className="size-4" />
                </div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200 rtl:text-end">
                    {t('alert')}
                </p>
            </div>

            {/* Payroll Cycle & Processing */}
            <Card className="overflow-hidden rounded-2xl border-none shadow-none ring-1 ring-border">
                <CardHeader className="border-b border-muted bg-muted/40 px-6 py-4">
                    <CardTitle className="text-sm font-bold text-foreground rtl:text-end">
                        {t('sections.cycle')}
                    </CardTitle>
                    <CardAction>
                        <Button
                            variant="ghost"
                            onClick={() => setIsCycleModalOpen(true)}
                            className="h-auto p-0 text-sm font-bold text-primary hover:bg-transparent hover:text-primary/80 flex items-center gap-1.5 rtl:flex-row-reverse"
                        >
                            <Edit2 className="size-3.5" />
                            {t('edit')}
                        </Button>
                    </CardAction>
                </CardHeader>
                <CardContent className="p-8 sm:p-10">
                    <div className="grid grid-cols-1 gap-12 sm:grid-cols-2">
                        <div className="space-y-4 text-center sm:text-start rtl:sm:text-end">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                {t('cycle.processingDay')}
                            </p>
                            <p className="text-lg font-bold text-foreground">
                                {cycleData.processingDay === '25th of the month'
                                    ? t('cycle.value25th')
                                    : cycleData.processingDay}
                            </p>
                        </div>
                        <div className="space-y-4 text-center sm:text-start rtl:sm:text-end">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                {t('cycle.payrollCycle')}
                            </p>
                            <p className="text-lg font-bold text-foreground">
                                {cycleData.cycle === 'monthly'
                                    ? t('cycle.valueMonthly')
                                    : cycleData.cycle}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Payroll Components */}
            <Card className="overflow-hidden rounded-2xl border-none shadow-none ring-1 ring-border">
                <CardHeader className="border-b border-muted bg-muted/40 px-6 py-4">
                    <CardTitle className="text-sm font-bold text-foreground rtl:text-end">
                        {t('sections.components')}
                    </CardTitle>
                    <CardAction>
                        <Button
                            variant="ghost"
                            onClick={() => setIsComponentsModalOpen(true)}
                            className="h-auto p-0 text-sm font-bold text-primary hover:bg-transparent hover:text-primary/80 flex items-center gap-1.5 rtl:flex-row-reverse"
                        >
                            <Edit2 className="size-3.5" />
                            {t('edit')}
                        </Button>
                    </CardAction>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="grid grid-cols-1 divide-y md:grid-cols-2 md:divide-x md:divide-y-0 rtl:md:divide-x-reverse">
                        {/* Allowances */}
                        <div className="p-8">
                            <h3 className="mb-6 text-sm font-bold text-muted-foreground rtl:text-end">
                                {t('components.allowances')}
                            </h3>
                            <div className="space-y-4">
                                {allowances.length === 0 && (
                                    <p className="text-xs text-muted-foreground italic">
                                        {t('components.noAllowances', 'No allowances configured')}
                                    </p>
                                )}
                                {allowances.map((item) => (
                                    <div
                                        key={item.id}
                                        className={cn(
                                            'flex flex-col gap-1 rounded-xl border border-border/60 p-5 rtl:text-end',
                                            !item.enabled && 'opacity-60 bg-muted/20',
                                        )}
                                    >
                                        <div className="flex items-center justify-between">
                                            <p className="text-[15px] font-bold text-foreground">
                                                {item.name}
                                            </p>
                                            {!item.enabled && (
                                                <span className="text-[10px] font-bold uppercase text-muted-foreground">
                                                    {t('components.inactive', 'Inactive')}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground font-medium">
                                            {item.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Deductions */}
                        <div className="p-8">
                            <h3 className="mb-6 text-sm font-bold text-muted-foreground rtl:text-end">
                                {t('components.deductions')}
                            </h3>
                            <div className="space-y-4">
                                {deductions.length === 0 && (
                                    <p className="text-xs text-muted-foreground italic">
                                        {t('components.noDeductions', 'No deductions configured')}
                                    </p>
                                )}
                                {deductions.map((item) => (
                                    <div
                                        key={item.id}
                                        className={cn(
                                            'flex flex-col gap-1 rounded-xl border border-border/60 p-5 rtl:text-end',
                                            !item.enabled && 'opacity-60 bg-muted/20',
                                        )}
                                    >
                                        <div className="flex items-center justify-between">
                                            <p className="text-[15px] font-bold text-foreground">
                                                {item.name}
                                            </p>
                                            {!item.enabled && (
                                                <span className="text-[10px] font-bold uppercase text-muted-foreground">
                                                    {t('components.inactive', 'Inactive')}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground font-medium">
                                            {item.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Overtime Rules */}
            <Card className="overflow-hidden rounded-2xl border-none shadow-none ring-1 ring-border">
                <CardHeader className="border-b border-muted bg-muted/40 px-6 py-4">
                    <CardTitle className="text-sm font-bold text-foreground rtl:text-end">
                        {t('sections.overtime')}
                    </CardTitle>
                    <CardAction>
                        <Button
                            variant="ghost"
                            onClick={() => setIsOvertimeModalOpen(true)}
                            className="h-auto p-0 text-sm font-bold text-primary hover:bg-transparent hover:text-primary/80 flex items-center gap-1.5 rtl:flex-row-reverse"
                        >
                            <Edit2 className="size-3.5" />
                            {t('edit')}
                        </Button>
                    </CardAction>
                </CardHeader>
                <CardContent className="space-y-12 p-8 sm:p-10">
                    <div className="grid grid-cols-1 gap-12 text-center md:grid-cols-3">
                        <div className="space-y-3">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                {t('overtime.standard')}
                            </p>
                            <p className="text-2xl font-bold text-foreground">
                                {overtimeRules.standard}x
                            </p>
                            <p className="text-xs text-muted-foreground font-medium">
                                {t('overtime.standardDesc')}
                            </p>
                        </div>
                        <div className="space-y-3">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                {t('overtime.weekend')}
                            </p>
                            <p className="text-2xl font-bold text-foreground">
                                {overtimeRules.weekend}x
                            </p>
                            <p className="text-xs text-muted-foreground font-medium">
                                {t('overtime.weekendDesc')}
                            </p>
                        </div>
                        <div className="space-y-3">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                {t('overtime.holiday')}
                            </p>
                            <p className="text-2xl font-bold text-foreground">
                                {overtimeRules.holiday}x
                            </p>
                            <p className="text-xs text-muted-foreground font-medium">
                                {t('overtime.holidayDesc')}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-border/60 pt-8 mt-4 rtl:flex-row-reverse">
                        <div className="space-y-1 rtl:text-end">
                            <p className="text-sm font-bold text-foreground">
                                {t('overtime.nightShift')}
                            </p>
                            <p className="text-xs text-muted-foreground font-medium">
                                {t('overtime.nightShiftDesc')}
                            </p>
                        </div>
                        <span className="text-sm font-bold text-emerald-600">
                            {overtimeRules.nightShiftEnabled
                                ? t('overtime.enabled')
                                : t('overtime.disabled')}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Action Button */}
            <div className="flex justify-center pb-20 pt-4 sm:justify-end">
                <Button
                    size="lg"
                    onClick={async () => {
                        try {
                            if (profile?.id) {
                                await updateOnboarding({
                                    userId: profile.id,
                                    onboardingComplete: true,
                                });
                            }
                            router.push('/onboarding-payroll-officer/finish');
                        } catch {
                            // Even if onboarding update fails, we might still want to proceed or show error
                            router.push('/onboarding-payroll-officer/finish');
                        }
                    }}
                    className="h-11 rounded-xl px-8 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                >
                    {t('finishSetup')}
                </Button>
            </div>

            <PayrollCycleModal
                isOpen={isCycleModalOpen}
                onOpenChange={setIsCycleModalOpen}
                initialData={cycleData}
                onSave={async (data) => {
                    try {
                        await updateConfig({
                            companyId,
                            cycleType: data.cycle.toUpperCase() as PayrollCycle,
                            payDay: parseInt(data.processingDay) || 25,
                        });
                        toast({ title: t('success'), description: t('configUpdated') });
                    } catch {
                        toast({
                            title: t('error'),
                            description: t('configUpdateError'),
                            variant: 'destructive',
                        });
                    }
                }}
            />

            <PayrollComponentsModal
                isOpen={isComponentsModalOpen}
                onOpenChange={setIsComponentsModalOpen}
                initialAllowances={allowances}
                initialDeductions={deductions}
                onSave={async (data) => {
                    try {
                        const inputs = [
                            ...data.allowances.map((a) => {
                                const original = allowancesData.find((c) => c.id === a.id);
                                return {
                                    id: a.id.length > 20 ? a.id : undefined,
                                    companyId,
                                    componentType: PayrollComponentType.ALLOWANCE,
                                    name: a.name,
                                    isActive: a.enabled ?? true,
                                    type: original?.type || 'fixed',
                                    value: original?.value || 0,
                                    taxable: original?.taxable ?? true,
                                };
                            }),
                            ...data.deductions.map((d) => {
                                const original = deductionsData.find((c) => c.id === d.id);
                                return {
                                    id: d.id.length > 20 ? d.id : undefined,
                                    companyId,
                                    componentType: PayrollComponentType.DEDUCTION,
                                    name: d.name,
                                    isActive: d.enabled ?? true,
                                    type: original?.type || 'fixed',
                                    value: original?.value || 0,
                                    recurring: original?.recurring ?? true,
                                };
                            }),
                        ];
                        await upsertComponents(inputs);
                        toast({ title: t('success'), description: t('componentsUpdated') });
                    } catch (error: any) {
                        toast({
                            title: t('error'),
                            description: error.message || t('componentsUpdateError'),
                            variant: 'destructive',
                        });
                    }
                }}
            />

            <PayrollOvertimeModal
                isOpen={isOvertimeModalOpen}
                onOpenChange={setIsOvertimeModalOpen}
                initialRules={overtimeRules}
                onSave={async (rules) => {
                    try {
                        const inputs = [
                            {
                                companyId,
                                name: 'Standard Overtime',
                                rateValue: parseFloat(rules.standard) || 1.5,
                                type: OvertimeType.MULTIPLIER,
                            },
                            {
                                companyId,
                                name: 'Weekend Overtime',
                                rateValue: parseFloat(rules.weekend) || 2.0,
                                type: OvertimeType.FIXED_RATE,
                            },
                            {
                                companyId,
                                name: 'Public Holiday Overtime',
                                rateValue: parseFloat(rules.holiday) || 2.0,
                                type: OvertimeType.FIXED_RATE,
                            },
                        ];
                        await createOvertimeBatch(inputs);
                        toast({ title: t('success'), description: t('overtimeUpdated') });
                    } catch {
                        toast({
                            title: t('error'),
                            description: t('overtimeUpdateError'),
                            variant: 'destructive',
                        });
                    }
                }}
            />
        </div>
    );
}
