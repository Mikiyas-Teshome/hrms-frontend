import { updateUserOnboardingComplete, updateUserOnboardingStep } from '@/features/auth/auth.actions';
import type { UserResponse } from '@/features/auth/auth.types';
import {
    clearStaffOnboardingStepSession,
    writeStaffOnboardingStepSession,
} from '@/lib/onboarding/staff-onboarding-step-storage';

export type StaffOnboardingStepPersistSource = 'primary' | 'fallback' | 'session';

export async function persistStaffOnboardingStep(
    userId: string,
    step: number,
): Promise<{ persisted: boolean; source: StaffOnboardingStepPersistSource; user?: UserResponse }> {
    const primary = await updateUserOnboardingStep({ step, userId });
    if (primary.success) {
        clearStaffOnboardingStepSession(userId);
        return { persisted: true, source: 'primary', user: primary.data };
    }

    const fallback = await updateUserOnboardingComplete({ onboardingStep: step, userId });
    if (fallback.success) {
        clearStaffOnboardingStepSession(userId);
        return { persisted: true, source: 'fallback', user: fallback.data };
    }

    writeStaffOnboardingStepSession(userId, step);
    return { persisted: false, source: 'session' };
}
