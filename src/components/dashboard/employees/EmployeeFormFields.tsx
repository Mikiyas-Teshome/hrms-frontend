'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { FormField } from '@/components/ui/FormField';
import { FormSelect } from '@/components/ui/FormSelect';
import { useTranslation } from 'react-i18next';
import type { UseFormReturn } from 'react-hook-form';
import { useProfile } from '@/features/auth/hooks/useAuth';
import {
    useCompanyOptions,
    useOrganizationHierarchy,
} from '@/features/organization/hooks/useOrganization';
import { buildOrganizationUnitOptionsForCompany } from '@/features/organization/organization-unit-options.util';
import type { OrganizationUnitType } from '@/features/organization/organization.types';
import { useRoles } from '@/features/roles/hooks/useRoles';
import { useContracts } from '@/features/contracts/hooks/useContracts';
import { useInviteContractAutoResolve } from '@/features/contracts/hooks/useInviteContractAutoResolve';
import {
    buildContractsById,
    useContractEmploymentTypeSync,
} from '@/features/contracts/hooks/useContractEmploymentTypeSync';
import { ContractEmploymentTypeField } from '@/components/dashboard/employees/ContractEmploymentTypeField';
import { useDisplayCurrency } from '@/features/settings/hooks/useDisplayCurrency';
import { useSalaryStructures } from '@/features/payroll/salary-structure/hooks/useSalaryStructure';
import { parseInviteSalary } from '@/features/employee/parse-invite-salary';

interface EmployeeFormFieldsProps {
    form: UseFormReturn<any>;
    onInviteReadyChange?: (ready: boolean) => void;
}

export function EmployeeFormFields({ form, onInviteReadyChange }: EmployeeFormFieldsProps) {
    const { t } = useTranslation('employees');
    const { currencySymbol } = useDisplayCurrency();
    const { data: profile } = useProfile();
    const { companies, isLoading: companiesLoading } = useCompanyOptions();
    const { data: hierarchy, isLoading: hierarchyLoading } = useOrganizationHierarchy();
    const { data: roles, isLoading: rolesLoading } = useRoles(profile?.companyId);
    const previousCompanyOuIdRef = useRef<string | undefined>(undefined);

    const selectedCompanyOuId = form.watch('companyOuId');
    const selectedOuId = form.watch('ouId');
    const selectedContractId = form.watch('contractId');
    const selectedEmploymentType = form.watch('employmentType');
    const selectedSalaryStructureId = form.watch('salaryStructureId');
    const selectedSalary = form.watch('salary');

    const companyOptions = useMemo(
        () =>
            (companies ?? []).map((company: OrganizationUnitType) => ({
                label:
                    company.name ||
                    company.displayLabel ||
                    company.companyProfile?.legalName ||
                    company.id,
                value: company.id,
            })),
        [companies],
    );

    const scopedUnitOptions =
        !hierarchy || !selectedCompanyOuId
            ? []
            : buildOrganizationUnitOptionsForCompany(hierarchy, selectedCompanyOuId);

    const { data: contractsData } = useContracts(
        selectedCompanyOuId ? { ouId: selectedCompanyOuId, limit: 100 } : undefined,
        { enabled: Boolean(selectedCompanyOuId) },
    );
    const { data: salaryStructures = [] } = useSalaryStructures(selectedCompanyOuId);

    const contractScopeOuId = selectedOuId || selectedCompanyOuId || undefined;
    const {
        contractOptions: departmentContractOptions,
        departmentContracts,
        isResolvingContract,
    } = useInviteContractAutoResolve(form, contractScopeOuId);

    const contractsById = useMemo(
        () => buildContractsById(contractsData?.data, departmentContracts),
        [contractsData?.data, departmentContracts],
    );

    const { syncEmploymentTypeFromContract } = useContractEmploymentTypeSync(form, contractsById);

    const salaryStructureOptions = useMemo(
        () => (salaryStructures ?? []).map((structure) => ({ label: structure.name, value: structure.id })),
        [salaryStructures],
    );
    const hasSalaryStructures = Boolean(selectedCompanyOuId) && salaryStructureOptions.length > 0;

    const contractOptions = useMemo(() => {
        if (contractScopeOuId && departmentContractOptions.length > 0) {
            return departmentContractOptions;
        }
        return (
            contractsData?.data?.map((c) => ({
                label: c.contractName || `Contract ${c.contractNumber}`,
                value: c.id,
            })) || []
        );
    }, [contractScopeOuId, departmentContractOptions, contractsData]);

    const hasContracts =
        Boolean(selectedCompanyOuId) && !isResolvingContract && contractOptions.length > 0;

    useEffect(() => {
        if (companyOptions.length === 1 && !form.getValues('companyOuId')) {
            form.setValue('companyOuId', companyOptions[0].value, { shouldValidate: true });
        }
    }, [companyOptions, form]);

    useEffect(() => {
        if (
            previousCompanyOuIdRef.current !== undefined &&
            previousCompanyOuIdRef.current !== selectedCompanyOuId
        ) {
            form.setValue('ouId', '', { shouldValidate: false });
            form.setValue('contractId', '', { shouldValidate: false });
            form.setValue('employmentType', '', { shouldValidate: false });
            form.setValue('salaryStructureId', '', { shouldValidate: false });
        }
        previousCompanyOuIdRef.current = selectedCompanyOuId;
    }, [selectedCompanyOuId, form]);

    useEffect(() => {
        onInviteReadyChange?.(
            Boolean(selectedCompanyOuId) &&
                hasSalaryStructures &&
                hasContracts &&
                Boolean(selectedContractId?.trim()) &&
                Boolean(selectedSalaryStructureId?.trim()) &&
                parseInviteSalary(selectedSalary) != null,
        );
    }, [
        selectedCompanyOuId,
        hasSalaryStructures,
        hasContracts,
        selectedContractId,
        selectedSalaryStructureId,
        selectedSalary,
        onInviteReadyChange,
    ]);

    const roleOptions =
        roles?.filter((role) => !!role.id).map((role) => ({ label: role.name, value: role.id! })) || [];

    return (
        <div className="grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2">
            <FormField
                id="firstName"
                label={t('firstName')}
                placeholder={t('firstName')}
                register={form.register}
                name="firstName"
                error={form.formState.errors.firstName as any}
                t={t}
            />
            <FormField
                id="lastName"
                label={t('lastName')}
                placeholder={t('lastName')}
                register={form.register}
                name="lastName"
                error={form.formState.errors.lastName as any}
                t={t}
            />
            <FormField
                id="email"
                label={t('email')}
                placeholder={t('email')}
                register={form.register}
                name="email"
                error={form.formState.errors.email as any}
                t={t}
            />
            <FormSelect
                id="companyOuId"
                label={t('companyType', 'Company')}
                placeholder={
                    companiesLoading ? t('loading', 'Loading...') : t('selectCompanyType', 'Select company')
                }
                control={form.control}
                name="companyOuId"
                error={form.formState.errors.companyOuId as any}
                options={companyOptions}
                disabled={companiesLoading || companyOptions.length === 0}
                t={t}
            />
            <FormSelect
                id="ouId"
                label={t('orgUnit', 'Org unit')}
                placeholder={
                    !selectedCompanyOuId
                        ? t('selectCompanyType', 'Select company')
                        : hierarchyLoading
                          ? t('loading', 'Loading...')
                          : scopedUnitOptions.length === 0
                            ? t('noOrgUnitsForCompany', 'No org units for this company')
                            : t('selectOrgUnit', 'Select org unit')
                }
                control={form.control}
                name="ouId"
                error={form.formState.errors.ouId as any}
                options={scopedUnitOptions.map((u) => ({ label: u.label, value: u.id }))}
                disabled={
                    !selectedCompanyOuId || hierarchyLoading || scopedUnitOptions.length === 0
                }
                t={t}
            />
            <FormSelect
                id="roleId"
                label={t('role')}
                placeholder={rolesLoading ? t('loading', 'Loading...') : t('selectRole', 'Select role')}
                control={form.control}
                name="roleId"
                error={form.formState.errors.roleId as any}
                options={roleOptions}
                disabled={rolesLoading}
                t={t}
            />
            <FormField
                id="gccId"
                label={t('gccId', 'GCC ID')}
                placeholder={t('gccIdPlaceholder', '12FR34CD')}
                register={form.register}
                name="gccId"
                error={form.formState.errors.gccId as any}
                t={t}
            />
            <div className="flex flex-col gap-2">
                <FormSelect
                    id="contractId"
                    label={t('contractType', 'Contract type')}
                    placeholder={
                        !selectedCompanyOuId
                            ? t('selectCompanyType', 'Select company')
                            : isResolvingContract
                              ? t('loading', 'Loading...')
                              : contractOptions.length === 0
                                ? t('noContractForDepartment', {
                                      defaultValue:
                                          'No contract for this org unit or its parents',
                                  })
                                : t('selectContractType', 'Select contract type')
                    }
                    control={form.control}
                    name="contractId"
                    error={form.formState.errors.contractId as any}
                    options={contractOptions}
                    onChange={(contractId) => syncEmploymentTypeFromContract(contractId)}
                    disabled={
                        !selectedCompanyOuId || isResolvingContract || contractOptions.length === 0
                    }
                    t={t}
                />
                {selectedCompanyOuId && !isResolvingContract && !hasContracts ? (
                    <p className="text-sm text-muted-foreground">
                        {t(
                            'noContractForCompanyHint',
                            'Create a contract for this company before inviting employees.',
                        )}
                    </p>
                ) : null}
            </div>
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
                id="jobTitle"
                label={t('jobTitle', 'Job title')}
                placeholder={t('jobTitlePlaceholder', 'Enter job title')}
                register={form.register}
                name="jobTitle"
                error={form.formState.errors.jobTitle as any}
                t={t}
            />
            <FormField
                id="salary"
                label={t('salary', { defaultValue: 'Salary ({{symbol}})', symbol: currencySymbol })}
                placeholder="0"
                type="number"
                register={form.register}
                name="salary"
                error={form.formState.errors.salary as any}
                validation={{
                    validate: (value) =>
                        parseInviteSalary(value) != null ||
                        t('salaryRequired', 'Salary is required'),
                }}
                t={t}
            />
            <div className="flex flex-col gap-2">
                <FormSelect
                    id="salaryStructureId"
                    label={t('salaryStructure', 'Salary structure')}
                    placeholder={
                        !selectedCompanyOuId
                            ? t('selectCompanyType', 'Select company')
                            : hasSalaryStructures
                              ? t('selectSalaryStructure', 'Select salary structure')
                              : t('noSalaryStructuresAvailable', 'No salary structures available')
                    }
                    control={form.control}
                    name="salaryStructureId"
                    error={form.formState.errors.salaryStructureId as any}
                    options={salaryStructureOptions}
                    disabled={!selectedCompanyOuId || !hasSalaryStructures}
                    t={t}
                />
                {selectedCompanyOuId && !hasSalaryStructures ? (
                    <p className="text-sm text-muted-foreground">
                        {t(
                            'noSalaryStructuresHint',
                            'Create at least one salary structure in Payroll setup before inviting employees.',
                        )}
                    </p>
                ) : null}
            </div>
        </div>
    );
}
