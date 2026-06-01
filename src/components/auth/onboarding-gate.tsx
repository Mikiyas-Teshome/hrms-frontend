'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { requiresTenantOnboarding } from '@/lib/onboarding/navigation';
import { DashboardSkeleton } from '@/components/dashboard/layout/dashboard-skeleton';

interface OnboardingGateProps {
    children: React.ReactNode;
}

export function OnboardingGate({ children }: OnboardingGateProps) {
    const { user, isInitializing, isAuthenticated } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (isInitializing || !isAuthenticated || !user) {
            return;
        }

        if (!requiresTenantOnboarding(user)) {
            return;
        }

        const target = '/onboarding';
        if (pathname !== target && !pathname.startsWith('/onboarding')) {
            router.replace(target);
        }
    }, [isInitializing, isAuthenticated, user, pathname, router]);

    if (isInitializing) {
        return <DashboardSkeleton />;
    }

    if (user && requiresTenantOnboarding(user) && pathname.startsWith('/dashboard')) {
        return <DashboardSkeleton />;
    }

    return <>{children}</>;
}
