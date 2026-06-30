'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { TenantSuperAdminRegistrationForm } from '@/components/auth/tenant-super-admin-registration-form';
import { PublicHeader } from '@/components/common/public-header';
import { useInvitationOnboardContext } from '@/features/auth/hooks/useInvitationOnboardContext';

function RegisterContent() {
    const { t } = useTranslation('onboarding');
    const searchParams = useSearchParams();
    const token = searchParams.get('token') || '';
    const email = searchParams.get('email') || '';
    const tenantId = searchParams.get('tenantId') || '';

    const { data: context, isLoading, isError } = useInvitationOnboardContext(
        token,
        tenantId || undefined,
    );

    if (!token) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
                {t('invalidInvitationLink', { defaultValue: 'Invalid or missing invitation link.' })}
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
                {t('loadingInvitation', { defaultValue: 'Loading invitation…' })}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center text-sm text-destructive">
                {t('invitationLoadError', {
                    defaultValue: 'This invitation link is invalid or has expired.',
                })}
            </div>
        );
    }

    return (
        <TenantSuperAdminRegistrationForm
            invitationToken={token}
            initialEmail={context?.email || email}
            initialFirstName={context?.firstName || ''}
            initialLastName={context?.lastName || ''}
            tenantName={context?.companyName}
        />
    );
}

export default function RegisterTenantSuperAdminPage() {
    const { t } = useTranslation('onboarding');

    return (
        <div className="min-h-screen bg-background">
            <PublicHeader />
            <main>
                <Suspense
                    fallback={
                        <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
                            {t('loadingInvitation', { defaultValue: 'Loading invitation…' })}
                        </div>
                    }
                >
                    <RegisterContent />
                </Suspense>
            </main>
        </div>
    );
}
