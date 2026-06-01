'use client';

import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UserResponse } from '@/features/auth/auth.types';
import { getProfile } from '@/features/auth/auth.actions';
import { AUTH_PROFILE_QUERY_KEY } from '@/features/auth/auth-session.constants';
import {
    clearAuthSessionCache,
    readAuthSessionCache,
    writeAuthSessionCache,
} from '@/features/auth/auth-session-cache.util';
import { hasPermission } from '@/features/auth/utils/permissions';
import type { PermissionsMap } from '@/features/roles/roles.types';

export type { PermissionsMap };

type AuthContextValue = {
    user: UserResponse | null;
    permissionsMap: PermissionsMap;
    isAuthenticated: boolean;
    isInitializing: boolean;
    setUser: (user: UserResponse | null) => void;
    reloadSession: () => Promise<void>;
    checkPermission: (module: string, action?: string) => boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const getPermissionsMapFromUser = (user: UserResponse | null | undefined): PermissionsMap =>
    (user?.roleProfile?.permissionsMap as PermissionsMap) ?? {};

export function AuthProvider({
    children,
    initialUser = null,
}: {
    children: React.ReactNode;
    initialUser?: UserResponse | null;
}) {
    const queryClient = useQueryClient();
    const cachedSession = useMemo(() => readAuthSessionCache(), []);

    const { data: user, isPending } = useQuery({
        queryKey: AUTH_PROFILE_QUERY_KEY,
        queryFn: () => getProfile(),
        initialData: initialUser || cachedSession?.user || undefined,
        staleTime: 60 * 1000,
        retry: false,
    });

    const resolvedUser = user ?? null;
    const permissionsMap = getPermissionsMapFromUser(resolvedUser);
    const hasCachedSession = Boolean(initialUser || cachedSession?.user);
    const isInitializing = isPending && !hasCachedSession;

    useEffect(() => {
        if (resolvedUser) {
            writeAuthSessionCache(resolvedUser);
            return;
        }

        if (!isPending) {
            clearAuthSessionCache();
        }
    }, [resolvedUser, isPending]);

    const handleSetUser = useCallback(
        (newUser: UserResponse | null) => {
            queryClient.setQueryData(AUTH_PROFILE_QUERY_KEY, newUser);
            if (newUser) {
                writeAuthSessionCache(newUser);
                return;
            }
            clearAuthSessionCache();
        },
        [queryClient],
    );

    const checkPermission = useCallback(
        (module: string, action: string = 'read') => {
            return hasPermission(permissionsMap, module, action);
        },
        [permissionsMap],
    );

    const reloadSession = useCallback(async () => {
        const existingUser = queryClient.getQueryData<UserResponse | null>(AUTH_PROFILE_QUERY_KEY);
        await queryClient.cancelQueries({ queryKey: AUTH_PROFILE_QUERY_KEY });

        const profile = await queryClient.fetchQuery({
            queryKey: AUTH_PROFILE_QUERY_KEY,
            queryFn: () => getProfile(),
            staleTime: 0,
        });

        try {
            const profile = await queryClient.fetchQuery({
                queryKey: AUTH_PROFILE_QUERY_KEY,
                queryFn: () => getProfile(),
            });

            if (profile) {
                writeAuthSessionCache(profile);
                queryClient.setQueryData(AUTH_PROFILE_QUERY_KEY, profile);
                return;
            }
        } catch {
            if (existingUser) {
                return;
            }
        }

        if (existingUser) {
            return;
        }

        clearAuthSessionCache();
        queryClient.setQueryData(AUTH_PROFILE_QUERY_KEY, null);
    }, [queryClient]);

    const value = useMemo<AuthContextValue>(
        () => ({
            user: resolvedUser,
            permissionsMap,
            isAuthenticated: Boolean(resolvedUser),
            isInitializing,
            setUser: handleSetUser,
            reloadSession,
            checkPermission,
        }),
        [
            resolvedUser,
            permissionsMap,
            isInitializing,
            handleSetUser,
            reloadSession,
            checkPermission,
        ],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider.');
    }
    return context;
}
