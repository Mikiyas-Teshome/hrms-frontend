'use client';

import { useMemo } from 'react';
import { FormSection } from '@/components/ui/form-section';
import { FormField } from '@/components/ui/FormField';
import { FormSelect } from '@/components/ui/FormSelect';
import { useTranslation } from 'react-i18next';
import type { FieldError, FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { useProfile } from '@/features/auth/hooks/useAuth';
import { useContracts } from '@/features/contracts/hooks/useContracts';
import { useContractsForOrganizationUnit } from '@/features/contracts/hooks/useContractsForOrganizationUnit';
import {
    buildContractsById,
    useContractEmploymentTypeSync,
} from '@/features/contracts/hooks/useContractEmploymentTypeSync';
import { ContractEmploymentTypeField } from '@/components/dashboard/employees/ContractEmploymentTypeField';
import { useSalaryStructures } from '@/features/payroll/salary-structure/hooks/useSalaryStructure';
import { useDisplayCurrency } from '@/features/settings/hooks/useDisplayCurrency';

type SelectOption = {
    id: string;
    label: string;
};

type EditEmployeeContractTabProps<T extends FieldValues> = {
    form: UseFormReturn<T>;
    departmentId?: string;
    selectedContractOption?: SelectOption | null;
    selectedSalaryStructureOption?: SelectOption | null;
};

function withSelectedOption(
    options: { label: string; value: string }[],
    selected?: SelectOption | null,
) {
    if (!selected?.id) {
        return options;
    }
    if (options.some((option) => option.value === selected.id)) {
        return options;
    }
    return [{ label: selected.label, value: selected.id }, ...options];
}

export function EditEmployeeContractTab<T extends FieldValues>({
    form,
    departmentId,
    selectedContractOption = null,
    selectedSalaryStructureOption = null,
}: EditEmployeeContractTabProps<T>) {
    const { t } = useTranslation('employees');
    const { data: profile } = useProfile();
    const companyId = profile?.companyId ?? '';
    const { currencySymbol } = useDisplayCurrency(departmentId);

    const { data: departmentContracts = [], isLoading: departmentContractsLoading } =
        useContractsForOrganizationUnit(departmentId, { enabled: Boolean(departmentId) });
    const { data: companyContractsResponse, isLoading: companyContractsLoading } = useContracts(
        companyId ? { ouId: companyId, limit: 100 } : undefined,
        { enabled: Boolean(companyId) },
    );
    const { data: salaryStructures = [], isLoading: structuresLoading } = useSalaryStructures(companyId);

    const contractsLoading = departmentContractsLoading || companyContractsLoading;

    const contractOptions = useMemo(() => {
        const departmentOptions = departmentContracts.map((contract) => ({
            label: contract.contractName || `Contract ${contract.contractNumber}`,
            value: contract.id,
        }));
        const companyOptions =
            companyContractsResponse?.data?.map((contract) => ({
                label: contract.contractName || `Contract ${contract.contractNumber}`,
                value: contract.id,
            })) ?? [];

        const merged = departmentOptions.length > 0 ? departmentOptions : companyOptions;
        const uniqueOptions = Array.from(
            new Map(
                [...departmentOptions, ...companyOptions].map((option) => [option.value, option]),
            ).values(),
        );

        return withSelectedOption(
            merged.length > 0 ? merged : uniqueOptions,
            selectedContractOption,
        );
    }, [
        departmentContracts,
        companyContractsResponse,
        selectedContractOption,
    ]);

    const contractsById = useMemo(
        () => buildContractsById(companyContractsResponse?.data, departmentContracts),
        [companyContractsResponse, departmentContracts],
    );

    const { syncEmploymentTypeFromContract } = useContractEmploymentTypeSync(form, contractsById);

    const selectedContractId = form.watch('contractId' as Path<T>) as string | undefined;
    const selectedEmploymentType = form.watch('employmentType' as Path<T>) as string | undefined;

    const salaryStructureOptions = useMemo(() => {
        const baseOptions = salaryStructures.map((structure) => ({
            label: structure.code ? `${structure.name} (${structure.code})` : structure.name,
            value: structure.id,
        }));

        return withSelectedOption(baseOptions, selectedSalaryStructureOption);
    }, [salaryStructures, selectedSalaryStructureOption]);

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <FormSection title={t('contractDetails', 'Contract details')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormSelect
                        id="contractId"
                        label={t('contract', 'Contract')}
                        placeholder={
                            contractsLoading
                                ? t('common.loading', 'Loading...')
                                : t('selectContract', 'Select contract')
                        }
                        control={form.control}
                        name={'contractId' as Path<T>}
                        error={form.formState.errors.contractId as FieldError}
                        options={contractOptions}
                        onChange={(contractId) => syncEmploymentTypeFromContract(contractId)}
                        disabled={contractsLoading}
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
                        label={t('salaryPlaceholder', {
                            defaultValue: 'Salary ({{symbol}})',
                            symbol: currencySymbol,
                        })}
                        name="salary"
                        type="number"
                        register={form.register}
                        error={form.formState.errors.salary as FieldError}
                        t={(key) => t(key)}
                    />
                    <FormField
                        id="jobTitle"
                        label={t('jobTitle', 'Job title')}
                        name="jobTitle"
                        register={form.register}
                        error={form.formState.errors.jobTitle as FieldError}
                        t={(key) => t(key)}
                    />
                </div>
            </FormSection>

            <FormSection title={t('salaryStructure', 'Salary structure')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormSelect
                        id="salaryStructureId"
                        label={t('salaryStructure', 'Salary structure')}
                        placeholder={
                            structuresLoading
                                ? t('common.loading', 'Loading...')
                                : t('selectSalaryStructure', 'Select salary structure')
                        }
                        control={form.control}
                        name={'salaryStructureId' as Path<T>}
                        error={form.formState.errors.salaryStructureId as FieldError}
                        options={salaryStructureOptions}
                        disabled={structuresLoading}
                        t={(key) => t(key)}
                    />
                </div>
            </FormSection>
        </div>
    );
}
