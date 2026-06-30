'use client';

import { useProfile } from '@/features/auth/hooks/useAuth';
import { UnifiedDashboard } from '@/components/dashboard/main/unified-dashboard';
import { CompanySetupCard } from '@/components/dashboard/main/company-setup-card';
import {
    AdminHomeDashboardSkeleton,
} from '@/components/dashboard/layout/dashboard-skeleton';
import { ResolveDashboardHome } from '../home/resolve-dashboard-home';

export function DashboardView() {
    const { data: user, isLoading: isProfileLoading } = useProfile();
    const onboardingComplete = user?.onboardingComplete ?? false;
    const isAdminUser = user?.role === 'ADMIN' || user?.role === 'TENANT_SUPER_ADMIN';

    if (isProfileLoading) {
        return <AdminHomeDashboardSkeleton />;
    }

    if (isAdminUser) {
        return onboardingComplete ? <UnifiedDashboard /> : <CompanySetupCard />;
    }

    return <ResolveDashboardHome />;
}
