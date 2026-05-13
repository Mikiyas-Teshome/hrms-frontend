'use client';

import { useTranslation } from 'react-i18next';
import { Clock, LayoutGrid } from 'lucide-react';
import Image from 'next/image';

export function ManagerSignupBanner() {
    const { t } = useTranslation('staffSignup');

    return (
        <div className="relative flex flex-col items-center w-full min-h-146.5 bg-secondary border border-border rounded-[12px] overflow-hidden">
            {/* Background Decorative Shapes */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl opacity-60 -mr-10 -mt-10" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl opacity-60 -ml-10 -mb-10" />

            {/* Centered Main Content Container */}
            <div className="relative z-10 flex flex-col items-center justify-center flex-1 w-full px-6 pb-12">
                {/* Illustration Section - Frame 89 */}
                <div className="w-70 h-70.5 flex items-center justify-center">
                    <Image
                        src="/assets/staff.svg"
                        alt="Team illustration"
                        width={280}
                        height={282}
                        className="object-contain dark:invert-[0.9] dark:hue-rotate-180"
                        priority
                    />
                </div>

                {/* Content Section - Frame 211 */}
                <div className="flex flex-col w-full gap-6 mt-12">
                    {/* Title Section - Frame 86 */}
                    <div className="space-y-4">
                        <h1 className="text-[20px] font-semibold leading-6.75 text-foreground max-w-103">
                            {t('banner.title')}
                        </h1>

                        {/* Company Info - Frame 87 */}
                        <div className="flex flex-col gap-3">
                            <span className="text-[16px] font-medium leading-4.75 text-foreground">
                                {t('banner.companyLabel')}
                            </span>
                            <div className="flex flex-col gap-1.5">
                                <p className="text-[16px] font-normal leading-4.75 text-muted-foreground">
                                    {t('banner.companyName')}
                                </p>
                                <p className="text-[16px] font-normal leading-4.75 text-muted-foreground">
                                    {t('banner.companyEmail')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Section - Container */}
            <div className="relative z-10 flex items-center justify-start w-full px-6 pb-8 gap-6 mt-auto">
                <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-3.5 h-3.5">
                        <Clock className="size-3.5 text-primary" strokeWidth={2.5} />
                    </div>
                    <span className="text-[12px] font-semibold leading-4 text-foreground">
                        {t('banner.requestLeave')}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-3.5 h-3.5">
                        <LayoutGrid className="size-3.5 text-primary" strokeWidth={2.5} />
                    </div>
                    <span className="text-[12px] font-semibold leading-4 text-foreground">
                        {t('banner.accessPayslips')}
                    </span>
                </div>
            </div>
        </div>
    );
}
