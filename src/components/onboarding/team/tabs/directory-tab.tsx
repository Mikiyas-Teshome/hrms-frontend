'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { FormField } from '@/components/ui/FormField';
import { FormSelect } from '@/components/ui/FormSelect';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProTipAlert } from '@/components/onboarding/shared/pro-tip-alert';
import { EmployeeTable } from '@/components/onboarding/team/employee-table';
import { useProfile } from '@/features/auth/hooks/useAuth';
import { useRoles } from '@/features/roles/hooks/useRoles';
import {
    useCompanyOptions,
    useOrganizationHierarchy,
} from '@/features/organization/hooks/useOrganization';
import {
    buildOrganizationUnitOptions,
    buildOrganizationUnitOptionsForCompany,
} from '@/features/organization/organization-unit-options.util';
import type { OrganizationUnitType } from '@/features/organization/organization.types';
import { useInviteEmployee, useEmployees } from '@/features/employee/hooks/useEmployee';
import { parseInviteSalary } from '@/features/employee/parse-invite-salary';
import { useContracts } from '@/features/contracts/hooks/useContracts';
import { useInviteContractAutoResolve } from '@/features/contracts/hooks/useInviteContractAutoResolve';
import {
    buildContractsById,
    useContractEmploymentTypeSync,
} from '@/features/contracts/hooks/useContractEmploymentTypeSync';
import {
    ContractEmploymentTypeField,
    formatEmploymentTypeLabel,
} from '@/components/dashboard/employees/ContractEmploymentTypeField';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import ImportEmployeesModal from '@/components/dashboard/employees/ImportEmployeesModal';
import { useDisplayCurrency } from '@/features/settings/hooks/useDisplayCurrency';
import { useSalaryStructures } from '@/features/payroll/salary-structure/hooks/useSalaryStructure';
import { resolveContractEmploymentType } from '@/features/contracts/contract-employment-type.util';

interface DirectoryTabProps {
    t: any;
    directoryFields: any[];
    appendEmployee: (employee: any) => void;
    onNextTab?: () => void;
}

export function DirectoryTab({ t, directoryFields, appendEmployee }: DirectoryTabProps) {
    const { toast } = useToast();
    const { data: profile } = useProfile();
    const { currencySymbol } = useDisplayCurrency();

    const { data: roles, isLoading: rolesLoading } = useRoles(profile?.companyId);
    const { companies, isLoading: companiesLoading } = useCompanyOptions();
    const { data: hierarchy, isLoading: hierarchyLoading } = useOrganizationHierarchy();
    const { data: employees } = useEmployees();
    const inviteMutation = useInviteEmployee();
    const newEmployeeIdRef = useRef(0);
    const previousCompanyOuIdRef = useRef<string | undefined>(undefined);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const handleSendInvitation = async () => {
        const formData = getValues();
        if (!formData.contractId) {
            inviteForm.setError('contractId', {
                type: 'required',
                message: t('add.contractRequired', 'Contract type is required.'),
            });
            return;
        }

        if (!formData.salaryStructureId) {
            inviteForm.setError('salaryStructureId', {
                type: 'required',
                message: t(
                    'add.salaryStructureRequired',
                    'Salary structure is required. Create at least one salary structure first.',
                ),
            });
            if (!hasSalaryStructures) {
                toast({
                    variant: 'destructive',
                    title: t('add.errorTitle', 'Invitation Failed'),
                    description: t(
                        'add.noSalaryStructuresHint',
                        'Create at least one salary structure in Payroll setup before inviting employees.',
                    ),
                });
            }
            return;
        }

        if (parseInviteSalary(formData.salary) == null) {
            inviteForm.setError('salary', {
                type: 'required',
                message: t('add.salaryRequired', 'Salary is required'),
            });
            return;
        }

        if (formData.firstName && formData.email) {
            const invitePayload = {
                email: formData.email.toLowerCase(),
                firstName: formData.firstName,
                lastName: formData.lastName,
                ouId: formData.ouId || undefined,
                roleId: formData.roleId || undefined,
                gccId: formData.gccId || undefined,
                contractId: formData.contractId,
                employmentType: formData.employmentType || undefined,
                jobTitle: formData.jobTitle || undefined,
                salary: parseInviteSalary(formData.salary),
                salaryStructureId: formData.salaryStructureId,
            };
            try {
                await inviteMutation.mutateAsync(invitePayload);

                const roleName = roles?.find((r) => r.id === formData.roleId)?.name || '';
                const ouName = scopedUnitOptions.find((u) => u.id === formData.ouId)?.name || '';

                const newEntry = {
                    id: `new-${(newEmployeeIdRef.current += 1)}`,
                    employeeNumber: '-',
                    name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email.toLowerCase(),
                    department: ouName || t('add.na'),
                    role: roleName || t('add.na'),
                    jobTitle: formData.jobTitle || roleName,
                    jobType: formatEmploymentTypeLabel(formData.employmentType, t) || '-',
                    status: t('status.pending'),
                    gccId: formData.gccId || undefined,
                    employmentType: formData.employmentType || undefined,
                    contractId: formData.contractId,
                    salary: formData.salary || undefined,
                };
                appendEmployee(newEntry);

                reset();

                toast({
                    title: t('add.successTitle') || 'Success',
                    description: t('add.successDescription') || 'Invitation sent successfully',
                });
            } catch (error: any) {
                toast({
                    title: t('add.errorTitle') || 'Error',
                    description: error.message || 'Failed to send invitation',
                    variant: 'destructive',
                });
            }
        } else {
            toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: 'Employee name and Email are required.',
            });
        }
    };

    const inviteForm = useForm({
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            companyOuId: '',
            ouId: '',
            roleId: '',
            gccId: '',
            employmentType: '',
            contractId: '',
            jobTitle: '',
            salary: '',
            salaryStructureId: '',
        },
    });

    const {
        register,
        control,
        getValues,
        reset,
        setValue,
        formState: { errors },
    } = inviteForm;

    const selectedCompanyOuId = useWatch({ control, name: 'companyOuId' });
    const selectedOuId = useWatch({ control, name: 'ouId' });
    const selectedContractId = useWatch({ control, name: 'contractId' });
    const selectedEmploymentType = useWatch({ control, name: 'employmentType' });
    const selectedSalary = useWatch({ control, name: 'salary' });
    const selectedSalaryStructureId = useWatch({ control, name: 'salaryStructureId' });

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
    const { data: salaryStructures } = useSalaryStructures(selectedCompanyOuId);

    const contractScopeOuId = selectedOuId || selectedCompanyOuId || undefined;
    const {
        contractOptions: departmentContractOptions,
        departmentContracts,
        isResolvingContract,
    } = useInviteContractAutoResolve(inviteForm, contractScopeOuId);

    const salaryStructureOptions = useMemo(
        () => (salaryStructures ?? []).map((structure) => ({ label: structure.name, value: structure.id })),
        [salaryStructures],
    );
    const hasSalaryStructures = Boolean(selectedCompanyOuId) && salaryStructureOptions.length > 0;

    useEffect(() => {
        if (companyOptions.length === 1 && !getValues('companyOuId')) {
            setValue('companyOuId', companyOptions[0].value, { shouldValidate: true });
        }
    }, [companyOptions, getValues, setValue]);

    useEffect(() => {
        if (
            previousCompanyOuIdRef.current !== undefined &&
            previousCompanyOuIdRef.current !== selectedCompanyOuId
        ) {
            setValue('ouId', '', { shouldValidate: false });
            setValue('contractId', '', { shouldValidate: false });
            setValue('employmentType', '', { shouldValidate: false });
            setValue('salaryStructureId', '', { shouldValidate: false });
        }
        previousCompanyOuIdRef.current = selectedCompanyOuId;
    }, [selectedCompanyOuId, setValue]);

    const allUnitOptions = useMemo(() => {
        if (!hierarchy) {
            return [];
        }
        return buildOrganizationUnitOptions(hierarchy);
    }, [hierarchy]);

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

    const contractsById = useMemo(
        () => buildContractsById(contractsData?.data, departmentContracts),
        [contractsData?.data, departmentContracts],
    );

    useContractEmploymentTypeSync(inviteForm, contractsById);

    const hasContracts =
        Boolean(selectedCompanyOuId) && !isResolvingContract && contractOptions.length > 0;

    return (
        <div className="space-y-8">
            <ProTipAlert
                title={t('proTip.title')}
                description={t('proTip.description')}
                buttonText={t('proTip.import')}
                onClick={() => setIsImportModalOpen(true)}
            />

            <ImportEmployeesModal open={isImportModalOpen} onOpenChange={setIsImportModalOpen} />

            <Card className="overflow-hidden rounded-xl border-none shadow-none ring-1 ring-border">
                <CardHeader className="border-b border-muted bg-muted/40 px-4 py-4 sm:px-6">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4 rtl:sm:flex-row-reverse">
                        <CardTitle className="text-sm font-bold text-foreground">
                            {t('add.title')}
                        </CardTitle>
                        <span className="text-sm font-medium text-muted-foreground sm:text-end">
                            {t('add.hint')}
                        </span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-4 pb-6 sm:p-8">
                    <div className="grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2">
                        <FormField
                            id="firstName"
                            label={t('add.firstName')}
                            placeholder={t('add.firstNamePlaceholder')}
                            register={register}
                            name="firstName"
                            error={errors.firstName}
                            t={t}
                        />

                        <FormField
                            id="lastName"
                            label={t('add.lastName')}
                            placeholder={t('add.lastNamePlaceholder')}
                            register={register}
                            name="lastName"
                            error={errors.lastName}
                            t={t}
                        />
                        <FormField
                            id="email"
                            label={t('add.email')}
                            placeholder={t('add.emailPlaceholder')}
                            register={register}
                            name="email"
                            error={errors.email}
                            t={t}
                        />

                        <FormSelect
                            id="companyOuId"
                            label={t('add.companyType', 'Company')}
                            placeholder={
                                companiesLoading
                                    ? t('common.loading')
                                    : t('add.selectCompanyType', 'Select company')
                            }
                            control={control}
                            name="companyOuId"
                            error={errors.companyOuId}
                            options={companyOptions}
                            disabled={companiesLoading || companyOptions.length === 0}
                            t={t}
                        />

                        <FormSelect
                            id="ouId"
                            label={t('add.department', 'Org unit')}
                            placeholder={
                                !selectedCompanyOuId
                                    ? t('add.selectCompanyType', 'Select company')
                                    : hierarchyLoading
                                      ? t('common.loading')
                                      : scopedUnitOptions.length === 0
                                        ? t('add.noOrgUnitsForCompany', {
                                              defaultValue: 'No org units for this company',
                                          })
                                        : t('add.selectDepartment', 'Select org unit')
                            }
                            control={control}
                            name="ouId"
                            error={errors.ouId}
                            options={scopedUnitOptions.map((u) => ({ label: u.label, value: u.id }))}
                            disabled={
                                !selectedCompanyOuId ||
                                hierarchyLoading ||
                                scopedUnitOptions.length === 0
                            }
                            t={t}
                        />

                        <FormSelect
                            id="roleId"
                            label={t('add.role')}
                            placeholder={rolesLoading ? t('common.loading') : t('add.selectRole')}
                            control={control}
                            name="roleId"
                            error={errors.roleId}
                            options={
                                roles
                                    ?.filter((r) => !!r.id)
                                    .map((r) => ({ label: r.name, value: r.id! })) || []
                            }
                            t={t}
                        />

                        <FormField
                            id="gccId"
                            label={t('add.gccId', 'GCC ID')}
                            placeholder={t('add.gccIdPlaceholder', '12FR34CD')}
                            register={register}
                            name="gccId"
                            error={errors.gccId}
                            t={t}
                        />

                        <div className="flex flex-col gap-2">
                            <FormSelect
                                id="contractId"
                                label={t('add.contractType', 'Contract type')}
                                placeholder={
                                    !selectedCompanyOuId
                                        ? t('add.selectCompanyType', 'Select company')
                                        : isResolvingContract
                                          ? t('common.loading')
                                          : contractOptions.length === 0
                                            ? t('add.noContractForDepartment', {
                                                  defaultValue:
                                                      'No contract for this org unit or its parents',
                                              })
                                            : t('add.selectContractType', 'Select contract type')
                                }
                                control={control}
                                name="contractId"
                                error={errors.contractId}
                                options={contractOptions}
                                onChange={(contractId) => {
                                    const employmentType = resolveContractEmploymentType(
                                        contractsById.get(contractId),
                                    );
                                    setValue('employmentType', employmentType ?? '', {
                                        shouldValidate: Boolean(employmentType),
                                    });
                                }}
                                disabled={
                                    !selectedCompanyOuId ||
                                    isResolvingContract ||
                                    contractOptions.length === 0
                                }
                                t={t}
                            />
                            {selectedCompanyOuId && !isResolvingContract && !hasContracts ? (
                                <p className="text-sm text-muted-foreground">
                                    {t(
                                        'add.noContractForCompanyHint',
                                        'Create a contract for this company before inviting employees.',
                                    )}
                                </p>
                            ) : null}
                        </div>

                        <ContractEmploymentTypeField
                            label={t('add.employmentType', 'Employment type')}
                            selectedContractId={selectedContractId}
                            employmentType={selectedEmploymentType}
                            register={register}
                            selectContractFirstLabel={t(
                                'add.selectContractFirst',
                                'Select a contract first',
                            )}
                            employmentTypeFromContractLabel={t(
                                'add.employmentTypeFromContract',
                                'Set from selected contract',
                            )}
                            t={t}
                        />

                        <FormField
                            id="jobTitle"
                            label={t('add.jobTitle', 'Job title')}
                            placeholder={t('add.selectJobTitle', 'Select job title')}
                            type="text"
                            name="jobTitle"
                            register={register}
                            error={errors.jobTitle}
                            t={t}
                        />

                        <FormField
                            id="salary"
                            label={t('add.salary', { defaultValue: 'Salary ({{symbol}})', symbol: currencySymbol })}
                            placeholder="0"
                            type="number"
                            register={register}
                            name="salary"
                            error={errors.salary}
                            validation={{
                                validate: (value) =>
                                    parseInviteSalary(value) != null ||
                                    t('add.salaryRequired', 'Salary is required'),
                            }}
                            t={t}
                        />

                        <div className="flex flex-col gap-2">
                            <FormSelect
                                id="salaryStructureId"
                                label={t('add.salaryStructure', 'Salary Structure')}
                                placeholder={
                                    !selectedCompanyOuId
                                        ? t('add.selectCompanyType', 'Select company')
                                        : hasSalaryStructures
                                          ? t('add.selectSalaryStructure', 'Select salary structure')
                                          : t('add.noSalaryStructuresAvailable', 'No salary structures available')
                                }
                                control={control}
                                name="salaryStructureId"
                                error={errors.salaryStructureId}
                                options={salaryStructureOptions}
                                disabled={!selectedCompanyOuId || !hasSalaryStructures}
                                t={t}
                            />
                            {!hasSalaryStructures ? (
                                <p className="text-sm text-muted-foreground">
                                    {t(
                                        'add.noSalaryStructuresHint',
                                        'Create at least one salary structure in Payroll setup before inviting employees.',
                                    )}
                                </p>
                            ) : null}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            className="bg-primary/10 hover:bg-primary/20 text-foreground py-2 px-4 font-medium text-sm gap-2 border-none transition-colors"
                            disabled={
                                inviteMutation.isPending ||
                                !selectedCompanyOuId ||
                                !hasSalaryStructures ||
                                !hasContracts ||
                                !selectedContractId ||
                                !selectedSalaryStructureId ||
                                parseInviteSalary(selectedSalary) == null
                            }
                            onClick={handleSendInvitation}
                        >
                            {inviteMutation.isPending && (
                                <Loader2 className="size-4 animate-spin" />
                            )}
                            {t('add.sendToEmployee', 'Send to employee')}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {(() => {
                const serverEmails = new Set((employees || []).map((e) => e.email.toLowerCase()));
                const filteredDirectoryFields = directoryFields.filter(
                    (f) => !serverEmails.has(f.email.toLowerCase()),
                );

                const combinedData = [
                    ...(employees || []).map((e) => ({
                        id: e.id,
                        employeeNumber: e.employeeNumber,
                        name: `${e.firstName} ${e.lastName}`,
                        email: e.email,
                        jobTitle: e.jobTitle || t('common.employee'),
                        jobType: e.employmentType || '-',
                        department:
                            e.orgUnit?.orgUnitName ||
                            allUnitOptions.find((u) => u.id === e.departmentId)?.name ||
                            t('add.na'),
                        status: t('status.active'),
                    })),
                    ...filteredDirectoryFields.map((f) => ({
                        ...f,
                        jobTitle: f.jobTitle || f.role,
                        jobType: f.jobType || '-',
                    })),
                ];

                const startIndex = (currentPage - 1) * pageSize;
                const pagedData = combinedData.slice(startIndex, startIndex + pageSize);

                return (
                    <EmployeeTable
                        data={pagedData}
                        t={t}
                        totalItems={combinedData.length}
                        pageSize={pageSize}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(size) => {
                            setPageSize(size);
                            setCurrentPage(1);
                        }}
                    />
                );
            })()}
        </div>
    );
}
