'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CircleAlert, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FormField } from '@/components/ui/FormField';
import { FormSelect } from '@/components/ui/FormSelect';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    useUpdatePayrollConfig,
    useUpsertPayrollComponents,
    usePayrollConfig,
    usePayrollComponents,
    useDeletePayrollComponent,
} from '@/features/payroll/hooks/usePayroll';
import { PayrollComponentType, PayrollCycle } from '@/features/payroll/payroll.types';
import { OvertimeType } from '@/features/overtime-policy/overtime-policy.types';
import { PayrollComponentSheet } from '@/components/payroll/payroll-component-sheet';
import { useOnboarding } from '@/components/onboarding/context/OnboardingContext';
import { useRouter } from 'next/navigation';
import {
    payrollStructureSchema,
    type PayrollStructureValues,
} from '@/components/onboarding/schemas/payroll-structure';
import { cn } from '@/lib/utils';
import { useCreateOvertimePoliciesBatch } from '@/features/overtime-policy/hooks/useOvertimePolicy';
import { useToast } from '@/hooks/use-toast';
import { AllowanceDeductionList } from '@/components/onboarding/payroll/allowance-deduction-list';
import { OvertimeRulesSection } from '@/components/onboarding/payroll/overtime-rules-section';
import { useCompanyOptions } from '@/features/organization/hooks/useOrganization';
import { useDisplayCurrency } from '@/features/settings/hooks/useDisplayCurrency';

const RadioIndicator = ({ checked }: { checked?: boolean }) => (
    <div
        className={cn(
            'flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors',
            checked ? 'border-primary bg-card text-primary' : 'border-border bg-card',
        )}
    >
        {checked && <div className="size-2 rounded-full bg-current" />}
    </div>
);

/** Maps form allowance/deduction ids to human-readable names for the backend */
const COMPONENT_NAMES: Record<string, string> = {
    hra: 'House Rent Allowance',
    conveyance: 'Conveyance Allowance',
    medical: 'Medical Allowance',
    tds: 'Tax Deducted at Source',
    pf: 'Provident Fund',
    loans: 'Loan Repayment',
};

const DEFAULT_ALLOWANCES = [
    { id: 'hra', type: 'percentage', value: 40, taxable: true },
    { id: 'conveyance', type: 'fixed', value: 200, taxable: true },
    { id: 'medical', type: 'fixed', value: 150, taxable: true },
];

const DEFAULT_DEDUCTIONS = [
    { id: 'tds', type: 'fixed', value: 0, recurring: true },
    { id: 'pf', type: 'percentage', value: 12, recurring: true },
    { id: 'loans', type: 'fixed', value: 0, recurring: true },
];

type PayrollStructureFormProps = {
    mode?: 'onboarding' | 'dashboard';
    onNext?: () => void;
    onBack?: () => void;
};

export function PayrollStructureForm({
    mode = 'onboarding',
    onNext,
    onBack,
}: PayrollStructureFormProps) {
    const { t } = useTranslation('payrollStructure');
    const { toast } = useToast();
    const router = useRouter();
    const { setPayrollData, payrollData } = useOnboarding();
    const [isSaving, setIsSaving] = useState(false);
    const [isAddComponentOpen, setIsAddComponentOpen] = useState(false);
    const [editingComponent, setEditingComponent] = useState<{
        type: 'allowances' | 'deductions';
        id: string;
        data: any;
    } | null>(null);
    const initializationRef = useRef(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        control,
        reset,
        formState: { errors },
    } = useForm<PayrollStructureValues>({
        resolver: zodResolver(payrollStructureSchema),
        defaultValues:
            Object.keys(payrollData).length > 0
                ? payrollData
                : {
                      companyId: '',
                      payrollCycle: 'monthly',
                      processingDay: 1,
                      allowances: DEFAULT_ALLOWANCES.map((a) => ({ ...a, enabled: false })),
                      deductions: DEFAULT_DEDUCTIONS.map((d) => ({ ...d, enabled: false })),
                      overtimeRules: {
                          standard: '1.5',
                          weekend: '2.0',
                          publicHoliday: '5.0',
                          enableNightShift: true,
                      },
                  },
    });

    const payrollCycle = watch('payrollCycle');
    const allowances = watch('allowances');
    const deductions = watch('deductions');
    const formCompanyId = watch('companyId');

    // Queries & mutations
    const { companies: companiesData, isLoading: isLoadingCompanies } = useCompanyOptions();
    const {
        data: existingComponents,
        isLoading: isLoadingComponentsList,
        isFetching: isFetchingComponents,
    } = usePayrollComponents(formCompanyId);
    const { data: existingConfig, isLoading: isLoadingConfig } = usePayrollConfig(formCompanyId);

    const { mutateAsync: updatePayrollConfig } = useUpdatePayrollConfig();
    const { mutateAsync: upsertPayrollComponents } = useUpsertPayrollComponents();
    const { mutateAsync: createOvertimePoliciesBatch } = useCreateOvertimePoliciesBatch();

    const { currencySymbol } = useDisplayCurrency(formCompanyId);

    const companyOptions = useMemo(() => {
        const options =
            (companiesData as any[])?.map((c) => ({
                label: c.name || c.displayLabel || c.companyProfile?.legalName || c.id,
                value: c.id,
            })) || [];
        return options;
    }, [companiesData]);

    // Auto-select first company or handle invalid selection
    useEffect(() => {
        if (companyOptions && companyOptions.length > 0) {
            const isValid = companyOptions.some((opt) => opt.value === formCompanyId);
            if (!formCompanyId || !isValid) {
                const firstCompanyId = companyOptions[0].value;
                setValue('companyId', firstCompanyId, { shouldValidate: true });
            }
        }
    }, [companyOptions, formCompanyId, setValue]);

    // Map existing data to form
    useEffect(() => {
        // Only map if we have data or we are sure it's empty (but not loading)
        if (existingComponents !== undefined && !isFetchingComponents) {
            const cycleMapRev: Record<string, string> = {
                [PayrollCycle.MONTHLY]: 'monthly',
                [PayrollCycle.BI_WEEKLY]: 'bi-weekly',
                [PayrollCycle.WEEKLY]: 'weekly',
            };

            const REVERSE_COMPONENT_NAMES: Record<string, string> = Object.fromEntries(
                Object.entries(COMPONENT_NAMES).map(([k, v]) => [v, k]),
            );

            const mappedAllowances = existingComponents
                .filter((c) => c.__typename === 'AllowanceResponse')
                .map((a) => ({
                    id: REVERSE_COMPONENT_NAMES[a.name] ?? a.name,
                    enabled: (a as any).isActive === true, // Only enabled if isActive is explicitly true
                    description:
                        a.type === 'percentage'
                            ? `${a.value}%`
                            : `Fixed: ${currencySymbol} ${a.value.toFixed(2)}`,
                    type: a.type,
                    value: a.value,
                    taxable: (a as any).taxable,
                    recurring: true,
                    dbId: a.id,
                }));

            const mappedDeductions = existingComponents
                .filter((c) => c.__typename === 'DeductionResponse')
                .map((d) => ({
                    id: REVERSE_COMPONENT_NAMES[d.name] ?? d.name,
                    enabled: (d as any).isActive === true, // Only enabled if isActive is explicitly true
                    description:
                        d.type === 'percentage'
                            ? `${d.value}%`
                            : `Fixed: ${currencySymbol} ${d.value.toFixed(2)}`,
                    type: d.type,
                    value: d.value,
                    taxable: false,
                    recurring: (d as any).recurring,
                    dbId: d.id,
                }));

            const finalCompanyId =
                existingConfig?.companyId &&
                companyOptions.some((o) => o.value === existingConfig.companyId)
                    ? existingConfig.companyId
                    : formCompanyId;

            reset({
                companyId: finalCompanyId,
                payrollCycle: existingConfig
                    ? (cycleMapRev[existingConfig.cycleType] as any)
                    : 'monthly',
                processingDay: existingConfig ? existingConfig.payDay : 1,
                allowances:
                    mappedAllowances.length > 0
                        ? mappedAllowances
                        : DEFAULT_ALLOWANCES.map((a) => ({ ...a, enabled: false })),
                deductions:
                    mappedDeductions.length > 0
                        ? mappedDeductions
                        : DEFAULT_DEDUCTIONS.map((d) => ({ ...d, enabled: false })),
                overtimeRules: {
                    standard: '1.5',
                    weekend: '2.0',
                    publicHoliday: '5.0',
                    enableNightShift: true,
                },
            });
        }
    }, [
        existingConfig,
        existingComponents,
        isFetchingComponents,
        reset,
        formCompanyId,
        companyOptions,
        currencySymbol,
    ]);

    // Initial Setup: If components are empty, seed with localized defaults (isActive: false)
    const [isInitializing, setIsInitializing] = useState(false);

    useEffect(() => {
        if (
            mode === 'onboarding' &&
            existingComponents !== undefined &&
            existingComponents.length === 0 &&
            formCompanyId &&
            !isInitializing &&
            !isFetchingComponents &&
            !initializationRef.current
        ) {
            const initializeDefaults = async () => {
                initializationRef.current = true;
                setIsInitializing(true);
                try {
                    const defaultItems: any[] = DEFAULT_ALLOWANCES.map((a) => ({
                        companyId: formCompanyId,
                        componentType: PayrollComponentType.ALLOWANCE,
                        name: COMPONENT_NAMES[a.id] || a.id,
                        type: a.type,
                        value: a.value,
                        taxable: a.taxable,
                        isActive: false, // Seeding as inactive as requested
                    }));

                    const defaultDeductions: any[] = DEFAULT_DEDUCTIONS.map((d) => ({
                        companyId: formCompanyId,
                        componentType: PayrollComponentType.DEDUCTION,
                        name: COMPONENT_NAMES[d.id] || d.id,
                        type: d.type,
                        value: d.value,
                        recurring: d.recurring,
                        isActive: false, // Seeding as inactive as requested
                    }));

                    const allDefaults = [...defaultItems, ...defaultDeductions];
                    await upsertPayrollComponents(allDefaults);
                    // Refreshing is handled by react-query invalidation in useUpsertPayrollComponents
                } catch (error) {
                    console.error('Failed to initialize default components:', error);
                    initializationRef.current = false; // Allow retry on failure
                } finally {
                    setIsInitializing(false);
                }
            };

            initializeDefaults();
        }
    }, [
        existingComponents,
        isFetchingComponents,
        formCompanyId,
        upsertPayrollComponents,
        isInitializing,
        mode,
    ]);

    const toggleComponent = (type: 'allowances' | 'deductions', id: string, enabled: boolean) => {
        const current = watch(type);
        const updated = current.map((item) => (item.id === id ? { ...item, enabled } : item));
        setValue(type, updated, { shouldValidate: true });
    };

    const handleAddComponent = (data: any) => {
        const fieldKey =
            data.category === PayrollComponentType.ALLOWANCE ? 'allowances' : 'deductions';
        const currentValues = watch(fieldKey);
        const exists = currentValues.some(
            (item) => item.id.toLowerCase() === data.name.toLowerCase(),
        );

        if (exists) {
            toast({
                title: t('setup.error'),
                description: t('components.existsError', {
                    defaultValue: 'Component already exists',
                }),
                variant: 'destructive',
            });
            return;
        }

        const defaultDesc =
            data.type === 'percentage'
                ? data.category === PayrollComponentType.ALLOWANCE
                    ? t('components.items.percentageAllowance', {
                          value: data.value,
                          defaultValue: `${data.value} %`,
                      })
                    : t('components.items.percentageDeduction', {
                          value: data.value,
                          defaultValue: `${data.value} %`,
                      })
                : t('components.items.fixedAmount', {
                      value: data.value.toFixed(2),
                      currency: currencySymbol,
                      defaultValue: `${currencySymbol} ${data.value.toFixed(2)}`,
                  });

        setValue(
            fieldKey,
            [
                ...currentValues,
                {
                    id: data.name,
                    enabled: true,
                    description: data.description || defaultDesc,
                    type: data.type,
                    value: data.value,
                    taxable: data.taxable,
                    recurring: data.recurring,
                },
            ],
            { shouldValidate: true },
        );
    };

    const handleSaveEdit = async (data: any) => {
        if (!editingComponent) return;

        const { type, id } = editingComponent;
        const current = watch(type);
        const itemToUpdate = current.find((i) => i.id === id);

        if (!itemToUpdate) return;

        const defaultDesc =
            data.type === 'percentage'
                ? data.category ===
                  (type === 'allowances'
                      ? PayrollComponentType.ALLOWANCE
                      : PayrollComponentType.DEDUCTION)
                    ? t('components.items.percentageAllowance', {
                          value: data.value,
                          defaultValue: `${data.value} %`,
                      })
                    : t('components.items.percentageDeduction', {
                          value: data.value,
                          defaultValue: `${data.value} %`,
                      })
                : t('components.items.fixedAmount', {
                      value: data.value.toFixed(2),
                      currency: currencySymbol,
                      defaultValue: `${currencySymbol} ${data.value.toFixed(2)}`,
                  });

        const updated = current.map((item) => {
            if (item.id === id) {
                return {
                    ...item,
                    id: data.name,
                    description: data.description || defaultDesc,
                    type: data.type,
                    value: data.value,
                    taxable: data.taxable,
                    recurring: data.recurring,
                };
            }
            return item;
        });

        setValue(type, updated, { shouldValidate: true });

        setEditingComponent(null);
    };

    const openEditDialog = (type: 'allowances' | 'deductions', item: any) => {
        setEditingComponent({
            type,
            id: item.id,
            data: {
                name: item.id,
                category:
                    type === 'allowances'
                        ? PayrollComponentType.ALLOWANCE
                        : PayrollComponentType.DEDUCTION,
                description: item.description,
                type: item.type,
                value: item.value,
                taxable: item.taxable,
                recurring: item.recurring,
            },
        });
    };

    const { mutateAsync: deletePayrollComponent } = useDeletePayrollComponent();

    const handleRemoveComponent = async (category: 'allowances' | 'deductions', id: string) => {
        const current = watch(category);
        const itemToRemove = current.find((i) => i.id === id);
        const updated = current.filter((item) => item.id !== id);

        // Persist deletion if it has a dbId
        if (itemToRemove?.dbId) {
            try {
                await deletePayrollComponent({
                    id: itemToRemove.dbId,
                    componentType:
                        category === 'allowances'
                            ? PayrollComponentType.ALLOWANCE
                            : PayrollComponentType.DEDUCTION,
                });
                toast({
                    title: t('setup.success'),
                    description: t('components.deleted', {
                        defaultValue: 'Component deleted successfully',
                    }),
                });
            } catch (error) {
                console.error('Failed to delete component:', error);
                toast({
                    title: t('setup.error'),
                    description: t('components.deleteError', {
                        defaultValue: 'Failed to delete component',
                    }),
                    variant: 'destructive',
                });
                return; // Don't remove from local state if backend delete fails
            }
        }

        setValue(category, updated, { shouldValidate: true });
    };

    const onSubmit = async (data: PayrollStructureValues) => {
        if (!data.companyId) {
            toast({
                title: t('setup.error', { defaultValue: 'Error' }),
                description: t('setup.selectCompanyFirst', {
                    defaultValue: 'Please select a company first.',
                }),
                variant: 'destructive',
            });
            return;
        }

        setIsSaving(true);
        try {
            // 1. Payroll Config
            const cycleMap: Record<string, PayrollCycle> = {
                monthly: PayrollCycle.MONTHLY,
                'bi-weekly': PayrollCycle.BI_WEEKLY,
                weekly: PayrollCycle.WEEKLY,
            };
            const payDay = data.processingDay;

            await updatePayrollConfig({
                companyId: data.companyId,
                cycleType: cycleMap[data.payrollCycle] ?? PayrollCycle.MONTHLY,
                payDay: payDay,
                autoFinalize: false,
            });

            // 2. Prepare Payroll Components for Unified Upsert
            const componentInputs: any[] = [
                ...data.allowances.map((item: any) => ({
                    id: item.dbId,
                    companyId: data.companyId,
                    componentType: PayrollComponentType.ALLOWANCE,
                    name: COMPONENT_NAMES[item.id] ?? item.id,
                    type: item.type ?? 'fixed',
                    value: item.value ?? 0,
                    taxable: item.taxable ?? true,
                    isActive: item.enabled,
                })),
                ...data.deductions.map((item: any) => ({
                    id: item.dbId,
                    companyId: data.companyId,
                    componentType: PayrollComponentType.DEDUCTION,
                    name: COMPONENT_NAMES[item.id] ?? item.id,
                    type: item.type ?? 'fixed',
                    value: item.value ?? 0,
                    recurring: item.recurring ?? true,
                    isActive: item.enabled,
                })),
            ];

            // 3. Unified Upsert
            if (componentInputs.length > 0) {
                await upsertPayrollComponents(componentInputs);
            }

            // 4. Overtime Policies
            const overtimeInputs = [
                {
                    companyId: data.companyId,
                    name: t('overtime.standard', { defaultValue: 'Standard Overtime' }),
                    rateValue: parseFloat(data.overtimeRules.standard) || 1.5,
                    type: OvertimeType.MULTIPLIER,
                },
                {
                    companyId: data.companyId,
                    name: t('overtime.weekend', { defaultValue: 'Weekend Overtime' }),
                    rateValue: parseFloat(data.overtimeRules.weekend) || 2.0,
                    type: OvertimeType.FIXED_RATE,
                },
                {
                    companyId: data.companyId,
                    name: t('overtime.public holiday', { defaultValue: 'Public Holiday Overtime' }),
                    rateValue: parseFloat(data.overtimeRules.publicHoliday) || 5.0,
                    type: OvertimeType.FIXED_RATE,
                },
            ];

            await createOvertimePoliciesBatch(overtimeInputs);

            toast({
                title: t('setup.success', { defaultValue: 'Success' }),
                description: t('setup.successMessage', {
                    defaultValue: 'Payroll structure successfully saved!',
                }),
            });
            setPayrollData(data);
            if (onNext) {
                onNext();
            } else {
                router.push(
                    mode === 'dashboard' ? '/dashboard/payroll-officer' : '/onboarding/team-setup',
                );
            }
        } catch (err: any) {
            console.error('Error saving payroll structure:', err);
            toast({
                title: t('setup.error', { defaultValue: 'Error' }),
                description:
                    err.message ||
                    t('setup.errorMessage', { defaultValue: 'Failed to save payroll structure.' }),
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="mx-auto w-full max-w-4xl space-y-6 pb-16"
            >
                <Card className="overflow-hidden rounded-[16px] border border-border bg-card shadow-none">
                    <CardHeader className="border-b border-border bg-muted/40 px-6 py-4">
                        <CardTitle className="text-[14px] font-semibold text-foreground rtl:text-end">
                            {t('sections.configureStructure', {
                                defaultValue: 'Configure Payroll structure by company',
                            })}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 sm:p-8">
                        {/* Select company block */}
                        <div className="flex flex-col gap-3">
                            <FormSelect
                                id="companyId"
                                label={t('setup.selectCompany')}
                                placeholder={
                                    isLoadingCompanies
                                        ? t('setup.loadingCompanies', {
                                              defaultValue: 'Loading...',
                                          })
                                        : t('setup.selectCompanyPlaceholder')
                                }
                                control={control}
                                name="companyId"
                                error={errors.companyId}
                                options={companyOptions}
                                t={t}
                            />
                        </div>

                        <div className="space-y-8 mt-8">
                            <div className="space-y-6">
                                <h3 className="text-[14px] font-semibold text-foreground rtl:text-end">
                                    {t('sections.payrollCycle', {
                                        defaultValue: 'Payroll Cycle & Processing',
                                    })}
                                </h3>

                                <RadioGroup
                                    onValueChange={(val) =>
                                        setValue('payrollCycle', val as any, {
                                            shouldValidate: true,
                                        })
                                    }
                                    defaultValue={payrollCycle}
                                    className="flex w-full flex-col items-start gap-4 md:flex-row md:gap-6"
                                >
                                    {['monthly', 'bi-weekly', 'weekly'].map((type) => (
                                        <Label
                                            key={type}
                                            className={cn(
                                                'relative flex min-h-17.5 w-full flex-1 cursor-pointer flex-row items-start gap-3 rounded-2xl border p-4 shadow-none transition-all',
                                                'rtl:flex-row-reverse',
                                                payrollCycle === type
                                                    ? 'border-primary bg-primary/10'
                                                    : 'border-border bg-card text-muted-foreground hover:bg-muted/10',
                                            )}
                                        >
                                            <RadioGroupItem
                                                value={type}
                                                id={type}
                                                className="sr-only"
                                            />
                                            <RadioIndicator checked={payrollCycle === type} />
                                            <div className="flex flex-1 flex-col items-start justify-center gap-1.5 pt-px rtl:items-end">
                                                <span className="font-sans text-sm font-medium leading-none text-foreground rtl:text-end">
                                                    {t(`cycles.${type}`)}
                                                </span>
                                                <span className="font-sans text-[12px] font-normal leading-4 text-muted-foreground rtl:text-end">
                                                    {t(`cycles.${type}Desc`)}
                                                </span>
                                            </div>
                                        </Label>
                                    ))}
                                </RadioGroup>

                                <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-6">
                                    <FormField
                                        id="processingDay"
                                        label={t('fields.processingDay')}
                                        name="processingDay"
                                        type="number"
                                        register={register}
                                        error={errors.processingDay}
                                        validation={{ valueAsNumber: true, min: 1, max: 31 }}
                                        className="h-9 text-left text-lg font-medium"
                                        t={t}
                                    />

                                    <div className="mt-0 flex w-full flex-1 items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 rtl:flex-row-reverse">
                                        <CircleAlert className="size-5 shrink-0 text-amber-500" />
                                        <p className="text-sm font-normal leading-relaxed text-amber-800 dark:text-amber-200 rtl:text-end">
                                            {t('fields.processingDayWarning')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="my-8 w-full border-t border-border" />

                            {/* Payroll Components */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[14px] font-semibold text-foreground rtl:text-end">
                                        {t('components.title', {
                                            defaultValue: 'Payroll Components',
                                        })}
                                    </h3>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setIsAddComponentOpen(true)}
                                        className="h-auto p-0 text-[14px] font-semibold text-primary hover:bg-transparent hover:text-primary/80 rtl:flex-row-reverse rtl:gap-1"
                                    >
                                        <Plus className="mr-1 size-4" />
                                        {t('components.addNew', { defaultValue: 'Add Component' })}
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {/* Allowances */}
                                    <AllowanceDeductionList
                                        title={t('components.allowances', {
                                            defaultValue: 'Allowances',
                                        })}
                                        items={allowances}
                                        isLoading={isLoadingComponentsList || isLoadingConfig}
                                        currencySymbol={currencySymbol}
                                        category="allowances"
                                        onToggle={toggleComponent}
                                        onEdit={openEditDialog}
                                        onRemove={handleRemoveComponent}
                                        t={t}
                                    />

                                    {/* Deductions */}
                                    <AllowanceDeductionList
                                        title={t('components.deductions')}
                                        items={deductions}
                                        isLoading={isLoadingComponentsList || isLoadingConfig}
                                        currencySymbol={currencySymbol}
                                        category="deductions"
                                        onToggle={toggleComponent}
                                        onEdit={openEditDialog}
                                        onRemove={handleRemoveComponent}
                                        t={t}
                                    />
                                </div>
                            </div>

                            <div className="my-8 w-full border-t border-border" />

                            {/* Overtime Rules */}
                            <OvertimeRulesSection
                                isLoading={isLoadingComponentsList || isLoadingConfig}
                                register={register}
                                t={t}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pb-10 pt-8">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                            if (onBack) {
                                onBack();
                            } else {
                                router.push('/onboarding/hr-policies');
                            }
                        }}
                        className="flex items-center gap-2 text-[14px] font-medium text-foreground/80 transition-transform hover:-translate-x-1 rtl:hover:translate-x-1 rtl:flex-row-reverse"
                    >
                        <ArrowLeft className="size-4 rtl:rotate-180" />
                        {t('actions.back')}
                    </Button>
                    <Button
                        type="submit"
                        size="lg"
                        disabled={isSaving}
                        className="h-11 rounded-[10px] bg-primary px-8 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                    >
                        {isSaving
                            ? t('actions.saving', { defaultValue: 'Saving...' })
                            : mode === 'dashboard'
                              ? t('actions.finishSetup')
                              : t('actions.continue')}
                    </Button>
                </div>
            </form>

            <PayrollComponentSheet
                isOpen={isAddComponentOpen || !!editingComponent}
                onOpenChange={(open) => {
                    if (!open) {
                        setIsAddComponentOpen(false);
                        setEditingComponent(null);
                    }
                }}
                title={
                    editingComponent
                        ? t('components.editTitle', { defaultValue: 'Edit Component' })
                        : undefined
                }
                defaultValues={editingComponent?.data}
                onSubmit={editingComponent ? handleSaveEdit : handleAddComponent}
            />
        </>
    );
}
