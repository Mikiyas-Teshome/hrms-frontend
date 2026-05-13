'use client';

import { useTranslation } from 'react-i18next';

interface OnboardingHeaderProps {
    title?: string;
    subtitle?: string;
}

export function OnboardingHeader({ title, subtitle }: OnboardingHeaderProps) {
    const { t } = useTranslation('companyProfile');

    return (
        <div className="flex flex-col items-start gap-2 text-start">
            <h1 className="text-xl font-semibold text-card-foreground">
                {title || t('header.title')}
            </h1>
            <p className="text-sm leading-5 text-muted-foreground">
                {subtitle || t('header.subtitle')}
            </p>
        </div>
    );
}
