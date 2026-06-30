"use client";

import { useEffect } from "react";
import { notFound, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { hasModuleAccess, hasPermission } from "@/features/auth/utils/permissions";
import { DashboardSkeleton } from "@/components/dashboard/layout/dashboard-skeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
  module: string;
  action?: string;
  actions?: string[];
  actionsAny?: string[];
  allowAnyModulePermission?: boolean;
}

export function ProtectedRoute({
  children,
  module,
  action = "read",
  actions,
  actionsAny,
  allowAnyModulePermission = false,
}: ProtectedRouteProps) {
  const { permissionsMap, isInitializing, isAuthenticated } = useAuth();
  const router = useRouter();

  const allowed = allowAnyModulePermission
    ? hasModuleAccess(permissionsMap, module, { action, actionsAny })
    : actionsAny?.length
      ? actionsAny.some((requiredAction) =>
          hasPermission(permissionsMap, module, requiredAction),
        )
      : (actions?.length ? actions : [action]).every((requiredAction) =>
          hasPermission(permissionsMap, module, requiredAction),
        );

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      router.push("/login");
    }
  }, [isInitializing, isAuthenticated, router]);

  if (isInitializing) {
    return <DashboardSkeleton />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!allowed) {
    notFound();
  }

  return <>{children}</>;
}
