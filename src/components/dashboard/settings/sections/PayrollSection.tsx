'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { FormField } from '@/components/ui/FormField';
import { FormSelect } from '@/components/ui/FormSelect';
import { SectionLayout } from '../SectionLayout';
import { AttendanceSectionSkeleton } from '../SettingsSectionSkeleton';
import { useTranslation } from 'react-i18next';
import { useCompanyOptions } from '@/features/organization/hooks/useOrganization';
import { usePayrollConfig, useUpdatePayrollConfig } from '@/features/payroll/hooks/usePayroll';
import {
    useCreateOvertimePoliciesBatch,
    useOvertimePolicies,
    useUpdateOvertimePolicy,
} from '@/features/payroll/overtime-policy/hooks/useOvertimePolicy';
import { OvertimeType } from '@/features/payroll/overtime-policy/overtime-policy.types';
import { PayrollCycle } from '@/features/payroll/payroll.types';
import { useToast } from '@/hooks/use-toast';
import { getUserFacingErrorMessage } from '@/lib/parse-api-error';

type PayrollSettingsFormValues = {
    companyId: string;
    cycleType: PayrollCycle;
    payDay: number;
    autoFinalize: boolean;
    standardOvertime: number;
    weekendOvertime: number;
    holidayOvertime: number;
};

const CYCLE_OPTIONS = [
    { label: 'Monthly', value: PayrollCycle.MONTHLY },
    { label: 'Bi-weekly', value: PayrollCycle.BI_WEEKLY },
    { label: 'Weekly', value: PayrollCycle.WEEKLY },
];

function findOvertimePolicy(
    policies: Array<{ id: string; name: string; rateValue: number }>,
    keywords: string[],
) {
    return policies.find((policy) => {
        const normalized = policy.name.toLowerCase();
        return keywords.some((keyword) => normalized.includes(keyword));
    });
}

export function PayrollSection() {
    const { t } = useTranslation('settings');
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    const { companies, isLoading: isLoadingCompanies } = useCompanyOptions();
    const companyOptions = useMemo(
        () =>
            companies.map((company) => ({
                label: company.name || company.displayLabel || company.companyProfile?.legalName || company.id,
                value: company.id,
            })),
        [companies],
    );

    const {
        register,
        control,
        watch,
        setValue,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<PayrollSettingsFormValues>({
        defaultValues: {
            companyId: '',
            cycleType: PayrollCycle.MONTHLY,
            payDay: 25,
            autoFinalize: false,
            standardOvertime: 1.5,
            weekendOvertime: 2,
            holidayOvertime: 2,
        },
    });

    const companyId = watch('companyId');
    const autoFinalize = watch('autoFinalize');

    const { data: payrollConfig, isLoading: isLoadingConfig } = usePayrollConfig(companyId);
    const { data: overtimePolicies = [], isLoading: isLoadingOvertime } = useOvertimePolicies(companyId);
    const { mutateAsync: updatePayrollConfig } = useUpdatePayrollConfig();
    const { mutateAsync: createOvertimePoliciesBatch } = useCreateOvertimePoliciesBatch();

    const standardPolicy = useMemo(
        () => findOvertimePolicy(overtimePolicies, ['standard']),
        [overtimePolicies],
    );
    const weekendPolicy = useMemo(
        () => findOvertimePolicy(overtimePolicies, ['weekend']),
        [overtimePolicies],
    );
    const holidayPolicy = useMemo(
        () => findOvertimePolicy(overtimePolicies, ['holiday', 'public']),
        [overtimePolicies],
    );

    const updateStandardPolicy = useUpdateOvertimePolicy(standardPolicy?.id ?? '');
    const updateWeekendPolicy = useUpdateOvertimePolicy(weekendPolicy?.id ?? '');
    const updateHolidayPolicy = useUpdateOvertimePolicy(holidayPolicy?.id ?? '');

    useEffect(() => {
        if (companyOptions.length > 0 && !companyId) {
            setValue('companyId', companyOptions[0].value, { shouldValidate: true });
        }
    }, [companyOptions, companyId, setValue]);

    useEffect(() => {
        if (!companyId) {
            return;
        }

        reset({
            companyId,
            cycleType: payrollConfig?.cycleType ?? PayrollCycle.MONTHLY,
            payDay: payrollConfig?.payDay ?? 25,
            autoFinalize: payrollConfig?.autoFinalize ?? false,
            standardOvertime: standardPolicy?.rateValue ?? 1.5,
            weekendOvertime: weekendPolicy?.rateValue ?? 2,
            holidayOvertime: holidayPolicy?.rateValue ?? 2,
        });
    }, [
        companyId,
        payrollConfig,
        standardPolicy,
        weekendPolicy,
        holidayPolicy,
        reset,
    ]);

    const isSectionLoading =
        isLoadingCompanies || (!!companyId && (isLoadingConfig || isLoadingOvertime));

    const onSubmit = async (data: PayrollSettingsFormValues) => {
        if (!companyId) {
            toast({
                variant: 'destructive',
                title: t('errors.title'),
                description: t('payroll.selectCompanyFirst'),
            });
            return;
        }

        setIsSaving(true);
        try {
            await updatePayrollConfig({
                companyId,
                cycleType: data.cycleType,
                payDay: Math.round(Number(data.payDay)),
                autoFinalize: data.autoFinalize,
            });

            const standardOvertime = Number(data.standardOvertime);
            const weekendOvertime = Number(data.weekendOvertime);
            const holidayOvertime = Number(data.holidayOvertime);

            const missingPolicies = [
                !standardPolicy
                    ? {
                          companyId,
                          name: 'Standard Overtime',
                          rateValue: standardOvertime,
                          type: OvertimeType.MULTIPLIER,
                      }
                    : null,
                !weekendPolicy
                    ? {
                          companyId,
                          name: 'Weekend Overtime',
                          rateValue: weekendOvertime,
                          type: OvertimeType.FIXED_RATE,
                      }
                    : null,
                !holidayPolicy
                    ? {
                          companyId,
                          name: 'Public Holiday Overtime',
                          rateValue: holidayOvertime,
                          type: OvertimeType.FIXED_RATE,
                      }
                    : null,
            ].filter((policy): policy is NonNullable<typeof policy> => policy !== null);

            if (missingPolicies.length > 0) {
                await createOvertimePoliciesBatch(missingPolicies);
            }

            await Promise.all([
                standardPolicy
                    ? updateStandardPolicy.mutateAsync({ rateValue: standardOvertime })
                    : Promise.resolve(),
                weekendPolicy
                    ? updateWeekendPolicy.mutateAsync({ rateValue: weekendOvertime })
                    : Promise.resolve(),
                holidayPolicy
                    ? updateHolidayPolicy.mutateAsync({ rateValue: holidayOvertime })
                    : Promise.resolve(),
            ]);

            toast({
                title: t('success.title'),
                description: t('success.payrollSaved'),
            });
        } catch (error: unknown) {
            toast({
                variant: 'destructive',
                title: t('errors.title'),
                description: getUserFacingErrorMessage(error, t('errors.saveFailed')),
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoadingCompanies && companies.length === 0) {
        return (
            <SectionLayout title={t('payroll.title')} description={t('payroll.description')}>
                <AttendanceSectionSkeleton />
            </SectionLayout>
        );
    }

    return (
        <SectionLayout title={t('payroll.title')} description={t('payroll.description')}>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                <div className="max-w-sm">
                    <FormSelect
                        id="companyId"
                        label={t('payroll.selectCompany')}
                        placeholder={
                            isLoadingCompanies
                                ? t('payroll.loadingCompanies')
                                : t('payroll.selectCompany')
                        }
                        control={control}
                        name="companyId"
                        error={errors.companyId}
                        options={companyOptions}
                        t={t}
                        containerClassName="flex flex-col gap-1.5"
                    />
                </div>

                {isSectionLoading ? (
                    <AttendanceSectionSkeleton showCompanyField={false} />
                ) : (
                    <>
                        <div className="border-t border-border" />

                        <div className="flex flex-col gap-4">
                            <h3 className="text-sm font-semibold text-foreground">{t('payroll.cycleSettings')}</h3>

                            <div className="grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
                                <FormSelect
                                    id="cycleType"
                                    label={t('payroll.cycleType')}
                                    control={control}
                                    name="cycleType"
                                    error={errors.cycleType}
                                    options={CYCLE_OPTIONS}
                                    t={t}
                                />
                                <FormField
                                    id="payDay"
                                    label={t('payroll.payDay')}
                                    register={register}
                                    name="payDay"
                                    type="number"
                                    error={errors.payDay}
                                    validation={{ valueAsNumber: true, min: 1, max: 31 }}
                                    t={t}
                                />
                            </div>

                            <div className="flex items-start justify-between gap-8 max-w-xl">
                                <div>
                                    <p className="text-sm font-medium text-foreground">{t('payroll.autoFinalize')}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{t('payroll.autoFinalizeDesc')}</p>
                                </div>
                                <Switch
                                    checked={autoFinalize}
                                    onCheckedChange={(value) => setValue('autoFinalize', value)}
                                    className="shrink-0"
                                />
                            </div>
                        </div>

                        <div className="border-t border-border" />

                        <div className="flex flex-col gap-4">
                            <h3 className="text-sm font-semibold text-foreground">{t('payroll.overtimeRules')}</h3>

                            <div className="grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-3">
                                <FormField
                                    id="standardOvertime"
                                    label={t('payroll.standardOvertime')}
                                    register={register}
                                    name="standardOvertime"
                                    type="number"
                                    error={errors.standardOvertime}
                                    validation={{ valueAsNumber: true }}
                                    t={t}
                                />
                                <FormField
                                    id="weekendOvertime"
                                    label={t('payroll.weekendOvertime')}
                                    register={register}
                                    name="weekendOvertime"
                                    type="number"
                                    error={errors.weekendOvertime}
                                    validation={{ valueAsNumber: true }}
                                    t={t}
                                />
                                <FormField
                                    id="holidayOvertime"
                                    label={t('payroll.publicHoliday')}
                                    register={register}
                                    name="holidayOvertime"
                                    type="number"
                                    error={errors.holidayOvertime}
                                    validation={{ valueAsNumber: true }}
                                    t={t}
                                />
                            </div>
                        </div>

                        <Link
                            href="/dashboard/payroll/salary-structures"
                            className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3 transition-colors hover:border-primary/40 hover:bg-primary/5 max-w-xl"
                        >
                            <div>
                                <p className="text-sm font-semibold text-foreground">{t('payroll.salaryStructuresLink')}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{t('payroll.salaryStructuresLinkDesc')}</p>
                            </div>
                            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                        </Link>

                        <div className="pt-2">
                            <Button
                                type="submit"
                                disabled={isSaving || !companyId}
                                className="bg-primary hover:bg-primary/90 text-white h-9 px-5 rounded-lg"
                            >
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {t('saveChange')}
                            </Button>
                        </div>
                    </>
                )}
            </form>
        </SectionLayout>
    );
}
