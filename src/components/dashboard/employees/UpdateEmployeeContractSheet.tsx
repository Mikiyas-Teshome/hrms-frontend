'use client';

import React, { useEffect, useMemo } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { X, Loader2, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { FormField } from '@/components/ui/FormField';
import { FormSelect } from '@/components/ui/FormSelect';
import { useContracts } from '@/features/contracts/hooks/useContracts';
import { useProfile } from '@/features/auth/hooks/useAuth';
import {
    useAssignEmployeeContract,
    useUpdateDraftEmployeeContract,
    useRenewEmployeeContract,
} from '@/features/contracts/hooks/useEmployeeContracts';
import { EmployeeContract } from '@/features/contracts/employee-contract.types';
import { ContractStatus } from '@/features/contracts/contracts.types';
import {
    buildContractsById,
    useContractEmploymentTypeSync,
} from '@/features/contracts/hooks/useContractEmploymentTypeSync';
import { ContractEmploymentTypeField } from '@/components/dashboard/employees/ContractEmploymentTypeField';
import { useDisplayCurrency } from '@/features/settings/hooks/useDisplayCurrency';

interface UpdateEmployeeContractSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employeeId: string;
    currentContract: EmployeeContract | null;
    onSuccess?: () => void;
}

export default function UpdateEmployeeContractSheet({
    open,
    onOpenChange,
    employeeId,
    currentContract,
    onSuccess,
}: UpdateEmployeeContractSheetProps) {
    const { t, i18n } = useTranslation('employees');
    const { toast } = useToast();
    const isRtl = i18n.language === 'ar';

    const { data: profile } = useProfile();
    const contractsOuId = profile?.companyId ?? '';
    const { data: contractsResponse, isLoading: contractsLoading } = useContracts(
        contractsOuId ? { ouId: contractsOuId, limit: 100 } : undefined,
        { enabled: Boolean(contractsOuId) },
    );
    const assignMutation = useAssignEmployeeContract();
    const updateDraftMutation = useUpdateDraftEmployeeContract();
    const renewMutation = useRenewEmployeeContract();

    const isPending =
        assignMutation.isPending || updateDraftMutation.isPending || renewMutation.isPending;
    const { currencySymbol } = useDisplayCurrency();

    const contractOptions = useMemo(() => {
        return contractsResponse?.data?.map((c) => ({
            label: c.contractName || `Contract ${c.contractNumber}`,
            value: c.id,
        })) || [];
    }, [contractsResponse]);

    const contractsById = useMemo(
        () => buildContractsById(contractsResponse?.data),
        [contractsResponse],
    );

    const updateContractSchema = useMemo(() => {
        return z.object({
            contractId: z.string().min(1, t('errors.contractRequired', 'Contract is required')),
            salary: z.coerce.number().min(0, t('errors.salaryMin', 'Salary must be a positive number')),
            employmentType: z.string().min(1, t('errors.employmentTypeRequired', 'Employment type is required')),
            jobTitle: z.string().min(1, t('errors.jobTitleRequired', 'Job title is required')),
        });
    }, [t]);

    type UpdateContractValues = z.infer<typeof updateContractSchema>;

    const form = useForm<UpdateContractValues>({
        resolver: zodResolver(updateContractSchema) as any,
        defaultValues: {
            contractId: '',
            salary: 0,
            employmentType: '',
            jobTitle: '',
        },
    });

    const { syncEmploymentTypeFromContract } = useContractEmploymentTypeSync(form, contractsById);

    const selectedContractId = form.watch('contractId');
    const selectedEmploymentType = form.watch('employmentType');

    useEffect(() => {
        if (open) {
            form.reset({
                contractId: currentContract?.contractId || '',
                salary: currentContract?.salary || 0,
                employmentType: currentContract?.employmentType || '',
                jobTitle: currentContract?.jobTitle || '',
            });
        }
    }, [open, currentContract, form]);

    const onSubmit = async (data: UpdateContractValues) => {
        const compensation = {
            contractId: data.contractId,
            salary: Number(data.salary),
            employmentType: data.employmentType,
            jobTitle: data.jobTitle,
        };

        try {
            if (!currentContract?.id) {
                await assignMutation.mutateAsync({
                    employeeId,
                    ...compensation,
                });
            } else if (currentContract.status === ContractStatus.draft) {
                await updateDraftMutation.mutateAsync({
                    id: currentContract.id,
                    input: compensation,
                });
            } else if (currentContract.status === ContractStatus.active) {
                const effectiveDate =
                    currentContract.effectiveDate?.split('T')[0] ??
                    new Date().toISOString().split('T')[0];
                await renewMutation.mutateAsync({
                    id: currentContract.id,
                    input: {
                        effectiveDate,
                        ...compensation,
                    },
                });
            } else {
                throw new Error(t('contractUpdateNotAllowed', 'This contract cannot be updated.'));
            }

            toast({
                title: t('contractUpdateSuccess', 'Contract Updated'),
                description: t('contractUpdateSuccessDesc', 'Employee contract has been updated successfully.'),
                variant: 'success',
            });
            onSuccess?.();
            onOpenChange(false);
        } catch (error: any) {
            toast({
                title: t('contractUpdateFailed', 'Update Failed'),
                description: error.message || t('common.error', 'An error occurred. Please try again.'),
                variant: 'destructive',
            });
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                showCloseButton={false}
                side={isRtl ? 'left' : 'right'}
                className="w-full sm:max-w-lg p-0 flex flex-col h-full border-0 shadow-2xl overflow-hidden font-['Albert_Sans']"
            >
                <div className="px-8 py-6 space-y-6 flex flex-col h-full">
                    <SheetHeader className="flex flex-row items-center justify-between shrink-0">
                        <SheetTitle className="text-xl font-bold text-foreground">
                            {t('updateContract', 'Update contract')}
                        </SheetTitle>
                        <SheetClose className="text-foreground/80 hover:text-foreground transition-colors rounded-lg">
                            <X className="h-5 w-5" strokeWidth={1.5} />
                            <span className="sr-only">Close</span>
                        </SheetClose>
                    </SheetHeader>

                    <Separator className="shrink-0" />

                    <div className="flex-1 overflow-y-auto no-scrollbar pr-1">
                        <Form {...form}>
                            <form
                                id="update-contract-form"
                                onSubmit={form.handleSubmit(onSubmit as any)}
                                className="space-y-6"
                            >
                                <FormSelect
                                    id="contractId"
                                    label={t('contract', 'Contract')}
                                    placeholder={contractsLoading ? t('common.loading', 'Loading...') : t('selectContract', 'Select contract')}
                                    control={form.control as any}
                                    name="contractId"
                                    error={form.formState.errors.contractId}
                                    options={contractOptions}
                                    onChange={(contractId) => syncEmploymentTypeFromContract(contractId)}
                                    t={(key) => t(key)}
                                />

                                <ContractEmploymentTypeField
                                    label={t('employmentType', 'Employment type')}
                                    selectedContractId={selectedContractId}
                                    employmentType={selectedEmploymentType}
                                    register={form.register}
                                    selectContractFirstLabel={t('selectContractFirst', 'Select a contract first')}
                                    employmentTypeFromContractLabel={t(
                                        'employmentTypeFromContract',
                                        'Set from selected contract',
                                    )}
                                    t={t}
                                />

                                <FormField
                                    id="salary"
                                    label={t('salaryPlaceholder', { defaultValue: 'Salary ({{symbol}})', symbol: currencySymbol })}
                                    placeholder="0"
                                    type="number"
                                    register={form.register}
                                    name="salary"
                                    error={form.formState.errors.salary}
                                    t={(key) => t(key)}
                                />

                                <FormField
                                    id="jobTitle"
                                    label={t('jobTitle', 'Job title')}
                                    placeholder={t('selectJobTitle', 'Select job title')}
                                    type="text"
                                    name="jobTitle"
                                    register={form.register}
                                    error={form.formState.errors.jobTitle}
                                    t={(key) => t(key)}
                                />
                            </form>
                        </Form>
                    </div>

                    <div className="pt-4 mt-auto shrink-0 flex items-center justify-end gap-3 border-t">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="h-10 px-6 rounded-lg font-semibold transition-all hover:bg-muted"
                        >
                            {t('cancel', 'Cancel')}
                        </Button>
                        <Button
                            form="update-contract-form"
                            type="submit"
                            disabled={isPending}
                            className="h-10 px-6 rounded-lg bg-primary text-primary-foreground font-semibold shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all gap-2"
                        >
                            {isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            {t('saveChange', 'Save change')}
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
