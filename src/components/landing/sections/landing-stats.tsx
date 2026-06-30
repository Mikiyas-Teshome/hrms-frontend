'use client';

import { useTranslation } from 'react-i18next';
import { LandingRevealStagger } from '@/components/landing/landing-reveal';
import { landingStats } from '@/data/landing';

export function LandingStats() {
    const { t } = useTranslation('landing');

    return (
        <section className="border-y border-border bg-muted/40 py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <LandingRevealStagger className="grid grid-cols-2 gap-8 lg:grid-cols-4">
                    {landingStats.map((stat) => (
                        <div key={stat.id} className="text-center">
                            <div className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
                                {stat.value}
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                                {t(`stats.${stat.id}`)}
                            </p>
                        </div>
                    ))}
                </LandingRevealStagger>
            </div>
        </section>
    );
}
