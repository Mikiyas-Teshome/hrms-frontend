'use server';

import { gqlRequest, GraphQLService } from '@/lib/graphql-client';
import { safeAction, ActionResult } from '@/lib/safe-action';
import {
    INITIATE_ONBOARDING_MUTATION,
    MANUAL_COMPLETE_ONBOARDING_MUTATION,
    SIGNUP_TENANT_MUTATION,
    VERIFY_FREE_ONBOARDING_MUTATION
} from './onboarding.queries';
import {
    InitiateOnboardingInput,
    OnboardingResponse,
    SignupInput
} from './onboarding.types';
import { revalidatePath } from 'next/cache';

export async function initiateOnboarding(input: InitiateOnboardingInput): Promise<ActionResult<OnboardingResponse>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ initiateOnboarding: OnboardingResponse }>(
            GraphQLService.AUTH,
            INITIATE_ONBOARDING_MUTATION,
            { input }
        );
        revalidatePath('/onboarding');
        return data.initiateOnboarding;
    });
}

export async function manualCompleteOnboarding(onboardingId: string): Promise<ActionResult<boolean>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ manualCompleteOnboarding: boolean }>(
            GraphQLService.AUTH,
            MANUAL_COMPLETE_ONBOARDING_MUTATION,
            { onboardingId }
        );
        revalidatePath('/onboarding');
        return data.manualCompleteOnboarding;
    });
}

export async function signupTenant(input: SignupInput): Promise<ActionResult<OnboardingResponse>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ signupTenant: OnboardingResponse }>(
            GraphQLService.AUTH,
            SIGNUP_TENANT_MUTATION,
            { input }
        );
        return data.signupTenant;
    });
}

export async function verifyFreeOnboarding(code: string, email: string): Promise<ActionResult<OnboardingResponse>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ verifyFreeOnboarding: OnboardingResponse }>(
            GraphQLService.AUTH,
            VERIFY_FREE_ONBOARDING_MUTATION,
            { code, email }
        );
        return data.verifyFreeOnboarding;
    });
}
