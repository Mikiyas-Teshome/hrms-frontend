import {
    AUTH_SESSION_STORAGE_KEY,
    type AuthSessionCache,
} from '@/features/auth/auth-session.constants';
import type { UserResponse } from '@/features/auth/auth.types';

export const readAuthSessionCache = (): AuthSessionCache | null => {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        const raw = sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY);
        if (!raw) {
            return null;
        }

        const parsed = JSON.parse(raw) as AuthSessionCache;
        if (!parsed?.user?.id) {
            return null;
        }

        return parsed;
    } catch {
        return null;
    }
};

export const writeAuthSessionCache = (user: UserResponse): void => {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        sessionStorage.setItem(
            AUTH_SESSION_STORAGE_KEY,
            JSON.stringify({ user } satisfies AuthSessionCache),
        );
    } catch {
        return;
    }
};

export const clearAuthSessionCache = (): void => {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        sessionStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    } catch {
        return;
    }
};
