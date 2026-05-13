'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { PublicHeader } from '@/components/common/public-header';
import { ManagerSignupBanner } from '@/components/staff-signup/staff-signup-banner';
import { ManagerSignupForm } from '@/components/staff-signup/staff-signup-form';
import { StaffSignupSuccess } from '@/components/staff-signup/staff-signup-success';
import { StaffOnboardingForm } from '@/components/staff-signup/staff-onboarding-form';

function StaffSignupContent() {
    const [step, setStep] = useState<'signup' | 'onboarding' | 'success'>('signup');
    const searchParams = useSearchParams();

    const token = searchParams.get('token') || '';
    const email = searchParams.get('email') || '';

    if (step === 'success') {
        return (
            <div className="flex flex-col w-full min-h-screen bg-muted/30">
                <PublicHeader showLanguage={true} />
                <div className="flex-1 flex items-center justify-center p-4 md:p-12">
                    <StaffSignupSuccess />
                </div>
            </div>
        );
    }

    if (step === 'onboarding') {
        return (
            <div className="flex flex-col w-full min-h-screen bg-background">
                <PublicHeader showLanguage={true} />
                <div className="flex-1 flex items-center justify-center p-4 md:p-12">
                    <StaffOnboardingForm onFinish={() => setStep('success')} />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full min-h-screen bg-muted/30">
            <PublicHeader showLanguage={true} />
            <div className="flex-1 flex items-center justify-center p-4 md:p-12">
                <div className="flex flex-col md:flex-row w-full max-w-6xl bg-card border border-border shadow-[0px_32px_64px_-12px_rgba(0,0,0,0.14)] rounded-[12px] min-h-160 overflow-hidden">
                    {/* Banner Section - Left side */}
                    <div className="w-full md:w-1/2 flex p-3">
                        <ManagerSignupBanner />
                    </div>

                    {/* Form Section - Right side */}
                    <div className="w-full md:w-1/2 flex items-center justify-center p-8">
                        <ManagerSignupForm
                            onSignupSuccess={() => setStep('onboarding')}
                            onSuccess={() => setStep('success')}
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
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-muted-foreground text-sm">{t('loading', { defaultValue: 'Loading…' })}</div>}>
            <StaffSignupContent />
        </Suspense>
    );
}
