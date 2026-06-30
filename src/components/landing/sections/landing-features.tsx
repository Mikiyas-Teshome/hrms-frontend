'use client';

import Image from 'next/image';
import {
    ArrowRight,
    BarChart3,
    Calendar,
    Clock,
    Target,
    Users,
    Wallet,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { LandingAvatar } from '@/components/landing/landing-avatar';
import {
    LANDING_DASHBOARD_PREVIEW_IMAGE,
    landingEmployeeSamples,
    landingFeatures,
    landingPerformancePreviewItems,
} from '@/data/landing';
import { LandingRevealStagger } from '@/components/landing/landing-reveal';
import { cn } from '@/lib/utils';

const iconMap = {
    users: Users,
    wallet: Wallet,
    target: Target,
    clock: Clock,
    calendar: Calendar,
    barChart: BarChart3,
} as const;

function EmployeeDataFeaturePreview() {
    const { t } = useTranslation('landing');

    return (
        <div className="space-y-2">
            {landingEmployeeSamples.map((employee) => (
                <div
                    key={employee.id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-background p-2.5"
                >
                    <LandingAvatar
                        alt={t(`features.employeeSamples.${employee.id}.name`)}
                        size="sm"
                        initials={employee.initials}
                    />
                    <div className="min-w-0 flex-1 text-start">
                        <p className="truncate text-sm font-medium text-foreground">
                            {t(`features.employeeSamples.${employee.id}.name`)}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                            {t(`features.employeeSamples.${employee.id}.department`)}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}

function PayrollFeaturePreview() {
    const { t } = useTranslation('landing');

    return (
        <div className="rounded-lg border border-border bg-background p-4">
            <div className="text-xs text-muted-foreground">
                {t('features.previews.payroll.label')}
            </div>
            <div className="mt-1 text-2xl font-bold text-primary">
                {t('features.previews.payroll.amount')}
            </div>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                <span className="size-1.5 rounded-full bg-primary" />
                {t('features.previews.payroll.status')}
            </div>
        </div>
    );
}

function PerformanceFeaturePreview() {
    const { t } = useTranslation('landing');

    return (
        <div className="space-y-3">
            {landingPerformancePreviewItems.map((item) => (
                <div key={item.id}>
                    <div className="mb-1 flex justify-between text-xs">
                        <span className="text-muted-foreground">
                            {t(`features.previews.performance.${item.id}`)}
                        </span>
                        <span className="font-medium text-primary">{item.progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted">
                        <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${item.progress}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

function FeaturePreview({ featureId, alt }: { featureId: string; alt: string }) {
    if (featureId === 'employeeData') {
        return <EmployeeDataFeaturePreview />;
    }

    if (featureId === 'payroll') {
        return <PayrollFeaturePreview />;
    }

    if (featureId === 'performance') {
        return <PerformanceFeaturePreview />;
    }

    return (
        <div className="overflow-hidden rounded-lg border border-border bg-background">
            <Image
                src={LANDING_DASHBOARD_PREVIEW_IMAGE}
                alt={alt}
                width={1850}
                height={925}
                className="h-32 w-full object-cover object-top sm:h-36"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
        </div>
    );
}

export function LandingFeatures() {
    const { t } = useTranslation('landing');

    return (
        <section id="features" className="bg-background py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        {t('features.title')}
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">{t('features.subtitle')}</p>
                </div>

                <LandingRevealStagger className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {landingFeatures.map((feature) => {
                        const Icon = iconMap[feature.icon];
                        return (
                            <Card
                                key={feature.id}
                                className="group border-border/60 bg-card transition-shadow hover:shadow-lg hover:shadow-primary/5"
                            >
                                <CardContent className="p-6">
                                    <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary/10">
                                        <Icon className="size-5 text-primary" />
                                    </div>
                                    <FeaturePreview
                                        featureId={feature.id}
                                        alt={t(`features.items.${feature.id}.title`)}
                                    />
                                    <h3 className="mt-5 text-lg font-semibold text-foreground">
                                        {t(`features.items.${feature.id}.title`)}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                        {t(`features.items.${feature.id}.description`)}
                                    </p>
                                    <a
                                        href="#how-it-works"
                                        className={cn(
                                            'mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary',
                                            'opacity-0 transition-opacity group-hover:opacity-100',
                                        )}
                                    >
                                        {t('features.learnMore')}
                                        <ArrowRight className="size-3.5" />
                                    </a>
                                </CardContent>
                            </Card>
                        );
                    })}
                </LandingRevealStagger>
            </div>
        </section>
    );
}
