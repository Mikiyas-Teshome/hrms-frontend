'use server';

import { safeAction, ActionResult } from '@/lib/safe-action';
import { authGqlRequest } from '@/lib/auth-graphql-client';
import { publicGqlRequest } from '@/lib/public-graphql-client';
import { cookies } from 'next/headers';

import { 
    LOGIN_MUTATION, 
    LOGIN_WITH_2FA_MUTATION,
    CHANGE_PASSWORD_MUTATION,
    FORGOT_PASSWORD_MUTATION,
    RESET_PASSWORD_MUTATION,
    REFRESH_TOKEN_MUTATION,
    PROFILE_QUERY,
    LOGOUT_MUTATION,
    LOGOUT_ALL_MUTATION,
    REGISTER_TENANT_SUPER_ADMIN_MUTATION,
    BULK_INVITE_USERS_MUTATION,
    CHANGE_EMAIL_MUTATION,
    DELETE_USER_MUTATION,
    DISABLE_2FA_MUTATION,
    ENABLE_2FA_MUTATION,
    IMPERSONATE_USER_MUTATION,
    INVITE_USER_MUTATION,
    REGENERATE_BACKUP_CODES_MUTATION,
    RESEND_INVITATION_MUTATION,
    REVOKE_INVITATION_MUTATION,
    REVOKE_SESSION_MUTATION,
    VERIFY_EMAIL_MUTATION,
    UPDATE_PROFILE_MUTATION,
    UPDATE_AVATAR_MUTATION,
    MARK_PROFILE_COMPLETE_MUTATION,
    USER_SESSIONS_QUERY,
    PENDING_INVITATIONS_QUERY,
    TWO_FACTOR_SETUP_QUERY,
    SIGNUP_TENANT_MUTATION,
    VERIFY_ONBOARDING_MUTATION,
    UPDATE_TENANT_PROFILE_MUTATION,
    UPDATE_USER_ONBOARDING_COMPLETE_MUTATION,
    RESEND_FREE_ONBOARDING_OTP_MUTATION
} from './auth.queries';
import { 
    AuthResponse, 
    LoginInput, 
    LoginWith2FAInput,
    ChangePasswordInput,
    ForgotPasswordInput,
    ResetPasswordInput,
    RefreshTokenInput,
    UserResponse,
    RegisterTenantSuperAdminInput,
    BulkInvitationResponse,
    BulkInvitationInput,
    CreateInvitationInput,
    InvitationResponse,
    UpdateUserInput,
    UserSessionType,
    TwoFASetupResponse,
    BackupCodesResponse,
    Enable2FAInput,
    SignupInput,
    OnboardingResponse,
    VerifyOnboardingInput,
    UpdateCompanyInput,
    CompanyResponse,
    UpdateOnboardingCompleteInput,
    ResendFreeOnboardingOtpInput
} from './auth.types';
import { fetchRoles } from '@/features/roles/roles.actions';
import { revalidatePath } from 'next/cache';

export const getRoles = fetchRoles;

export const loginUser = async (input: LoginInput): Promise<ActionResult<AuthResponse>> => {
    return safeAction(async () => {
        const data = await publicGqlRequest<{ login: AuthResponse }>(
            LOGIN_MUTATION, 
            { input }
        );
        
        if (data.login.accessToken) {
            const cookieStore = await cookies();

            // Calculate max-age from expiresIn (seconds)
            const maxAge = data.login.expiresIn ?? 60 * 60 * 24 * 1; // default: 1 days

            cookieStore.set('hrms.accessToken', data.login.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge,
            });

            if (data.login.refreshToken) {
                cookieStore.set('hrms.refreshToken', data.login.refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    path: '/',
                    maxAge: 60 * 60 * 24 * 30, // 30 days
                });
            }
        }

        return data.login;
    });
};

export const loginWith2FA = async (input: LoginWith2FAInput): Promise<ActionResult<AuthResponse>> => {
    return safeAction(async () => {
        const data = await authGqlRequest<{ loginWith2FA: AuthResponse }>(
            LOGIN_WITH_2FA_MUTATION, 
            { input }
        );

        if (data.loginWith2FA.accessToken) {
            const cookieStore = await cookies();
            cookieStore.set('hrms.accessToken', data.loginWith2FA.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: data.loginWith2FA.expiresIn || 86400
            });
            cookieStore.set('hrms.refreshToken', data.loginWith2FA.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 7 * 24 * 60 * 60
            });
        }

        return data.loginWith2FA;
    });
};

export const registerTenantSuperAdmin = async (input: RegisterTenantSuperAdminInput): Promise<ActionResult<AuthResponse>> => {
    return safeAction(async () => {
        const data = await publicGqlRequest<{ register: AuthResponse }>(
            REGISTER_TENANT_SUPER_ADMIN_MUTATION, 
            { input }
        );

        if (data.register.accessToken) {
            const cookieStore = await cookies();
            const maxAge = data.register.expiresIn ?? 60 * 60 * 24 * 1; // default: 1 days

            cookieStore.set('hrms.accessToken', data.register.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge,
            });

            if (data.register.refreshToken) {
                cookieStore.set('hrms.refreshToken', data.register.refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    path: '/',
                    maxAge: 60 * 60 * 24 * 30,
                });
            }
        }

        return data.register;
    });
};

export const changePassword = async (input: ChangePasswordInput): Promise<ActionResult<boolean>> => {
    return safeAction(async () => {
        const data = await authGqlRequest<{ changePassword: boolean }>(
            CHANGE_PASSWORD_MUTATION, 
            { input }
        );
        return data.changePassword;
    });
};

export const forgotPassword = async (input: ForgotPasswordInput): Promise<ActionResult<boolean>> => {
    return safeAction(async () => {
        const data = await publicGqlRequest<{ forgotPassword: boolean }>(
            FORGOT_PASSWORD_MUTATION, 
            { input }
        );
        return data.forgotPassword;
    });
};

export const resetPassword = async (input: ResetPasswordInput): Promise<ActionResult<boolean>> => {
    return safeAction(async () => {
        const data = await publicGqlRequest<{ resetPassword: boolean }>(
            RESET_PASSWORD_MUTATION, 
            { input }
        );
        return data.resetPassword;
    });
};

export const refreshUserToken = async (input: RefreshTokenInput): Promise<ActionResult<AuthResponse>> => {
    return safeAction(async () => {
        const data = await publicGqlRequest<{ refreshToken: AuthResponse }>(
            REFRESH_TOKEN_MUTATION,
            { input },
        );

        if (data.refreshToken.accessToken) {
            const cookieStore = await cookies();
            cookieStore.set('hrms.accessToken', data.refreshToken.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: data.refreshToken.expiresIn || 86400
            });
            cookieStore.set('hrms.refreshToken', data.refreshToken.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 7 * 24 * 60 * 60
            });
        }

        return data.refreshToken;
    });
};

export const getProfile = async (): Promise<UserResponse | null> => {
    try {
        const cookieStore = await cookies();
        const hasTokens =
            cookieStore.get('hrms.accessToken') || cookieStore.get('hrms.refreshToken');

        // Short-circuit the request entirely to prevent useless backend network pings
        if (!hasTokens) {
            return null;
        }

        const data = await authGqlRequest<{ profile: UserResponse }>(PROFILE_QUERY);
        return data.profile;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : '';

        // Suppress expected auth errors
        if (message.includes('Not authenticated') || message.includes('User not found')) {
            return null;
        }

        throw error;
    }
};


export const logout = async (): Promise<ActionResult<boolean>> => {
    return safeAction(async () => {
        try {
            await authGqlRequest<{ logout: boolean }>(LOGOUT_MUTATION);
        } catch (error) {
            console.error('Logout mutation failed:', error);
        } finally {
            const cookieStore = await cookies();
            cookieStore.delete('hrms.accessToken');
            cookieStore.delete('hrms.refreshToken');
        }
        return true;
    });
};

export const logoutAll = async (): Promise<ActionResult<boolean>> => {
    return safeAction(async () => {
        try {
            await authGqlRequest<{ logoutAll: boolean }>(LOGOUT_ALL_MUTATION);
        } catch (error) {
            console.error('LogoutAll mutation failed:', error);
        } finally {
            const cookieStore = await cookies();
            cookieStore.delete('hrms.accessToken');
            cookieStore.delete('hrms.refreshToken');
        }
        return true;
    });
};

export const bulkInviteUsers = async (input: BulkInvitationInput): Promise<ActionResult<BulkInvitationResponse>> => {
    return safeAction(async () => {
        const data = await authGqlRequest<{ bulkInviteUsers: BulkInvitationResponse }>(
            BULK_INVITE_USERS_MUTATION,
            { input }
        );
        revalidatePath('/dashboard/employees');
        return data.bulkInviteUsers;
    });
};

export const inviteUser = async (input: CreateInvitationInput): Promise<ActionResult<InvitationResponse>> => {
    return safeAction(async () => {
        const data = await authGqlRequest<{ inviteUser: InvitationResponse }>(
            INVITE_USER_MUTATION,
            { input }
        );
        return data.inviteUser;
    });
};

export const resendInvitation = async (id: string): Promise<ActionResult<InvitationResponse>> => {
    return safeAction(async () => {
        const data = await authGqlRequest<{ resendInvitation: InvitationResponse }>(
            RESEND_INVITATION_MUTATION,
            { id }
        );
        return data.resendInvitation;
    });
};

export const revokeInvitation = async (id: string): Promise<ActionResult<InvitationResponse>> => {
    return safeAction(async () => {
        const data = await authGqlRequest<{ revokeInvitation: InvitationResponse }>(
            REVOKE_INVITATION_MUTATION,
            { id }
        );
        revalidatePath('/dashboard/employees');
        return data.revokeInvitation;
    });
};

export const fetchPendingInvitations = async (): Promise<ActionResult<InvitationResponse[]>> => {
    return safeAction(async () => {
        const data = await authGqlRequest<{ pendingInvitations: InvitationResponse[] }>(
            PENDING_INVITATIONS_QUERY
        );
        return data.pendingInvitations;
    });
};

export const changeEmail = async (currentPassword: string, newEmail: string): Promise<ActionResult<UserResponse>> => {
    return safeAction(async () => {
        const data = await authGqlRequest<{ changeEmail: UserResponse }>(
            CHANGE_EMAIL_MUTATION,
            { currentPassword, newEmail }
        );
        return data.changeEmail;
    });
};

export const deleteUser = async (userId: string): Promise<ActionResult<boolean>> => {
    return safeAction(async () => {
        const data = await authGqlRequest<{ deleteUser: boolean }>(
            DELETE_USER_MUTATION,
            { userId }
        );
        revalidatePath('/dashboard/employees');
        return data.deleteUser;
    });
};

export const enable2FA = async (input: Enable2FAInput): Promise<ActionResult<BackupCodesResponse>> => {
    return safeAction(async () => {
        const data = await authGqlRequest<{ enable2FA: BackupCodesResponse }>(
            ENABLE_2FA_MUTATION,
            { input }
        );
        return data.enable2FA;
    });
};

export const disable2FA = async (password: string): Promise<ActionResult<boolean>> => {
    return safeAction(async () => {
        const data = await authGqlRequest<{ disable2FA: boolean }>(
            DISABLE_2FA_MUTATION,
            { password }
        );
        return data.disable2FA;
    });
};

export const fetch2FASetup = async (): Promise<ActionResult<TwoFASetupResponse>> => {
    return safeAction(async () => {
        const data = await authGqlRequest<{ twoFactorSetup: TwoFASetupResponse }>(
            TWO_FACTOR_SETUP_QUERY
        );
        return data.twoFactorSetup;
    });
};

export const regenerateBackupCodes = async (): Promise<ActionResult<BackupCodesResponse>> => {
    return safeAction(async () => {
        const data = await authGqlRequest<{ regenerateBackupCodes: BackupCodesResponse }>(
            REGENERATE_BACKUP_CODES_MUTATION
        );
        return data.regenerateBackupCodes;
    });
};

export const impersonateUser = async (userId: string): Promise<ActionResult<AuthResponse>> => {
    return safeAction(async () => {
        const data = await authGqlRequest<{ impersonateUser: AuthResponse }>(
            IMPERSONATE_USER_MUTATION,
            { userId }
        );
        
        if (data.impersonateUser.accessToken) {
            const cookieStore = await cookies();
            cookieStore.set('hrms.accessToken', data.impersonateUser.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: data.impersonateUser.expiresIn || 86400
            });
        }
        
        return data.impersonateUser;
    });
};

export const revokeSession = async (sessionId: string): Promise<ActionResult<boolean>> => {
    return safeAction(async () => {
        const data = await authGqlRequest<{ revokeSession: boolean }>(
            REVOKE_SESSION_MUTATION,
            { sessionId }
        );
        return data.revokeSession;
    });
};

export const fetchUserSessions = async (userId: string): Promise<ActionResult<UserSessionType[]>> => {
    return safeAction(async () => {
        const data = await authGqlRequest<{ userSessions: UserSessionType[] }>(
            USER_SESSIONS_QUERY,
            { userId }
        );
        return data.userSessions;
    });
};

export const verifyEmail = async (code: string): Promise<ActionResult<boolean>> => {
    return safeAction(async () => {
        const data = await authGqlRequest<{ verifyEmail: boolean }>(
            VERIFY_EMAIL_MUTATION,
            { code }
        );
        return data.verifyEmail;
    });
};

export const updateProfile = async (input: UpdateUserInput): Promise<ActionResult<UserResponse>> => {
    return safeAction(async () => {
        const data = await authGqlRequest<{ updateProfile: UserResponse }>(
            UPDATE_PROFILE_MUTATION,
            { input }
        );
        revalidatePath('/dashboard/settings');
        return data.updateProfile;
    });
};

export const updateAvatar = async (avatarUrl: string): Promise<ActionResult<UserResponse>> => {
    return safeAction(async () => {
        const data = await authGqlRequest<{ updateAvatar: UserResponse }>(
            UPDATE_AVATAR_MUTATION,
            { avatarUrl }
        );
        revalidatePath('/dashboard/settings');
        return data.updateAvatar;
    });
};

export const markProfileComplete = async (): Promise<ActionResult<UserResponse>> => {
    return safeAction(async () => {
        const data = await authGqlRequest<{ markProfileComplete: UserResponse }>(
            MARK_PROFILE_COMPLETE_MUTATION
        );
        revalidatePath('/dashboard');
        return data.markProfileComplete;
    });
}

export const signupTenant = async (input: SignupInput): Promise<ActionResult<OnboardingResponse>> => {
    return safeAction(async () => {
        const data = await publicGqlRequest<{ signupTenant: OnboardingResponse }>(
            SIGNUP_TENANT_MUTATION,
            { input }
        );
        return data.signupTenant;
    });
};

export const verifyOnboarding = async (input: VerifyOnboardingInput): Promise<ActionResult<OnboardingResponse>> => {
    return safeAction(async () => {
        const data = await publicGqlRequest<{ verifyFreeOnboarding: OnboardingResponse }>(
            VERIFY_ONBOARDING_MUTATION,
            { code: input.code, email: input.email }
        );
        return data.verifyFreeOnboarding;
    });
};

export const updateTenantProfile = async (id: string, input: UpdateCompanyInput): Promise<ActionResult<CompanyResponse>> => {
    return safeAction(async () => {
        const data = await authGqlRequest<{ updateTenantProfile: CompanyResponse }>(
            UPDATE_TENANT_PROFILE_MUTATION,
            { id, input }
        );
        revalidatePath('/dashboard/settings');
        revalidatePath('/onboarding');
        return data.updateTenantProfile;
    });
};

export const updateUserOnboardingComplete = async (input: UpdateOnboardingCompleteInput): Promise<ActionResult<UserResponse>> => {
    return safeAction(async () => {
        const data = await authGqlRequest<{ updateUserOnboardingComplete: UserResponse }>(
            UPDATE_USER_ONBOARDING_COMPLETE_MUTATION,
            { input }
        );
        revalidatePath('/dashboard');
        revalidatePath('/onboarding');
        return data.updateUserOnboardingComplete;
    });
};

export const resendFreeOnboardingOtp = async (input: ResendFreeOnboardingOtpInput): Promise<ActionResult<OnboardingResponse>> => {
    return safeAction(async () => {
        const data = await publicGqlRequest<{ resendFreeTenantRegistrationOtp: OnboardingResponse }>(
            RESEND_FREE_ONBOARDING_OTP_MUTATION,
            { input }
        );
        return data.resendFreeTenantRegistrationOtp;
    });
};
