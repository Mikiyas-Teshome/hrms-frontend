'use client';

import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Phone, User, Loader2 } from 'lucide-react';
import { PasswordField } from '@/components/ui/PasswordField';
import Link from 'next/link';
import { Button } from '../ui/button';
import {
    managerSignupSchema,
    type ManagerSignupFormValues,
} from '../onboarding/schemas/manager-signup-schema';
import { useRegisterTenantSuperAdmin } from '@/features/auth/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

import { FormField } from '@/components/ui/FormField';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
interface ManagerSignupFormProps {
    onSignupSuccess?: () => void;
    onSuccess?: () => void;
    token?: string;
    email?: string;
}

export function ManagerSignupForm({ onSignupSuccess, token, email }: ManagerSignupFormProps) {
    const { t } = useTranslation(['staffSignup', 'onboarding', 'common']);
    const { toast } = useToast();
    const registerMutation = useRegisterTenantSuperAdmin();
    const searchParams = useSearchParams();

    const returnTo = useMemo(() => {
        const query = searchParams.toString();
        return query ? `/onboard?${query}` : '/onboard';
    }, [searchParams]);

    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: { errors, isSubmitting },
    } = useForm<ManagerSignupFormValues>({
        resolver: zodResolver(managerSignupSchema),
        defaultValues: {
            email: email || '',
            phoneNumber: '',
            password: '',
            confirmPassword: '',
        },
    });

    useEffect(() => {
        if (email) {
            setValue('email', email);
        }
    }, [email, setValue]);

    const watchedPhoneNumber = useWatch({ control, name: 'phoneNumber' });

    const { reloadSession } = useAuth();
    const queryClient = useQueryClient();

    const onSubmit = async (data: ManagerSignupFormValues) => {
        try {
            await registerMutation.mutateAsync({
                email: data.email || email || '',
                password: data.password,
                invitationToken: token || '',
            });

            await reloadSession();
            await queryClient.invalidateQueries({ queryKey: ['myEmployee'] });

            toast({
                title: t('staffSignup:accountCreatedTitle', { defaultValue: 'Account created!' }),
                description: t('staffSignup:accountCreatedDesc', { defaultValue: 'Now, let\'s complete your profile.' }),
            });
            if (onSignupSuccess) {
                onSignupSuccess();
            }
        } catch (error: any) {
            console.error('[StaffSignup] Registration failed:', error);
            toast({
                title: t('staffSignup:registrationFailedTitle', { defaultValue: 'Registration failed' }),
                description: error.message || t('staffSignup:registrationFailedDesc', { defaultValue: 'Something went wrong. Please try again.' }),
                variant: 'destructive',
            });
        }
    };


    return (
        <div className="flex w-full max-w-140 flex-col gap-6">
            <div className="flex w-full flex-col gap-2 text-start">
                <h2 className="text-xl font-semibold text-foreground">
                    {t('staffSignup:formTitle')}
                </h2>
                <p className="text-sm leading-5 text-muted-foreground">
                    {t('staffSignup:formSubtitle')}
                </p>
            </div>

            {(email || watchedPhoneNumber) && (
                <div className="flex w-full flex-col gap-2">
                    {email && (
                        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
                            <User className="size-4 shrink-0 text-muted-foreground" />
                            <span className="truncate text-sm text-foreground">{email}</span>
                        </div>
                    )}
                    {watchedPhoneNumber && (
                        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
                            <Phone className="size-4 shrink-0 text-muted-foreground" />
                            <span className="text-sm text-foreground">{watchedPhoneNumber}</span>
                        </div>
                    )}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-6">

                {email ? (
                    <input type="hidden" {...register('email')} />
                ) : (
                    <FormField
                        id="email"
                        label={t('onboarding:email')}
                        name="email"
                        type="email"
                        register={register}
                        error={errors.email}
                        placeholder={t('onboarding:emailPlaceholder')}
                        t={(key) => t(`onboarding:${key}`)}
                    />
                )}

                <div className="space-y-2">
                    <PasswordField
                        id="password"
                        label={t('staffSignup:password')}
                        name="password"
                        register={register}
                        error={errors.password}
                        t={(key) => t(`onboarding:${key}`)}
                    />
                    <p className="text-xs text-muted-foreground">{t('staffSignup:passwordHint')}</p>
                </div>

                <PasswordField
                    id="confirmPassword"
                    label={t('staffSignup:confirmPassword')}
                    name="confirmPassword"
                    register={register}
                    error={errors.confirmPassword}
                    t={(key) => t(`onboarding:${key}`)}
                />

                <Button
                    type="submit"
                    disabled={isSubmitting || registerMutation.isPending}
                    className="h-9 w-full"
                >
                    {(isSubmitting || registerMutation.isPending) ? (
                        <Loader2 className="size-5 animate-spin" />
                    ) : (
                        t('staffSignup:submitButton')
                    )}
                </Button>
            </form>

            <p className="text-sm leading-5 text-foreground/70">
                {t('staffSignup:termsText')}{' '}
                <Link
                    href={`/terms?returnTo=${encodeURIComponent(returnTo)}`}
                    className="font-medium text-primary underline hover:text-primary/80"
                >
                    {t('staffSignup:termsLink')}
                </Link>{' '}
                {t('staffSignup:privacyText')}{' '}
                <Link
                    href={`/privacy?returnTo=${encodeURIComponent(returnTo)}`}
                    className="font-medium text-primary underline hover:text-primary/80"
                >
                    {t('staffSignup:privacyLink')}
                </Link>
            </p>
        </div>
    );
}
