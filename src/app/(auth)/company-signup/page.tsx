'use client';

import { useState, useTransition } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { PublicHeader } from '@/components/common/public-header';
import { FormField } from '@/components/ui/FormField';
import { FormSelect } from '@/components/ui/FormSelect';
import { PasswordField } from '@/components/ui/PasswordField';
import { PasswordRequirements } from '@/components/auth/password-requirements';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/common/language-switcher';
import {
    companySignupSchema,
    type CompanySignupFormValues,
} from '@/features/auth/schemas/company-signup-schema';
import { signupTenant } from '@/features/auth/auth.actions';
import { getSubscriptionPlans } from '@/features/subscription/subscription.actions';
import { type PlanType } from '@/features/subscription/subscription.types';

export default function CompanySignupPage() {
    const { t } = useTranslation('onboarding');
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [serverError, setServerError] = useState<string | null>(null);
    const [plans, setPlans] = useState<PlanType[]>([]);
    const [isLoadingPlans, setIsLoadingPlans] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const data = await getSubscriptionPlans();
                setPlans(data);
            } catch (err) {
                console.error('Failed to fetch subscription plans:', err);
            } finally {
                setIsLoadingPlans(false);
            }
        };
        fetchPlans();
    }, []);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<CompanySignupFormValues>({
        resolver: zodResolver(companySignupSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            companyName: '',
            email: '',
            password: '',
            confirmPassword: '',
            planId: '',
        },
    });

    const passwordValue = useWatch({ control, name: 'password', defaultValue: '' });

    const onSubmit = (data: CompanySignupFormValues) => {
        setServerError(null);
        startTransition(async () => {
            try {
                const result = await signupTenant({
                    email: data.email,
                    password: data.password,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    companyName: data.companyName,
                    planId: data.planId,
                });

                if (!result.success) {
                    setServerError(result.error);
                    return;
                }

                const response = result.data;
                
                if (response.checkoutUrl) {
                    router.push(response.checkoutUrl);
                } else if (response.requiresPayment && response.stripeSessionId) {
                    // Fallback or handle specific stripe session if needed, 
                    // but usually checkoutUrl is what we want.
                    // For now, if no checkoutUrl but requires payment, we might have an issue
                    // but the backend should provide checkoutUrl.
                    setServerError(t('errors.paymentConfigurationError'));
                } else {
                    localStorage.setItem('onboarding_email', data.email);
                    router.push('/verify-email');
                }
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : t('errors.passwordRequired');
                setServerError(msg);
            }
        });
    };

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <PublicHeader showLanguage={false} />
            <div className="flex-1 flex flex-col items-center py-[40px] px-0 gap-3 w-full">
                <div
                    className="box-border flex flex-col items-start py-6 px-0 gap-[32px] w-140 bg-card border border-border rounded-[12px]"
                    style={{
                        boxShadow:
                            '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px -1px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    <div className="flex flex-col items-start p-0 gap-6 w-140">
                        <div className="flex flex-row items-start px-6 py-0 gap-2 w-140">
                            <div className="flex flex-col items-start p-0 gap-2 w-lg">
                                <h1 className="w-lg h-5 font-semibold text-xl leading-[100%] text-foreground ">
                                    {t('title')}
                                </h1>
                                <p className="w-lg font-normal text-sm leading-5 text-muted-foreground ">
                                    {t('subtitle')}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col items-start px-6 py-0 gap-2 w-140">
                            {serverError && (
                                <div
                                    role="alert"
                                    className="w-lg rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 mb-2 text-sm text-destructive"
                                >
                                    {serverError}
                                </div>
                            )}
                            <form
                                onSubmit={handleSubmit(onSubmit)}
                                className="flex flex-col items-end px-2 py-0 gap-[32px] w-lg"
                            >
                                <div className="flex flex-col items-start p-0 gap-6 w-124">
                                    <div className="grid grid-cols-2 gap-4 w-124">
                                        <FormField
                                            id="firstName"
                                            name="firstName"
                                            label={t('firstName')}
                                            placeholder={t('firstNamePlaceholder')}
                                            register={register}
                                            error={errors.firstName}
                                            t={t}
                                        />
                                        <FormField
                                            id="lastName"
                                            name="lastName"
                                            label={t('lastName')}
                                            placeholder={t('lastNamePlaceholder')}
                                            register={register}
                                            error={errors.lastName}
                                            t={t}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 w-124">
                                        <FormField
                                            id="companyName"
                                            name="companyName"
                                            label={t('companyName')}
                                            placeholder={t('companyNamePlaceholder')}
                                            register={register}
                                            error={errors.companyName}
                                            t={t}
                                        />
                                        <FormField
                                            id="email"
                                            name="email"
                                            label={t('email')}
                                            placeholder={t('emailPlaceholder')}
                                            type="email"
                                            register={register}
                                            error={errors.email}
                                            t={t}
                                        />
                                    </div>

                                    <div className="w-124">
                                        <FormSelect
                                            id="planId"
                                            name="planId"
                                            label={t('plan')}
                                            placeholder={
                                                isLoadingPlans
                                                    ? t('loadingPlans')
                                                    : t('planPlaceholder')
                                            }
                                            control={control}
                                            options={plans.map((p) => ({
                                                label: `${p.name} - ${p.price} ${p.currency}`,
                                                value: p.id,
                                            }))}
                                            error={errors.planId}
                                            t={t}
                                        />
                                    </div>

                                    <div className="flex flex-col items-start p-0 gap-4 w-124">
                                        <div className="w-124">
                                            <PasswordField
                                                id="password"
                                                name="password"
                                                label={t('password')}
                                                register={register}
                                                error={errors.password}
                                                t={t}
                                            />
                                        </div>
                                        <div className="">
                                            <PasswordRequirements password={passwordValue} />
                                        </div>
                                    </div>

                                    <div className="w-124">
                                        <PasswordField
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            label={t('confirmPassword')}
                                            register={register}
                                            error={errors.confirmPassword}
                                            t={t}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col justify-center items-start p-0 gap-4 w-124">
                                    <Button
                                        id="company-signup-submit-btn"
                                        type="submit"
                                        disabled={isPending}
                                        className="w-124 h-9 bg-primary hover:bg-primary/90 text-primary-foreground rounded-[8px] flex flex-row justify-center items-center py-2 px-4 gap-2"
                                    >
                                        <span className=" font-medium text-sm leading-5 flex items-center">
                                            {isPending ? t('submitting') : t('submit')}
                                        </span>
                                    </Button>

                                    <div className="w-124 flex justify-center items-center gap-1">
                                        <span className="text-sm text-foreground/70">
                                            {t('alreadyHaveAccount')}
                                        </span>
                                        <Link
                                            href="/login"
                                            className="text-sm text-primary font-medium underline"
                                        >
                                            {t('logIn')}
                                        </Link>
                                    </div>

                                    <div className="w-124 font-normal text-sm leading-5 text-foreground/70">
                                        {t('termsText')}{' '}
                                        <Link
                                            href="/terms"
                                            className="text-primary underline hover:text-primary/80 transition-colors"
                                        >
                                            {t('termsLink')}
                                        </Link>{' '}
                                        {t('privacyText')}{' '}
                                        <Link
                                            href="/privacy"
                                            className="text-primary underline hover:text-primary/80 transition-colors"
                                        >
                                            {t('privacyLink')}
                                        </Link>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="flex flex-row justify-end items-start p-0 gap-2 w-140">
                    <div className="box-border flex flex-row justify-center items-center py-1 px-0 gap-2 w-auto max-w-43.75 h-9 bg-transparent rounded-[8px]">
                        <LanguageSwitcher />
                    </div>
                </div>
            </div>
        </div>
    );
}
