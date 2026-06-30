'use client';

import { FormEventHandler } from 'react';
import { FormSection } from '@/components/ui/form-section';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from 'react-i18next';
import { FormField } from '@/components/ui/FormField';
import { FormSelect } from '@/components/ui/FormSelect';
import { NationalitySelect } from '@/components/ui/NationalitySelect';
import { CountrySelect } from '@/components/ui/CountrySelect';
import type { UseFormReturn, FieldError, FieldValues, Path } from 'react-hook-form';
import { useOrganizationUnitOptions } from '@/features/organization/hooks/useOrganization';
import { UpdateEmployeeInput } from '@/features/employee/employee.types';
import { EditEmployeeBankingTab } from '@/components/dashboard/employees/EditEmployeeBankingTab';
import { EditEmployeeContractTab } from '@/components/dashboard/employees/EditEmployeeContractTab';

interface EmployeeFormValues extends UpdateEmployeeInput {
    employeeNumber?: string;
}

type SelectOption = {
    id: string;
    label: string;
};

export function EditEmployeeFormFields<T extends FieldValues = EmployeeFormValues>({
    form,
    canEditEmployment = true,
    showBankingTab = false,
    employeeId,
    bankingUseSelfService = true,
    profileFormId = 'edit-employee-form',
    onProfileSubmit,
    activeTab = 'general',
    onActiveTabChange,
    selectedContractOption = null,
    selectedSalaryStructureOption = null,
}: {
    form: UseFormReturn<T>;
    canEditEmployment?: boolean;
    showBankingTab?: boolean;
    employeeId?: string;
    bankingUseSelfService?: boolean;
    profileFormId?: string;
    onProfileSubmit?: FormEventHandler<HTMLFormElement>;
    activeTab?: string;
    onActiveTabChange?: (tab: string) => void;
    selectedContractOption?: SelectOption | null;
    selectedSalaryStructureOption?: SelectOption | null;
}) {
    const { t } = useTranslation('employees');
    const { unitOptions, isLoading: hierarchyLoading } = useOrganizationUnitOptions();
    const tabCount = (canEditEmployment ? 6 : 4) + (showBankingTab && employeeId ? 1 : 0);

    const departmentId = form.watch('departmentId' as any);

    return (
        <Tabs value={activeTab} onValueChange={onActiveTabChange} className="w-full">
            <TabsList
                className="grid w-full mb-8"
                style={{ gridTemplateColumns: `repeat(${tabCount}, minmax(0, 1fr))` }}
            >
                <TabsTrigger value="general">{t('general', 'General')}</TabsTrigger>
                {canEditEmployment && (
                    <TabsTrigger value="employment">{t('employment', 'Employment')}</TabsTrigger>
                )}
                {canEditEmployment && (
                    <TabsTrigger value="contract">{t('contract', 'Contract')}</TabsTrigger>
                )}
                <TabsTrigger value="documents">{t('documents', 'Documents')}</TabsTrigger>
                <TabsTrigger value="address">{t('address', 'Address')}</TabsTrigger>
                <TabsTrigger value="emergency">{t('emergency', 'Emergency')}</TabsTrigger>
                {showBankingTab && employeeId && (
                    <TabsTrigger value="banking">{t('banking', 'Banking')}</TabsTrigger>
                )}
            </TabsList>

            <form
                id={profileFormId}
                onSubmit={onProfileSubmit}
                className="space-y-8"
            >
            <TabsContent value="general" className="space-y-6 animate-in fade-in duration-300">
                <FormSection title={t('basicInfo')}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            id="employeeNumber"
                            label={t('employeeNumber', 'Employee ID')}
                            name="employeeNumber"
                            register={form.register}
                            error={form.formState.errors.employeeNumber as FieldError}
                            readOnly={true}
                            className="bg-muted"
                            t={(key) => t(key)}
                        />
                        <div className="hidden md:block" />
                        <FormField
                            id="firstName"
                            label={t('firstName')}
                            name="firstName"
                            register={form.register}
                            error={form.formState.errors.firstName as FieldError}
                            t={(key) => t(key)}
                        />
                        <FormField
                            id="lastName"
                            label={t('lastName')}
                            name="lastName"
                            register={form.register}
                            error={form.formState.errors.lastName as FieldError}
                            t={(key) => t(key)}
                        />
                        <FormField
                            id="middleName"
                            label={t('middleName', 'Middle Name')}
                            name="middleName"
                            register={form.register}
                            error={form.formState.errors.middleName as FieldError}
                            t={(key) => t(key)}
                        />
                        <FormField
                            id="email"
                            label={t('email')}
                            name="email"
                            register={form.register}
                            error={form.formState.errors.email as FieldError}
                            readOnly={!canEditEmployment}
                            className={!canEditEmployment ? 'bg-muted' : undefined}
                            t={(key) => t(key)}
                        />
                        <FormField
                            id="businessEmail"
                            label={t('businessEmail', 'Business Email')}
                            name="businessEmail"
                            register={form.register}
                            error={form.formState.errors.businessEmail as FieldError}
                            readOnly={!canEditEmployment}
                            className={!canEditEmployment ? 'bg-muted' : undefined}
                            t={(key) => t(key)}
                        />
                        <FormField
                            id="personalEmail"
                            label={t('personalEmail', 'Personal Email')}
                            name="personalEmail"
                            register={form.register}
                            error={form.formState.errors.personalEmail as FieldError}
                            t={(key) => t(key)}
                        />
                        <FormField
                            id="phoneNumber"
                            label={t('phoneNumber', 'Phone Number')}
                            name="phoneNumber"
                            inputMode="tel"
                            register={form.register}
                            error={form.formState.errors.phoneNumber as FieldError}
                            t={(key) => t(key)}
                        />
                    </div>
                </FormSection>

                <FormSection title={t('personalDetails', 'Personal Details')}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            id="dateOfBirth"
                            label={t('dateOfBirth', 'Date of Birth')}
                            name="dateOfBirth"
                            type="date"
                            register={form.register}
                            error={form.formState.errors.dateOfBirth as FieldError}
                            t={(key) => t(key)}
                        />
                        <FormSelect
                            id="gender"
                            label={t('gender', 'Gender')}
                            name={"gender" as Path<T>}
                            control={form.control}
                            error={form.formState.errors.gender as FieldError}
                            options={[
                                { label: 'Male', value: 'male' },
                                { label: 'Female', value: 'female' },
                                { label: 'Other', value: 'other' },
                                { label: 'Prefer not to say', value: 'prefer_not_to_say' }
                            ]}
                            placeholder="Select gender"
                            t={(key) => t(key)}
                        />
                        <NationalitySelect
                            id="nationality"
                            label={t('nationality', 'Nationality')}
                            name={"nationality" as Path<T>}
                            control={form.control}
                            error={form.formState.errors.nationality as FieldError}
                            placeholder={t('selectNationality', 'Select nationality')}
                            t={(key) => t(key)}
                        />
                        <FormField
                            id="nationalId"
                            label={t('nationalId', 'National ID / Iqama')}
                            name="nationalId"
                            register={form.register}
                            error={form.formState.errors.nationalId as FieldError}
                            t={(key) => t(key)}
                        />
                    </div>
                </FormSection>
            </TabsContent>

            {canEditEmployment && (
            <TabsContent value="employment" className="space-y-6 animate-in fade-in duration-300">
                <FormSection title={t('jobDetails', 'Job Details')}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormSelect
                            id="departmentId"
                            label="Organization Unit"
                            name={"departmentId" as Path<T>}
                            control={form.control}
                            error={form.formState.errors.departmentId as FieldError}
                            options={unitOptions.map(u => ({ label: u.label, value: u.id }))}
                            placeholder={hierarchyLoading ? "Loading..." : "Select unit"}
                            disabled={hierarchyLoading}
                            t={(key) => t(key)}
                        />
                    </div>
                </FormSection>
            </TabsContent>
            )}

            {canEditEmployment && (
            <TabsContent value="contract" className="space-y-6 animate-in fade-in duration-300">
                <EditEmployeeContractTab
                    form={form}
                    departmentId={departmentId}
                    selectedContractOption={selectedContractOption}
                    selectedSalaryStructureOption={selectedSalaryStructureOption}
                />
            </TabsContent>
            )}

            <TabsContent value="documents" className="space-y-6 animate-in fade-in duration-300">
                <FormSection title={t('passportInfo', 'Passport Information')}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            id="passportNumber"
                            label={t('passportNumber', 'Passport Number')}
                            name="passportNumber"
                            register={form.register}
                            error={form.formState.errors.passportNumber as FieldError}
                            t={(key) => t(key)}
                        />
                        <FormField
                            id="passportExpiry"
                            label={t('passportExpiry', 'Passport Expiry')}
                            name="passportExpiry"
                            type="date"
                            register={form.register}
                            error={form.formState.errors.passportExpiry as FieldError}
                            t={(key) => t(key)}
                        />
                    </div>
                </FormSection>

                <FormSection title={t('visaInfo', 'Visa & Work Permit')}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            id="visaNumber"
                            label={t('visaNumber', 'Visa Number')}
                            name="visaNumber"
                            register={form.register}
                            error={form.formState.errors.visaNumber as FieldError}
                            t={(key) => t(key)}
                        />
                        <FormField
                            id="visaExpiry"
                            label={t('visaExpiry', 'Visa Expiry')}
                            name="visaExpiry"
                            type="date"
                            register={form.register}
                            error={form.formState.errors.visaExpiry as FieldError}
                            t={(key) => t(key)}
                        />
                        <FormField
                            id="workPermitNumber"
                            label={t('workPermitNumber', 'Work Permit Number')}
                            name="workPermitNumber"
                            register={form.register}
                            error={form.formState.errors.workPermitNumber as FieldError}
                            t={(key) => t(key)}
                        />
                        <FormField
                            id="workPermitExpiry"
                            label={t('workPermitExpiry', 'Work Permit Expiry')}
                            name="workPermitExpiry"
                            type="date"
                            register={form.register}
                            error={form.formState.errors.workPermitExpiry as FieldError}
                            t={(key) => t(key)}
                        />
                    </div>
                </FormSection>
            </TabsContent>

            <TabsContent value="address" className="space-y-6 animate-in fade-in duration-300">
                <FormSection title={t('workAddress', 'Work Address')}>
                    <div className="grid grid-cols-1 gap-6">
                        <FormField
                            id="address"
                            label={t('address')}
                            name="address"
                            register={form.register}
                            error={form.formState.errors.address as FieldError}
                            t={(key) => t(key)}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                id="city"
                                label={t('city')}
                                name="city"
                                register={form.register}
                                error={form.formState.errors.city as FieldError}
                                t={(key) => t(key)}
                            />
                            <FormField
                                id="state"
                                label={t('state')}
                                name="state"
                                register={form.register}
                                error={form.formState.errors.state as FieldError}
                                t={(key) => t(key)}
                            />
                            <CountrySelect
                                id="country"
                                label={t('country')}
                                name={"country" as Path<T>}
                                control={form.control}
                                error={form.formState.errors.country as FieldError}
                                placeholder={t('selectCountry', 'Select country')}
                                t={(key) => t(key)}
                            />
                            <FormField
                                id="postalCode"
                                label={t('postalCode')}
                                name="postalCode"
                                inputMode="numeric"
                                register={form.register}
                                error={form.formState.errors.postalCode as FieldError}
                                t={(key) => t(key)}
                            />
                        </div>
                    </div>
                </FormSection>

                <FormSection title={t('homeAddress', 'Home Address')}>
                    <div className="grid grid-cols-1 gap-6">
                        <FormField
                            id="homeAddress"
                            label={t('address')}
                            name="homeAddress"
                            register={form.register}
                            error={form.formState.errors.homeAddress as FieldError}
                            t={(key) => t(key)}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                id="homeCity"
                                label={t('city')}
                                name="homeCity"
                                register={form.register}
                                error={form.formState.errors.homeCity as FieldError}
                                t={(key) => t(key)}
                            />
                            <FormField
                                id="homeState"
                                label={t('state')}
                                name="homeState"
                                register={form.register}
                                error={form.formState.errors.homeState as FieldError}
                                t={(key) => t(key)}
                            />
                            <CountrySelect
                                id="homeCountry"
                                label={t('country')}
                                name={"homeCountry" as Path<T>}
                                control={form.control}
                                error={form.formState.errors.homeCountry as FieldError}
                                placeholder={t('selectCountry', 'Select country')}
                                t={(key) => t(key)}
                            />
                            <FormField
                                id="homePostalCode"
                                label={t('postalCode')}
                                name="homePostalCode"
                                inputMode="numeric"
                                register={form.register}
                                error={form.formState.errors.homePostalCode as FieldError}
                                t={(key) => t(key)}
                            />
                            <FormField
                                id="homePhone"
                                label={t('homePhone', 'Home Phone')}
                                name="homePhone"
                                inputMode="tel"
                                register={form.register}
                                error={form.formState.errors.homePhone as FieldError}
                                t={(key) => t(key)}
                            />
                        </div>
                    </div>
                </FormSection>
            </TabsContent>

            <TabsContent value="emergency" className="space-y-6 animate-in fade-in duration-300">
                <FormSection title={t('emergencyContact', 'Emergency Contact')}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            id="emergencyContactName"
                            label={t('contactName', 'Contact Name')}
                            name="emergencyContactName"
                            register={form.register}
                            error={form.formState.errors.emergencyContactName as FieldError}
                            t={(key) => t(key)}
                        />
                        <FormField
                            id="emergencyContactPhone"
                            label={t('contactPhone', 'Contact Phone')}
                            name="emergencyContactPhone"
                            inputMode="tel"
                            register={form.register}
                            error={form.formState.errors.emergencyContactPhone as FieldError}
                            t={(key) => t(key)}
                        />
                        <FormField
                            id="emergencyContactRelationship"
                            label={t('relationship', 'Relationship')}
                            name="emergencyContactRelationship"
                            register={form.register}
                            error={form.formState.errors.emergencyContactRelationship as FieldError}
                            t={(key) => t(key)}
                        />
                    </div>
                </FormSection>
            </TabsContent>
            </form>

            {showBankingTab && employeeId && (
                <TabsContent value="banking" className="space-y-6 animate-in fade-in duration-300">
                    <EditEmployeeBankingTab
                        employeeId={employeeId}
                        useSelfService={bankingUseSelfService}
                    />
                </TabsContent>
            )}
        </Tabs>
    );
}
