'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { resolvePostAuthPath } from '@/lib/onboarding/navigation';

export function AuthenticatedHomeRedirect() {
    const router = useRouter();
    const { user, isInitializing, isProfileSettling } = useAuth();

    useEffect(() => {
        if (isInitializing || isProfileSettling || !user) {
            return;
        }

        router.replace(resolvePostAuthPath(user));
    }, [isInitializing, isProfileSettling, user, router]);

    return (
        <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
            Loading…
        </div>
    );
}
