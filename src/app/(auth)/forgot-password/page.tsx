'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Card } from '@/components/ui/card';
import { FormField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/common/language-switcher';
import { PublicHeader } from '@/components/common/public-header';
import { forgotPassword } from '@/features/auth/auth.actions';
import { useToast } from '@/hooks/use-toast';

const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address').min(1, 'Email is required'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage = () => {
    const { t } = useTranslation('forgotPassword');
    const router = useRouter();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: '' },
    });

    const onSubmit = (data: ForgotPasswordValues) => {
        setServerError(null);

        startTransition(async () => {
            try {
                const result = await forgotPassword({ email: data.email });
                if (result.success) {
                    toast({
                        title: t('successTitle', 'Email Sent'),
                        description: t('successMessage', 'Password reset code sent!'),
                    });
                    localStorage.setItem('resetEmail', data.email);
                    router.push('/reset-password');
                } else {
                    setServerError(result.error);
                }
            } catch {
                setServerError(t('error', 'An unexpected error occurred.'));
            }
        });
    };

    return (
        <div className="flex flex-col min-h-screen">
            <PublicHeader showLanguage={false} />

            <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4">
                <div className="w-full max-w-120 flex flex-col items-end gap-3">
                    <Card className="w-full p-4 sm:p-8 gap-8 rounded-[12px] shadow-sm border border-border">
                        <div className="space-y-2 text-center sm:text-start">
                            <h2 className="font-bold text-xl sm:text-2xl text-card-foreground">
                                {t('title', 'Forgot your password?')}
                            </h2>
                            <p className="font-normal text-sm text-muted-foreground">
                                {t(
                                    'subtitle',
                                    'Enter your email address and we will send you a 6-digit code to reset your password.',
                                )}
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

                            <FormField
                                id="email"
                                name="email"
                                label={t('emailLabel', 'Email address')}
                                placeholder={t('emailPlaceholder', 'Enter your email')}
                                register={register}
                                error={errors.email}
                                t={t}
                            />

                            <div className="space-y-6">
                                <Button
                                    type="submit"
                                    disabled={isPending}
                                    className="w-full text-white h-9 text-sm leading-5 cursor-pointer"
                                >
                                    {isPending
                                        ? t('sending', 'Sending code...')
                                        : t('sendLink', 'Send reset code')}
                                </Button>

                                <div className="text-center text-sm leading-6 text-foreground">
                                    <Link
                                        href="/login"
                                        className="text-primary hover:underline font-medium"
                                    >
                                        {t('backToLogin', 'Back to login')}
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

export default ForgotPasswordPage;
