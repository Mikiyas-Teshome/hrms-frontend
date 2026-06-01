import { UserResponse } from '@/features/auth/auth.types';

export function requiresTenantOnboarding(user: Pick<UserResponse, 'role' | 'onboardingComplete'>): boolean {
    return user.role === 'TENANT_SUPER_ADMIN' && !user.onboardingComplete;
}

export function resolvePostAuthPath(
    user: Pick<UserResponse, 'role' | 'onboardingComplete' | 'onboardingStep'>,
): string {
    if (requiresTenantOnboarding(user)) {
        return '/onboarding';
    }
    return '/dashboard';
}
