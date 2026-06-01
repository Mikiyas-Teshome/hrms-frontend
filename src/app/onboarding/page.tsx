'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StepIndicator } from '@/components/onboarding/shared/step-indicator';
import { OnboardingHeader } from '@/components/onboarding/shared/onboarding-header';
import { OnboardingPageSkeleton } from '@/components/onboarding/shared/onboarding-page-skeleton';
import { PublicHeader } from '@/components/common/public-header';
import { OrganizationProfileForm } from '@/components/onboarding/organization/organization-profile-form';
import { OrganizationStructureForm } from '@/components/onboarding/organization/organization-structure-form';
import { HrPoliciesForm } from '@/components/onboarding/hr-policies/hr-policies-form';
import { PayrollStructureForm } from '@/components/onboarding/payroll/payroll-structure-form';
import { ContractsInsurancesForm } from '@/components/onboarding/contracts-insurances/contracts-insurances-form';
import { TeamSetupForm } from '@/components/onboarding/team/team-setup-form';
import { useTranslation } from 'react-i18next';
import { OnboardingProvider } from '@/components/onboarding/context/OnboardingContext';
import {
  useProfile,
  useUpdateOnboardingComplete,
  useUpdateOnboardingStep,
} from '@/features/auth/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { clampOnboardingStep, TOTAL_TENANT_ONBOARDING_STEPS } from '@/lib/onboarding/steps';
import { requiresTenantOnboarding } from '@/lib/onboarding/navigation';

interface StepConfig {
  title?: string;
  subtitle?: string;
  form?: React.ReactNode;
  content?: React.ReactNode;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t: tCompanyProfile } = useTranslation('companyProfile');
  const { t: tOrg } = useTranslation('orgStructure');
  const { t: tHr } = useTranslation('hrPolicies');
  const { t: tPayroll } = useTranslation('payrollStructure');
  const { t: tContractsInsurances } = useTranslation('contractsInsurances');
  const { t: tTeam } = useTranslation('teamSetup');

  const { data: user, isLoading: isProfileLoading, isFetching } = useProfile();
  const { mutateAsync: updateOnboarding } = useUpdateOnboardingComplete();
  const { mutateAsync: updateOnboardingStep } = useUpdateOnboardingStep();

  const profileStep = user ? clampOnboardingStep(user.onboardingStep) : 1;
  const [stepOverride, setStepOverride] = useState<number | null>(null);
  const currentStep = stepOverride ?? profileStep;

  useEffect(() => {
    if (isProfileLoading || isFetching) {
      return;
    }

    if (!user) {
      router.replace('/login');
      return;
    }

    if (!requiresTenantOnboarding(user)) {
      router.replace('/dashboard');
    }
  }, [isProfileLoading, isFetching, user, router]);

  const persistStep = useCallback(
    async (step: number) => {
      if (!user?.id) {
        return;
      }
      const normalized = clampOnboardingStep(step);
      await updateOnboardingStep({ step: normalized });
      setStepOverride(normalized);
    },
    [user, updateOnboardingStep],
  );

  const nextStep = useCallback(async () => {
    if (currentStep < TOTAL_TENANT_ONBOARDING_STEPS) {
      await persistStep(currentStep + 1);
      return;
    }

    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'User profile not found. Please try refreshing.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const res = await updateOnboarding({
        userId: user.id,
        onboardingComplete: true,
      });
      if (res) {
        router.push('/setup-success');
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to complete onboarding. Please try again.';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  }, [currentStep, persistStep, router, user, updateOnboarding, toast]);

  const prevStep = useCallback(async () => {
    if (currentStep > 1) {
      await persistStep(currentStep - 1);
      return;
    }
    router.push('/dashboard');
  }, [currentStep, persistStep, router]);

  const handleSaveAndExit = useCallback(async () => {
    if (!user?.id) {
      return;
    }
    try {
      await updateOnboardingStep({ step: currentStep, userId: user.id });
      setStepOverride(currentStep);
      toast({
        title: tCompanyProfile('success.saveTitle'),
        description: tCompanyProfile('success.saveDescription'),
      });
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save progress.';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  }, [currentStep, updateOnboardingStep, user, router, toast, tCompanyProfile]);

  const stepConfig: Record<number, StepConfig> = useMemo(
    () => ({
      1: {
        title: undefined,
        subtitle: undefined,
        form: <OrganizationProfileForm onNext={nextStep} onBack={prevStep} />,
      },
      2: {
        title: tOrg('header.title'),
        subtitle: tOrg('header.subtitle'),
        content: (
          <div className="space-y-6">
            <OrganizationStructureForm onNext={nextStep} onBack={prevStep} />
          </div>
        ),
      },
      3: {
        title: tHr('header.title'),
        subtitle: tHr('header.subtitle'),
        form: <HrPoliciesForm onNext={nextStep} onBack={prevStep} />,
      },
      4: {
        title: tPayroll('header.title'),
        subtitle: tPayroll('header.subtitle'),
        form: <PayrollStructureForm onNext={nextStep} onBack={prevStep} />,
      },
      5: {
        title: tContractsInsurances('title'),
        subtitle: tContractsInsurances('subtitle'),
        form: <ContractsInsurancesForm onNext={nextStep} onBack={prevStep} />,
      },
      6: {
        title: tTeam('header.title'),
        subtitle: tTeam('header.subtitle'),
        form: <TeamSetupForm onNext={nextStep} onBack={prevStep} />,
      },
    }),
    [nextStep, prevStep, tOrg, tHr, tPayroll, tTeam, tContractsInsurances],
  );

  const config = stepConfig[currentStep] || stepConfig[1];

  if (isProfileLoading) {
    return <OnboardingPageSkeleton />;
  }

  return (
    <OnboardingProvider>
      <div className="min-h-screen">
        <PublicHeader showSave={true} onSave={handleSaveAndExit} />
        <main className="px-6 py-12 sm:px-10 lg:py-4 lg:my-2">
          <div className="mx-auto flex max-w-4xl flex-col gap-2.5">
            <div className="flex flex-col py-4 gap-6">
              <OnboardingHeader title={config.title} subtitle={config.subtitle} />
              <StepIndicator
                currentStep={currentStep}
                totalSteps={TOTAL_TENANT_ONBOARDING_STEPS}
              />
            </div>

            {config.form || config.content}
          </div>
        </main>
      </div>
    </OnboardingProvider>
  );
}
