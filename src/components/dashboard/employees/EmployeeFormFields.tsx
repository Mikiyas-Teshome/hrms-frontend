'use client';

import React from 'react';
import { FormField } from '@/components/ui/FormField';
import { FormSelect } from '@/components/ui/FormSelect';
import { FormSection } from '@/components/ui/form-section';
import { useTranslation } from 'react-i18next';
import { EMPLOYMENT_TYPE_OPTIONS } from '@/features/employee/employee.types';
import type { UseFormReturn } from 'react-hook-form';
import { useProfile } from '@/features/auth/hooks/useAuth';
import { useOrganizationUnitOptions } from '@/features/organization/hooks/useOrganization';
import { useRoles } from '@/features/roles/hooks/useRoles';
import { useContracts } from '@/features/contracts/hooks/useContracts';
import { useDisplayCurrency } from '@/features/settings/hooks/useDisplayCurrency';


interface EmployeeFormFieldsProps {
    form: UseFormReturn<any>;
}

export function EmployeeFormFields({ form }: EmployeeFormFieldsProps) {
    const { t } = useTranslation('employees');
    const { currencySymbol } = useDisplayCurrency();
    const { data: profile } = useProfile();
    const { unitOptions, isLoading: hierarchyLoading } = useOrganizationUnitOptions();
    const { data: roles, isLoading: rolesLoading } = useRoles(profile?.companyId);
    const { data: contractsData } = useContracts();

    const ouOptions = unitOptions.map(u => ({ label: u.label, value: u.id }));
    const roleOptions = roles?.filter(role => !!role.id).map(role => ({ label: role.name, value: role.id! })) || [];
    const contractOptions = contractsData?.data?.map((c) => ({
        label: c.contractName || `Contract ${c.contractNumber}`,
        value: c.id,
    })) || [];

    return (
        <div className="space-y-8 pb-8">
            {/* Basic Info */}
            <FormSection title={t('basicInfo')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <FormField
                        id="gccid"
                        label={t('gccid', 'GCC ID')}
                        placeholder={t('gccidPlaceholder', 'Enter GCC ID')}
                        register={form.register}
                        name="gccid"
                        error={form.formState.errors.gccid as any}
                        t={t}
                    />
                </div>
            </FormSection>

            <FormSection title={t('assignment', 'Assignment')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormSelect
                        id="ouId"
                        label="Organization Unit"
                        placeholder={hierarchyLoading ? "Loading..." : "Select unit"}
                        control={form.control}
                        name="ouId"
                        options={ouOptions}
                        t={t}
                        error={form.formState.errors.ouId as any}
                        disabled={hierarchyLoading}
                    />
                    <FormSelect
                        id="role"
                        label={t('role')}
                        placeholder={rolesLoading ? "Loading..." : t('role')}
                        control={form.control}
                        name="role"
                        options={roleOptions}
                        t={t}
                        error={form.formState.errors.role as any}
                        disabled={rolesLoading}
                    />
                    <FormSelect
                        id="employmentType"
                        label={t('employmentType', 'Employment Type')}
                        placeholder={t('selectEmploymentType', 'Select employment type')}
                        control={form.control}
                        name="employmentType"
                        options={EMPLOYMENT_TYPE_OPTIONS.map(opt => ({ label: t(opt.value, opt.label), value: opt.value }))}
                        t={t}
                        error={form.formState.errors.employmentType as any}
                    />
                    <FormField
                        id="jobTitle"
                        label={t('jobTitle', 'Job Title')}
                        placeholder={t('jobTitlePlaceholder', 'Enter job title')}
                        register={form.register}
                        name="jobTitle"
                        error={form.formState.errors.jobTitle as any}
                        t={t}
                    />
                    <FormSelect
                        id="contractId"
                        label={t('contractType', 'Contract Type')}
                        placeholder={t('selectContractType', 'Select contract type')}
                        control={form.control}
                        name="contractId"
                        options={contractOptions}
                        t={t}
                        error={form.formState.errors.contractId as any}
                    />
                    <FormField
                        id="salary"
                        label={t('salary', { defaultValue: 'Salary ({{symbol}})', symbol: currencySymbol })}
                        placeholder="0"
                        type="number"
                        register={form.register}
                        name="salary"
                        error={form.formState.errors.salary as any}
                        t={t}
                    />
                </div>
            </FormSection>
        </div>
    );
}
