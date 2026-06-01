export const ONBOARDING_STEP_SLUGS = [
    'organization-profile',
    'organization-structure',
    'hr-policies',
    'payroll-structure',
    'contracts-insurances',
    'team-setup',
] as const;

export type OnboardingStepSlug = (typeof ONBOARDING_STEP_SLUGS)[number];

export const TOTAL_TENANT_ONBOARDING_STEPS = ONBOARDING_STEP_SLUGS.length;

export function clampOnboardingStep(step: number): number {
    if (!Number.isFinite(step) || step < 1) {
        return 1;
    }
    if (step > TOTAL_TENANT_ONBOARDING_STEPS) {
        return TOTAL_TENANT_ONBOARDING_STEPS;
    }
    return Math.floor(step);
}

export function stepToSlug(step: number): OnboardingStepSlug {
    const index = clampOnboardingStep(step) - 1;
    return ONBOARDING_STEP_SLUGS[index];
}

export function slugToStep(slug: string): number | null {
    const index = ONBOARDING_STEP_SLUGS.indexOf(slug as OnboardingStepSlug);
    if (index === -1) {
        return null;
    }
    return index + 1;
}

export function isOnboardingStepSlug(slug: string): slug is OnboardingStepSlug {
    return ONBOARDING_STEP_SLUGS.includes(slug as OnboardingStepSlug);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getOnboardingPath(_step?: number): string {
    return '/onboarding';
}
