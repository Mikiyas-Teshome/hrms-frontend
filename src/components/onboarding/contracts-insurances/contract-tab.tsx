'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { X, Info, ShieldAlert, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FormSelect } from '@/components/ui/FormSelect';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { uploadLogo } from '@/features/documents/documents.actions';
import { useContracts, useCreateContract } from '@/features/contracts/hooks/useContracts';
import { useInsurances } from '@/features/insurance/hooks/useInsurance';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { usePermissions } from '@/features/auth/hooks/usePermissions';

const FormSelectAny = FormSelect as any;

// Zod schema for Contract Form in Onboarding
export const contractOnboardingSchema = z.object({
    companyId: z.string().min(1, 'Company is required'),
    contractName: z.string().min(1, 'Contract name is required'),
    status: z.string().min(1, 'Status is required'),
    description: z.string().optional(),
    durationMonths: z
        .union([z.string(), z.number()])
        .optional()
        .transform((val) => (val === '' || val === undefined ? undefined : Number(val))),
    probationPeriodMonths: z
        .union([z.string(), z.number()])
        .optional()
        .transform((val) => (val === '' || val === undefined ? undefined : Number(val))),
    employmentType: z.string().min(1, 'Employment type is required'),
    contractType: z.string().min(1, 'Contract type is required'),
    isRenewable: z.boolean().default(false),
    insuranceIds: z.array(z.string()).default([]),
});

export type ContractOnboardingValues = z.infer<typeof contractOnboardingSchema>;

interface ContractTabProps {
    selectedCompanyId: string;
    companyName?: string;
}

export function ContractTab({ selectedCompanyId, companyName }: ContractTabProps) {
    const { t } = useTranslation(['contractsInsurances', 'contracts', 'insurance', 'dashboard', 'employees']);
    const { toast } = useToast();
  const { hasPermission } = usePermissions();
  const canCreateContracts = hasPermission('contracts:create');
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [contractFile, setContractFile] = useState<File | null>(null);
    const contractFileInputRef = useRef<HTMLInputElement>(null);
    const selectedCompanyIdTrimmed = selectedCompanyId?.trim();

    // Fetch lists from backend
    const { data: insurancesList } = useInsurances({
        limit: 100,
        companyOuId: selectedCompanyId || undefined,
    });

    const contractFilter = useMemo(
        () => ({
            limit: rowsPerPage,
            page: currentPage,
        }),
        [rowsPerPage, currentPage],
    );

    const { data: contractsResponse, refetch: refetchContracts } = useContracts(contractFilter);
    const contractsList = contractsResponse?.data ?? [];
    const contractsPagination = contractsResponse?.pagination;

    // Mutations
    const createContractMutation = useCreateContract();

    // Contract Form Hook
    const {
        register: registerContract,
        handleSubmit: handleSubmitContract,
        watch: watchContract,
        setValue: setValueContract,
        control: controlContract,
        reset: resetContract,
        formState: { errors: errorsContract, isSubmitting: isSubmittingContract },
    } = useForm<ContractOnboardingValues>({
        resolver: zodResolver(contractOnboardingSchema) as any,
        defaultValues: {
            companyId: selectedCompanyId || '',
            contractName: '',
            status: 'active',
            description: '',
            employmentType: 'full_time',
            contractType: 'permanent',
            isRenewable: false,
            insuranceIds: [],
        },
    });

    // Sync selectedCompanyId to Contract Form and refetch
    useEffect(() => {
        if (selectedCompanyId) {
            setValueContract('companyId', selectedCompanyId);
            refetchContracts();
        }
    }, [selectedCompanyId, setValueContract, refetchContracts]);

    // Watchers
    const selectedInsuranceIds = watchContract('insuranceIds') || [];

    const triggerContractFilePicker = () => {
        contractFileInputRef.current?.click();
    };

    const handleContractFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (file) {
            setContractFile(file);
        }
    };

    const onAddContract = async (data: ContractOnboardingValues) => {
        if (!canCreateContracts) {
            toast({
                title: 'Error',
                description: 'Insufficient permissions',
                variant: 'destructive',
            });
            return;
        }
        try {
            const insurancesInput = data.insuranceIds
                ?.map((id: string) => {
                    const ins = insurancesList?.data?.find((i) => i.id === id);
                    if (!ins) return null;
                    return {
                        insuranceName: ins.insuranceName,
                        providerName: ins.providerName,
                        policyNumber: ins.policyNumber,
                        coverageType: ins.coverageType,
                        assignment: ins.assignment,
                        renewalType: ins.renewalType,
                        hasDependentsCoverage: ins.hasDependentsCoverage,
                        employerContribution: ins.employerContribution,
                        employeeContribution: ins.employeeContribution,
                        startDate: ins.startDate,
                        endDate: ins.endDate,
                        status: ins.status,
                    };
                })
                .filter(Boolean);

            let documentUrl: string | undefined;
            if (contractFile) {
                const formData = new FormData();
                formData.append('file', contractFile);
                const uploadResult = await uploadLogo(formData);
                if (uploadResult.error || !uploadResult.url) {
                    throw new Error(uploadResult.error || 'Failed to upload contract file');
                }
                documentUrl = uploadResult.url;
            }

            const payload: any = {
                contractNumber: `CON-${Math.floor(100000 + Math.random() * 900000)}`,
                contractName: data.contractName,
                description: data.description || undefined,
                contractType: data.contractType as any,
                employmentType: data.employmentType as any,
                status: data.status as any,
                durationMonths: data.durationMonths || undefined,
                isRenewable: data.isRenewable,
                probationPeriodMonths: data.probationPeriodMonths || undefined,
                insurances: insurancesInput,
                documentUrl,
            };

            await createContractMutation.mutateAsync(payload);
            toast({ title: 'Success', description: 'Contract saved successfully!' });
            resetContract({
                companyId: selectedCompanyId,
                contractName: '',
                status: 'active',
                description: '',
                employmentType: 'full_time',
                contractType: 'permanent',
                isRenewable: false,
                insuranceIds: [],
            });
            setContractFile(null);
            if (contractFileInputRef.current) {
                contractFileInputRef.current.value = '';
            }
            refetchContracts();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Something went wrong',
                variant: 'destructive',
            });
        }
    };

    const getInsuranceName = (id: string) =>
        insurancesList?.data?.find((i) => i.id === id)?.insuranceName || id;

    return (
        <div className="space-y-8 animate-in fade-in duration-300 w-full">
            {/* Add Contract Card — full width */}
            <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-none bg-white dark:bg-zinc-950/20 overflow-hidden w-full">
                <CardHeader className="bg-slate-50/50 dark:bg-zinc-900/40 border-b border-slate-200/60 dark:border-zinc-850 px-6 py-4">
                    <CardTitle className="text-base font-bold text-foreground">
                        {t('addContractTitle', { defaultValue: 'Add contract' })}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <form
                        onSubmit={(handleSubmitContract as any)(onAddContract)}
                        className="space-y-6"
                    >
                        {/* Row 1: Contract name + Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <Label className="text-sm font-semibold text-foreground">
                                    Contract name
                                </Label>
                                <input
                                    type="text"
                                    {...registerContract('contractName')}
                                    placeholder=""
                                    className="flex h-11 w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                />
                                {errorsContract.contractName && (
                                    <span className="text-xs text-destructive">
                                        {errorsContract.contractName.message}
                                    </span>
                                )}
                            </div>

                            <FormSelectAny
                                id="contract-status"
                                label="Status"
                                name="status"
                                control={controlContract as any}
                                error={errorsContract.status}
                                options={[
                                    { label: 'Active', value: 'active' },
                                    { label: 'Draft', value: 'draft' },
                                ]}
                                t={t}
                                containerClassName="space-y-2"
                            />
                        </div>

                        {/* Row 2: Description full width */}
                        <div className="flex flex-col gap-2">
                            <Label className="text-sm font-semibold text-foreground">
                                Description
                            </Label>
                            <Textarea
                                placeholder="Add description"
                                {...registerContract('description')}
                                className="min-h-28 resize-none rounded-lg"
                            />
                        </div>

                        {/* Row 3: Employment type + Contract type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormSelectAny
                                id="contract-employment-type"
                                label="Employment type"
                                name="employmentType"
                                control={controlContract as any}
                                error={errorsContract.employmentType}
                                options={[
                                    { label: 'Full time', value: 'full_time' },
                                    { label: 'Part time', value: 'part_time' },
                                    { label: 'Contract', value: 'contract' },
                                    { label: 'Intern', value: 'intern' },
                                    { label: 'Consultant', value: 'consultant' },
                                ]}
                                t={t}
                                containerClassName="space-y-2"
                            />

                            <FormSelectAny
                                id="contract-type-select"
                                label="Contract type"
                                name="contractType"
                                control={controlContract as any}
                                error={errorsContract.contractType}
                                options={[
                                    { label: 'Permanent', value: 'permanent' },
                                    { label: 'Fixed Term', value: 'fixed_term' },
                                    { label: 'Probation', value: 'probation' },
                                    { label: 'Internship', value: 'internship' },
                                    { label: 'Consultant', value: 'consultant' },
                                    { label: 'Seasonal', value: 'seasonal' },
                                ]}
                                t={t}
                                containerClassName="space-y-2"
                            />
                        </div>

                        {/* Row 4: Duration + Probation */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <Label className="text-sm font-semibold text-foreground">
                                    Duration (months)
                                </Label>
                                <input
                                    type="number"
                                    {...registerContract('durationMonths')}
                                    placeholder="Enter duration"
                                    className="flex h-11 w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label className="text-sm font-semibold text-foreground">
                                    Probation (months)
                                </Label>
                                <input
                                    type="number"
                                    {...registerContract('probationPeriodMonths')}
                                    placeholder="Enter probation"
                                    className="flex h-11 w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                />
                            </div>
                        </div>

                        {/* Row 5: Renewable checkbox */}
                        <Controller
                            name="isRenewable"
                            control={controlContract as any}
                            render={({ field }) => (
                                <div className="flex items-center gap-2.5">
                                    <Checkbox
                                        id="isRenewableContract"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                    <Label
                                        htmlFor="isRenewableContract"
                                        className="text-sm font-semibold cursor-pointer text-foreground"
                                    >
                                        Renewable contract
                                    </Label>
                                </div>
                            )}
                        />

                        {/* Row 6: Select insurance + info box */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-foreground">
                                    Select insurance
                                </Label>
                                <Select
                                    onValueChange={(val) => {
                                        if (val && !selectedInsuranceIds.includes(val)) {
                                            setValueContract('insuranceIds', [
                                                ...selectedInsuranceIds,
                                                val,
                                            ]);
                                        }
                                    }}
                                    value=""
                                >
                                    <SelectTrigger className="h-11 w-full rounded-lg border border-input bg-background text-sm text-muted-foreground">
                                        <SelectValue placeholder="Select insurance" />
                                    </SelectTrigger>
                                    <SelectContent position="popper" sideOffset={4}>
                                        {insurancesList?.data && insurancesList.data.length > 0 ? (
                                            insurancesList.data.map((ins) => (
                                                <SelectItem key={ins.id} value={ins.id}>
                                                    {ins.insuranceName}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className="px-3 py-2 text-xs text-muted-foreground">
                                                No insurance plans yet
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>

                                {/* Selected insurance chips */}
                                {selectedInsuranceIds.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {selectedInsuranceIds.map((id) => (
                                            <span
                                                key={id}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-300"
                                            >
                                                {getInsuranceName(id)}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setValueContract(
                                                            'insuranceIds',
                                                            selectedInsuranceIds.filter(
                                                                (i) => i !== id,
                                                            ),
                                                        )
                                                    }
                                                    className="text-slate-400 hover:text-destructive transition-colors"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Info box */}
                            <div className="flex items-start gap-2.5 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
                                <Info className="h-4 w-4 mt-0.5 shrink-0 text-blue-500" />
                                You can select multiple insurance types that apply to the contract
                                you&apos;re creating.
                            </div>
                        </div>

                        {/* Row 7: Contract content file upload */}
                        <div className="flex flex-col gap-2">
                            <Label className="text-sm font-semibold text-foreground">
                                {t('fileAttachment', { defaultValue: 'Contract content' })}
                            </Label>
                            <div className="flex items-center h-11 w-full rounded-lg border border-input bg-background overflow-hidden">
                                <button
                                    type="button"
                                    onClick={triggerContractFilePicker}
                                    className="flex-1 h-full px-3.5 text-sm text-muted-foreground/70 truncate text-left hover:bg-muted/30 transition-colors"
                                >
                                    {contractFile?.name ??
                                        t('employees:noFileChosen', { defaultValue: 'No file chosen' })}
                                </button>
                                <button
                                    type="button"
                                    onClick={triggerContractFilePicker}
                                    className="px-5 h-full flex items-center bg-slate-50 dark:bg-zinc-900 border-l border-input text-sm font-semibold text-foreground hover:bg-slate-100 dark:hover:bg-zinc-850 transition-colors"
                                >
                                    {t('employees:chooseFile', { defaultValue: 'Choose file' })}
                                </button>
                                <input
                                    ref={contractFileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                    onChange={handleContractFileChange}
                                />
                            </div>
                        </div>

                        {/* Save button right-aligned */}
                        <div className="flex justify-end pt-2">
                            <Button
                                type="submit"
                                disabled={isSubmittingContract || !canCreateContracts}
                                className="bg-primary/10 hover:bg-primary/20 text-foreground py-2 px-4 font-medium text-sm gap-2 border-none transition-colors flex items-center"
                            >
                                {isSubmittingContract && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {t('saveContract', { defaultValue: 'Save contract' })}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Contracts Table — full width below */}
            <div className="w-full">
                <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-none bg-white dark:bg-zinc-950/20 overflow-hidden">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto w-full">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/75 dark:bg-zinc-900/60 border-b border-slate-100 dark:border-zinc-800 text-slate-500 dark:text-zinc-400">
                                        <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold">
                                            Contract name
                                        </th>
                                        <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold">
                                            Company
                                        </th>
                                        <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold">
                                            Contract type
                                        </th>
                                        <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold">
                                            Duration
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-zinc-900">
                                    {(() => {
                                        if (contractsList.length > 0) {
                                            return contractsList.map((c) => (
                                                <tr
                                                    key={c.id}
                                                    className="hover:bg-slate-50/30 dark:hover:bg-zinc-900/10 transition-colors font-medium"
                                                >
                                                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-zinc-200">
                                                        {c.contractName ||
                                                            `Contract ${c.contractNumber}`}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600 dark:text-zinc-400">
                                                        {companyName || 'ABC Engineering'}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600 dark:text-zinc-400 capitalize">
                                                        {c.contractType
                                                            ?.toLowerCase()
                                                            .replace('_', '-') || '—'}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600 dark:text-zinc-400 font-semibold">
                                                        {c.durationMonths
                                                            ? `${c.durationMonths} months`
                                                            : 'Indefinite'}
                                                    </td>
                                                </tr>
                                            ));
                                        }
                                        return (
                                            <tr>
                                                <td colSpan={5} className="p-12 text-center">
                                                    <div className="flex flex-col items-center justify-center gap-3">
                                                        <div className="p-3.5 bg-slate-50 dark:bg-zinc-900/50 rounded-2xl">
                                                            <ShieldAlert className="h-8 w-8 text-muted-foreground/75" />
                                                        </div>
                                                        <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                                                            No contracts added yet
                                                        </p>
                                                        <p className="text-xs text-muted-foreground max-w-sm">
                                                            Save a contract using the form above to
                                                            display it here.
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })()}
                                </tbody>
                            </table>
                        </div>

                        {(() => {
                            const filteredContracts = contractsList.filter(
                                (c) =>
                                    !selectedCompanyIdTrimmed ||
                                    c.ouId?.trim() === selectedCompanyIdTrimmed,
                            );
                            if (filteredContracts.length === 0) return null;
                            return (
                                <DataTablePagination
                                    totalItems={contractsPagination?.total ?? filteredContracts.length}
                                    pageSize={rowsPerPage}
                                    currentPage={currentPage}
                                    totalPages={contractsPagination?.totalPages || 1}
                                    onPageChange={setCurrentPage}
                                    onPageSizeChange={(size) => {
                                        setRowsPerPage(size);
                                        setCurrentPage(1);
                                    }}
                                    pageSizeOptions={[10, 20, 50]}
                                    className="px-6 py-4 border-t border-border bg-background h-auto lg:h-13 pt-4"
                                />
                            );
                        })()}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
