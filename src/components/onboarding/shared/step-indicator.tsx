'use client';

import { useTranslation } from 'react-i18next';

interface StepIndicatorProps {
    currentStep: number;
    totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
    const { t } = useTranslation('companyProfile');

    return (
        <div className="flex flex-col items-start gap-2.5">
            <span className="text-sm font-semibold text-foreground/80">
                {t('steps.step', { current: currentStep, total: totalSteps })}
            </span>
            <div className="flex w-full gap-3">
                {Array.from({ length: totalSteps }).map((_, i) => (
                    <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                            i < currentStep ? 'bg-primary' : 'bg-primary/40'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}
