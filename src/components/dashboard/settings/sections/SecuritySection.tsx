'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/FormField';
import { PasswordField } from '@/components/ui/PasswordField';
import { useTranslation } from 'react-i18next';
import { Loader2, Monitor, Smartphone, Globe } from 'lucide-react';
import { SectionLayout } from '../SectionLayout';
import { SessionsListSkeleton } from '../SettingsSectionSkeleton';
import {
    useChangePassword,
    useProfile,
    useRevokeSession,
    useUserSessions,
} from '@/features/auth/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { getUserFacingErrorMessage } from '@/lib/parse-api-error';

const accountDisplaySchema = z.object({
    accountEmail: z.string(),
    passwordPlaceholder: z.string(),
});

const passwordSchema = z
    .object({
        currentPassword: z.string().min(1, 'required'),
        newPassword: z.string().min(8, 'password_min_length'),
        confirmPassword: z.string().min(1, 'required'),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
        message: 'passwords_do_not_match',
        path: ['confirmPassword'],
    });

type AccountDisplayValues = z.infer<typeof accountDisplaySchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

function getSessionIcon(userAgent?: string | null) {
    const ua = userAgent?.toLowerCase() ?? '';
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
        return Smartphone;
    }
    if (ua.includes('mac') || ua.includes('windows') || ua.includes('linux')) {
        return Monitor;
    }
    return Globe;
}

function formatSessionTime(value: string) {
    const date = new Date(value);
    const now = new Date();
    const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

    if (isToday) {
        return new Intl.DateTimeFormat(undefined, {
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    }

    return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: '2-digit',
    }).format(date);
}

export function SecuritySection() {
    const { t } = useTranslation('settings');
    const { toast } = useToast();
    const { data: profile } = useProfile();
    const changePasswordMutation = useChangePassword();
    const revokeSessionMutation = useRevokeSession();
    const {
        data: sessions,
        isLoading: sessionsLoading,
        isError: sessionsError,
    } = useUserSessions(profile?.id ?? '');
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);

    const { register: registerAccount, reset: resetAccount } = useForm<AccountDisplayValues>({
        resolver: zodResolver(accountDisplaySchema) as never,
        defaultValues: { accountEmail: '', passwordPlaceholder: '**********' },
    });

    const {
        register: registerPassword,
        handleSubmit: handlePasswordSubmit,
        reset: resetPassword,
        formState: { errors: passwordErrors },
    } = useForm<PasswordValues>({
        resolver: zodResolver(passwordSchema) as never,
    });

    useEffect(() => {
        resetAccount({
            accountEmail: profile?.email ?? '',
            passwordPlaceholder: '**********',
        });
    }, [profile?.email, resetAccount]);

    const onPasswordSubmit = async (data: PasswordValues) => {
        try {
            await changePasswordMutation.mutateAsync({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            });

            toast({
                title: t('success.title'),
                description: t('security.passwordUpdated'),
            });

            resetPassword();
            setShowPasswordForm(false);
        } catch (error: unknown) {
            toast({
                variant: 'destructive',
                title: t('errors.title'),
                description: getUserFacingErrorMessage(error, t('errors.saveFailed')),
            });
        }
    };

    const handleRevokeSession = async (sessionId: string) => {
        setRevokingSessionId(sessionId);

        try {
            await revokeSessionMutation.mutateAsync(sessionId);

            toast({
                title: t('success.title'),
                description: t('security.sessionRevoked', 'Session revoked successfully.'),
            });
        } catch (error: unknown) {
            toast({
                variant: 'destructive',
                title: t('errors.title'),
                description: getUserFacingErrorMessage(error, t('security.revokeSessionFailed', 'Failed to revoke session.')),
            });
        } finally {
            setRevokingSessionId(null);
        }
    };

    return (
        <SectionLayout
            title={t('security.title', 'Security')}
            description={t('security.description', 'Manage personal account access and system security.')}
        >
            <div className="flex flex-col gap-5">
                <h3 className="text-sm font-semibold text-foreground">
                    {t('security.accountSecurity', 'Account security')}
                </h3>

                <div className="max-w-xl">
                    <FormField
                        id="accountEmail"
                        label={t('security.accountEmail', 'Account email')}
                        register={registerAccount}
                        name="accountEmail"
                        type="email"
                        readOnly
                        t={t}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        {t(
                            'security.accountEmailHint',
                            'The email you use to sign in. Organization contact email is managed in General settings.',
                        )}
                    </p>
                </div>

                <div className="max-w-xl">
                    {!showPasswordForm ? (
                        <div className="flex items-end gap-2">
                            <div className="flex-1">
                                <FormField
                                    id="passwordPlaceholder"
                                    label={t('security.password', 'Password')}
                                    register={registerAccount}
                                    name="passwordPlaceholder"
                                    type="password"
                                    readOnly
                                    t={t}
                                />
                            </div>
                            <Button
                                variant="outline"
                                className="shrink-0 h-9 px-4 text-sm mb-0.5"
                                onClick={() => setShowPasswordForm(true)}
                            >
                                {t('security.change', 'Change')}
                            </Button>
                        </div>
                    ) : (
                        <form
                            onSubmit={handlePasswordSubmit(onPasswordSubmit)}
                            className="flex flex-col gap-4 p-4 rounded-xl border border-border bg-muted/20"
                        >
                            <PasswordField
                                id="currentPassword"
                                label={t('security.currentPassword', 'Current password')}
                                name="currentPassword"
                                register={registerPassword}
                                error={passwordErrors.currentPassword}
                                t={t}
                            />
                            <PasswordField
                                id="newPassword"
                                label={t('security.newPassword', 'New password')}
                                name="newPassword"
                                register={registerPassword}
                                error={passwordErrors.newPassword}
                                t={t}
                            />
                            <PasswordField
                                id="confirmPassword"
                                label={t('security.confirmPassword', 'Confirm new password')}
                                name="confirmPassword"
                                register={registerPassword}
                                error={passwordErrors.confirmPassword}
                                t={t}
                            />
                            <div className="flex gap-2 pt-1">
                                <Button
                                    type="submit"
                                    disabled={changePasswordMutation.isPending}
                                    className="bg-primary hover:bg-primary/90 text-white h-9 px-5 rounded-lg text-sm"
                                >
                                    {changePasswordMutation.isPending && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    {t('security.updatePassword', 'Update password')}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-9 px-4 text-sm rounded-lg"
                                    onClick={() => {
                                        resetPassword();
                                        setShowPasswordForm(false);
                                    }}
                                >
                                    {t('security.cancel', 'Cancel')}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            <div className="border-t border-border" />

            <div className="flex flex-col gap-3">
                <div>
                    <h3 className="text-sm font-semibold text-foreground">
                        {t('security.activeSessions', 'Active sessions')}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {t('security.activeSessionsDesc', 'List of active devices/sessions.')}
                    </p>
                </div>
                <div className="flex flex-col gap-0">
                    {sessionsLoading && <SessionsListSkeleton />}
                    {sessionsError && !sessionsLoading && (
                        <p className="text-sm text-destructive py-2">
                            {t('security.sessionsLoadFailed', 'Failed to load active sessions.')}
                        </p>
                    )}
                    {!sessionsLoading && !sessionsError && (sessions ?? []).map((session) => {
                        const Icon = getSessionIcon(session.userAgent ?? session.deviceInfo);
                        const deviceLabel =
                            session.deviceInfo ??
                            session.userAgent ??
                            t('security.unknownDevice', 'Unknown device');
                        const locationLabel = session.ipAddress ?? '—';
                        const isRevoking = revokingSessionId === session.sessionId;

                        return (
                            <div
                                key={session.sessionId}
                                className="flex items-center gap-4 py-2.5 border-b border-border last:border-0"
                            >
                                <Icon className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
                                <span className="text-sm text-foreground flex-1 truncate">{deviceLabel}</span>
                                <span className="text-sm text-muted-foreground shrink-0">{locationLabel}</span>
                                <span className="text-sm text-muted-foreground w-20 text-right shrink-0">
                                    {formatSessionTime(session.lastActivity)}
                                </span>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 shrink-0 px-3 text-xs"
                                    disabled={isRevoking}
                                    onClick={() => handleRevokeSession(session.sessionId)}
                                >
                                    {isRevoking && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                                    {t('security.revokeSession', 'Revoke')}
                                </Button>
                            </div>
                        );
                    })}
                    {!sessionsLoading && !sessionsError && (sessions ?? []).length === 0 && (
                        <p className="text-sm text-muted-foreground py-2">
                            {t('security.noActiveSessions', 'No active sessions found.')}
                        </p>
                    )}
                </div>
            </div>
        </SectionLayout>
    );
}
