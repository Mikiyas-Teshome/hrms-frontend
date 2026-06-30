'use client';

import { useTranslation } from 'react-i18next';

interface StaffStepIndicatorProps {
    currentStep: number;
    totalSteps: number;
}

export function StaffStepIndicator({ currentStep, totalSteps }: StaffStepIndicatorProps) {
    const { t } = useTranslation('staffSignup');

    return (
        <div className="flex w-full flex-col items-start gap-2.5">
            <span className="text-sm font-semibold text-foreground/80">
                {t('onboarding.step', { current: currentStep, total: totalSteps })}
            </span>
            <div className="flex w-full gap-2 sm:gap-3">
                {Array.from({ length: totalSteps }).map((_, index) => (
                    <div
                        key={index}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                            index < currentStep ? 'bg-primary' : 'bg-primary/40'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}
