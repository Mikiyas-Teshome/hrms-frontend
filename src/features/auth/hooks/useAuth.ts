import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AUTH_PROFILE_QUERY_KEY } from '@/features/auth/auth-session.constants';
import { readAuthSessionCache } from '@/features/auth/auth-session-cache.util';
import { 
    loginUser, 
    loginWith2FA, 
    registerTenantSuperAdmin, 
    changePassword, 
    getProfile, 
    refreshUserToken, 
    logout, 
    logoutAll,
    bulkInviteUsers,
    inviteUser,
    resendInvitation,
    revokeInvitation,
    fetchPendingInvitations,
    changeEmail,
    deleteUser,
    enable2FA,
    disable2FA,
    fetch2FASetup,
    regenerateBackupCodes,
    impersonateUser,
    revokeSession,
    fetchUserSessions,
    verifyEmail,
    updateProfile,
    updateAvatar,
    markProfileComplete,
    updateTenantProfile,
    updateUserOnboardingComplete,
    updateUserOnboardingStep,
    resendFreeOnboardingOtp
} from '../auth.actions';
import { 
    LoginInput, 
    LoginWith2FAInput, 
    RegisterTenantSuperAdminInput, 
    ChangePasswordInput, 
    RefreshTokenInput,
    BulkInvitationInput,
    CreateInvitationInput,
    Enable2FAInput,
    UpdateUserInput,
    UpdateCompanyInput,
    UpdateOnboardingCompleteInput,
    UpdateOnboardingStepInput,
    ResendFreeOnboardingOtpInput
} from '../auth.types';

export const useLogin = () => {
    return useMutation({
        mutationFn: async (input: LoginInput) => {
            const result = await loginUser(input);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useLoginWith2FA = () => {
    return useMutation({
        mutationFn: async (input: LoginWith2FAInput) => {
            const result = await loginWith2FA(input);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useRegisterTenantSuperAdmin = () => {
    return useMutation({
        mutationFn: async (input: RegisterTenantSuperAdminInput) => {
            const result = await registerTenantSuperAdmin(input);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useChangePassword = () => {
    return useMutation({
        mutationFn: async (input: ChangePasswordInput) => {
            const result = await changePassword(input);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useRefreshToken = () => {
    return useMutation({
        mutationFn: async (input: RefreshTokenInput) => {
            const result = await refreshUserToken(input);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useProfile = () => {
    return useQuery({
        queryKey: AUTH_PROFILE_QUERY_KEY,
        queryFn: () => getProfile(),
        initialData: () => readAuthSessionCache()?.user,
        staleTime: 60 * 1000,
        retry: false,
    });
};

export const useLogout = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const result = await logout();
            return result.success ? result.data : true;
        },
        onSettled: () => {
            if (typeof window !== 'undefined') {
                localStorage.clear();
                sessionStorage.clear();
            }
            queryClient.cancelQueries({ queryKey: AUTH_PROFILE_QUERY_KEY });
            queryClient.clear();
            // Re-set auth query to null (not pending) so isInitializing stays false
            // and reloadSession() starts a fresh, undeduped request after next login
            queryClient.setQueryData(AUTH_PROFILE_QUERY_KEY, null);
        }
    });
};

export const useLogoutAll = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const result = await logoutAll();
            return result.success ? result.data : true;
        },
        onSettled: () => {
            if (typeof window !== 'undefined') {
                localStorage.clear();
                sessionStorage.clear();
            }
            // Cancel any in-flight profile fetches to prevent dedup race on re-login
            queryClient.cancelQueries({ queryKey: AUTH_PROFILE_QUERY_KEY });
            queryClient.clear();
            // Re-set auth query to null (not pending) so isInitializing stays false
            queryClient.setQueryData(AUTH_PROFILE_QUERY_KEY, null);
        }
    });
};

export const useBulkInviteUsers = () => {
    return useMutation({
        mutationFn: async (input: BulkInvitationInput) => {
            const result = await bulkInviteUsers(input);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useInviteUser = () => {
    return useMutation({
        mutationFn: async (input: CreateInvitationInput) => {
            const result = await inviteUser(input);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useResendInvitation = () => {
    return useMutation({
        mutationFn: async (id: string) => {
            const result = await resendInvitation(id);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useRevokeInvitation = () => {
    return useMutation({
        mutationFn: async (id: string) => {
            const result = await revokeInvitation(id);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const usePendingInvitations = () => {
    return useQuery({
        queryKey: ['auth', 'pending-invitations'],
        queryFn: async () => {
            const result = await fetchPendingInvitations();
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useChangeEmail = () => {
    return useMutation({
        mutationFn: async ({ currentPassword, newEmail }: { currentPassword: string; newEmail: string }) => {
            const result = await changeEmail(currentPassword, newEmail);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useDeleteUser = () => {
    return useMutation({
        mutationFn: async (userId: string) => {
            const result = await deleteUser(userId);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useEnable2FA = () => {
    return useMutation({
        mutationFn: async (input: Enable2FAInput) => {
            const result = await enable2FA(input);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useDisable2FA = () => {
    return useMutation({
        mutationFn: async (password: string) => {
            const result = await disable2FA(password);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const use2FASetup = () => {
    return useQuery({
        queryKey: ['auth', '2fa-setup'],
        queryFn: async () => {
            const result = await fetch2FASetup();
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useRegenerateBackupCodes = () => {
    return useMutation({
        mutationFn: async () => {
            const result = await regenerateBackupCodes();
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useImpersonateUser = () => {
    return useMutation({
        mutationFn: async (userId: string) => {
            const result = await impersonateUser(userId);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useRevokeSession = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (sessionId: string) => {
            const result = await revokeSession(sessionId);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['auth', 'sessions'] });
        },
    });
};

export const useUserSessions = (userId: string) => {
    return useQuery({
        queryKey: ['auth', 'sessions', userId],
        queryFn: async () => {
            const result = await fetchUserSessions(userId);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        enabled: !!userId,
    });
};

export const useVerifyEmail = () => {
    return useMutation({
        mutationFn: async (code: string) => {
            const result = await verifyEmail(code);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useUpdateProfile = () => {
    return useMutation({
        mutationFn: async (input: UpdateUserInput) => {
            const result = await updateProfile(input);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useUpdateAvatar = () => {
    return useMutation({
        mutationFn: async (avatarUrl: string) => {
            const result = await updateAvatar(avatarUrl);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useMarkProfileComplete = () => {
    return useMutation({
        mutationFn: async () => {
            const result = await markProfileComplete();
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};
export const useUpdateTenantProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, input }: { id: string; input: UpdateCompanyInput }) => {
            const result = await updateTenantProfile(id, input);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['company', variables.id] });
        },
    });
};

export const useUpdateOnboardingComplete = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (input: UpdateOnboardingCompleteInput) => {
            const result = await updateUserOnboardingComplete(input);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] });
        },
    });
};

export const useUpdateOnboardingStep = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (input: UpdateOnboardingStepInput) => {
            const result = await updateUserOnboardingStep(input);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] });
        },
    });
};

export const useResendFreeOnboardingOtp = () => {
    return useMutation({
        mutationFn: async (input: ResendFreeOnboardingOtpInput) => {
            const result = await resendFreeOnboardingOtp(input);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};
