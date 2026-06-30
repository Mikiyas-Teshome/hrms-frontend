export const STAFF_ONBOARDING_CONTRACT_STEP = 1;
export const STAFF_ONBOARDING_PROFILE_FIRST_STEP = 2;
export const TOTAL_STAFF_ONBOARDING_STEPS = 6;
export const TOTAL_STAFF_PROFILE_STEPS = 5;

export function clampStaffOnboardingStep(step: number): number {
    if (!Number.isFinite(step) || step < STAFF_ONBOARDING_CONTRACT_STEP) {
        return STAFF_ONBOARDING_CONTRACT_STEP;
    }
    if (step > TOTAL_STAFF_ONBOARDING_STEPS) {
        return TOTAL_STAFF_ONBOARDING_STEPS;
    }
    return Math.floor(step);
}

export function staffProfileStepFromOnboardingStep(onboardingStep: number): number {
    const clamped = clampStaffOnboardingStep(onboardingStep);
    return Math.max(1, clamped - STAFF_ONBOARDING_PROFILE_FIRST_STEP + 1);
}

export function staffOnboardingStepFromProfileStep(profileStep: number): number {
    const normalized = Math.max(1, Math.min(profileStep, TOTAL_STAFF_PROFILE_STEPS));
    return normalized + STAFF_ONBOARDING_PROFILE_FIRST_STEP - 1;
}

export type StaffOnboardPhase = 'signup' | 'contract-review' | 'onboarding';

export function resolveStaffOnboardPhase(
    onboardingStep: number,
    hasPendingContract: boolean,
): Exclude<StaffOnboardPhase, 'signup'> {
    const step = clampStaffOnboardingStep(onboardingStep);
    if (step === STAFF_ONBOARDING_CONTRACT_STEP && hasPendingContract) {
        return 'contract-review';
    }
    return 'onboarding';
}
