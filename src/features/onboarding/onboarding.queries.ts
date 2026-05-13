export const VERIFY_FREE_ONBOARDING_MUTATION = `
  mutation VerifyFreeOnboarding($code: String!, $email: String!) {
    verifyFreeOnboarding(code: $code, email: $email) {
      checkoutUrl
      companyId
      onboardingId
      requiresPayment
      status
      stripeSessionId
    }
  }
`;

export const SIGNUP_FREE_TENANT_MUTATION = `
  mutation SignupFreeTenant($input: SignupInput!) {
    signupFreeTenant(input: $input) {
      checkoutUrl
      companyId
      onboardingId
      requiresPayment
      status
      stripeSessionId
    }
  }
`;

export const SIGNUP_TENANT_MUTATION = `
  mutation SignupTenant($input: SignupInput!) {
    signupTenant(input: $input) {
      checkoutUrl
      companyId
      onboardingId
      requiresPayment
      status
      stripeSessionId
    }
  }
`;

export const INITIATE_ONBOARDING_MUTATION = `
  mutation InitiateOnboarding($input: InitiateOnboardingInput!) {
    initiateOnboarding(input: $input) {
      checkoutUrl
      companyId
      onboardingId
      status
      stripeSessionId
    }
  }
`;

export const MANUAL_COMPLETE_ONBOARDING_MUTATION = `
  mutation ManualCompleteOnboarding($onboardingId: String!) {
    manualCompleteOnboarding(onboardingId: $onboardingId)
  }
`;
