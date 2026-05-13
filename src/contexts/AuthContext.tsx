'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { UserResponse } from "@/features/auth/auth.types";
import { getProfile } from "@/features/auth/auth.actions";
import { hasPermission } from "@/features/auth/utils/permissions";
import type { PermissionsMap } from "@/features/roles/roles.types";

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [permissionsMap, setPermissionsMap] = useState<PermissionsMap>({});
  const [isInitializing, setIsInitializing] = useState(true);

  const handleSetUser = useCallback((newUser: UserResponse | null) => {
    setUser(newUser);
    const activePermissionsMap: PermissionsMap =
      (newUser?.roleProfile?.permissionsMap as PermissionsMap) ?? {};
    setPermissionsMap(activePermissionsMap);
  }, []);

  const checkPermission = useCallback(
    (module: string, action: string = "read") => {
      return hasPermission(permissionsMap, module, action);
    },
    [permissionsMap],
  );

  const fetchSessionData = async () => {
    try {
      const profile = await getProfile();
      const activePermissionsMap: PermissionsMap =
        (profile?.roleProfile?.permissionsMap as PermissionsMap) ?? {};
      return { profile, activePermissionsMap };
    } catch (error) {
      console.error("Failed to retrieve auth session", error);
      return { profile: null, activePermissionsMap: {} };
    }
  };

  useEffect(() => {
    let isActive = true;

    (async () => {
      const { profile, activePermissionsMap } = await fetchSessionData();
      if (isActive) {
        setUser(profile);
        setPermissionsMap(activePermissionsMap);
        setIsInitializing(false);
      }
    })();

    return () => {
      isActive = false;
    };
  }, []);

  const reloadSession = useCallback(async () => {
    // Clear stale state immediately so components never show the previous user's data
    setUser(null);
    setPermissionsMap({});
    const { profile, activePermissionsMap } = await fetchSessionData();
    setUser(profile);
    setPermissionsMap(activePermissionsMap);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      permissionsMap,
      isAuthenticated: Boolean(user),
      isInitializing,
      setUser: handleSetUser,
      reloadSession,
      checkPermission,
    }),
    [user, permissionsMap, isInitializing, handleSetUser, reloadSession, checkPermission],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}
