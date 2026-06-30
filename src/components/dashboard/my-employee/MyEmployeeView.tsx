'use client';

import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
    PencilLine,
    Briefcase,
    Calendar,
    Loader2,
    CircleX,
    FileText,
    CheckCircle2,
    XCircle,
} from 'lucide-react';
import { ContractDocumentPreviewButton } from '@/components/dashboard/contracts/ContractDocumentPreviewButton';
import { useMyEmployeeProfile } from '@/features/employee/hooks/useEmployee';
import { useMyBankAccounts } from '@/features/bank-account/hooks/useBankAccount';
import {
    useMyEmployeeContracts,
    useActivateMyEmployeeContract,
    useRejectMyEmployeeContract,
} from '@/features/contracts/hooks/useEmployeeContracts';
import { ContractStatus } from '@/features/contracts/contracts.types';
import { useDisplayCurrency } from '@/features/settings/hooks/useDisplayCurrency';
import { SecureAvatar } from '@/components/common/secure-avatar';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import {
    getUserDisplayName,
    getUserInitials,
    getUserRoleLabel,
} from '@/features/auth/utils/user-display.util';
import { ProfilePageLoader } from '@/components/dashboard/shared/profile-page-states';
import EditEmployeeSheet from '@/components/dashboard/employees/EditEmployeeSheet';
import { useToast } from '@/hooks/use-toast';
import { useIsClient } from '@/hooks/use-is-client';
import ConfirmationModal from '@/components/dashboard/shared/ConfirmationModal';
import { formatAddressLine } from '@/lib/format-address';

function GridInfo({ label, value }: { label: string; value: React.ReactNode }) {
    const { i18n } = useTranslation();
    const isRtl = i18n.dir() === 'rtl';
    return (
        <div className="flex items-start">
            <span
                className={`text-sm text-muted-foreground w-45 shrink-0 ${isRtl ? 'text-right ml-4' : 'text-left mr-4'}`}
            >
                {label}
            </span>
            <span
                className={`text-sm font-medium text-foreground ${isRtl ? 'text-right' : 'text-left'}`}
            >
                {value || '—'}
            </span>
        </div>
    );
}

function TenantSuperAdminProfileView() {
    const { t } = useTranslation('dashboard');
    const { user } = useAuth();

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] w-full gap-4 text-muted-foreground">
                <CircleX className="w-12 h-12 text-destructive/50" />
                <p>{t('profile.notFound', { defaultValue: 'Profile not found.' })}</p>
            </div>
        );
    }

    const displayName = getUserDisplayName(user);
    const roleLabel = getUserRoleLabel(user, t);
    const initials = getUserInitials(user);

    return (
        <div className="flex flex-col w-full bg-card rounded-xl border border-border shadow-sm min-h-150 mb-8 p-8">
            <div className="flex gap-6 items-center">
                <SecureAvatar
                    className="h-15 w-15"
                    reference={user.avatarUrl}
                    alt={displayName}
                    fallback={initials}
                    fallbackClassName="text-xl bg-primary/10 text-primary"
                />
                <div className="flex flex-col gap-2">
                    <h1 className="text-xl font-medium text-foreground m-0">{displayName}</h1>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5" />
                            <span>{roleLabel}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{user.email}</span>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        {t('profile.tenantAdminHint', {
                            defaultValue:
                                'Tenant administrator accounts are managed in Settings. Employee HR profile tabs apply to staff members only.',
                        })}
                    </p>
                </div>
            </div>
        </div>
    );
}

function MyEmployeeContent() {
    const { t, i18n } = useTranslation(['dashboard', 'employees']);
    const isRtl = i18n.dir() === 'rtl';
    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');
    const [declineConfirmOpen, setDeclineConfirmOpen] = useState(false);
    const { toast } = useToast();
    const { hasScope, isSystemAdmin } = usePermissions();
    const isClient = useIsClient();

    const canEditEmployment =
        isSystemAdmin ||
        hasScope('employees', 'update', 'all') ||
        hasScope('employees', 'update', 'company') ||
        hasScope('employees', 'update', 'department');

    const { data: employee, isLoading } = useMyEmployeeProfile();
    const { user } = useAuth();
    const avatarReference = user?.avatarUrl ?? employee?.avatarUrl ?? null;
    const hasEmployeeRecord = Boolean(employee?.id);
    const employeeId = employee?.id ?? '';
    const { data: bankAccounts = [], isLoading: bankLoading } = useMyBankAccounts({
        enabled: hasEmployeeRecord,
    });
    const {
        data: contractsResponse,
        isLoading: contractsLoading,
        isError: isContractsError,
        error: contractsError,
        refetch: refetchContracts,
    } = useMyEmployeeContracts({ limit: 20 }, { enabled: !!employeeId && activeTab === 'contract' });

    const activateContractMutation = useActivateMyEmployeeContract();
    const rejectContractMutation = useRejectMyEmployeeContract();

    const handleAcceptContract = async (contractId: string) => {
        try {
            await activateContractMutation.mutateAsync(contractId);
            toast({
                title: t('profile.contractAcceptedTitle', { defaultValue: 'Contract Accepted' }),
                description: t('profile.contractAcceptedDesc', { defaultValue: 'You have successfully accepted and signed your employment contract.' }),
            });
        } catch (error: any) {
            toast({
                title: t('common.error', { defaultValue: 'Error' }),
                description: error.message || t('profile.contractAcceptError', { defaultValue: 'Failed to accept contract. Please try again.' }),
                variant: 'destructive',
            });
        }
    };

    const handleDeclineContract = async (contractId: string) => {
        try {
            await rejectContractMutation.mutateAsync(contractId);
            setDeclineConfirmOpen(false);
            toast({
                title: t('profile.contractDeclinedTitle', { defaultValue: 'Contract Declined' }),
                description: t('profile.contractDeclinedDesc', { defaultValue: 'Your contract has been declined. Please contact HR for further assistance.' }),
            });
        } catch (error: any) {
            toast({
                title: t('common.error', { defaultValue: 'Error' }),
                description: error.message || t('profile.contractDeclineError', { defaultValue: 'Failed to decline contract. Please try again.' }),
                variant: 'destructive',
            });
        }
    };
    const { formatAmount } = useDisplayCurrency(employee?.orgUnit?.orgUnitId);
    const [tenureAnchorMs] = useState(() => Date.now());

    const durationLabel = useMemo(() => {
        const hireDate = employee?.hireDate;
        if (!hireDate) return '-';
        const ms = tenureAnchorMs - new Date(hireDate).getTime();
        const years = Math.floor(ms / (1000 * 60 * 60 * 24 * 365.25));
        const months = Math.floor(
            (ms % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44),
        );
        if (years > 0) {
            return `${years}.${Math.floor((months / 12) * 10)} years`;
        }
        if (months > 0) {
            return `${months} months`;
        }
        return '< 1 month';
    }, [employee?.hireDate, tenureAnchorMs]);

    if (!isClient || isLoading) {
        return <ProfilePageLoader />;
    }

    if (!employee) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] w-full gap-4 text-muted-foreground">
                <CircleX className="w-12 h-12 text-destructive/50" />
                <p>
                    {t('profile.employeeRecordMissing', {
                        defaultValue:
                            'Your employee record could not be loaded. Contact HR to link your account.',
                    })}
                </p>
            </div>
        );
    }

    const fullName = `${employee.firstName}${employee.middleName ? ` ${employee.middleName}` : ''} ${employee.lastName}`;
    const isActive = employee.status?.toLowerCase() === 'active';

    const formatEmploymentType = (type?: string | null) => {
        if (!type) return null;
        return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    };

    const employeeContracts = contractsResponse?.data ?? [];
    const activeContract =
        employeeContracts.find((c) => c.status === 'active') ||
        employeeContracts.find((c) => c.status === 'draft') ||
        employeeContracts[0];

    const displaySalary =
        activeContract?.salary != null
            ? formatAmount(activeContract.salary)
            : employee.salary != null
              ? formatAmount(employee.salary)
              : null;

    const homeAddressLine = formatAddressLine({
        line: employee.homeAddress,
        city: employee.homeCity,
        state: employee.homeState,
        country: employee.homeCountry,
        postalCode: employee.homePostalCode,
    });

    const workAddressLine = formatAddressLine({
        line: employee.address,
        city: employee.city,
        state: employee.state,
        country: employee.country,
        postalCode: employee.postalCode,
    });

    const tabs = [
        { id: 'personal', label: t('profile.personal_info') },
        { id: 'employment', label: t('profile.employment_details') },
        { id: 'contract', label: t('profile.contract', { defaultValue: 'Contract' }) },
        { id: 'documents', label: t('profile.document_center') },
        { id: 'banking', label: t('profile.banking_details') },
    ];

    const displayTabs = isRtl ? [...tabs].reverse() : tabs;

    const renderGridItems = (items: React.ReactNode[]) => {
        if (!isRtl) return items;
        const reversed: React.ReactNode[] = [];
        for (let i = 0; i < items.length; i += 2) {
            if (i + 1 < items.length) {
                reversed.push(items[i + 1]);
                reversed.push(items[i]);
            } else {
                reversed.push(items[i]);
            }
        }
        return reversed;
    };

    return (
        <>
            <div
                className="flex flex-col w-full bg-card rounded-xl border border-border shadow-sm min-h-150 mb-8"
                dir={isRtl ? 'rtl' : 'ltr'}
            >
                <div className="flex items-start justify-between p-8 pb-2">
                    <div className="flex gap-6 items-center">
                        <SecureAvatar
                            className="h-15 w-15"
                            reference={avatarReference}
                            alt={fullName}
                            fallback={
                                <>
                                    {employee.firstName?.[0]}
                                    {employee.lastName?.[0]}
                                </>
                            }
                            fallbackClassName="text-xl bg-primary/10 text-primary"
                        />

                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl font-medium text-foreground m-0">{fullName}</h1>
                                <div className="flex items-center gap-1.5 px-2.5 py-0.5 border border-green-500 rounded-full">
                                    <div
                                        className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}
                                    />
                                    <span className="text-xs font-medium text-green-500 capitalize">
                                        {isActive ? t('profile.active') : employee.status}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                <div className="flex items-center gap-1.5">
                                    <Briefcase className="w-3.5 h-3.5" />
                                    <span>{employee.jobTitle || t('profile.role')}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>
                                        {t('profile.joined')}{' '}
                                        {employee.hireDate
                                            ? format(new Date(employee.hireDate), 'MMM yyyy')
                                            : '—'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                        <Button
                            type="button"
                            onClick={() => setIsEditSheetOpen(true)}
                            className="bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-4 shadow-sm h-9"
                        >
                            <PencilLine className="w-4 h-4 mr-2" />
                            {t('profile.edit_info')}
                        </Button>
                        <span className="text-xs text-muted-foreground mt-2">
                            {t('profile.employment_duration')}:{' '}
                            <span className="font-semibold text-foreground">{durationLabel}</span>
                        </span>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="px-8">
                        <TabsList
                            variant="line"
                            className="h-8 p-0 gap-2 justify-start w-full border-b border-border"
                        >
                            {displayTabs.map((tab) => (
                                <TabsTrigger
                                    key={tab.id}
                                    value={tab.id}
                                    className="flex-none h-8 px-4 pb-2 text-sm font-normal text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:font-medium after:bg-primary after:-bottom-px after:h-0.5 after:z-10"
                                >
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    <div className="p-8">
                        <TabsContent value="personal" className="mt-0 outline-none">
                            <div className="flex flex-col gap-10 max-w-5xl">
                                <div className="flex flex-col gap-6">
                                    <h3 className="font-medium text-base text-foreground">
                                        {t('profile.personal_info')}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                                        {renderGridItems([
                                            <GridInfo
                                                key="fn"
                                                label={t('profile.first_name')}
                                                value={employee.firstName}
                                            />,
                                            <GridInfo
                                                key="ln"
                                                label={t('profile.last_name')}
                                                value={employee.lastName}
                                            />,
                                            <GridInfo
                                                key="role"
                                                label={t('profile.role')}
                                                value={employee.jobTitle}
                                            />,
                                            <GridInfo
                                                key="co"
                                                label={t('profile.country_of_origin')}
                                                value={employee.nationality}
                                            />,
                                            <GridInfo
                                                key="cr"
                                                label={t('profile.country_of_residence')}
                                                value={employee.country}
                                            />,
                                        ])}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-6">
                                    <h3 className="font-medium text-base text-foreground">
                                        {t('profile.contact_info')}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                                        {renderGridItems([
                                            <GridInfo
                                                key="pe"
                                                label={t('profile.personal_email')}
                                                value={employee.personalEmail}
                                            />,
                                            <GridInfo
                                                key="ce"
                                                label={t('profile.company_email')}
                                                value={employee.businessEmail || employee.email}
                                            />,
                                            <GridInfo
                                                key="pn"
                                                label={t('profile.phone_number')}
                                                value={employee.phoneNumber}
                                            />,
                                            <GridInfo
                                                key="ecn"
                                                label={t('employees:contactName', {
                                                    defaultValue: 'Emergency contact name',
                                                })}
                                                value={employee.emergencyContactName}
                                            />,
                                            <GridInfo
                                                key="ecp"
                                                label={t('employees:contactPhone', {
                                                    defaultValue: 'Emergency contact phone',
                                                })}
                                                value={employee.emergencyContactPhone}
                                            />,
                                            <GridInfo
                                                key="ecr"
                                                label={t('employees:relationship', {
                                                    defaultValue: 'Relationship',
                                                })}
                                                value={employee.emergencyContactRelationship}
                                            />,
                                        ])}
                                    </div>
                                </div>

                                {workAddressLine && (
                                    <div className="flex flex-col gap-4">
                                        <span className="text-sm text-muted-foreground">
                                            {t('employees:workAddress', {
                                                defaultValue: 'Work address',
                                            })}
                                        </span>
                                        <div className="p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground border border-border/50">
                                            {workAddressLine}
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col gap-4">
                                    <span className="text-sm text-muted-foreground">
                                        {t('profile.home_address')}
                                    </span>
                                    <div className="p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground border border-border/50">
                                        {homeAddressLine || '—'}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="employment" className="mt-0 outline-none">
                            <div className="flex flex-col gap-8 max-w-5xl">
                                <div className="flex flex-col gap-6">
                                    <h3 className="font-medium text-base text-foreground">
                                        {t('profile.employment_details')}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                                        {renderGridItems([
                                            <GridInfo
                                                key="dept"
                                                label={t('employees:department', {
                                                    defaultValue: 'Department',
                                                })}
                                                value={
                                                    employee.orgUnit?.orgUnitName ||
                                                    employee.departmentId
                                                }
                                            />,
                                            <GridInfo
                                                key="jc"
                                                label={t('profile.job_classification')}
                                                value={formatEmploymentType(employee.employmentType)}
                                            />,
                                            <GridInfo
                                                key="jo"
                                                label={t('profile.joined_on')}
                                                value={
                                                    employee.hireDate
                                                        ? format(
                                                              new Date(employee.hireDate),
                                                              'MMM dd, yyyy',
                                                          )
                                                        : null
                                                }
                                            />,
                                            <GridInfo
                                                key="ed"
                                                label={t('profile.employment_duration')}
                                                value={durationLabel}
                                            />,
                                            <GridInfo
                                                key="status"
                                                label={t('profile.status')}
                                                value={employee.status}
                                            />,
                                            <GridInfo
                                                key="eno"
                                                label={t('employees:employeeNumber', {
                                                    defaultValue: 'Employee ID',
                                                })}
                                                value={employee.employeeNumber}
                                            />,
                                        ])}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="contract" className="mt-0 outline-none">
                            <div className="flex flex-col gap-6 max-w-5xl">
                                <h3 className="font-medium text-base text-foreground">
                                    {t('profile.contract', { defaultValue: 'Contract' })}
                                </h3>
                                {contractsLoading ? (
                                    <div className="flex items-center py-8">
                                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                    </div>
                                ) : isContractsError ? (
                                    <div className="flex flex-col gap-3 py-4">
                                        <p className="text-sm text-destructive">
                                            {(contractsError as Error)?.message ||
                                                t('profile.contractLoadError', {
                                                    defaultValue: 'Could not load contract.',
                                                })}
                                        </p>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => refetchContracts()}
                                        >
                                            {t('profile.tryAgain', { defaultValue: 'Try again' })}
                                        </Button>
                                    </div>
                                ) : !activeContract ? (
                                    <p className="text-sm text-muted-foreground">
                                        {t('employees:noContractAssigned', {
                                            defaultValue: 'No contract assigned yet.',
                                        })}
                                    </p>
                                ) : (
                                    <>
                                        {activeContract.status === ContractStatus.draft && (
                                            <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-300/60 bg-amber-50/60 dark:bg-amber-900/10 dark:border-amber-700/40">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 shrink-0 mt-0.5">
                                                    <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                                                        {t('profile.contractPendingTitle', { defaultValue: 'Contract awaiting your signature' })}
                                                    </p>
                                                    <p className="text-xs text-amber-700/80 dark:text-amber-400/70 mt-0.5">
                                                        {t('profile.contractPendingDesc', { defaultValue: 'Please review your employment contract details below and accept or decline.' })}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                                            {renderGridItems([
                                                <GridInfo
                                                    key="cn"
                                                    label={t('employees:contract', {
                                                        defaultValue: 'Contract',
                                                    })}
                                                    value={
                                                        activeContract.contract?.contractName ||
                                                        null
                                                    }
                                                />,
                                                <GridInfo
                                                    key="sal"
                                                    label={t('employees:salary', {
                                                        defaultValue: 'Salary',
                                                    })}
                                                    value={displaySalary}
                                                />,
                                                <GridInfo
                                                    key="et"
                                                    label={t('employees:employmentType', {
                                                        defaultValue: 'Employment type',
                                                    })}
                                                    value={formatEmploymentType(
                                                        activeContract.employmentType ||
                                                            employee.employmentType,
                                                    )}
                                                />,
                                                <GridInfo
                                                    key="jt"
                                                    label={t('employees:jobTitle', {
                                                        defaultValue: 'Job title',
                                                    })}
                                                    value={
                                                        activeContract.jobTitle || employee.jobTitle
                                                    }
                                                />,
                                                activeContract.effectiveDate ? (
                                                    <GridInfo
                                                        key="eff"
                                                        label={t('employees:effectiveDate', {
                                                            defaultValue: 'Effective date',
                                                        })}
                                                        value={format(
                                                            new Date(activeContract.effectiveDate),
                                                            'MMM dd, yyyy',
                                                        )}
                                                    />
                                                ) : null,
                                                activeContract.signedDate ? (
                                                    <GridInfo
                                                        key="signed"
                                                        label={t('employees:signedDate', {
                                                            defaultValue: 'Signed date',
                                                        })}
                                                        value={format(
                                                            new Date(activeContract.signedDate),
                                                            'MMM dd, yyyy',
                                                        )}
                                                    />
                                                ) : null,
                                            ].filter(Boolean))}
                                        </div>

                                        {activeContract.contract?.documentUrl && (
                                            <ContractDocumentPreviewButton
                                                documentReference={activeContract.contract.documentUrl}
                                                documentName={
                                                    activeContract.contract.contractName ||
                                                    t('profile.contractDocument', {
                                                        defaultValue: 'Contract document',
                                                    })
                                                }
                                            />
                                        )}

                                        {activeContract.status === ContractStatus.draft && (
                                            <div className="flex items-center gap-3 pt-2 border-t border-border/40">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="gap-2 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-700 dark:text-red-400"
                                                    onClick={() => setDeclineConfirmOpen(true)}
                                                    disabled={activateContractMutation.isPending || rejectContractMutation.isPending}
                                                >
                                                    {rejectContractMutation.isPending ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <XCircle className="w-4 h-4" />
                                                    )}
                                                    {t('profile.declineContract', { defaultValue: 'Decline' })}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    className="gap-2"
                                                    onClick={() => handleAcceptContract(activeContract.id)}
                                                    disabled={activateContractMutation.isPending || rejectContractMutation.isPending}
                                                >
                                                    {activateContractMutation.isPending ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    )}
                                                    {t('profile.acceptContract', { defaultValue: 'Accept & Sign' })}
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            <ConfirmationModal
                                open={declineConfirmOpen}
                                onOpenChange={setDeclineConfirmOpen}
                                title={t('profile.declineContractTitle', { defaultValue: 'Decline contract?' })}
                                message={t('profile.declineContractMessage', { defaultValue: 'Are you sure you want to decline this contract? Your HR team will be notified. This action cannot be undone.' })}
                                confirmLabel={t('profile.declineContract', { defaultValue: 'Decline' })}
                                onConfirm={() => activeContract && handleDeclineContract(activeContract.id)}
                                isLoading={rejectContractMutation.isPending}
                            />
                        </TabsContent>

                        <TabsContent value="documents" className="mt-0 outline-none">
                            <div className="flex flex-col gap-6 max-w-5xl">
                                <h3 className="font-medium text-base text-foreground">
                                    {t('profile.documents')}
                                </h3>
                                <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                                    {renderGridItems([
                                        <GridInfo
                                            key="passport"
                                            label={t('employees:passportNumber', {
                                                defaultValue: 'Passport number',
                                            })}
                                            value={employee.passportNumber}
                                        />,
                                        <GridInfo
                                            key="passportExp"
                                            label={t('employees:passportExpiry', {
                                                defaultValue: 'Passport expiry',
                                            })}
                                            value={
                                                employee.passportExpiry
                                                    ? format(
                                                          new Date(employee.passportExpiry),
                                                          'dd/MM/yyyy',
                                                      )
                                                    : null
                                            }
                                        />,
                                        <GridInfo
                                            key="visa"
                                            label={t('employees:visaNumber', {
                                                defaultValue: 'Visa number',
                                            })}
                                            value={employee.visaNumber}
                                        />,
                                        <GridInfo
                                            key="visaExp"
                                            label={t('employees:visaExpiry', {
                                                defaultValue: 'Visa expiry',
                                            })}
                                            value={
                                                employee.visaExpiry
                                                    ? format(
                                                          new Date(employee.visaExpiry),
                                                          'dd/MM/yyyy',
                                                      )
                                                    : null
                                            }
                                        />,
                                        <GridInfo
                                            key="wp"
                                            label={t('employees:workPermitNumber', {
                                                defaultValue: 'Work permit number',
                                            })}
                                            value={employee.workPermitNumber}
                                        />,
                                        <GridInfo
                                            key="wpExp"
                                            label={t('employees:workPermitExpiry', {
                                                defaultValue: 'Work permit expiry',
                                            })}
                                            value={
                                                employee.workPermitExpiry
                                                    ? format(
                                                          new Date(employee.workPermitExpiry),
                                                          'dd/MM/yyyy',
                                                      )
                                                    : null
                                            }
                                        />,
                                    ])}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="banking" className="mt-0 outline-none">
                            <div className="flex flex-col gap-8 w-full max-w-5xl">
                                <h3 className="font-medium text-base text-foreground">
                                    {t('profile.bank_details')}
                                </h3>

                                {bankLoading ? (
                                    <div className="flex items-center py-8">
                                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                    </div>
                                ) : bankAccounts.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        {t('profile.noBankAccounts', {
                                            defaultValue:
                                                'No bank accounts on file. Open Edit info and use the Banking tab to add one.',
                                        })}
                                    </p>
                                ) : (
                                    bankAccounts.map((account) => (
                                        <div
                                            key={account.id}
                                            className="grid grid-cols-2 gap-y-6 gap-x-12 border-b border-border pb-8 last:border-0 last:pb-0"
                                        >
                                            {renderGridItems([
                                                <GridInfo
                                                    key={`${account.id}-bn`}
                                                    label={t('profile.bank_name')}
                                                    value={account.bankName}
                                                />,
                                                <GridInfo
                                                    key={`${account.id}-br`}
                                                    label={t('profile.branch')}
                                                    value={account.branchName}
                                                />,
                                                <GridInfo
                                                    key={`${account.id}-noa`}
                                                    label={t('profile.name_on_account')}
                                                    value={account.accountName}
                                                />,
                                                <GridInfo
                                                    key={`${account.id}-an`}
                                                    label={t('profile.account_number')}
                                                    value={account.accountNumber}
                                                />,
                                                account.swiftCode ? (
                                                    <GridInfo
                                                        key={`${account.id}-sc`}
                                                        label={t('profile.swift_bic_code')}
                                                        value={account.swiftCode}
                                                    />
                                                ) : null,
                                                account.iban ? (
                                                    <GridInfo
                                                        key={`${account.id}-iban`}
                                                        label={t('employees:iban', {
                                                            defaultValue: 'IBAN',
                                                        })}
                                                        value={account.iban}
                                                    />
                                                ) : null,
                                            ].filter(Boolean))}
                                        </div>
                                    ))
                                )}
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>

            <EditEmployeeSheet
                open={isEditSheetOpen}
                onOpenChange={setIsEditSheetOpen}
                employee={employee}
                canEditEmployment={canEditEmployment && hasEmployeeRecord}
            />
        </>
    );
}

export default function MyEmployeeView() {
    const { isTenantSuperAdmin } = usePermissions();

    if (isTenantSuperAdmin) {
        return <TenantSuperAdminProfileView />;
    }

    return <MyEmployeeContent />;
}
