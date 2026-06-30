'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { X, Save, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useUpdateEmployee, useUpdateMyEmployeeProfile } from '@/features/employee/hooks/useEmployee';
import { EmployeeResponse, UpdateMyEmployeeProfileInput } from '@/features/employee/employee.types';
import { useProfile, useUpdateProfile } from '@/features/auth/hooks/useAuth';
import { useDeferredAvatarUpload } from '@/features/auth/hooks/useDeferredAvatarUpload';
import { ProfileAvatarUpload } from '@/components/onboarding/shared/profile-avatar-upload';
import {
    useAssignEmployeeContract,
    useEmployeeContracts,
    useRenewEmployeeContract,
    useUpdateDraftEmployeeContract,
} from '@/features/contracts/hooks/useEmployeeContracts';
import { ContractStatus } from '@/features/contracts/contracts.types';
import { EmployeeContract } from '@/features/contracts/employee-contract.types';
import {
    useAssignEmployeeSalary,
    useEmployeeSalaryStructure,
} from '@/features/payroll/salary-structure/hooks/useSalaryStructure';
import { useDisplayCurrency } from '@/features/settings/hooks/useDisplayCurrency';
import { EditEmployeeFormFields } from '@/components/dashboard/employees/EditEmployeeFormFields';
import { EDIT_EMPLOYEE_BANK_FORM_ID } from '@/components/dashboard/employees/edit-employee-banking.constants';
import {
    useCreateBankAccount,
    useCreateMyBankAccount,
    useUpdateBankAccount,
    useUpdateMyBankAccount,
} from '@/features/bank-account/hooks/useBankAccount';

import { 
    optionalPhoneValidation, 
    futureDateValidation, 
    pastDateValidation, 
    numericValidation
} from '@/lib/validations';

interface EditEmployeeSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employee: EmployeeResponse | null;
    onSuccess?: () => void;
    canEditEmployment?: boolean;
}

const SELF_PROFILE_FIELD_KEYS: (keyof UpdateMyEmployeeProfileInput)[] = [
    'firstName',
    'lastName',
    'middleName',
    'phoneNumber',
    'personalEmail',
    'dateOfBirth',
    'gender',
    'nationality',
    'nationalId',
    'address',
    'city',
    'state',
    'country',
    'postalCode',
    'homeAddress',
    'homeCity',
    'homeState',
    'homeCountry',
    'homePostalCode',
    'homePhone',
    'passportNumber',
    'passportExpiry',
    'visaNumber',
    'visaExpiry',
    'workPermitNumber',
    'workPermitExpiry',
    'emergencyContactName',
    'emergencyContactPhone',
    'emergencyContactRelationship',
];

const EditEmployeeSheet: React.FC<EditEmployeeSheetProps> = ({ 
    open, 
    onOpenChange, 
    employee,
    onSuccess,
    canEditEmployment = true,
}) => {
    const { t, i18n } = useTranslation('employees');
    const { toast } = useToast();
    const isRtl = i18n.language === 'ar';
    const useScopedEmployeeUpdate = !canEditEmployment;
    const hasEmployeeRecord = Boolean(employee?.id);
    const [activeTab, setActiveTab] = useState('general');
    const isBankingTab = activeTab === 'banking' && hasEmployeeRecord;

    const handleOpenChange = useCallback(
        (nextOpen: boolean) => {
            if (!nextOpen) {
                setActiveTab('general');
            }
            onOpenChange(nextOpen);
        },
        [onOpenChange],
    );
    
    const { data: profile } = useProfile();
    const companyId = profile?.companyId ?? '';
    const canEditAvatar = Boolean(
        employee &&
            (useScopedEmployeeUpdate ||
                !hasEmployeeRecord ||
                (profile?.id && employee.userId && profile.id === employee.userId)),
    );
    const {
        reference: avatarReference,
        isUploading: isAvatarUploading,
        onFileSelect: onAvatarFileSelect,
        onClear: onAvatarClear,
        persistPendingAvatar,
    } = useDeferredAvatarUpload(profile?.avatarUrl ?? employee?.avatarUrl ?? null);
    const updateEmployeeMutation = useUpdateEmployee();
    const updateMyProfileMutation = useUpdateMyEmployeeProfile();
    const updateUserProfileMutation = useUpdateProfile();
    const assignContractMutation = useAssignEmployeeContract();
    const updateDraftContractMutation = useUpdateDraftEmployeeContract();
    const renewContractMutation = useRenewEmployeeContract();
    const assignSalaryMutation = useAssignEmployeeSalary();
    const { data: employeeContractsResponse } = useEmployeeContracts(
        { employeeId: employee?.id ?? '' },
        { enabled: open && Boolean(employee?.id) && canEditEmployment },
    );
    const { data: assignedSalaryStructure } = useEmployeeSalaryStructure(
        employee?.id ?? '',
        companyId,
    );
    const departmentId = employee?.orgUnit?.orgUnitId || employee?.departmentId;
    const { currencyCode } = useDisplayCurrency(departmentId ?? undefined);
    const createMyBankAccount = useCreateMyBankAccount();
    const createBankAccount = useCreateBankAccount();
    const updateMyBankAccount = useUpdateMyBankAccount();
    const updateBankAccountMutation = useUpdateBankAccount();
    const isBankSaving =
        createMyBankAccount.isPending ||
        createBankAccount.isPending ||
        updateMyBankAccount.isPending ||
        updateBankAccountMutation.isPending;
    const isContractSaving =
        assignContractMutation.isPending ||
        updateDraftContractMutation.isPending ||
        renewContractMutation.isPending ||
        assignSalaryMutation.isPending;
    const updateMutation = useScopedEmployeeUpdate
        ? updateMyProfileMutation
        : updateEmployeeMutation;

    const updateEmployeeSchema = useMemo(() => {
        return z.object({
            employeeNumber: z.string().optional(),
            firstName: z.string().min(1, t('firstName')),
            lastName: z.string().min(1, t('lastName')),
            middleName: z.string().optional(),
            email: z.string().email(t('emailInvalid', 'Invalid email address')),
            businessEmail: z.string().email(t('emailInvalid', 'Invalid email address')).optional().or(z.literal('')),
            personalEmail: z.string().email(t('emailInvalid', 'Invalid email address')).optional().or(z.literal('')),
            phoneNumber: optionalPhoneValidation(t('errors.phoneInvalid')),
            homePhone: optionalPhoneValidation(t('errors.phoneInvalid')),
            dateOfBirth: pastDateValidation(t('errors.pastDateRequired')),
            gender: z.string().optional(),
            nationality: z.string().optional(),
            nationalId: z.string().optional(),
            jobTitle: z.string().min(1, t('jobTitle')),
            employmentType: z.string().optional(),
            departmentId: z.string().optional(),
            managerId: z.string().optional(),
            salary: z.coerce.number().optional(),
            currency: z.string().optional(),
            address: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
            country: z.string().optional(),
            postalCode: numericValidation(t('errors.numbersOnly')).optional(),
            homeAddress: z.string().optional(),
            homeCity: z.string().optional(),
            homeState: z.string().optional(),
            homeCountry: z.string().optional(),
            homePostalCode: numericValidation(t('errors.numbersOnly')).optional(),
            passportNumber: z.string().optional(),
            passportExpiry: futureDateValidation(t('errors.futureDateRequired')).optional(),
            visaNumber: z.string().optional(),
            visaExpiry: futureDateValidation(t('errors.futureDateRequired')).optional(),
            workPermitNumber: z.string().optional(),
            workPermitExpiry: futureDateValidation(t('errors.futureDateRequired')).optional(),
            emergencyContactName: z.string().optional(),
            emergencyContactPhone: optionalPhoneValidation(t('errors.phoneInvalid')),
            emergencyContactRelationship: z.string().optional(),
            contractId: z.string().optional(),
            salaryStructureId: z.string().optional(),
        });
    }, [t]);

    const currentEmployeeContract = useMemo(() => {
        const contracts = employeeContractsResponse?.data ?? [];
        return (
            contracts.find((contract) => contract.status === ContractStatus.active) ??
            contracts.find((contract) => contract.status === ContractStatus.draft) ??
            contracts[0] ??
            null
        );
    }, [employeeContractsResponse]);

    const selectedContractOption = useMemo(() => {
        if (!currentEmployeeContract?.contractId) {
            return null;
        }
        const contract = currentEmployeeContract.contract;
        return {
            id: currentEmployeeContract.contractId,
            label: contract?.contractName || `Contract ${contract?.contractNumber ?? ''}`.trim(),
        };
    }, [currentEmployeeContract]);

    const selectedSalaryStructureOption = useMemo(() => {
        if (!assignedSalaryStructure?.id) {
            return null;
        }
        return {
            id: assignedSalaryStructure.id,
            label: assignedSalaryStructure.code
                ? `${assignedSalaryStructure.name} (${assignedSalaryStructure.code})`
                : assignedSalaryStructure.name,
        };
    }, [assignedSalaryStructure]);

    type UpdateEmployeeValues = z.infer<typeof updateEmployeeSchema>;

    const form = useForm<UpdateEmployeeValues>({
        resolver: zodResolver(updateEmployeeSchema) as any,
        defaultValues: {
            employeeNumber: '',
            firstName: '',
            lastName: '',
            middleName: '',
            email: '',
            businessEmail: '',
            personalEmail: '',
            phoneNumber: '',
            homePhone: '',
            dateOfBirth: '',
            gender: '',
            nationality: '',
            nationalId: '',
            jobTitle: '',
            employmentType: '',
            departmentId: '',
            managerId: '',
            salary: 0,
            currency: '',
            address: '',
            city: '',
            state: '',
            country: '',
            postalCode: '',
            homeAddress: '',
            homeCity: '',
            homeState: '',
            homeCountry: '',
            homePostalCode: '',
            passportNumber: '',
            passportExpiry: '',
            visaNumber: '',
            visaExpiry: '',
            workPermitNumber: '',
            workPermitExpiry: '',
            emergencyContactName: '',
            emergencyContactPhone: '',
            emergencyContactRelationship: '',
            contractId: '',
            salaryStructureId: '',
        },
    });
    
    useEffect(() => {
        if (open && employee) {
            form.reset({
                employeeNumber: employee.employeeNumber || '',
                firstName: employee.firstName || '',
                lastName: employee.lastName || '',
                middleName: employee.middleName || '',
                email: employee.email || '',
                businessEmail: employee.businessEmail || '',
                personalEmail: employee.personalEmail || '',
                phoneNumber: employee.phoneNumber || '',
                homePhone: employee.homePhone || '',
                dateOfBirth: employee.dateOfBirth ? new Date(employee.dateOfBirth).toISOString().split('T')[0] : '',
                gender: employee.gender || '',
                nationality: employee.nationality || '',
                nationalId: employee.nationalId || '',
                jobTitle: employee.jobTitle || '',
                employmentType: employee.employmentType || '',
                departmentId: employee.orgUnit?.orgUnitId || employee.departmentId || '',
                managerId: employee.managerId || '',
                salary: employee.salary || 0,
                currency: employee.currency || currencyCode || '',
                address: employee.address || '',
                city: employee.city || '',
                state: employee.state || '',
                country: employee.country || '',
                postalCode: employee.postalCode || '',
                homeAddress: employee.homeAddress || '',
                homeCity: employee.homeCity || '',
                homeState: employee.homeState || '',
                homeCountry: employee.homeCountry || '',
                homePostalCode: employee.homePostalCode || '',
                passportNumber: employee.passportNumber || '',
                passportExpiry: employee.passportExpiry ? new Date(employee.passportExpiry).toISOString().split('T')[0] : '',
                visaNumber: employee.visaNumber || '',
                visaExpiry: employee.visaExpiry ? new Date(employee.visaExpiry).toISOString().split('T')[0] : '',
                workPermitNumber: employee.workPermitNumber || '',
                workPermitExpiry: employee.workPermitExpiry ? new Date(employee.workPermitExpiry).toISOString().split('T')[0] : '',
                emergencyContactName: employee.emergencyContactName || '',
                emergencyContactPhone: employee.emergencyContactPhone || '',
                emergencyContactRelationship: employee.emergencyContactRelationship || '',
                contractId: '',
                salaryStructureId: '',
            });
        }
    }, [open, employee, form, currencyCode]);

    useEffect(() => {
        if (!open || !employee) {
            return;
        }

        if (currentEmployeeContract) {
            form.setValue('contractId', currentEmployeeContract.contractId ?? '', {
                shouldDirty: false,
                shouldValidate: false,
            });
            if (currentEmployeeContract.salary != null) {
                form.setValue('salary', Number(currentEmployeeContract.salary), {
                    shouldDirty: false,
                    shouldValidate: false,
                });
            }
            if (currentEmployeeContract.employmentType) {
                form.setValue('employmentType', currentEmployeeContract.employmentType, {
                    shouldDirty: false,
                    shouldValidate: false,
                });
            }
            if (currentEmployeeContract.jobTitle) {
                form.setValue('jobTitle', currentEmployeeContract.jobTitle, {
                    shouldDirty: false,
                    shouldValidate: false,
                });
            }
        }

        if (assignedSalaryStructure?.id) {
            form.setValue('salaryStructureId', assignedSalaryStructure.id, {
                shouldDirty: false,
                shouldValidate: false,
            });
            const contractSalary = currentEmployeeContract?.salary;
            if (
                assignedSalaryStructure.baseSalary != null &&
                (contractSalary == null || Number(contractSalary) === 0)
            ) {
                form.setValue('salary', Number(assignedSalaryStructure.baseSalary), {
                    shouldDirty: false,
                    shouldValidate: false,
                });
            }
        }
    }, [open, employee, currentEmployeeContract, assignedSalaryStructure, form]);


    const hasContractChanges = (
        data: UpdateEmployeeValues,
        currentContract: EmployeeContract | null,
    ) => {
        if (!data.contractId) {
            return false;
        }
        if (!currentContract) {
            return true;
        }

        return (
            data.contractId !== currentContract.contractId ||
            Number(data.salary ?? 0) !== Number(currentContract.salary ?? 0) ||
            (data.employmentType || '') !== (currentContract.employmentType || '') ||
            (data.jobTitle || '') !== (currentContract.jobTitle || '')
        );
    };

    const syncEmployeeContract = async (
        data: UpdateEmployeeValues,
        currentContract: EmployeeContract | null,
    ) => {
        if (!employee?.id || !hasContractChanges(data, currentContract)) {
            return;
        }

        const compensation = {
            contractId: data.contractId,
            salary: data.salary ? Number(data.salary) : undefined,
            employmentType: data.employmentType || undefined,
            jobTitle: data.jobTitle || undefined,
        };

        if (!currentContract?.id) {
            await assignContractMutation.mutateAsync({
                employeeId: employee.id,
                ...compensation,
            });
            return;
        }

        if (currentContract.status === ContractStatus.draft) {
            await updateDraftContractMutation.mutateAsync({
                id: currentContract.id,
                input: compensation,
            });
            return;
        }

        if (currentContract.status === ContractStatus.active) {
            const effectiveDate =
                currentContract.effectiveDate?.split('T')[0] ??
                new Date().toISOString().split('T')[0];
            await renewContractMutation.mutateAsync({
                id: currentContract.id,
                input: {
                    effectiveDate,
                    ...compensation,
                },
            });
            return;
        }

        throw new Error(t('contractUpdateNotAllowed', 'This contract cannot be updated.'));
    };

    const syncEmployeeSalaryStructure = async (data: UpdateEmployeeValues) => {
        if (!employee?.id || !companyId || !data.salaryStructureId) {
            return;
        }

        const baseSalary = data.salary ? Number(data.salary) : 0;
        if (baseSalary <= 0) {
            throw new Error(t('errors.salaryMin', 'Salary must be a positive number'));
        }

        const structureChanged = assignedSalaryStructure?.id !== data.salaryStructureId;
        const salaryChanged = assignedSalaryStructure?.baseSalary !== baseSalary;
        if (assignedSalaryStructure && !structureChanged && !salaryChanged) {
            return;
        }

        await assignSalaryMutation.mutateAsync({
            companyId,
            employeeId: employee.id,
            salaryStructureId: data.salaryStructureId,
            baseSalary,
            currency: (assignedSalaryStructure?.currency || currencyCode).toUpperCase(),
            employeeContractId: currentEmployeeContract?.id,
        });
    };

    const onSubmit = async (data: UpdateEmployeeValues) => {
        if (!employee) return;
        try {
            if (canEditAvatar) {
                await persistPendingAvatar();
            }

            const { employeeNumber, contractId, salaryStructureId, ...updateInput } = data;
            void employeeNumber;
            void contractId;
            void salaryStructureId;
            
            const formatDate = (dateStr: string | undefined) => {
                if (!dateStr || dateStr === '') return undefined;
                if (dateStr.includes('T')) return dateStr;
                return `${dateStr}T00:00:00+03:00`;
            };

            const finalInput = {
                ...updateInput,
                dateOfBirth: formatDate(data.dateOfBirth),
                passportExpiry: formatDate(data.passportExpiry),
                visaExpiry: formatDate(data.visaExpiry),
                workPermitExpiry: formatDate(data.workPermitExpiry),
                salary: data.salary ? Number(data.salary) : undefined,
            };

            const sanitizedInput = Object.fromEntries(
                Object.entries(finalInput)
                    .filter(([, value]) => value !== '' && value !== undefined && value !== null)
            );

            if (!hasEmployeeRecord) {
                await updateUserProfileMutation.mutateAsync({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    phoneNumber: data.phoneNumber || undefined,
                });
            } else if (useScopedEmployeeUpdate) {
                const selfInput = Object.fromEntries(
                    SELF_PROFILE_FIELD_KEYS.filter((key) => key in sanitizedInput).map((key) => [
                        key,
                        sanitizedInput[key as keyof typeof sanitizedInput],
                    ]),
                ) as UpdateMyEmployeeProfileInput;
                await updateMyProfileMutation.mutateAsync(selfInput);
            } else {
                await updateEmployeeMutation.mutateAsync({
                    id: employee!.id,
                    input: sanitizedInput as any,
                });
                await syncEmployeeContract(data, currentEmployeeContract);
                await syncEmployeeSalaryStructure(data);
            }
            toast({
                title: t('updateSuccess', 'Profile Updated'),
                description: useScopedEmployeeUpdate || !hasEmployeeRecord
                    ? t('updateMyProfileSuccessDesc', 'Your profile has been updated successfully.')
                    : t('updateSuccessDesc', 'Employee profile has been updated successfully.'),
            });
            onSuccess?.();
            onOpenChange(false);
        } catch (error: any) {
            toast({
                title: t('updateError', 'Update Failed'),
                description: error.message || t('saveErrorDesc'),
                variant: 'destructive',
            });
        }
    };

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetContent
                showCloseButton={false}
                side={isRtl ? 'left' : 'right'}
                className="w-full sm:max-w-225 p-0 flex flex-col h-full border-0 shadow-2xl overflow-hidden"
            >
                <div className="px-10 py-6 space-y-6 flex flex-col h-full">
                    <SheetHeader className="flex flex-row items-center justify-between shrink-0">
                        <SheetTitle className="text-2xl font-bold text-foreground">
                            {useScopedEmployeeUpdate || !hasEmployeeRecord
                                ? t('editMyProfile', 'Edit My Profile')
                                : t('editProfile', 'Edit Employee Profile')}
                        </SheetTitle>
                        <SheetClose className="text-foreground/80 hover:text-foreground transition-colors rounded-lg">
                            <X className="h-5 w-5" strokeWidth={1.33} />
                            <span className="sr-only">Close</span>
                        </SheetClose>
                    </SheetHeader>
                    
                    <Separator className="shrink-0" />

                    <div className="flex-1 overflow-y-auto no-scrollbar pr-2">
                        {canEditAvatar ? (
                            <div className="mb-6 rounded-xl border border-border/60 bg-muted/15 p-4">
                                <ProfileAvatarUpload
                                    initialUrl={avatarReference}
                                    isUploading={isAvatarUploading}
                                    onFileSelect={onAvatarFileSelect}
                                    onClear={onAvatarClear}
                                    onUploadError={(message) =>
                                        toast({
                                            title: t('updateError', 'Update Failed'),
                                            description: message,
                                            variant: 'destructive',
                                        })
                                    }
                                />
                            </div>
                        ) : null}
                        <Form {...form}>
                            <EditEmployeeFormFields
                                form={form}
                                canEditEmployment={canEditEmployment && hasEmployeeRecord}
                                showBankingTab={hasEmployeeRecord}
                                employeeId={employee?.id}
                                bankingUseSelfService={useScopedEmployeeUpdate}
                                profileFormId="edit-employee-form"
                                onProfileSubmit={form.handleSubmit(onSubmit as any)}
                                activeTab={activeTab}
                                onActiveTabChange={setActiveTab}
                                selectedContractOption={selectedContractOption}
                                selectedSalaryStructureOption={selectedSalaryStructureOption}
                            />
                        </Form>
                    </div>

                    <div className="pt-6 mt-auto shrink-0 flex items-center justify-end gap-3 border-t">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="h-11 px-6 rounded-xl font-semibold transition-all hover:bg-muted"
                        >
                            {t('cancel', 'Cancel')}
                        </Button>
                        {isBankingTab ? (
                            <Button
                                form={EDIT_EMPLOYEE_BANK_FORM_ID}
                                type="submit"
                                disabled={isBankSaving}
                                className="h-11 px-8 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] gap-2"
                            >
                                {isBankSaving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                {isBankSaving
                                    ? t('saving', 'Saving...')
                                    : t('saveBankDetails', 'Save bank details')}
                            </Button>
                        ) : (
                            <Button
                                form="edit-employee-form"
                                type="submit"
                                disabled={updateMutation.isPending || isContractSaving}
                                className="h-11 px-8 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] gap-2"
                            >
                                {updateMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                {t('saveChanges', 'Save Changes')}
                            </Button>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default EditEmployeeSheet;
