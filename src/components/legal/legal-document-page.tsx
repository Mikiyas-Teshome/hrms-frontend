'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PublicHeader } from '@/components/common/public-header';

const TERMS_SECTION_KEYS = [
    'acceptance',
    'services',
    'accounts',
    'subscriptions',
    'data',
    'termination',
    'liability',
    'governingLaw',
] as const;

const PRIVACY_SECTION_KEYS = [
    'introduction',
    'dataCollected',
    'dataUse',
    'dataSharing',
    'dataRetention',
    'security',
    'yourRights',
    'contact',
] as const;

type LegalNamespace = 'terms' | 'privacy';

interface LegalDocumentPageProps {
    namespace: LegalNamespace;
}

export function LegalDocumentPage({ namespace }: LegalDocumentPageProps) {
    const { t } = useTranslation(namespace);
    const searchParams = useSearchParams();
    const returnTo = searchParams.get('returnTo');
    const backHref =
        returnTo?.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/company-signup';
    const sectionKeys = namespace === 'terms' ? TERMS_SECTION_KEYS : PRIVACY_SECTION_KEYS;

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <PublicHeader />
            <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10 sm:px-8 sm:py-14">
                <Link
                    href={backHref}
                    className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                    <ArrowLeft className="size-4 rtl:rotate-180" />
                    {t('backLink')}
                </Link>

                <div className="space-y-2 border-b border-border pb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        {t('title')}
                    </h1>
                    <p className="text-sm text-muted-foreground">{t('lastUpdated')}</p>
                </div>

                <div className="mt-10 space-y-10">
                    {sectionKeys.map((key) => (
                        <section key={key} className="space-y-3">
                            <h2 className="text-lg font-semibold text-foreground">
                                {t(`sections.${key}.title`)}
                            </h2>
                            <p className="text-sm leading-7 text-muted-foreground whitespace-pre-line">
                                {t(`sections.${key}.content`)}
                            </p>
                        </section>
                    ))}
                </div>
            </main>
        </div>
    );
}
