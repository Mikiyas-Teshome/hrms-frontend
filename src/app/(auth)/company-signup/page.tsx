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
import { Card } from '@/components/ui/card';
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
        <div className="flex min-h-screen flex-col bg-background">
            <PublicHeader showLanguage={false} />
            <div className="flex flex-1 flex-col items-center p-2 sm:p-4">
                <div className="flex w-full max-w-140 flex-col items-end gap-3">
                    <Card className="w-full p-4 sm:p-8 gap-8 rounded-[12px] border border-border">
                        <div className="space-y-2 text-center sm:text-start">
                            <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
                                {t('title')}
                            </h1>
                            <p className="text-sm leading-5 text-muted-foreground">
                                {t('subtitle')}
                            </p>
                        </div>

                        {serverError && (
                            <div
                                role="alert"
                                className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                            >
                                {serverError}
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="flex w-full flex-col gap-8"
                        >
                            <div className="flex w-full flex-col gap-6">
                                <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
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

                                <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
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

                                <FormSelect
                                    id="planId"
                                    name="planId"
                                    label={t('plan')}
                                    placeholder={
                                        isLoadingPlans ? t('loadingPlans') : t('planPlaceholder')
                                    }
                                    control={control}
                                    options={plans.map((p) => ({
                                        label: `${p.name} - ${p.price} ${p.currency}`,
                                        value: p.id,
                                    }))}
                                    error={errors.planId}
                                    t={t}
                                />

                                <div className="flex w-full flex-col gap-4">
                                    <PasswordField
                                        id="password"
                                        name="password"
                                        label={t('password')}
                                        register={register}
                                        error={errors.password}
                                        t={t}
                                    />
                                    <PasswordRequirements password={passwordValue} />
                                </div>

                                <PasswordField
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    label={t('confirmPassword')}
                                    register={register}
                                    error={errors.confirmPassword}
                                    t={t}
                                />
                            </div>

                            <div className="flex w-full flex-col gap-4">
                                <Button
                                    id="company-signup-submit-btn"
                                    type="submit"
                                    disabled={isPending}
                                    className="h-9 w-full rounded-[8px] bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                    {isPending ? t('submitting') : t('submit')}
                                </Button>

                                <div className="flex flex-wrap items-center justify-center gap-1 sm:justify-start">
                                    <span className="text-sm text-foreground/70">
                                        {t('alreadyHaveAccount')}
                                    </span>
                                    <Link
                                        href="/login"
                                        className="text-sm font-medium text-primary underline"
                                    >
                                        {t('logIn')}
                                    </Link>
                                </div>

                                <p className="text-center text-sm leading-5 text-foreground/70 sm:text-start">
                                    {t('termsText')}{' '}
                                    <Link
                                        href="/terms?returnTo=/company-signup"
                                        className="text-primary underline hover:text-primary/80 transition-colors"
                                    >
                                        {t('termsLink')}
                                    </Link>{' '}
                                    {t('privacyText')}{' '}
                                    <Link
                                        href="/privacy?returnTo=/company-signup"
                                        className="text-primary underline hover:text-primary/80 transition-colors"
                                    >
                                        {t('privacyLink')}
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </Card>

                    <div className="flex w-full justify-end">
                        <LanguageSwitcher />
                    </div>
                </div>
            </div>
        </div>
    );
}
