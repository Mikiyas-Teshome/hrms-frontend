'use client';

import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Mail } from 'lucide-react';

export function StaffOnboardingCard() {
    const { t } = useTranslation('dashboard');

    return (
        <Card className="bg-background rounded-[10px] overflow-hidden">
            <CardContent className="px-10 py-8">
                {/* Empty State Section */}
                <div className="flex flex-col items-center justify-center pt-20 pb-12 text-center">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                        <Mail className="w-8 h-8 text-primary" />
                    </div>
                    <div className="max-w-xl space-y-4">
                        <h4 className="text-[24px] lg:text-[28px] font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                            {t('staffOnboarding.empty.title')}
                        </h4>
                        <p className="text-[14px] lg:text-[16px] text-zinc-500 leading-relaxed font-normal">
                            {t('staffOnboarding.empty.subtitle')}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
