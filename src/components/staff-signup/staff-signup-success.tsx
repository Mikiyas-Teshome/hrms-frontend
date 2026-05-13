'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function StaffSignupSuccess() {
    const { t } = useTranslation('staffSignup');
    const router = useRouter();

    return (
        <div className="flex w-full md:w-118.5 flex-col items-start gap-8 bg-card p-8 rounded-[32px] border border-border animate-in fade-in zoom-in duration-500">
            <div className="flex flex-col items-start gap-4">
                {/* Success Icon */}
                <div className="flex items-center justify-center size-12 rounded-full bg-green-500/10">
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 32 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-green-500"
                    >
                        <path
                            d="M29.3333 14.7745V16.0011C29.3317 18.8764 28.4006 21.674 26.6791 23.9769C24.9575 26.2798 22.5377 27.9644 19.7804 28.7797C17.0232 29.5949 14.0763 29.497 11.3793 28.5006C8.6822 27.5041 6.3795 25.6626 4.81457 23.2505C3.24965 20.8385 2.50635 17.9852 2.69553 15.1162C2.88471 12.2472 3.99624 9.51622 5.86433 7.33055C7.73243 5.14488 10.257 3.62163 13.0615 2.98798C15.8661 2.35433 18.8003 2.64424 21.4266 3.81446M12 14.6676L16 18.6676L29.3333 5.33431"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>

                {/* Text Content */}
                <div className="flex flex-col items-start gap-2">
                    <h1 className="text-[32px] font-semibold leading-[130%] tracking-tight text-foreground">
                        {t('successTitlePart1')} <br />
                        <span className="font-normal">{t('successTitlePart2')}</span>
                    </h1>
                    <p className="text-base font-normal leading-5 text-muted-foreground">
                        {t('successDescription')}
                    </p>
                </div>
            </div>

            {/* Action Button */}
            <Button
                onClick={() => router.push('/dashboard')}
                className="h-10 w-full rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all"
            >
                {t('successButton')}
            </Button>
        </div>
    );
}
