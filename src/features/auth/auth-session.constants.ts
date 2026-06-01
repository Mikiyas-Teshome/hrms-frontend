import type { UserResponse } from '@/features/auth/auth.types';

export const AUTH_PROFILE_QUERY_KEY = ['auth', 'profile'] as const;

export const AUTH_SESSION_STORAGE_KEY = 'hrms-auth-session';

export type AuthSessionCache = {
    user: UserResponse;
};
