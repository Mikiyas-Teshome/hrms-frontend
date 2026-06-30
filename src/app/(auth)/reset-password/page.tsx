'use client';

import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { Card } from '@/components/ui/card';
import { PasswordField } from '@/components/ui/PasswordField';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { LanguageSwitcher } from '@/components/common/language-switcher';
import { PublicHeader } from '@/components/common/public-header';
import { resetPassword } from '@/features/auth/auth.actions';
import { useToast } from '@/hooks/use-toast';

const resetPasswordSchema = z
    .object({
        email: z.string().email('Invalid email address').min(1, 'Email is required'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

const ResetPasswordForm = () => {
    const { t } = useTranslation('resetPassword');
    const router = useRouter();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [serverError, setServerError] = useState<string | null>(null);
    const [otp, setOtp] = useState('');

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<ResetPasswordValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { email: '', password: '', confirmPassword: '' },
    });

    useEffect(() => {
        const storedEmail = localStorage.getItem('resetEmail');
        if (storedEmail) {
            setValue('email', storedEmail);
        }
    }, [setValue]);

    const onSubmit = (data: ResetPasswordValues) => {
        setServerError(null);

        if (otp.length !== 6) {
            setServerError(t('otpRequired', 'Please enter the 6-digit code from your email.'));
            return;
        }

        startTransition(async () => {
            try {
                const result = await resetPassword({
                    email: data.email,
                    token: otp,
                    newPassword: data.password,
                });

                if (result.success) {
                    toast({
                        title: t('successTitle', 'Success'),
                        description: t(
                            'successMessage',
                            'Password reset successfully! Redirecting to login...',
                        ),
                    });
                    localStorage.removeItem('resetEmail');
                    router.push('/login');
                } else {
                    setServerError(result.error);
                }
            } catch {
                setServerError(t('error', 'An unexpected error occurred.'));
            }
        });
    };

    return (
        <Card className="w-full p-8 gap-8 rounded-[12px] shadow-sm border border-border">
            <div className="space-y-2 text-center sm:text-start">
                <h2 className="font-bold text-xl sm:text-2xl text-card-foreground">
                    {t('title', 'Reset your password')}
                </h2>
                <p className="font-normal text-sm text-muted-foreground">
                    {t('subtitle', 'Enter the 6-digit code sent to your email and choose a new password.')}
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 mt-3 sm:mt-8">
                {serverError && (
                    <div
                        role="alert"
                        className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive"
                    >
                        {serverError}
                    </div>
                )}

                <div className="space-y-6">
                    <div className="space-y-3">
                        <label
                            htmlFor="email"
                            className="text-sm font-medium leading-5 text-foreground block"
                        >
                            {t('emailLabel', 'Email address')}
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder={t('emailPlaceholder', 'Enter your email')}
                            {...register('email')}
                            className={`h-9 w-full rounded-lg px-4 py-2 bg-background border border-input focus:border-primary focus:ring-primary/20 text-start ${
                                errors.email
                                    ? 'border-destructive focus-visible:ring-destructive'
                                    : ''
                            }`}
                        />
                        {errors.email && (
                            <p className="text-xs text-destructive rtl:text-end">
                                {errors.email.message &&
                                    (errors.email.message.includes(' ')
                                        ? errors.email.message
                                        : t(`errors.${errors.email.message}`))}
                            </p>
                        )}
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-semibold leading-none text-foreground block rtl:text-end">
                            {t('otpLabel', 'Verification code')}
                        </label>
                        <div className="flex h-16 w-full items-center justify-center sm:justify-start">
                            <InputOTP
                                maxLength={6}
                                value={otp}
                                onChange={setOtp}
                                containerClassName="gap-2"
                            >
                                <InputOTPGroup className="gap-2 rtl:flex-row-reverse">
                                    <InputOTPSlot index={0} className="sm:size-14" />
                                    <InputOTPSlot index={1} className="sm:size-14" />
                                    <InputOTPSlot index={2} className="sm:size-14" />
                                    <InputOTPSlot index={3} className="sm:size-14" />
                                    <InputOTPSlot index={4} className="sm:size-14" />
                                    <InputOTPSlot index={5} className="sm:size-14" />
                                </InputOTPGroup>
                            </InputOTP>
                        </div>
                        <p className="text-xs text-muted-foreground rtl:text-end">
                            {t('otpHint', 'Enter the 6-digit code sent to your email.')}
                        </p>
                    </div>

                    <PasswordField
                        id="password"
                        name="password"
                        label={t('newPasswordLabel', 'New Password')}
                        register={register}
                        error={errors.password}
                        t={t}
                    />
                    <PasswordField
                        id="confirmPassword"
                        name="confirmPassword"
                        label={t('confirmPasswordLabel', 'Confirm New Password')}
                        register={register}
                        error={errors.confirmPassword}
                        t={t}
                    />
                </div>

                <div className="space-y-6">
                    <Button
                        type="submit"
                        disabled={isPending || otp.length !== 6}
                        className="w-full text-white h-9 text-sm leading-5 cursor-pointer"
                    >
                        {isPending
                            ? t('resetting', 'Resetting...')
                            : t('resetButton', 'Reset Password')}
                    </Button>

                    <div className="text-center text-sm leading-6 text-foreground">
                        <Link href="/forgot-password" className="text-primary hover:underline font-medium">
                            {t('requestNewCode', 'Request a new code')}
                        </Link>
                    </div>
                </div>
            </form>
        </Card>
    );
};

const ResetPasswordPage = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <PublicHeader showLanguage={false} />

            <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4">
                <div className="w-full max-w-120 flex flex-col items-end gap-3">
                    <ResetPasswordForm />
                    <LanguageSwitcher />
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
