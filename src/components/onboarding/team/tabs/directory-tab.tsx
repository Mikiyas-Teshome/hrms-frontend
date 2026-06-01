'use client';

import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormField } from '@/components/ui/FormField';
import { FormSelect } from '@/components/ui/FormSelect';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProTipAlert } from '@/components/onboarding/shared/pro-tip-alert';
import { EmployeeTable } from '@/components/onboarding/team/employee-table';
import { useProfile } from '@/features/auth/hooks/useAuth';
import { useRoles } from '@/features/roles/hooks/useRoles';
import { useOrganizationUnitOptions } from '@/features/organization/hooks/useOrganization';
import { useInviteEmployee, useEmployees } from '@/features/employee/hooks/useEmployee';
import { useContracts } from '@/features/contracts/hooks/useContracts';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { EMPLOYMENT_TYPE_OPTIONS } from '@/features/employee/employee.types';
import ImportEmployeesModal from '@/components/dashboard/employees/ImportEmployeesModal';
import { useDisplayCurrency } from '@/features/settings/hooks/useDisplayCurrency';

const formatEmploymentType = (type: string, t?: any) => {
    const option = EMPLOYMENT_TYPE_OPTIONS.find((opt) => opt.value === type);
    if (!option) return type || '-';
    return t ? t(option.value, option.label) : option.label;
};

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
    const { unitOptions, isLoading: hierarchyLoading } = useOrganizationUnitOptions();
    const { data: employees } = useEmployees();
    const { data: contractsData } = useContracts();
    const inviteMutation = useInviteEmployee();
    const newEmployeeIdRef = useRef(0);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const handleSendInvitation = async () => {
        const formData = getValues();
        if (formData.firstName && formData.email) {
            const invitePayload = {
                email: formData.email.toLowerCase(),
                firstName: formData.firstName,
                lastName: formData.lastName,
                ouId: formData.ouId || undefined,
                roleId: formData.roleId || undefined,
                gccId: formData.gccId || undefined,
                contractId: formData.contractId || undefined,
                employmentType: formData.employmentType || undefined,
                jobTitle: formData.jobTitle || undefined,
                salary: formData.salary ? Number(formData.salary) : undefined,
            };
            try {
                await inviteMutation.mutateAsync(invitePayload);

                const roleName = roles?.find((r) => r.id === formData.roleId)?.name || '';
                const ouName = unitOptions.find((u) => u.id === formData.ouId)?.name || '';

                const newEntry = {
                    id: `new-${(newEmployeeIdRef.current += 1)}`,
                    employeeNumber: '-',
                    name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email.toLowerCase(),
                    department: ouName || t('add.na'),
                    role: roleName || t('add.na'),
                    jobTitle: formData.jobTitle || roleName,
                    jobType: formatEmploymentType(formData.employmentType, t),
                    status: t('status.pending'),
                    gccId: formData.gccId || undefined,
                    employmentType: formData.employmentType || undefined,
                    contractId: formData.contractId || undefined,
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

    const contractOptions =
        contractsData?.data?.map((c) => ({
            label: c.contractName || `Contract ${c.contractNumber}`,
            value: c.id,
        })) || [];

    const {
        register,
        control,
        getValues,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            ouId: '',
            roleId: '',
            gccId: '',
            employmentType: '',
            contractId: '',
            jobTitle: '',
            salary: '',
        },
    });

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
                <CardHeader className="border-b border-muted bg-muted/40 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-bold text-foreground">
                            {t('add.title')}
                        </CardTitle>
                        <span className="text-[14px] font-medium text-muted-foreground rtl:text-right">
                            {t('add.hint')}
                        </span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 sm:p-8">
                    <div className="grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2">
                        {/* Employee name */}
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
                        {/* Email */}
                        <FormField
                            id="email"
                            label={t('add.email')}
                            placeholder={t('add.emailPlaceholder')}
                            register={register}
                            name="email"
                            error={errors.email}
                            t={t}
                        />

                        {/* Department */}
                        <FormSelect
                            id="ouId"
                            label={t('add.department', 'Department')}
                            placeholder={
                                hierarchyLoading
                                    ? t('common.loading')
                                    : t('add.selectDepartment', 'Select department')
                            }
                            control={control}
                            name="ouId"
                            error={errors.ouId}
                            options={unitOptions.map((u) => ({ label: u.label, value: u.id }))}
                            t={t}
                        />

                        {/* Role */}
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

                        {/* GCC ID */}
                        <FormField
                            id="gccId"
                            label={t('add.gccId', 'GCC ID')}
                            placeholder={t('add.gccIdPlaceholder', '12FR34CD')}
                            register={register}
                            name="gccId"
                            error={errors.gccId}
                            t={t}
                        />

                        {/* Employment type */}
                        <FormSelect
                            id="employmentType"
                            label={t('add.employmentType', 'Employment type')}
                            placeholder={t('add.selectEmploymentType', 'Select employment type')}
                            control={control}
                            name="employmentType"
                            error={errors.employmentType}
                            options={EMPLOYMENT_TYPE_OPTIONS.map((opt) => ({
                                label: t(opt.value, opt.label),
                                value: opt.value,
                            }))}
                            t={t}
                        />

                        {/* Job title */}
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

                        {/* Contract type */}
                        <FormSelect
                            id="contractId"
                            label={t('add.contractType', 'Contract type')}
                            placeholder={t('add.selectContractType', 'Select contract type')}
                            control={control}
                            name="contractId"
                            error={errors.contractId}
                            options={contractOptions}
                            t={t}
                        />

                        {/* Salary */}
                        <FormField
                            id="salary"
                            label={t('add.salary', { defaultValue: 'Salary ({{symbol}})', symbol: currencySymbol })}
                            placeholder="0"
                            type="number"
                            register={register}
                            name="salary"
                            error={errors.salary}
                            t={t}
                        />

                        {/* Empty spacing for desktop layout alignment */}
                        <div />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            className="bg-primary/10 hover:bg-primary/20 text-foreground py-2 px-4 font-medium text-sm gap-2 border-none transition-colors"
                            disabled={inviteMutation.isPending}
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

            {/* Employee Table */}
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
                            unitOptions.find((u) => u.id === e.departmentId)?.name ||
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
