'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { AvatarGroup } from '@/components/ui/avatar';
import { DashboardPreview } from '@/components/landing/previews/dashboard-preview';
import { LandingAvatar } from '@/components/landing/landing-avatar';
import { heroMemberAvatars } from '@/data/landing';

export function LandingHero() {
    const { t } = useTranslation('landing');

    return (
        <section id="home" className="relative overflow-hidden">
            <div className="landing-hero-gradient absolute inset-0" />
            <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                    backgroundImage:
                        'linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                }}
            />
            <div className="landing-hero-fade-bottom pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40" />

            <div className="relative z-10 mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 sm:pb-28 sm:pt-32 lg:px-8">
                <div className="landing-hero-enter flex flex-col items-center text-center">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background/80 px-4 py-1.5 text-sm text-foreground/70 shadow-sm backdrop-blur-sm dark:border-primary/30 dark:bg-card/90 dark:text-foreground/90">
                        <Sparkles className="size-3.5 text-primary" />
                        {t('hero.badge')}
                    </div>

                    <AvatarGroup className="mb-6">
                        {heroMemberAvatars.map((member) => (
                            <LandingAvatar
                                key={member.id}
                                alt={t('hero.memberAvatarAlt')}
                                size="sm"
                            />
                        ))}
                    </AvatarGroup>
                    <p className="mb-4 text-sm text-foreground/60 dark:text-foreground/80">{t('hero.members')}</p>

                    <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                        {t('hero.title')}{' '}
                        <span className="text-primary italic">{t('hero.titleHighlight')}</span>
                    </h1>

                    <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
                        {t('hero.subtitle')}
                    </p>

                    <div className="mt-8">
                        <Button size="lg" className="h-12 px-8 text-base" asChild>
                            <Link href="/company-signup">{t('hero.cta')}</Link>
                        </Button>
                    </div>
                </div>

                <div className="landing-hero-enter landing-hero-enter-delayed relative mt-16 -mb-8 sm:-mb-12">
                    <DashboardPreview alt={t('hero.dashboardPreviewAlt')} fadeBottom />
                </div>
            </div>
        </section>
    );
}
