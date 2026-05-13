/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormField } from '@/components/ui/FormField';
import { FormSelect } from '@/components/ui/FormSelect';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProTipAlert } from '@/components/onboarding/shared/pro-tip-alert';
import { EmployeeTable } from '@/components/onboarding/team/employee-table';
import { useProfile } from '@/features/auth/hooks/useAuth';
import { useRoles } from '@/features/roles/hooks/useRoles';
import { useOrganizationLeafOptions } from '@/features/organization/hooks/useOrganization';
import { useInviteEmployee, useEmployees } from '@/features/employee/hooks/useEmployee';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface DirectoryTabProps {
    t: any;
    directoryFields: any[];
    appendEmployee: (employee: any) => void;
    onNextTab?: () => void;
}

export function DirectoryTab({ t, directoryFields, appendEmployee, onNextTab }: DirectoryTabProps) {
    const { toast } = useToast();
    const { data: profile } = useProfile();

    const { data: roles, isLoading: rolesLoading } = useRoles(profile?.companyId);

    const { leafOptions, isLoading: hierarchyLoading } = useOrganizationLeafOptions();

    const { data: employees } = useEmployees();
    const inviteMutation = useInviteEmployee();

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const {
        register,
        control,
        watch,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            ouId: '',
            roleId: '',
        },
    });

    return (
        <div className="space-y-8">
            <ProTipAlert
                title={t('proTip.title')}
                description={t('proTip.description')}
                buttonText={t('proTip.import')}
            />

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
                    {/* Row 1: First / Last name */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                    </div>

                    {/* Row 2: Email / Role */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                    </div>

                    {/* Row 3: Organization unit tree picker (full-width) */}
                    <FormSelect
                        id="ouId"
                        label={t('add.organizationUnit')}
                        placeholder={
                            hierarchyLoading ? t('common.loading') : t('add.selectOrganizationUnit')
                        }
                        control={control}
                        name="ouId"
                        error={errors.ouId}
                        options={leafOptions.map((u) => ({ label: u.name, value: u.id }))}
                        t={t}
                    />

                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="py-2 px-4 font-medium text-sm gap-2"
                            onClick={() => onNextTab?.()}
                        >
                            {t('tabs.creation')}
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            className="bg-primary/10 hover:bg-primary/20 text-primary py-2 px-4 font-medium text-sm gap-2 border-none transition-colors"
                            disabled={inviteMutation.isPending}
                            onClick={async () => {
                                const formData = watch();
                                if (formData.firstName && formData.lastName && formData.email) {
                                    const invitePayload = {
                                        email: formData.email.toLowerCase(),
                                        firstName: formData.firstName,
                                        lastName: formData.lastName,
                                        ouId: formData.ouId || undefined,
                                        roleId: formData.roleId || undefined,
                                    };
                                    try {
                                        await inviteMutation.mutateAsync(invitePayload);

                                        const roleName =
                                            roles?.find((r) => r.id === formData.roleId)?.name ||
                                            '';
                                        const ouName =
                                            leafOptions.find((u) => u.id === formData.ouId)?.name ||
                                            '';
                                        const newEntry = {
                                            id: Date.now().toString(),
                                            employeeNumber: '-',
                                            name: `${formData.firstName} ${formData.lastName}`,
                                            email: formData.email.toLowerCase(),
                                            department: ouName || t('add.na'),
                                            role: roleName || t('add.na'),
                                            jobTitle: roleName,
                                            jobType: '-',
                                            status: t('status.pending'),
                                        };
                                        appendEmployee(newEntry);

                                        reset();

                                        toast({
                                            title: t('add.successTitle') || 'Success',
                                            description:
                                                t('add.successDescription') ||
                                                'Invitation sent successfully',
                                        });
                                    } catch (error: any) {
                                        toast({
                                            title: t('add.errorTitle') || 'Error',
                                            description:
                                                error.message || 'Failed to send invitation',
                                            variant: 'destructive',
                                        });
                                    }
                                }
                            }}
                        >
                            {inviteMutation.isPending && (
                                <Loader2 className="size-4 animate-spin" />
                            )}
                            {t('add.addToList')}
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
                            leafOptions.find((u) => u.id === e.departmentId)?.name ||
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
