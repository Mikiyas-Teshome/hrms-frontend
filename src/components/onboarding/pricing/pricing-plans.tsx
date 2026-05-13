'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const features = [
    'employeeManagement',
    'leaveManagement',
    'attendanceTracking',
    'shiftManagement',
    'payrollEngine',
    'benefitsManagement',
    'complianceTracking',
    'wpsPayroll',
    'aiAnalytics',
    'customReportBuilder',
    'erpIntegrations',
];

const plans = [
    {
        id: 'essential',
        price: 3,
        includedFeatures: ['employeeManagement', 'leaveManagement', 'attendanceTracking'],
    },
    {
        id: 'professional',
        price: 6,
        includedFeatures: [
            'employeeManagement',
            'leaveManagement',
            'attendanceTracking',
            'shiftManagement',
            'payrollEngine',
            'benefitsManagement',
        ],
    },
    {
        id: 'enterprise',
        price: null,
        includedFeatures: [
            'employeeManagement',
            'leaveManagement',
            'attendanceTracking',
            'shiftManagement',
            'payrollEngine',
            'benefitsManagement',
            'complianceTracking',
            'wpsPayroll',
            'aiAnalytics',
            'customReportBuilder',
            'erpIntegrations',
        ],
    },
];

export function PricingPlans() {
    const { t } = useTranslation('pricing');
    const router = useRouter();
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

    const formatPrice = (plan: (typeof plans)[0]) => {
        if (plan.price === null) return t('plans.enterprise.price');

        if (billingCycle === 'monthly') {
            return `$${plan.price} ${t('perEmployee')}`;
        }

        const yearlyPrice = (plan.price * 12 * 0.8).toFixed(1);
        return `$${yearlyPrice} ${t('perYear')}`;
    };

    return (
        <div className="mx-auto w-full container px-4 py-8">
            {/* Header Section */}
            <div className="mb-16 flex flex-col items-center justify-between gap-8 sm:flex-row sm:items-end pl-24">
                <div className="text-center sm:text-start rtl:sm:text-end">
                    <h1 className="text-[2rem] font-semibold tracking-tight card-foreground">
                        {t('title')}
                    </h1>
                    <p className="mt-2 text-[1rem] font-normal text-muted-foreground">
                        {t('subtitle')}
                    </p>
                </div>

                <div className="flex flex-col items-center gap-8 sm:items-end">
                    <div className="relative">
                        <div className="flex rounded-lg bg-muted p-1 [direction:ltr]">
                            <button
                                onClick={() => setBillingCycle('yearly')}
                                className={cn(
                                    'rounded-md px-12 py-1.5 text-[1rem] font-medium transition-all',
                                    billingCycle === 'yearly'
                                        ? 'bg-background text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                {t('yearly')}
                            </button>
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                className={cn(
                                    'rounded-md px-12 py-1.5 text-[1rem] font-medium transition-all',
                                    billingCycle === 'monthly'
                                        ? 'bg-background text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                {t('monthly')}
                            </button>
                        </div>
                        <p className="absolute inset-is-1 top-full mt-1 w-1/2 text-center text-xs font-medium text-foreground">
                            {t('saveNote')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-1 gap-px sm:grid-cols-4 sm:gap-0">
                {/* Features Column Label */}
                <div className="hidden sm:flex sm:flex-col sm:items-center pt-6">
                    {/* Features Header */}
                    <div className="h-40 border-b border-transparent pb-6 flex items-end justify-center w-full">
                        <span className="text-base font-semibold text-foreground">
                            {t('features')}
                        </span>
                    </div>

                    {/* Features List */}
                    <div className="flex flex-col items-center w-full">
                        {features.map((feature) => (
                            <div
                                key={feature}
                                className="h-12 flex items-center justify-center text-sm font-medium"
                            >
                                {t(`featureList.${feature}`)}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Plan Columns */}
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className="flex flex-col gap-6 border-border sm:border-is p-6"
                    >
                        {/* Plan Header */}
                        <div className="flex h-40 flex-col justify-between border-b border-border gap-4 pb-6 px-4 pt-4 sm:px-6">
                            <div className="rtl:text-end">
                                <h3 className="text-[1rem] font-semibold text-foreground">
                                    {t(`plans.${plan.id}.name`)}
                                </h3>
                                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                    {t(`plans.${plan.id}.description`)}
                                </p>
                            </div>
                            <div className="rtl:text-end">
                                <span className="text-[1.5rem] font-semibold text-card-foreground">
                                    {formatPrice(plan)}
                                </span>
                            </div>
                        </div>

                        {/* Features Rows (Mobile labels) */}
                        <div className="flex-1 px-4 sm:px-0 -my-6">
                            {features.map((feature) => (
                                <div
                                    key={feature}
                                    className="h-12 flex items-center justify-between sm:justify-center"
                                >
                                    {/* Mobile label */}
                                    <span className="text-sm font-medium text-foreground/80 sm:hidden">
                                        {t(`featureList.${feature}`)}
                                    </span>

                                    {/* Icon */}
                                    <div className="flex items-center justify-center w-full bg">
                                        {plan.includedFeatures.includes(feature) ? (
                                            <Check className="size-5 text-foreground/60" />
                                        ) : (
                                            <div className="size-5" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Plan Bottom CTA */}
                        <div className="mt-8 px-4 pb-8 sm:px-6">
                            <Button
                                variant={plan.id === 'enterprise' ? 'default' : 'outline'}
                                onClick={() => router.push('billing')}
                                className={cn(
                                    'h-11 w-full text-sm font-medium transition-colors sm:h-12 sm:text-sm',
                                    plan.id === 'enterprise'
                                        ? ''
                                        : 'border-transparent bg-muted text-foreground hover:bg-muted/80',
                                )}
                            >
                                {t('cta')}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
