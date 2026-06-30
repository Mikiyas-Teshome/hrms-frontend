'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FormSelect } from '@/components/ui/FormSelect';
import { FormField } from '@/components/ui/FormField';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
    useInsurances,
    useCreateInsurance
} from '@/features/insurance/hooks/useInsurance';
import {
    InsuranceCoverageType,
    InsuranceRenewalType,
    InsuranceIncludedService,
    DependentRelationship,
    EmploymentType
} from '@/features/insurance/insurance.types';
import { formatInsuranceFormPayload } from '@/components/dashboard/benefits/insurance-form.utils';
import {
    getIncludedServiceOptionsForCoverageType,
    pruneIncludedServicesForCoverageType,
    coverageTypeSupportsIncludedServices,
} from '@/features/insurance/insurance-included-services.util';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { useCompanyOptions } from '@/features/organization/hooks/useOrganization';
import {
    buildCompanyNameByOuIdMap,
    resolveCompanyLabel,
} from '@/features/organization/organization-unit-options.util';


const FormSelectAny = FormSelect as any;

export const insuranceOnboardingSchema = z.object({
    ouId: z.string().min(1, 'Company is required'),
    insuranceName: z.string().min(1, 'Insurance name is required'),
    providerName: z.string().min(1, 'Provider name is required'),
    policyNumber: z.string().min(1, 'Policy number is required'),
    cardId: z.string().optional(),
    coverageType: z.nativeEnum(InsuranceCoverageType),
    coverageAmount: z.coerce.number().min(0).optional(),
    renewalType: z.nativeEnum(InsuranceRenewalType),
    hasDependentsCoverage: z.boolean().default(false),
    maxDependents: z.coerce.number().min(0).optional(),
    allowedDependents: z.array(z.nativeEnum(DependentRelationship)).default([]),
    includedServices: z.array(z.nativeEnum(InsuranceIncludedService)).default([]),
    employmentType: z.nativeEnum(EmploymentType).optional(),
    minTenureMonths: z.coerce.number().min(0).optional(),
    employerContribution: z.coerce.number().min(0).max(100).default(100),
    employeeContribution: z.coerce.number().min(0).max(100).default(0),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
});

export type InsuranceOnboardingValues = z.infer<typeof insuranceOnboardingSchema>;

interface InsuranceTabProps {
    selectedCompanyId: string;
    companyName?: string;
    onContinueToContract?: () => void;
}

export function InsuranceTab({ selectedCompanyId, companyName, onContinueToContract }: InsuranceTabProps) {
    const { t } = useTranslation(['contractsInsurances', 'contracts', 'insurance', 'dashboard']);
    const { toast } = useToast();
    const { companies: companiesData } = useCompanyOptions();
    const companyNameByOuId = useMemo(
        () => buildCompanyNameByOuIdMap(companiesData ?? []),
        [companiesData],
    );

    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const { data: insurancesList, refetch: refetchInsurances } = useInsurances({
        limit: rowsPerPage,
        page: currentPage,
        ouId: selectedCompanyId || undefined
    });

    const createInsuranceMutation = useCreateInsurance();

    const {
        register: registerIns,
        handleSubmit: handleSubmitIns,
        watch: watchIns,
        setValue: setValueIns,
        control: controlIns,
        reset: resetIns,
        getValues: getValuesIns,
        formState: { errors: errorsIns, isSubmitting: isSubmittingIns }
    } = useForm<InsuranceOnboardingValues>({
        resolver: zodResolver(insuranceOnboardingSchema) as any,
        defaultValues: {
            ouId: selectedCompanyId || '',
            insuranceName: '',
            providerName: '',
            policyNumber: 'AUTO-GEN-POLICY',
            coverageType: InsuranceCoverageType.HEALTH,
            renewalType: InsuranceRenewalType.YEARLY,
            hasDependentsCoverage: false,
            maxDependents: 1,
            allowedDependents: [],
            includedServices: [],
            employerContribution: 100,
            employeeContribution: 0,
            employmentType: EmploymentType.full_time,
            minTenureMonths: 0,
        }
    });

    useEffect(() => {
        if (selectedCompanyId) {
            setValueIns('ouId', selectedCompanyId);
            refetchInsurances();
        }
    }, [selectedCompanyId, setValueIns, refetchInsurances]);

    const coverageType = watchIns('coverageType');
    const hasDependentsCoverage = watchIns('hasDependentsCoverage');
    const allowedDependents = watchIns('allowedDependents') || [];
    const includedServices = watchIns('includedServices') || [];

    const includedServiceOptions = useMemo(
        () => getIncludedServiceOptionsForCoverageType(coverageType),
        [coverageType],
    );

    useEffect(() => {
        const current = getValuesIns('includedServices') || [];
        const pruned = pruneIncludedServicesForCoverageType(coverageType, current);
        if (pruned.length !== current.length) {
            setValueIns('includedServices', pruned, { shouldValidate: true });
        }
    }, [coverageType, getValuesIns, setValueIns]);

    const handleCheckboxChange = (
        field: 'allowedDependents' | 'includedServices',
        value: any,
        checked: boolean
    ) => {
        const current = watchIns(field) || [];
        if (checked) {
            setValueIns(field, [...current, value] as any, { shouldValidate: true });
        } else {
            setValueIns(field, current.filter((v: any) => v !== value) as any, { shouldValidate: true });
        }
    };

    const onAddInsurance = async (data: InsuranceOnboardingValues) => {
        try {
            const today = new Date();
            const nextYear = new Date();
            nextYear.setFullYear(today.getFullYear() + 1);

            const payloadData = {
                ...data,
                policyNumber: data.policyNumber || `POL-${Math.floor(100000 + Math.random() * 900000)}`,
                providerName: data.providerName || 'Provider',
                startDate: today.toISOString().split('T')[0],
                endDate: nextYear.toISOString().split('T')[0],
            };

            const payload = formatInsuranceFormPayload(payloadData as any);
            const result = await createInsuranceMutation.mutateAsync(payload);
            if (result && !result.success) {
                toast({
                    title: 'Error',
                    description: result.error || 'Failed to add insurance plan',
                    variant: 'destructive'
                });
                return;
            }
            toast({
                title: 'Success',
                description: 'Insurance plan added successfully!'
            });
            resetIns({
                ouId: selectedCompanyId,
                insuranceName: '',
                providerName: '',
                policyNumber: 'AUTO-GEN-POLICY',
                coverageType: InsuranceCoverageType.HEALTH,
                renewalType: InsuranceRenewalType.YEARLY,
                hasDependentsCoverage: false,
                maxDependents: 1,
                allowedDependents: [],
                includedServices: [],
                employerContribution: 100,
                employeeContribution: 0,
                employmentType: EmploymentType.full_time,
                minTenureMonths: 0,
            });
            refetchInsurances();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Something went wrong',
                variant: 'destructive'
            });
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300 w-full">
            <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-none bg-white dark:bg-zinc-950/20 overflow-hidden w-full">
                <CardHeader className="bg-slate-50/50 dark:bg-zinc-900/40 border-b border-slate-200/60 dark:border-zinc-850 px-6 py-4">
                    <CardTitle className="text-base font-bold text-foreground">Add Insurance</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <form onSubmit={(handleSubmitIns as any)(onAddInsurance)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                id="insuranceName"
                                label="Insurance name"
                                placeholder="Enter insurance name"
                                register={registerIns as any}
                                name="insuranceName"
                                error={errorsIns.insuranceName}
                                t={t}
                            />

                            <FormField
                                id="providerName"
                                label="Insurance provider"
                                placeholder="Enter insurance provider"
                                register={registerIns as any}
                                name="providerName"
                                error={errorsIns.providerName}
                                t={t}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormSelectAny
                                id="coverageType"
                                label="Coverage type"
                                placeholder="Select Coverage Type"
                                control={controlIns as any}
                                name="coverageType"
                                error={errorsIns.coverageType}
                                options={[
                                    { label: 'Health', value: InsuranceCoverageType.HEALTH },
                                    { label: 'Dental', value: InsuranceCoverageType.DENTAL },
                                    { label: 'Vision', value: InsuranceCoverageType.VISION },
                                    { label: 'Life', value: InsuranceCoverageType.LIFE },
                                    { label: 'Other', value: InsuranceCoverageType.OTHER },
                                ]}
                                t={t}
                                containerClassName="space-y-2"
                            />

                            <div className="flex flex-col gap-2">
                                <Label className="text-sm font-semibold text-foreground">Coverage amount</Label>
                                <input
                                    type="number"
                                    {...registerIns('coverageAmount', { valueAsNumber: true })}
                                    placeholder="Enter coverage amount"
                                    className="flex h-11 w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormSelectAny
                                id="renewalType"
                                label="Renewal Type"
                                placeholder="Select Renewal"
                                control={controlIns as any}
                                name="renewalType"
                                error={errorsIns.renewalType}
                                options={[
                                    { label: 'Yearly', value: InsuranceRenewalType.YEARLY },
                                    { label: 'Monthly', value: InsuranceRenewalType.MONTHLY },
                                    { label: 'Quarterly', value: InsuranceRenewalType.QUARTERLY },
                                ]}
                                t={t}
                                containerClassName="space-y-2"
                            />
                        </div>

                        <div className="pt-2 space-y-4">
                            <div className="flex items-center gap-3">
                                <Switch
                                    id="hasDependentsCoverage"
                                    checked={hasDependentsCoverage}
                                    onCheckedChange={(checked) => {
                                        setValueIns('hasDependentsCoverage', checked, { shouldValidate: true });
                                        if (checked && (watchIns('maxDependents') === undefined || watchIns('maxDependents') === null)) {
                                            setValueIns('maxDependents', 1, { shouldValidate: true });
                                        }
                                    }}
                                    className="data-[state=checked]:bg-primary"
                                />
                                <Label htmlFor="hasDependentsCoverage" className="font-semibold text-sm cursor-pointer text-foreground">Dependents Coverage</Label>
                            </div>

                            {hasDependentsCoverage && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50/65 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800 animate-in slide-in-from-top-2 duration-200">
                                    <div className="flex flex-col gap-2">
                                        <Label className="text-sm font-semibold text-foreground">Max dependents</Label>
                                        <input
                                            type="number"
                                            min={0}
                                            {...registerIns('maxDependents', { valueAsNumber: true })}
                                            placeholder="1"
                                            className="flex h-11 w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                        {errorsIns.maxDependents && (
                                            <span className="text-xs text-destructive">{errorsIns.maxDependents.message}</span>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Relationships</Label>
                                        <div className="grid grid-cols-2 gap-3.5 pt-1">
                                            {[
                                                { label: 'Spouse', value: DependentRelationship.SPOUSE },
                                                { label: 'Child', value: DependentRelationship.CHILD },
                                                { label: 'Parent', value: DependentRelationship.PARENT },
                                                { label: 'Other', value: DependentRelationship.OTHER },
                                            ].map((rel) => (
                                                <div key={rel.value} className="flex items-center gap-2">
                                                    <Checkbox
                                                        id={`rel-${rel.value}`}
                                                        checked={allowedDependents.includes(rel.value)}
                                                        onCheckedChange={(checked) => handleCheckboxChange('allowedDependents', rel.value, !!checked)}
                                                    />
                                                    <Label htmlFor={`rel-${rel.value}`} className="text-sm font-medium cursor-pointer text-foreground">{rel.label}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {coverageTypeSupportsIncludedServices(coverageType) ? (
                            <div className="pt-2 space-y-3">
                                <Label className="text-sm font-semibold text-foreground">Included services</Label>
                                <div className="flex flex-wrap gap-x-8 gap-y-3">
                                    {includedServiceOptions.map((service) => (
                                        <div key={service.value} className="flex items-center gap-2">
                                            <Checkbox
                                                id={`service-${service.value}`}
                                                checked={includedServices.includes(service.value)}
                                                onCheckedChange={(checked) =>
                                                    handleCheckboxChange(
                                                        'includedServices',
                                                        service.value,
                                                        !!checked,
                                                    )
                                                }
                                            />
                                            <Label
                                                htmlFor={`service-${service.value}`}
                                                className="text-sm font-medium cursor-pointer text-foreground"
                                            >
                                                {service.label}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <FormSelectAny
                                id="employmentType"
                                label="Employment type"
                                placeholder="Select Employment Type"
                                control={controlIns as any}
                                name="employmentType"
                                options={[
                                    { label: 'Full time', value: EmploymentType.full_time },
                                    { label: 'Part time', value: EmploymentType.part_time },
                                    { label: 'Contract', value: EmploymentType.contract },
                                    { label: 'Intern', value: EmploymentType.intern },
                                    { label: 'Consultant', value: EmploymentType.consultant },
                                ]}
                                t={t}
                                containerClassName="space-y-2"
                            />

                            <div className="flex flex-col gap-2">
                                <Label className="text-sm font-semibold text-foreground">Minimum tenure (months)</Label>
                                <input
                                    type="number"
                                    min={0}
                                    {...registerIns('minTenureMonths', { valueAsNumber: true })}
                                    placeholder="0"
                                    className="flex h-11 w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                                {errorsIns.minTenureMonths && (
                                    <span className="text-xs text-destructive">{errorsIns.minTenureMonths.message}</span>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <div className="flex flex-col gap-2">
                                <Label className="text-sm font-semibold text-foreground">Employer Contribution</Label>
                                <div className="relative flex items-center">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        {...registerIns('employerContribution', {
                                            onChange: (e) => {
                                                const cleaned = e.target.value.replace(/\D/g, '');
                                                const val = cleaned ? Math.min(100, Number(cleaned)) : 0;
                                                e.target.value = val.toString();
                                                setValueIns('employerContribution', val, { shouldValidate: true });
                                                setValueIns('employeeContribution', 100 - val, { shouldValidate: true });
                                            }
                                        })}
                                        placeholder="100"
                                        className="flex h-11 w-full rounded-lg border border-input bg-background pl-3.5 pr-10 py-2 text-sm placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    />
                                    <span className="absolute right-3.5 text-sm font-semibold text-muted-foreground select-none">%</span>
                                </div>
                                {errorsIns.employerContribution && (
                                    <span className="text-xs text-destructive">{errorsIns.employerContribution.message}</span>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label className="text-sm font-semibold text-foreground">Employee Contribution</Label>
                                <div className="relative flex items-center">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        {...registerIns('employeeContribution', {
                                            onChange: (e) => {
                                                const cleaned = e.target.value.replace(/\D/g, '');
                                                const val = cleaned ? Math.min(100, Number(cleaned)) : 0;
                                                e.target.value = val.toString();
                                                setValueIns('employeeContribution', val, { shouldValidate: true });
                                                setValueIns('employerContribution', 100 - val, { shouldValidate: true });
                                            }
                                        })}
                                        placeholder="0"
                                        className="flex h-11 w-full rounded-lg border border-input bg-background pl-3.5 pr-10 py-2 text-sm placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    />
                                    <span className="absolute right-3.5 text-sm font-semibold text-muted-foreground select-none">%</span>
                                </div>
                                {errorsIns.employeeContribution && (
                                    <span className="text-xs text-destructive">{errorsIns.employeeContribution.message}</span>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="submit"
                                disabled={isSubmittingIns || createInsuranceMutation.isPending}
                                className="bg-primary/10 hover:bg-primary/20 text-foreground py-2 px-4 font-medium text-sm gap-2 border-none transition-colors flex items-center"
                            >
                                {(isSubmittingIns || createInsuranceMutation.isPending) ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    t('actions.saveInsurance', { defaultValue: 'Save insurance' })
                                )}
                            </Button>
                            {(insurancesList?.data?.length ?? 0) > 0 && onContinueToContract ? (
                                <Button
                                    type="button"
                                    onClick={onContinueToContract}
                                    className="bg-primary hover:bg-primary/90 text-white py-2 px-4 font-medium text-sm transition-colors"
                                >
                                    {t('actions.continueToContract', { defaultValue: 'Continue to contract' })}
                                </Button>
                            ) : null}
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="w-full">
                <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-none bg-white dark:bg-zinc-950/20 overflow-hidden w-full">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto w-full">
                            <table className="w-full text-sm text-left rtl:text-right border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/75 dark:bg-zinc-900/60 border-b border-slate-100 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-semibold">
                                        <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold">Insurance name</th>
                                        <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold">Company</th>
                                        <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold">Provider</th>
                                        <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold">Coverage type</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-zinc-900">
                                    {insurancesList?.data && insurancesList.data.length > 0 ? (
                                        insurancesList.data.map((ins) => (
                                            <tr key={ins.id} className="hover:bg-slate-50/30 dark:hover:bg-zinc-900/10 transition-colors font-medium">
                                                <td className="px-6 py-4 text-slate-800 dark:text-zinc-200 font-semibold">{ins.insuranceName}</td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-zinc-400">
                                                    {resolveCompanyLabel(
                                                        ins.ouId,
                                                        companyNameByOuId,
                                                        companyName,
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-zinc-400 font-semibold">
                                                    {ins.providerName || '—'}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-zinc-400">
                                                    {(() => {
                                                        const t = ins.coverageType?.toUpperCase();
                                                        if (t === 'HEALTH') return 'Health';
                                                        if (t === 'OTHER') return 'Accidents';
                                                        if (t === 'DENTAL') return 'Dental';
                                                        if (t === 'VISION') return 'Vision';
                                                        if (t === 'LIFE') return 'Life';
                                                        return ins.coverageType ? ins.coverageType.charAt(0).toUpperCase() + ins.coverageType.slice(1).toLowerCase() : '—';
                                                    })()}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="p-12 text-center">
                                                <div className="flex flex-col items-center justify-center gap-3">
                                                    <div className="p-3.5 bg-slate-50 dark:bg-zinc-900/50 rounded-2xl text-muted-foreground">
                                                        <ShieldAlert className="h-8 w-8 text-muted-foreground/80" />
                                                    </div>
                                                    <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">No insurance plans added yet</p>
                                                    <p className="text-xs text-muted-foreground max-w-sm">Create an insurance plan using the form above to display it in the table list.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {(insurancesList?.data?.length ?? 0) > 0 && (
                            <DataTablePagination
                                totalItems={insurancesList?.pagination?.total ?? insurancesList?.data?.length ?? 0}
                                pageSize={rowsPerPage}
                                currentPage={currentPage}
                                totalPages={insurancesList?.pagination?.totalPages || 1}
                                onPageChange={setCurrentPage}
                                onPageSizeChange={(size) => {
                                    setRowsPerPage(size);
                                    setCurrentPage(1);
                                }}
                                pageSizeOptions={[10, 20, 50]}
                                className="px-6 py-4 border-t border-border bg-background h-auto lg:h-13 pt-4"
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
