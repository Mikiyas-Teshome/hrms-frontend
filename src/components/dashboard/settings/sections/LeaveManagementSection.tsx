'use client';

import Link from 'next/link';
import { ArrowRight, CalendarOff, Scale } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SectionLayout } from '../SectionLayout';

const LEAVE_LINKS = [
    {
        href: '/dashboard/leave/policies',
        icon: Scale,
        titleKey: 'leave.links.policiesTitle',
        descKey: 'leave.links.policiesDesc',
    },
    {
        href: '/dashboard/leave/balances',
        icon: CalendarOff,
        titleKey: 'leave.links.balancesTitle',
        descKey: 'leave.links.balancesDesc',
    },
] as const;

export function LeaveManagementSection() {
    const { t } = useTranslation('settings');

    return (
        <SectionLayout title={t('leave.title')} description={t('leave.description')}>
            <div className="flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">{t('leave.links.intro')}</p>
                {LEAVE_LINKS.map((item) => {
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3 transition-colors hover:border-primary/40 hover:bg-primary/5"
                        >
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">{t(item.titleKey)}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{t(item.descKey)}</p>
                                </div>
                            </div>
                            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                        </Link>
                    );
                })}
            </div>
        </SectionLayout>
    );
}
