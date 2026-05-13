"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { hasPermission } from "@/features/auth/utils/permissions";
import { DashboardSkeleton } from "@/components/dashboard/layout/dashboard-skeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
  module: string;
  action?: string;
}

export function ProtectedRoute({ 
  children, 
  module, 
  action = "read" 
}: ProtectedRouteProps) {
  const { permissionsMap, isInitializing, isAuthenticated } = useAuth();
  const router = useRouter();

  const allowed = hasPermission(permissionsMap, module, action);

  useEffect(() => {
    if (!isInitializing) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (!allowed) {
        router.push("/404");
      }
    }
  }, [isInitializing, isAuthenticated, allowed, router]);

  if (isInitializing) {
    return <DashboardSkeleton />;
  }

  if (!isAuthenticated || !allowed) {
    return null;
  }

  return <>{children}</>;
}
