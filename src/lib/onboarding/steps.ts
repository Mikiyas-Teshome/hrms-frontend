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
