'use client';

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    useMyEmployeeContracts,
    useActivateMyEmployeeContract,
} from '@/features/contracts/hooks/useEmployeeContracts';
import { ContractStatus } from '@/features/contracts/contracts.types';
import { EMPLOYEE_DECLINED_TERMINATION_REASON } from '@/features/contracts/employee-contract.constants';
import type { EmployeeContract } from '@/features/contracts/employee-contract.types';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/features/auth/hooks/useAuth';
import { persistStaffOnboardingStep } from '@/lib/onboarding/persist-staff-onboarding-step';
import { writeStaffOnboardingStepSession } from '@/lib/onboarding/staff-onboarding-step-storage';
import { AUTH_PROFILE_QUERY_KEY } from '@/features/auth/auth-session.constants';
import { writeAuthSessionCache } from '@/features/auth/auth-session-cache.util';
import { useQueryClient } from '@tanstack/react-query';
import { getUserRoleLabel } from '@/features/auth/utils/user-display.util';
import { useMyEmployeeProfile } from '@/features/employee/hooks/useEmployee';
import { useMySalaryStructure } from '@/features/payroll/salary-structure/hooks/useSalaryStructure';
import { useDisplayCurrency } from '@/features/settings/hooks/useDisplayCurrency';
import { FileText, Loader2, AlertCircle, XCircle } from 'lucide-react';
import { ContractDocumentPreviewButton } from '@/components/dashboard/contracts/ContractDocumentPreviewButton';
import { Skeleton } from '../ui/skeleton';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { STAFF_ONBOARDING_PROFILE_FIRST_STEP } from '@/lib/onboarding/staff-steps';

interface StaffContractReviewStepProps {
    onAccept: () => void;
}

type ContractReviewMode = 'pending' | 'declined' | 'active' | 'none';

function resolveContractReviewState(assignments: EmployeeContract[]): {
    contract: EmployeeContract | null;
    mode: ContractReviewMode;
} {
    const draft = assignments.find((assignment) => assignment.status === ContractStatus.draft);
    if (draft) {
        return { contract: draft, mode: 'pending' };
    }

    const declined = assignments.find(
        (assignment) =>
            assignment.status === ContractStatus.terminated &&
            assignment.terminationReason === EMPLOYEE_DECLINED_TERMINATION_REASON,
    );
    if (declined) {
        return { contract: declined, mode: 'declined' };
    }

    const active = assignments.find((assignment) => assignment.status === ContractStatus.active);
    if (active) {
        return { contract: active, mode: 'active' };
    }

    return { contract: null, mode: 'none' };
}

export function StaffContractReviewStep({ onAccept }: StaffContractReviewStepProps) {
    const { t } = useTranslation(['staffSignup', 'common']);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const {
        data: contractsResponse,
        isLoading: isLoadingContracts,
        isError: isContractsError,
        error: contractsError,
        refetch: refetchContracts,
    } = useMyEmployeeContracts({ limit: 20 });

    const [hasAgreed, setHasAgreed] = useState(false);
    const activateContractMutation = useActivateMyEmployeeContract();
    const { data: authProfile } = useProfile();
    const {
        data: employeeProfile,
        isLoading: isLoadingProfile,
    } = useMyEmployeeProfile();
    const tenantCompanyId = authProfile?.companyId ?? employeeProfile?.companyOuId ?? undefined;
    const { data: mySalaryStructure, isLoading: isLoadingSalaryStructure } = useMySalaryStructure();
    const { formatAmount } = useDisplayCurrency(tenantCompanyId);

    const { contract: employeeContract, mode: reviewMode } = useMemo(
        () => resolveContractReviewState(contractsResponse?.data ?? []),
        [contractsResponse?.data],
    );

    const isPendingSignature = reviewMode === 'pending';
    const isDeclined = reviewMode === 'declined';
    const contractTemplate = employeeContract?.contract;

    const contractDocuments = useMemo(() => {
        const documentUrl = contractTemplate?.documentUrl?.trim();
        if (!documentUrl) {
            return [];
        }

        return [
            {
                name:
                    contractTemplate?.contractName ||
                    t('staffSignup:contractDocument', { defaultValue: 'Employment contract' }),
                url: documentUrl,
            },
        ];
    }, [contractTemplate?.contractName, contractTemplate?.documentUrl, t]);

    const continueToProfileSetup = async () => {
        if (authProfile?.id) {
            const result = await persistStaffOnboardingStep(
                authProfile.id,
                STAFF_ONBOARDING_PROFILE_FIRST_STEP,
            );
            if (result.user) {
                queryClient.setQueryData(AUTH_PROFILE_QUERY_KEY, result.user);
                writeAuthSessionCache(result.user);
            } else {
                writeStaffOnboardingStepSession(
                    authProfile.id,
                    STAFF_ONBOARDING_PROFILE_FIRST_STEP,
                );
            }
        }
        onAccept();
    };

    const handleAccept = async () => {
        if (!employeeContract?.id) {
            return;
        }
        try {
            if (isPendingSignature) {
                await activateContractMutation.mutateAsync(employeeContract.id);
            }
            toast({
                title: t('staffSignup:contractAcceptedTitle', { defaultValue: 'Contract Accepted!' }),
                description: t('staffSignup:contractAcceptedDesc', { defaultValue: 'Your employment contract has been signed and activated successfully.' }),
            });
            await continueToProfileSetup();
        } catch (error: any) {
            console.error('Failed to activate contract:', error);
            toast({
                title: t('staffSignup:contractAcceptErrorTitle', { defaultValue: 'Failed to accept contract' }),
                description: error.message || t('staffSignup:contractAcceptErrorDesc', { defaultValue: 'Something went wrong. Please try again.' }),
                variant: 'destructive',
            });
        }
    };

    const displaySalary =
        employeeContract?.salary ??
        employeeProfile?.salary ??
        mySalaryStructure?.baseSalary ??
        null;

    const displayRole = getUserRoleLabel(authProfile, t);

    const isLoading = isLoadingContracts || isLoadingProfile || isLoadingSalaryStructure;

    const formatCurrency = (value: number | null | undefined) => {
        if (value === undefined || value === null) return '—';
        return formatAmount(value, { maximumFractionDigits: 0 });
    };

    const formatEmploymentType = (type: string | null | undefined) => {
        if (!type) return '—';
        return type.split('_').map((word, index) => {
            if (index === 0) return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            return word.toLowerCase();
        }).join('-');
    };

    if (isLoading) {
        return (
            <div className="w-full max-w-3xl flex flex-col gap-3">
                <Card className="flex w-full flex-col overflow-hidden rounded-[12px] border border-border bg-card p-0 shadow-sm">
                    <CardHeader className="flex flex-col gap-2 p-6 pb-0">
                        <Skeleton className="h-5 w-48 bg-muted rounded" />
                        <Skeleton className="h-4 w-96 max-w-full bg-muted rounded mt-1" />
                    </CardHeader>

                    <CardContent className="flex flex-col p-6 gap-8">
                        <div className="flex flex-col gap-4">
                            <Skeleton className="h-4 w-32 bg-muted rounded" />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`flex flex-col justify-between p-4 gap-2 bg-muted/20 border border-border/40 rounded-lg ${i === 4 ? 'md:col-span-2' : ''}`}
                                    >
                                        <Skeleton className="h-3 w-16 bg-muted rounded" />
                                        <Skeleton className="h-4 w-32 bg-muted rounded" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <Skeleton className="h-4 w-36 bg-muted rounded" />
                            <div className="flex items-center justify-between p-4 border border-border/60 bg-muted/10 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="size-9 rounded-lg bg-muted" />
                                    <Skeleton className="h-4 w-40 bg-muted rounded" />
                                </div>
                                <Skeleton className="h-8 w-16 bg-muted rounded" />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-4 border-t border-border/60 pt-6 mt-2">
                            <Skeleton className="h-10 w-24 bg-muted rounded-lg" />
                            <Skeleton className="h-10 w-32 bg-muted rounded-lg" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isContractsError) {
        return (
            <div className="flex w-full max-w-2xl flex-col items-center gap-6 rounded-[12px] border border-border bg-card p-6 text-center shadow-sm sm:p-8">
                <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-red-500/10">
                    <XCircle className="size-6 text-red-500" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-foreground">
                        {t('staffSignup:contractLoadErrorTitle', { defaultValue: 'Could not load contract' })}
                    </h2>
                    <p className="text-muted-foreground text-[15px] leading-relaxed max-w-md">
                        {(contractsError as Error)?.message ||
                            t('staffSignup:contractLoadErrorDesc', {
                                defaultValue: 'We could not load your assigned contract. Please try again.',
                            })}
                    </p>
                </div>
                <Button onClick={() => refetchContracts()} className="mt-2">
                    {t('staffSignup:checkAgain', { defaultValue: 'Check Again' })}
                </Button>
            </div>
        );
    }

    if (isDeclined) {
        return (
            <div className="flex w-full max-w-2xl flex-col items-center gap-6 rounded-[12px] border border-border bg-card p-6 text-center shadow-sm sm:p-8">
                <div className="flex items-center justify-center size-12 rounded-full bg-red-500/10 mb-2">
                    <XCircle className="size-6 text-red-500" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-foreground">
                        {t('staffSignup:contractDeclinedTitle', { defaultValue: 'Contract Declined' })}
                    </h2>
                    <p className="text-muted-foreground text-[15px] leading-relaxed max-w-md">
                        {t('staffSignup:contractDeclinedContinueDesc', {
                            defaultValue:
                                'Your contract has been marked as declined. You can continue setting up your profile.',
                        })}
                    </p>
                </div>
                <Button onClick={() => void continueToProfileSetup()} className="mt-2">
                    {t('staffSignup:continueButton', { defaultValue: 'Continue' })}
                </Button>
            </div>
        );
    }

    if (!employeeContract) {
        return (
            <div className="flex w-full max-w-2xl flex-col items-center gap-6 rounded-[12px] border border-border bg-card p-6 text-center shadow-sm sm:p-8">
                <div className="flex items-center justify-center size-12 rounded-full bg-amber-500/10 mb-2">
                    <AlertCircle className="size-6 text-amber-500" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-foreground">
                        {t('staffSignup:noContractTitle', { defaultValue: 'No Pending Contract' })}
                    </h2>
                    <p className="text-muted-foreground text-[15px] leading-relaxed max-w-md">
                        {t('staffSignup:noContractDesc', { defaultValue: 'There is no pending contract assigned to your profile at the moment. Please ask your HR manager to assign a contract.' })}
                    </p>
                </div>
                <Button onClick={() => refetchContracts()} className="mt-2">
                    {t('staffSignup:checkAgain', { defaultValue: 'Check Again' })}
                </Button>
            </div>
        );
    }

    return (
        <div className="flex w-full max-w-3xl flex-col gap-3">
            <Card className="flex w-full flex-col overflow-hidden rounded-[12px] border border-border bg-card p-0 shadow-sm">
                <CardHeader className="flex flex-col gap-2 p-4 pb-0 sm:p-6">
                    <CardTitle className="text-xl font-semibold leading-5 text-foreground">
                        {t('staffSignup:reviewContractTitle', { defaultValue: 'Review your employment contract' })}
                    </CardTitle>
                    <CardDescription className="m-0 text-sm leading-5 text-muted-foreground">
                        {t('staffSignup:reviewContractSubtitle', {
                            defaultValue:
                                'Review your assigned contract details and documents before continuing.',
                        })}
                    </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col gap-6 p-4 sm:gap-8 sm:p-6">
                    <div className="flex flex-col gap-4">
                        <h3 className="text-sm font-medium text-foreground">
                            {t('staffSignup:contractInformation', { defaultValue: 'Contract information' })}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex flex-col justify-between p-4 gap-2 bg-muted/30 hover:bg-muted/50 border border-border/60 rounded-lg transition-colors">
                                <span className="text-xs font-normal text-muted-foreground">
                                    {t('staffSignup:contractLabel', { defaultValue: 'Contract' })}
                                </span>
                                <span className="text-sm font-medium text-foreground">
                                    {contractTemplate?.contractName || t('staffSignup:standardContract', { defaultValue: 'Full-time permanent' })}
                                </span>
                            </div>

                            <div className="flex flex-col justify-between p-4 gap-2 bg-muted/30 hover:bg-muted/50 border border-border/60 rounded-lg transition-colors">
                                <span className="text-xs font-normal text-muted-foreground">
                                    {t('staffSignup:roleLabel', { defaultValue: 'Role' })}
                                </span>
                                <span className="text-sm font-medium text-foreground">
                                    {displayRole}
                                </span>
                            </div>

                            <div className="flex flex-col justify-between p-4 gap-2 bg-muted/30 hover:bg-muted/50 border border-border/60 rounded-lg transition-colors">
                                <span className="text-xs font-normal text-muted-foreground">
                                    {t('staffSignup:salaryLabel', { defaultValue: 'Salary' })}
                                </span>
                                <span className="text-sm font-semibold text-foreground">
                                    {formatCurrency(displaySalary)}
                                </span>
                                {displaySalary == null && !isLoading ? (
                                    <span className="text-xs text-muted-foreground">
                                        {t('staffSignup:salaryPendingPayroll', {
                                            defaultValue:
                                                'Salary has not been assigned yet. Please contact HR to confirm your compensation details.',
                                        })}
                                    </span>
                                ) : null}
                            </div>

                            <div className="flex flex-col justify-between p-4 gap-2 bg-muted/30 hover:bg-muted/50 border border-border/60 rounded-lg transition-colors">
                                <span className="text-xs font-normal text-muted-foreground">
                                    {t('staffSignup:employmentTypeLabel', { defaultValue: 'Employment type' })}
                                </span>
                                <span className="text-sm font-medium text-foreground">
                                    {formatEmploymentType(employeeContract.employmentType)}
                                </span>
                            </div>

                            <div className="flex flex-col justify-between p-4 gap-2 bg-muted/30 hover:bg-muted/50 border border-border/60 rounded-lg transition-colors md:col-span-2">
                                <span className="text-xs font-normal text-muted-foreground">
                                    {t('staffSignup:jobTitleLabel', { defaultValue: 'Job title' })}
                                </span>
                                <span className="text-sm font-medium text-foreground">
                                    {employeeContract.jobTitle || '—'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {contractDocuments.length > 0 ? (
                    <div className="flex flex-col gap-4">
                        <h3 className="text-sm font-medium text-foreground">
                            {t('staffSignup:contractDocuments', { defaultValue: 'Contract documents' })}
                        </h3>

                        <div className="grid grid-cols-1 gap-4">
                            {contractDocuments.map((document) => (
                            <div
                                key={document.url}
                                className="flex flex-col gap-3 rounded-lg border border-border/80 bg-card p-4 shadow-sm transition-all hover:border-primary/40 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center size-9 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
                                        <FileText className="size-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-foreground line-clamp-1">
                                            {document.name}
                                        </span>
                                    </div>
                                </div>
                                <ContractDocumentPreviewButton
                                    documentReference={document.url}
                                    documentName={document.name}
                                    variant="button"
                                    previewLabel={t('staffSignup:previewDocument', { defaultValue: 'Preview' })}
                                />
                            </div>
                            ))}
                        </div>
                    </div>
                    ) : null}

                    {isPendingSignature ? (
                        <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 p-4">
                            <Checkbox
                                id="contract-agreement"
                                checked={hasAgreed}
                                onCheckedChange={(checked) => setHasAgreed(checked === true)}
                            />
                            <Label
                                htmlFor="contract-agreement"
                                className="cursor-pointer text-sm leading-5 text-foreground"
                            >
                                {t('staffSignup:contractAgreementLabel', {
                                    defaultValue:
                                        'I have read and understood the employment contract and employee agreement, and I agree to its terms and conditions.',
                                })}
                            </Label>
                        </div>
                    ) : null}

                    <div className="mt-2 border-t border-border/60 pt-6">
                        <Button
                            onClick={handleAccept}
                            className="h-9 w-full sm:ml-auto sm:w-auto sm:min-w-32"
                            disabled={
                                activateContractMutation.isPending ||
                                (isPendingSignature && !hasAgreed)
                            }
                        >
                            {activateContractMutation.isPending ? (
                                <Loader2 className="mr-2 size-4 animate-spin" />
                            ) : null}
                            {isPendingSignature
                                ? t('staffSignup:acceptButton', { defaultValue: 'Accept' })
                                : t('staffSignup:continueButton', { defaultValue: 'Continue' })}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
