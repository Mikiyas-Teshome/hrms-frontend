'use client';

import { useTranslation } from 'react-i18next';
import { Clock, LayoutGrid } from 'lucide-react';
import Image from 'next/image';
import { StaffSignupCompanyInfo } from '@/components/staff-signup/staff-signup-company-info';

interface ManagerSignupBannerProps {
    companyName?: string;
    companyEmail?: string | null;
}

export function ManagerSignupBanner({ companyName, companyEmail }: ManagerSignupBannerProps) {
    const { t } = useTranslation('staffSignup');

    return (
        <div className="relative flex min-h-full w-full flex-col items-center overflow-hidden rounded-[12px] border border-border bg-secondary">
            <div className="absolute top-0 right-0 -mr-10 -mt-10 size-32 rounded-full bg-primary/10 opacity-60 blur-3xl" />
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 size-32 rounded-full bg-primary/10 opacity-60 blur-3xl" />

            <div className="relative z-10 flex w-full flex-1 flex-col px-6 pb-8 pt-10">
                <div className="flex flex-1 items-center justify-center">
                    <div className="flex size-48 items-center justify-center sm:size-56 md:size-70">
                        <Image
                            src="/assets/staff.svg"
                            alt="Team illustration"
                            width={280}
                            height={282}
                            className="h-auto w-full max-w-70 object-contain dark:invert-[0.9] dark:hue-rotate-180"
                            priority
                        />
                    </div>
                </div>

                <StaffSignupCompanyInfo
                    companyName={companyName}
                    companyEmail={companyEmail}
                />
            </div>

            <div className="relative z-10 mt-auto flex w-full flex-wrap items-center justify-start gap-4 px-6 pb-8">
                <div className="flex items-center gap-2">
                    <Clock className="size-3.5 text-muted-foreground" strokeWidth={2.5} />
                    <span className="text-xs font-medium text-muted-foreground">
                        {t('banner.requestLeave')}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <LayoutGrid className="size-3.5 text-muted-foreground" strokeWidth={2.5} />
                    <span className="text-xs font-medium text-muted-foreground">
                        {t('banner.accessPayslips')}
                    </span>
                </div>
            </div>
        </div>
    );
}
