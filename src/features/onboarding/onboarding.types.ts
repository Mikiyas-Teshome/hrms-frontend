export interface OnboardingResponse {
    checkoutUrl?: string | null;
    companyId?: string | null;
    onboardingId: string;
    requiresPayment?: boolean;
    status?: string | null;
    stripeSessionId?: string | null;
}

export interface InitiateOnboardingInput {
    companyName: string;
    industry?: string;
    size?: string;
    country?: string;
}

export interface SignupInput {
    companyName: string;
    email: string;
    firstName: string;
    gccId?: string | null;
    lastName: string;
    password: string;
    planId: string;
}

export interface SignupResponse {
    onboarding: OnboardingResponse;
    accessToken?: string;
}
