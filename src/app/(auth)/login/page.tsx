'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { FormField } from '@/components/ui/FormField';
import { PasswordField } from '@/components/ui/PasswordField';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { PublicHeader } from '@/components/common/public-header';
import { LanguageSwitcher } from '@/components/common/language-switcher';
import { loginUser } from '@/features/auth/auth.actions';
import { LoginFormValues, loginSchema } from '@/features/auth/schemas/login-schema';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { AUTH_PROFILE_QUERY_KEY } from '@/features/auth/auth-session.constants';
import { writeAuthSessionCache } from '@/features/auth/auth-session-cache.util';
import { resolvePostAuthPath } from '@/lib/onboarding/navigation';

const LoginPage = () => {
    const { t } = useTranslation('login');
    const router = useRouter();
    const queryClient = useQueryClient();
    const { reloadSession, setUser } = useAuth();
    const [isPending, startTransition] = useTransition();
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '', remember: false },
    });

    const onSubmit = (data: LoginFormValues) => {
        setServerError(null);

        startTransition(async () => {
            try {
                const result = await loginUser({
                    identifier: data.email,
                    password: data.password,
                });

                if (!result.success) {
                    setServerError(result.error);
                    return;
                }

                if (result.data.requires2FA === true) {
                    router.push('/verify-email');
                    return;
                }

                if (result.data.user) {
                    setUser(result.data.user);
                    writeAuthSessionCache(result.data.user);
                }

                await reloadSession();

                const sessionUser =
                    queryClient.getQueryData<{ role: string; onboardingComplete: boolean; onboardingStep: number }>(
                        AUTH_PROFILE_QUERY_KEY,
                    ) ?? result.data.user;
                const destination = sessionUser
                    ? resolvePostAuthPath(sessionUser)
                    : '/dashboard';
                router.push(destination);
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : t('loginError', 'Login failed. Please try again.');

                setServerError(message);
            }
        });
    };

    return (
        <div className="flex flex-col min-h-screen">
            <PublicHeader showLanguage={false} />

            <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4">
                <div className="w-full max-w-120 flex flex-col items-end gap-3">
                    <Card className="w-full p-8 gap-8 rounded-[12px] shadow-sm border border-border">
                        <div className="space-y-2 text-center sm:text-start">
                            <h2 className="font-bold text-2xl text-card-foreground">
                                {t('title', 'Login to HRMS workspace')}
                            </h2>
                            <p className="font-normal text-sm text-muted-foreground">
                                {t(
                                    'subtitle',
                                    'Enter your information below to login to your HRMS workspace',
                                )}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                            {serverError && (
                                <div
                                    role="alert"
                                    className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive"
                                >
                                    {serverError}
                                </div>
                            )}

                            <div className="space-y-6">
                                <FormField
                                    id="email"
                                    name="email"
                                    label={t('emailLabel', 'Email or phone number')}
                                    placeholder={t('emailPlaceholder', 'Add email or phone no.')}
                                    register={register}
                                    error={errors.email}
                                    t={t}
                                />
                                <div className="relative">
                                    <div className="absolute right-0 top-0 rtl:left-0 rtl:right-auto text-sm z-10 pt-0.5">
                                        <Link
                                            href="/forgot-password"
                                            className="text-foreground hover:underline text-sm font-medium"
                                        >
                                            {t('forgotPassword', 'Forgot your password?')}
                                        </Link>
                                    </div>
                                    <PasswordField
                                        id="password"
                                        name="password"
                                        label={t('passwordLabel', 'Password')}
                                        register={register}
                                        error={errors.password}
                                        t={t}
                                    />
                                </div>
                                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                    <Checkbox id="remember" {...register('remember')} />
                                    <label
                                        htmlFor="remember"
                                        className="text-sm font-medium leading-none cursor-pointer"
                                    >
                                        {t('rememberMe', 'Remember me')}
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <Button
                                    id="login-submit-btn"
                                    type="submit"
                                    disabled={isPending}
                                    className="w-full text-white h-9 text-sm leading-5 cursor-pointer"
                                >
                                    {isPending
                                        ? t('loggingIn', 'Logging in…')
                                        : t('loginButton', 'Login')}
                                </Button>

                                <div className="text-center text-sm leading-6 text-foreground">
                                    {t('noAccount', "Still don't have a workspace?")}{' '}
                                    <Link
                                        href="/company-signup"
                                        className="text-primary hover:underline font-medium"
                                    >
                                        {t('createAccount', 'Create account')}
                                    </Link>
                                </div>
                            </div>
                        </form>
                    </Card>

                    <LanguageSwitcher />
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
