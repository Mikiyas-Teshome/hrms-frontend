'use client';

import { useEffect } from 'react';
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

    // Step State

    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: { errors, isSubmitting },
    } = useForm<ManagerSignupFormValues>({
        resolver: zodResolver(managerSignupSchema),
        defaultValues: {
            // firstName: '',
            // lastName: '',
            email: email || '',
            phoneNumber: '',
            password: '',
            confirmPassword: '',
        },
    });

    // Auto-fill email from URL param whenever it changes
    useEffect(() => {
        if (email) {
            setValue('email', email);
        }
    }, [email, setValue]);

    const watchedEmail = useWatch({ control, name: 'email' });
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
            await queryClient.invalidateQueries({ queryKey: ['employee', 'profile'] });

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
        <div className="flex w-full max-w-140 flex-col items-center space-y-6 bg-card border border-border p-6 md:p-8 rounded-[32px]">
            <div className="space-y-3 text-center w-full">
                <h2 className="text-3xl font-black leading-tight tracking-tight text-foreground">
                    {t('staffSignup:formTitle')}
                </h2>
                <p className="text-muted-foreground font-medium">
                    {t('staffSignup:formSubtitle')}
                </p>
            </div>

            {/* Auto-filled info pills */}
            <div className="flex flex-col items-center gap-3 w-full">
                {watchedEmail && (
                    <div className="flex items-center gap-3 rounded-full bg-muted/50 border border-border px-4 py-1.5 shadow-sm">
                        <div className="flex items-center justify-center size-8 rounded-full bg-primary/20">
                            <User className="size-4 text-primary" />
                        </div>
                        <span className="text-[16px] font-normal text-foreground">
                            {watchedEmail}
                        </span>
                    </div>
                )}
                {watchedPhoneNumber && (
                    <div className="flex items-center gap-3 rounded-full bg-muted/50 border border-border px-4 py-1.5 shadow-sm">
                        <div className="flex items-center justify-center size-8 rounded-full bg-primary/20">
                            <Phone className="size-4 text-primary" />
                        </div>
                        <span className="text-[16px] font-normal text-foreground">
                            {watchedPhoneNumber}
                        </span>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 w-full">
 
                <FormField
                    id="email"
                    label={t('onboarding:email')}
                    name="email"
                    type="email"
                    register={register}
                    error={errors.email}
                    placeholder={t('onboarding:emailPlaceholder')}
                    t={(key) => t(`onboarding:${key}`)}
                    readOnly={!!email}
                />

                <div className="space-y-2">
                    <PasswordField
                        id="password"
                        label={t('staffSignup:password')}
                        name="password"
                        register={register}
                        error={errors.password}
                        t={(key) => t(`onboarding:${key}`)}
                    />
                    <p className="text-xs font-medium text-muted-foreground ml-1">{t('staffSignup:passwordHint')}</p>
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

            <div className="text-center text-[11px] font-medium text-muted-foreground leading-relaxed px-4">
                <p>
                    {t('staffSignup:termsText')}{' '}
                    <Link href="/terms" className="text-primary hover:underline font-bold">
                        {t('staffSignup:termsLink')}
                    </Link>{' '}
                    {t('staffSignup:privacyText')}{' '}
                    <Link href="/privacy" className="text-primary hover:underline font-bold">
                        {t('staffSignup:privacyLink')}
                    </Link>
                </p>
            </div>
        </div>
    );
}
