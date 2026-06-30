'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { landingPricingPlans } from '@/data/landing';
import { LandingRevealStagger } from '@/components/landing/landing-reveal';
import { cn } from '@/lib/utils';

export function LandingPricing() {
    const { t } = useTranslation('landing');
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

    const formatPrice = (plan: (typeof landingPricingPlans)[number]) => {
        if (plan.price === null) return t('pricing.custom');

        if (billingCycle === 'monthly') {
            return `$${plan.price}${t('pricing.perEmployee')}`;
        }

        const yearlyPrice = (plan.price * 12 * 0.8).toFixed(1);
        return `$${yearlyPrice}${t('pricing.perYear')}`;
    };

    return (
        <section id="pricing" className="bg-background py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        {t('pricing.title')}
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">{t('pricing.subtitle')}</p>

                    <div className="mt-8 inline-flex flex-col items-center gap-2">
                        <div className="flex rounded-lg bg-muted p-1 [direction:ltr]">
                            <button
                                type="button"
                                onClick={() => setBillingCycle('yearly')}
                                className={cn(
                                    'rounded-md px-6 py-2 text-sm font-medium transition-all',
                                    billingCycle === 'yearly'
                                        ? 'bg-background text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                {t('pricing.yearly')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setBillingCycle('monthly')}
                                className={cn(
                                    'rounded-md px-6 py-2 text-sm font-medium transition-all',
                                    billingCycle === 'monthly'
                                        ? 'bg-background text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                {t('pricing.monthly')}
                            </button>
                        </div>
                        <span className="text-xs font-medium text-primary">{t('pricing.saveNote')}</span>
                    </div>
                </div>

                <LandingRevealStagger className="mt-16 grid gap-6 lg:grid-cols-3">
                    {landingPricingPlans.map((plan) => (
                        <Card
                            key={plan.id}
                            className={cn(
                                'relative flex flex-col border-border/60 transition-shadow hover:shadow-lg',
                                plan.featured && 'border-primary bg-primary text-primary-foreground shadow-xl shadow-primary/20 lg:scale-105',
                            )}
                        >
                            {plan.featured && (
                                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-background text-primary hover:bg-background">
                                    {t('pricing.plans.professional.badge')}
                                </Badge>
                            )}
                            <CardContent className="flex flex-1 flex-col p-8">
                                <h3
                                    className={cn(
                                        'text-xl font-semibold',
                                        plan.featured ? 'text-primary-foreground' : 'text-foreground',
                                    )}
                                >
                                    {t(`pricing.plans.${plan.id}.name`)}
                                </h3>
                                <p
                                    className={cn(
                                        'mt-2 text-sm',
                                        plan.featured ? 'text-primary-foreground/80' : 'text-muted-foreground',
                                    )}
                                >
                                    {t(`pricing.plans.${plan.id}.description`)}
                                </p>
                                <div className="mt-6">
                                    <span
                                        className={cn(
                                            'text-3xl font-bold',
                                            plan.featured ? 'text-primary-foreground' : 'text-foreground',
                                        )}
                                    >
                                        {formatPrice(plan)}
                                    </span>
                                </div>

                                <ul className="mt-8 flex-1 space-y-3">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-2.5 text-sm">
                                            <Check
                                                className={cn(
                                                    'mt-0.5 size-4 shrink-0',
                                                    plan.featured ? 'text-primary-foreground' : 'text-primary',
                                                )}
                                            />
                                            <span
                                                className={
                                                    plan.featured
                                                        ? 'text-primary-foreground/90'
                                                        : 'text-muted-foreground'
                                                }
                                            >
                                                {t(`featureList.${feature}`, {
                                                    ns: 'pricing',
                                                    defaultValue: feature,
                                                })}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    className={cn(
                                        'mt-8 w-full',
                                        plan.featured &&
                                            'border-0 bg-white text-primary shadow-md hover:bg-white/90 dark:bg-white dark:text-primary dark:hover:bg-white/90',
                                    )}
                                    variant="default"
                                    asChild
                                >
                                    <Link href="/company-signup">{t('pricing.cta')}</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </LandingRevealStagger>
            </div>
        </section>
    );
}
