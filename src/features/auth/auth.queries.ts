export const LOGIN_MUTATION = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      expiresIn
      message
      refreshToken
      requires2FA
      user {
        id
        email
        firstName
        lastName
        fullName
        role
        roleProfile {
          name
          permissionsMap
        }
        status
        companyId
        department
        phoneNumber
        position
        isEmailVerified
        onboardingComplete
        onboardingStep
        lastLoginAt
        createdAt
        updatedAt
      }
    }
  }
`;

export const LOGIN_WITH_2FA_MUTATION = `
  mutation LoginWith2FA($input: LoginWith2FAInput!) {
    loginWith2FA(input: $input) {
      accessToken
      expiresIn
      message
      refreshToken
      requires2FA
      user {
        id
        email
        firstName
        lastName
        status
      }
    }
  }
`;

export const REGISTER_TENANT_SUPER_ADMIN_MUTATION = `
  mutation RegisterTenantSuperAdmin($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      expiresIn
      message
      refreshToken
      requires2FA
      user {
        id
        email
        firstName
        lastName
        fullName
        role
        roleProfile {
          name
          permissionsMap
        }
        status
        companyId
        department
        phoneNumber
        position
        isEmailVerified
        onboardingComplete
        onboardingStep
        lastLoginAt
        createdAt
        updatedAt
      }
    }
  }
`;

export const CHANGE_PASSWORD_MUTATION = `
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input)
  }
`;

export const FORGOT_PASSWORD_MUTATION = `
  mutation ForgotPassword($input: ForgotPasswordInput!) {
    forgotPassword(input: $input)
  }
`;

export const RESET_PASSWORD_MUTATION = `
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input)
  }
`;

export const REFRESH_TOKEN_MUTATION = `
  mutation RefreshToken($input: RefreshTokenInput!) {
    refreshToken(input: $input) {
      accessToken
      expiresIn
      message
      refreshToken
      requires2FA
      user {
        id
        email
        firstName
        lastName
        fullName
        role
        roleProfile {
          name
          permissionsMap
        }
        status
        companyId
        department
        phoneNumber
        position
        isEmailVerified
        onboardingComplete
        onboardingStep
        lastLoginAt
        createdAt
        updatedAt
      }
    }
  }
`;

export const PROFILE_QUERY = `
  query GetProfile {
    profile {
      id
      email
      firstName
      lastName
      fullName
      role
      roleProfile {
        name
        permissionsMap
      } 
      status
      companyId
      department
      phoneNumber
      position
      isEmailVerified
      onboardingComplete
      onboardingStep
      createdAt
      updatedAt
      lastLoginAt
      avatarUrl
      dashboardPreferences {
        version
        adminExecutive {
          kpiSlugs
          widgetSlugs
          widgetConfigs
        }
      }
    }
  }
`;

export const UPDATE_DASHBOARD_PREFERENCES_MUTATION = `
  mutation UpdateDashboardPreferences($input: UpdateDashboardPreferencesInput!) {
    updateDashboardPreferences(input: $input) {
      id
      email
      firstName
      lastName
      fullName
      role
      roleProfile {
        name
        permissionsMap
      }
      status
      companyId
      department
      phoneNumber
      position
      isEmailVerified
      onboardingComplete
      onboardingStep
      createdAt
      updatedAt
      lastLoginAt
      dashboardPreferences {
        version
        adminExecutive {
          kpiSlugs
          widgetSlugs
          widgetConfigs
        }
      }
    }
  }
`;

export const ROLES_BY_COMPANY_QUERY = `
  query getRolesByCompanyId($companyId: ID) {
    roles(companyId: $companyId) {
      id
      name
      description
      companyId
      createdAt
      updatedAt
      permissions {
        id
        action
        description
        roleId
        createdAt
      }
    }
  }
`;

export const INVITATION_FIELDS_FRAGMENT = `
  fragment InvitationFields on InvitationResponse {
    companyId
    createdAt
    email
    expiresAt
    id
    role
    status
    token
  }
`;

export const BULK_INVITE_USERS_MUTATION = `
  mutation BulkInviteUsers($input: BulkInvitationInput!) {
    bulkInviteUsers(input: $input) {
      failedCount
      failedInvitations {
        email
        error
      }
      successfulCount
      successfulInvitations {
        ...InvitationFields
      }
    }
  }
  ${INVITATION_FIELDS_FRAGMENT}
`;

export const INVITE_USER_MUTATION = `
  mutation InviteUser($input: CreateInvitationInput!) {
    inviteUser(input: $input) {
      ...InvitationFields
    }
  }
  ${INVITATION_FIELDS_FRAGMENT}
`;

export const RESEND_INVITATION_MUTATION = `
  mutation ResendInvitation($id: ID!) {
    resendInvitation(id: $id) {
      ...InvitationFields
    }
  }
  ${INVITATION_FIELDS_FRAGMENT}
`;

export const REVOKE_INVITATION_MUTATION = `
  mutation RevokeInvitation($id: ID!) {
    revokeInvitation(id: $id) {
      ...InvitationFields
    }
  }
  ${INVITATION_FIELDS_FRAGMENT}
`;

export const PENDING_INVITATIONS_QUERY = `
  query PendingInvitations {
    pendingInvitations {
      ...InvitationFields
    }
  }
  ${INVITATION_FIELDS_FRAGMENT}
`;

export const CHANGE_EMAIL_MUTATION = `
  mutation ChangeEmail($currentPassword: String!, $newEmail: String!) {
    changeEmail(currentPassword: $currentPassword, newEmail: $newEmail) {
      id
      email
    }
  }
`;

export const DELETE_USER_MUTATION = `
  mutation DeleteUser($userId: String!) {
    deleteUser(userId: $userId)
  }
`;

export const ENABLE_2FA_MUTATION = `
  mutation Enable2FA($input: Enable2FAInput!) {
    enable2FA(input: $input) {
      backupCodes
    }
  }
`;

export const DISABLE_2FA_MUTATION = `
  mutation Disable2FA($password: String!) {
    disable2FA(password: $password)
  }
`;

export const TWO_FACTOR_SETUP_QUERY = `
  query TwoFactorSetup {
    twoFactorSetup {
      qrCodeUrl
      secret
    }
  }
`;

export const REGENERATE_BACKUP_CODES_MUTATION = `
  mutation RegenerateBackupCodes {
    regenerateBackupCodes {
      backupCodes
    }
  }
`;

export const IMPERSONATE_USER_MUTATION = `
  mutation ImpersonateUser($userId: ID!) {
    impersonateUser(userId: $userId) {
      accessToken
      expiresIn
      message
      refreshToken
      requires2FA
      user {
        id
        email
        firstName
        lastName
        fullName
        role
        status
        companyId
        onboardingComplete
        onboardingStep
      }
    }
  }
`;

export const REVOKE_SESSION_MUTATION = `
  mutation RevokeSession($sessionId: String!) {
    revokeSession(sessionId: $sessionId)
  }
`;

export const USER_SESSIONS_QUERY = `
  query UserSessions($userId: ID!) {
    userSessions(userId: $userId) {
      createdAt
      deviceInfo
      ipAddress
      lastActivity
      sessionId
      userAgent
      userId
    }
  }
`;

export const VERIFY_EMAIL_MUTATION = `
  mutation VerifyEmail($code: String!) {
    verifyEmail(code: $code)
  }
`;

export const UPDATE_PROFILE_MUTATION = `
  mutation UpdateProfile($input: UpdateUserInput!) {
    updateProfile(input: $input) {
      id
      firstName
      lastName
      fullName
      phoneNumber
    }
  }
`;

export const UPDATE_AVATAR_MUTATION = `
  mutation UpdateAvatar($avatarUrl: String!) {
    updateAvatar(avatarUrl: $avatarUrl) {
      id
      avatarUrl
    }
  }
`;

export const MARK_PROFILE_COMPLETE_MUTATION = `
  mutation MarkProfileComplete {
    markProfileComplete {
      id
      status
    }
  }
`;

export const LOGOUT_MUTATION = `
  mutation Logout {
    logout
  }
`;

export const LOGOUT_ALL_MUTATION = `
  mutation LogoutAll {
    logoutAll
  }
`;

export const SIGNUP_FREE_TENANT_MUTATION = `
  mutation SignupFreeTenant($input: SignupInput!) {
    signupFreeTenant(input: $input) {
      checkoutUrl
      companyId
      onboardingId
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

export const VERIFY_ONBOARDING_MUTATION = `
  mutation VerifyFreeOnboarding($code: String!, $email: String!) {
    verifyFreeOnboarding(code: $code, email: $email) {
      checkoutUrl
      companyId
      onboardingId
      status
      stripeSessionId
    }
  }
`;
export const UPDATE_TENANT_PROFILE_MUTATION = `
  mutation UpdateTenantProfile($id: String!, $input: UpdateCompanyInput!) {
    updateTenantProfile(id: $id, input: $input) {
      id
      name
      slug
      status
      tier
      website
      description
      logo
      email
      phone
      address
      city
      state
      postalCode
      country
      currency
      timezone
      themeColor
      multiDept
      crossDivision
      requireDept
      size
      currentEmployees
      maxEmployees
      createdAt
      updatedAt
    }
  }
`;
export const UPDATE_USER_ONBOARDING_COMPLETE_MUTATION = `
  mutation UpdateUserOnboardingComplete($input: UpdateOnboardingCompleteInput!) {
    updateUserOnboardingComplete(input: $input) {
      id
      email
      firstName
      lastName
      fullName
      role
      roleProfile {
        name
        permissionsMap
      }
      status
      companyId
      department
      phoneNumber
      position
      isEmailVerified
      onboardingComplete
      onboardingStep
      lastLoginAt
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_USER_ONBOARDING_STEP_MUTATION = `
  mutation UpdateUserOnboardingStep($input: UpdateOnboardingStepInput!) {
    updateUserOnboardingStep(input: $input) {
      id
      email
      firstName
      lastName
      fullName
      role
      roleProfile {
        name
        permissionsMap
      }
      status
      companyId
      department
      phoneNumber
      position
      isEmailVerified
      onboardingComplete
      onboardingStep
      lastLoginAt
      createdAt
      updatedAt
    }
  }
`;

export const INVITATION_ONBOARD_CONTEXT_QUERY = `
  query InvitationOnboardContext($token: String!, $tenantId: String) {
    invitationOnboardContext(token: $token, tenantId: $tenantId) {
      tenantId
      companyName
      companyEmail
      email
      firstName
      lastName
    }
  }
`;

export const RESEND_FREE_ONBOARDING_OTP_MUTATION = `
  mutation ResendOtp($input: ResendFreeOnboardingOtpInput!) {
    resendFreeTenantRegistrationOtp(input: $input) {
      checkoutUrl
      companyId
      onboardingId
      requiresPayment
      status
      stripeSessionId
    }
  }
`;
