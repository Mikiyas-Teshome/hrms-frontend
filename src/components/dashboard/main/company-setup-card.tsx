'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useProfile } from '@/features/auth/hooks/useAuth';

export function CompanySetupCard() {
    const { t } = useTranslation('dashboard');
    const { data: user } = useProfile();
    const currentStep = user?.onboardingStep ?? 1;

    const steps = [
        { id: 'profile', label: t('companySetup.steps.profile'), completed: currentStep > 1 || !!user?.onboardingComplete },
        { id: 'structure', label: t('companySetup.steps.structure'), completed: currentStep > 2 || !!user?.onboardingComplete },
        {
            id: 'hr policies',
            label: t('companySetup.steps.hrPolicies'),
            completed: currentStep > 3 || !!user?.onboardingComplete,
        },
        {
            id: 'payroll structure',
            label: t('companySetup.steps.payrollStructure'),
            completed: currentStep > 4 || !!user?.onboardingComplete,
        },
        {
            id: 'contractsInsurances',
            label: t('companySetup.steps.contractsInsurances'),
            completed: currentStep > 5 || !!user?.onboardingComplete,
        },
        {
            id: 'addEmployees',
            label: t('companySetup.steps.addEmployees'),
            completed: currentStep > 6 || !!user?.onboardingComplete,
        },
    ];

    const completedCount = steps.filter((s) => s.completed).length;
    const percent = Math.round((completedCount / steps.length) * 100);

    return (
        <Card className="bg-background rounded-[10px] overflow-hidden">
            <CardContent className="px-10 py-8">
                <div className="bg-background border border-border rounded-[8px] p-6 lg:p-8 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-[16px] text-zinc-900 dark:text-zinc-100">
                            {t('companySetup.title')}
                        </h3>
                        <span className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-100">
                            {t('companySetup.complete', { percent })}
                        </span>
                    </div>

                    <div className="relative">
                        <Progress
                            value={percent}
                            className="h-2 bg-zinc-100 dark:bg-zinc-800 animate-in fade-in duration-500"
                        />
                        <div className="grid grid-cols-6 gap-2 mt-4">
                            {steps.map((step) => (
                                <div
                                    key={step.id}
                                    className="flex flex-col items-center text-center"
                                >
                                    <span
                                        className={cn(
                                            'text-[12px] lg:text-[14px] font-normal transition-colors leading-tight',
                                            step.completed
                                                ? 'text-primary font-medium'
                                                : 'text-zinc-500',
                                        )}
                                    >
                                        {step.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center pt-20 pb-12 text-center">
                    <div className="max-w-xl space-y-4">
                        <h4 className="text-[24px] lg:text-[28px] font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                            {t('companySetup.empty.title')}
                        </h4>
                        <p className="text-[14px] lg:text-[16px] text-zinc-500 leading-relaxed font-normal">
                            {t('companySetup.empty.subtitle')}
                        </p>
                    </div>

                    <Button
                        asChild
                        className="mt-8 rounded-[8px] px-8 h-[44px] text-[14px] font-semibold bg-[#3A43D9] hover:bg-[#3A43D9]/90 text-white border-none transition-all shadow-sm"
                    >
                        <Link href="/onboarding">{t('companySetup.empty.button')}</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
