import { UserResponse } from '@/features/auth/auth.types';

export function requiresTenantOnboarding(user: Pick<UserResponse, 'role' | 'onboardingComplete'>): boolean {
    return user.role === 'TENANT_SUPER_ADMIN' && !user.onboardingComplete;
}

export function requiresStaffOnboarding(user: Pick<UserResponse, 'role' | 'onboardingComplete'>): boolean {
    if (user.onboardingComplete) {
        return false;
    }
    return user.role !== 'TENANT_SUPER_ADMIN' && user.role !== 'SYSTEM_ADMIN';
}

export function resolvePostAuthPath(
    user: Pick<UserResponse, 'role' | 'onboardingComplete' | 'onboardingStep'>,
): string {
    if (requiresTenantOnboarding(user)) {
        return '/onboarding';
    }
    if (requiresStaffOnboarding(user)) {
        return '/onboard';
    }
    return '/dashboard';
}
