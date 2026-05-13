'use client';

import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { Castle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CompanySuccess() {
    const { t } = useTranslation('companySuccess');
    const router = useRouter();

    return (
        <div className="flex flex-1 flex-col bg-background p-4 sm:p-6 lg:p-8">
            {/* Main Content */}
            <div className="flex flex-1 items-center justify-center">
                <div className="w-full max-w-358 overflow-hidden bg-background p-8 sm:p-12 ">
                    <div className="flex flex-col items-center justify-between gap-16 lg:flex-row lg:gap-32 rtl:flex-row-reverse">
                        {/* Illustration */}
                        <div className="flex flex-1 items-center justify-center w-full max-w-100">
                            <div className="relative flex size-64 items-center justify-center rounded-2xl bg-background sm:size-80 lg:size-100">
                                <Castle
                                    className="size-48 text-foreground sm:size-64 lg:size-100"
                                    strokeWidth={1.5}
                                />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex flex-1 flex-col items-center text-center lg:items-center lg:text-center rtl:lg:items-center rtl:lg:text-center">
                            <div className="w-full max-w-97.5 flex flex-col items-center text-center lg:items-center lg:text-center rtl:lg:items-center rtl:lg:text-center">
                                <h1 className="mb-6 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-3xl">
                                    {t('title')}
                                </h1>

                                <p className="mb-10 max-w-lg text-lg leading-relaxed text-muted-foreground">
                                    {t('subtitle')}
                                </p>
                            </div>

                            <div className="w-full max-w-97.5 flex flex-col gap-4 sm:max-w-97.5">
                                <Button
                                    onClick={() => router.push('/dashboard')}
                                    size="lg"
                                    className="h-9 py-2 px-4 w-full text-sm font-medium"
                                >
                                    {t('openDashboard')}
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={() => router.push('/onboarding/company-profile')}
                                    className="h-9 py-2 px-4 w-full bg-muted text-sm font-medium text-foreground hover:bg-muted/80 border-none"
                                >
                                    {t('startSetup')}
                                </Button>
                            </div>

                            <p className="mt-8 text-sm font-normal text-muted-foreground">
                                {t('footerNote')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
