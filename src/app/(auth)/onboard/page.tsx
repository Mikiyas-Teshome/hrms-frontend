'use client';

import { useState, Suspense, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { PublicHeader } from '@/components/common/public-header';
import { ManagerSignupBanner } from '@/components/staff-signup/staff-signup-banner';
import { StaffSignupCompanyInfo } from '@/components/staff-signup/staff-signup-company-info';
import { ManagerSignupForm } from '@/components/staff-signup/staff-signup-form';
import { StaffSignupSuccess } from '@/components/staff-signup/staff-signup-success';
import { StaffOnboardingForm } from '@/components/staff-signup/staff-onboarding-form';
import { StaffContractReviewStep } from '@/components/staff-signup/staff-contract-review-step';
import { useInvitationOnboardContext } from '@/features/auth/hooks/useInvitationOnboardContext';
import { useAuth } from '@/contexts/AuthContext';
import { useMyEmployeeContracts } from '@/features/contracts/hooks/useEmployeeContracts';
import { requiresStaffOnboarding, requiresTenantOnboarding } from '@/lib/onboarding/navigation';
import { hasPendingStaffContract } from '@/lib/onboarding/staff-contract-onboarding';
import { persistStaffOnboardingStep } from '@/lib/onboarding/persist-staff-onboarding-step';
import { resolveStaffOnboardingStep } from '@/lib/onboarding/staff-onboarding-step-storage';
import { AUTH_PROFILE_QUERY_KEY } from '@/features/auth/auth-session.constants';
import { writeAuthSessionCache } from '@/features/auth/auth-session-cache.util';
import {
    resolveStaffOnboardPhase,
    STAFF_ONBOARDING_CONTRACT_STEP,
    STAFF_ONBOARDING_PROFILE_FIRST_STEP,
    type StaffOnboardPhase,
} from '@/lib/onboarding/staff-steps';

function StaffSignupContent() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const { user, isAuthenticated, isInitializing, isProfileSettling } = useAuth();
    const [stepOverride, setStepOverride] = useState<StaffOnboardPhase | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const token = searchParams.get('token') || '';
    const email = searchParams.get('email') || '';
    const tenantId = searchParams.get('tenantId') || '';

    const { data: onboardContext } = useInvitationOnboardContext(token, tenantId || undefined);
    const companyName = onboardContext?.companyName;
    const companyEmail = onboardContext?.companyEmail;

    const staffOnboardingActive = Boolean(
        isAuthenticated && user && requiresStaffOnboarding(user),
    );

    const { data: contractsResponse, isLoading: isLoadingContracts } = useMyEmployeeContracts(
        { limit: 20 },
        { enabled: staffOnboardingActive },
    );

    const hasPendingContract = useMemo(
        () => hasPendingStaffContract(contractsResponse?.data ?? []),
        [contractsResponse?.data],
    );

    const profilePhase = useMemo(() => {
        if (!staffOnboardingActive || !user) {
            return null;
        }
        if (isLoadingContracts) {
            return null;
        }
        const step = resolveStaffOnboardingStep(user.id, user.onboardingStep);
        return resolveStaffOnboardPhase(step, hasPendingContract);
    }, [staffOnboardingActive, user, isLoadingContracts, hasPendingContract]);

    useEffect(() => {
        if (!user || isLoadingContracts || hasPendingContract) {
            return;
        }

        const resolvedStep = resolveStaffOnboardingStep(user.id, user.onboardingStep);
        if (resolvedStep !== STAFF_ONBOARDING_CONTRACT_STEP) {
            return;
        }

        void persistStaffOnboardingStep(user.id, STAFF_ONBOARDING_PROFILE_FIRST_STEP).then((result) => {
            if (result.user) {
                queryClient.setQueryData(AUTH_PROFILE_QUERY_KEY, result.user);
                writeAuthSessionCache(result.user);
            }
        });
    }, [user, isLoadingContracts, hasPendingContract, queryClient]);

    const currentStep: StaffOnboardPhase = stepOverride ?? profilePhase ?? 'signup';

    useEffect(() => {
        if (isInitializing || isProfileSettling || !user) {
            return;
        }

        if (requiresStaffOnboarding(user)) {
            return;
        }

        if (requiresTenantOnboarding(user)) {
            router.replace('/onboarding');
            return;
        }

        if (user.onboardingComplete) {
            router.replace('/dashboard');
        }
    }, [isInitializing, isProfileSettling, user, router]);

    if (
        (isInitializing || isProfileSettling || (staffOnboardingActive && isLoadingContracts)) &&
        isAuthenticated
    ) {
        return (
            <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
                Loading…
            </div>
        );
    }

    if (showSuccess) {
        return (
            <div className="flex min-h-screen w-full flex-col bg-muted/30">
                <PublicHeader showLanguage={true} />
                <div className="flex flex-1 items-center justify-center p-4 md:p-12">
                    <StaffSignupSuccess />
                </div>
            </div>
        );
    }

    if (currentStep === 'contract-review') {
        return (
            <div className="flex min-h-screen w-full flex-col bg-muted/30">
                <PublicHeader showLanguage={true} />
                <div className="flex flex-1 items-start justify-center px-4 py-6 sm:items-center sm:px-6 sm:py-10 md:p-12">
                    <StaffContractReviewStep
                        onAccept={() => {
                            setStepOverride('onboarding');
                        }}
                    />
                </div>
            </div>
        );
    }

    if (currentStep === 'onboarding') {
        return (
            <div className="flex min-h-screen w-full flex-col bg-muted/30">
                <PublicHeader showLanguage={true} />
                <div className="flex flex-1 items-start justify-center px-4 py-6 sm:items-center sm:px-6 sm:py-10 md:p-12">
                    <StaffOnboardingForm onFinish={() => setShowSuccess(true)} />
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/30">
            <PublicHeader showLanguage={true} />
            <div className="flex flex-1 items-center justify-center px-4 py-6 sm:px-6 sm:py-10 md:p-12">
                <div className="flex w-full max-w-6xl flex-col overflow-hidden rounded-[12px] border border-border bg-card shadow-[0px_32px_64px_-12px_rgba(0,0,0,0.14)] lg:min-h-160 lg:flex-row">
                    <div className="hidden w-full p-3 lg:flex lg:w-1/2">
                        <ManagerSignupBanner
                            companyName={companyName}
                            companyEmail={companyEmail}
                        />
                    </div>

                    <div className="flex w-full flex-col justify-center p-4 sm:p-6 lg:w-1/2 lg:p-8">
                        <div className="mb-6 w-full lg:hidden">
                            <StaffSignupCompanyInfo
                                companyName={companyName}
                                companyEmail={companyEmail}
                            />
                        </div>

                        <ManagerSignupForm
                            onSignupSuccess={() => setStepOverride('contract-review')}
                            onSuccess={() => setShowSuccess(true)}
                            token={token}
                            email={email}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function StaffSignupPage() {
    const { t } = useTranslation('staffSignup');

    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
                    {t('loading', { defaultValue: 'Loading…' })}
                </div>
            }
        >
            <StaffSignupContent />
        </Suspense>
    );
}
