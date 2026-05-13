'use client';

import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, FileClock, CalendarOff, CircleGauge } from 'lucide-react';
import { OnboardingHeader } from '@/components/onboarding/shared/onboarding-header';

export function ManagerReviewView() {
    const { t } = useTranslation('dashboard');
    const router = useRouter();

    const stats = [
        {
            title: t('managerDashboard.totalMembers'),
            value: '0',
            icon: Users,
            styleClass: 'bg-amber-500/10 text-amber-600',
        },
        {
            title: t('managerDashboard.pendingLeave'),
            value: '0',
            icon: FileClock,
            styleClass: 'bg-violet-500/10 text-violet-600',
        },
        {
            title: t('managerDashboard.onLeave'),
            value: '0',
            icon: CalendarOff,
            styleClass: 'bg-violet-500/10 text-violet-600',
        },
        {
            title: t('managerDashboard.avgPerformance'),
            value: '0',
            icon: CircleGauge,
            styleClass: 'bg-cyan-500/10 text-cyan-600',
        },
    ];

    return (
        <div className="flex min-h-screen flex-col gap-8 bg-background p-[24px_24px_12px] font-sans text-foreground">
            {/* Header Section using standardized OnboardingHeader */}
            <OnboardingHeader
                title={t('managerDashboard.welcome', { name: 'Micheal' })}
                subtitle={t('managerDashboard.subtitle')}
            />

            {/* Stats Row Container */}
            <div className="grid gap-4 w-full sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, idx) => (
                    <Card key={idx} className="rounded-xl border border-border bg-card shadow-none">
                        <CardContent className="p-4 flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div
                                    className={`h-10 w-10 shrink-0 rounded-lg flex items-center justify-center ${stat.styleClass}`}
                                >
                                    <stat.icon className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="text-left rtl:text-right">
                                <p className="text-sm font-normal text-muted-foreground">
                                    {stat.title}
                                </p>
                                <p className="text-2xl font-bold text-foreground mt-1">
                                    {stat.value}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Empty State Content */}
            <div className="flex flex-1 min-h-100 items-center justify-center rounded-xl border border-dashed border-border bg-card ">
                <div className="flex flex-col items-center justify-center text-center max-w-105 px-4">
                    <h2 className="text-[20px] font-bold text-foreground mb-2">
                        {t('managerDashboard.reviewTitle')}
                    </h2>
                    <p className="text-[14px] mb-6 leading-relaxed text-muted-foreground">
                        {t('managerDashboard.reviewSubtitle')}
                    </p>
                    <Button
                        className="rounded-lg px-6 w-fit h-10 font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => router.push('/onboarding-team-view')}
                    >
                        {t('managerDashboard.reviewButton')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
