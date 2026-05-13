"use client";

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StepIndicator } from '@/components/onboarding/shared/step-indicator';
import { OnboardingHeader } from '@/components/onboarding/shared/onboarding-header';
import { PublicHeader } from '@/components/common/public-header';
import { OrganizationProfileForm } from '@/components/onboarding/organization/organization-profile-form';
import { OrganizationStructureForm } from '@/components/onboarding/organization/organization-structure-form';
import { HrPoliciesForm } from '@/components/onboarding/hr-policies/hr-policies-form';
import { PayrollStructureForm } from '@/components/onboarding/payroll/payroll-structure-form';
import { TeamSetupForm } from '@/components/onboarding/team/team-setup-form';
import { ProTipAlert } from '@/components/onboarding/shared/pro-tip-alert';
import { useTranslation } from "react-i18next";
import { OnboardingProvider } from '@/components/onboarding/context/OnboardingContext';
import { useProfile, useUpdateOnboardingComplete } from '@/features/auth/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface StepConfig {
    title?: string;
    subtitle?: string;
    form?: React.ReactNode;
    content?: React.ReactNode;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t: tOrg } = useTranslation("orgStructure");
  const { t: tHr } = useTranslation("hrPolicies");
  const { t: tPayroll } = useTranslation("payrollStructure");
  const { t: tTeam } = useTranslation('teamSetup');
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('onboarding_current_step');
    if (saved && !isNaN(parseInt(saved))) {
      setCurrentStep(parseInt(saved));
    }
    setIsLoaded(true);
  }, []);

  // Update localStorage when step changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('onboarding_current_step', currentStep.toString());
    }
  }, [currentStep, isLoaded]);

  const { data: user, error: profileError, isLoading: profileLoading } = useProfile();
  const { mutateAsync: updateOnboarding } = useUpdateOnboardingComplete();


  const nextStep = useCallback(async () => {
      if (currentStep < 5) {
          setCurrentStep((s) => s + 1);
      } else {
          if (user?.id) {
              try {
                  const res = await updateOnboarding({ 
                      userId: user.id, 
                      onboardingComplete: true 
                   });
                  if (res) {
                      localStorage.removeItem('onboarding_current_step');
                      router.push('/setup-success');
                  }
              } catch (err: any) {
                  toast({
                      title: 'Error',
                      description: err.message || 'Failed to complete onboarding. Please try again.',
                      variant: 'destructive',
                  });
              }
          } else {
              toast({
                  title: 'Error',
                  description: 'User profile not found. Please try refreshing.',
                  variant: 'destructive',
              });
          }
      }
  }, [currentStep, router, user, updateOnboarding, toast]);

  const prevStep = useCallback(() => {
      if (currentStep > 1) {
          setCurrentStep((s) => s - 1);
      } else {
          router.push('/dashboard');
      }
  }, [currentStep, router]);

  const handleSaveAndExit = useCallback(() => {
    localStorage.setItem('onboarding_current_step', currentStep.toString());
    if (user) {
      router.push('/dashboard');
    }
  }, [currentStep, user, router]);


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
                      <ProTipAlert
                          title={tOrg('proTip.title')}
                          description={tOrg('proTip.description')}
                          buttonText={tOrg('proTip.import')}
                      />
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
              title: tTeam('header.title'),
              subtitle: tTeam('header.subtitle'),
              form: <TeamSetupForm onNext={nextStep} onBack={prevStep} />,
          },
      }),
      [nextStep, prevStep, tOrg, tHr, tPayroll, tTeam],
  );

  const config = stepConfig[currentStep] || stepConfig[1];
  const indicatorStep = currentStep > 4 ? 4 : currentStep;

  return (
    <OnboardingProvider>
      <div className="min-h-screen">
        <PublicHeader showSave={true} onSave={handleSaveAndExit} />
        <main className="px-6 py-12 sm:px-10 lg:py-4 lg:my-2">
          <div className="mx-auto flex max-w-4xl flex-col gap-2.5">
            <div className="flex flex-col py-4 gap-6">
              <OnboardingHeader
                title={config.title}
                subtitle={config.subtitle}
              />
              <StepIndicator currentStep={indicatorStep} totalSteps={4} />
            </div>

            {config.form || config.content}
          </div>
        </main>
      </div>
    </OnboardingProvider>
  );
}
