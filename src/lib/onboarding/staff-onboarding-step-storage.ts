import { clampStaffOnboardingStep } from '@/lib/onboarding/staff-steps';

const STORAGE_PREFIX = 'hrms.staffOnboardingStep';

function storageKey(userId: string): string {
    return `${STORAGE_PREFIX}.${userId}`;
}

export function readStaffOnboardingStepSession(userId: string): number | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const raw = window.sessionStorage.getItem(storageKey(userId));
    if (!raw) {
        return null;
    }

    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) {
        return null;
    }

    return clampStaffOnboardingStep(parsed);
}

export function writeStaffOnboardingStepSession(userId: string, step: number): void {
    if (typeof window === 'undefined') {
        return;
    }

    window.sessionStorage.setItem(storageKey(userId), String(clampStaffOnboardingStep(step)));
}

export function clearStaffOnboardingStepSession(userId: string): void {
    if (typeof window === 'undefined') {
        return;
    }

    window.sessionStorage.removeItem(storageKey(userId));
}

export function resolveStaffOnboardingStep(
    userId: string,
    profileStep: number,
): number {
    const sessionStep = readStaffOnboardingStepSession(userId);
    if (sessionStep === null) {
        return clampStaffOnboardingStep(profileStep);
    }

    return Math.max(clampStaffOnboardingStep(profileStep), sessionStep);
}
