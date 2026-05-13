import { useMutation } from '@tanstack/react-query';
import {
    initiateOnboarding,
    manualCompleteOnboarding,
    signupTenant,
    verifyFreeOnboarding
} from '../onboarding.actions';
import {
    InitiateOnboardingInput,
    SignupInput
} from '../onboarding.types';

export const useInitiateOnboarding = () => {
    return useMutation({
        mutationFn: async (input: InitiateOnboardingInput) => {
            const result = await initiateOnboarding(input);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useManualCompleteOnboarding = () => {
    return useMutation({
        mutationFn: async (onboardingId: string) => {
            const result = await manualCompleteOnboarding(onboardingId);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useSignupTenant = () => {
    return useMutation({
        mutationFn: async (input: SignupInput) => {
            const result = await signupTenant(input);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useVerifyFreeOnboarding = () => {
    return useMutation({
        mutationFn: async ({ code, email }: { code: string; email: string }) => {
            const result = await verifyFreeOnboarding(code, email);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};
