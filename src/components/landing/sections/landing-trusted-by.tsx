'use client';

import { useTranslation } from 'react-i18next';
import { trustedCompanies } from '@/data/landing';

export function LandingTrustedBy() {
    const { t } = useTranslation('landing');
    const marqueeItems = [...trustedCompanies, ...trustedCompanies];

    return (
        <section className="relative bg-background pb-12 pt-4">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <p className="mb-8 text-center text-sm font-medium text-muted-foreground">
                    {t('trustedBy.title')}
                </p>

                <div className="landing-marquee-fade relative overflow-hidden">
                    <div className="landing-marquee-track flex items-center gap-16 px-8">
                        {marqueeItems.map((company, index) => (
                            <span
                                key={`${company}-${index}`}
                                className="shrink-0 text-lg font-semibold tracking-tight text-muted-foreground/50"
                            >
                                {company}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
