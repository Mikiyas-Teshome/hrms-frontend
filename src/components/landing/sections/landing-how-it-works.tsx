'use client';

import { Building2, Check, Rocket, Settings, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { landingSteps } from '@/data/landing';

const stepIconMap = {
    building: Building2,
    userPlus: UserPlus,
    settings: Settings,
    rocket: Rocket,
} as const;

export function LandingHowItWorks() {
    const { t } = useTranslation('landing');

    return (
        <section id="how-it-works" className="bg-background py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                    <div>
                        <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/10">
                            {t('howItWorks.badge')}
                        </Badge>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            {t('howItWorks.title')}
                        </h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                            {t('howItWorks.subtitle')}
                        </p>

                        <div className="mt-8 space-y-6">
                            {landingSteps.map((step) => {
                                const Icon = stepIconMap[step.icon];
                                return (
                                    <div key={step.id} className="flex gap-4">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                                            <Icon className="size-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground">
                                                {t(`howItWorks.steps.${step.id}.title`)}
                                            </h3>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {t(`howItWorks.steps.${step.id}.description`)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-6 shadow-xl shadow-primary/5 sm:p-8">
                        <h3 className="mb-6 text-lg font-semibold text-foreground">
                            {t('howItWorks.form.title')}
                        </h3>
                        <div className="space-y-4">
                            {(
                                [
                                    'companyName',
                                    'email',
                                    'industry',
                                    'companySize',
                                ] as const
                            ).map((field) => (
                                <div key={field}>
                                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                                        {t(`howItWorks.form.${field}`)}
                                    </label>
                                    <div className="flex h-10 items-center rounded-lg border border-border bg-background px-3">
                                        <div className="h-2 w-32 rounded-full bg-muted-foreground/15" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 flex items-center gap-2 rounded-lg bg-primary/5 p-3">
                            <Check className="size-4 text-primary" />
                            <span className="text-sm text-muted-foreground">
                                {t('howItWorks.steps.setup.description')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
