"use client"

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DashboardSidebar } from '@/components/dashboard/layout/dashboard-sidebar';
import { DashboardHeader } from '@/components/dashboard/layout/dashboard-header';
import { TenantSuperAdminDashboardProvider } from '@/components/dashboard/layout/tenant-super-admin-dashboard-provider';
import { PushNotificationProvider } from '@/components/dashboard/layout/push-notification-provider';
import { useAuth } from '@/contexts/AuthContext';
import { requiresStaffOnboarding } from '@/lib/onboarding/navigation';
import { cn } from '@/lib/utils';

interface Props {
  children: ReactNode
}

export default function DashboardLayout({ children }: Props) {
  const { i18n } = useTranslation('dashboard');
  const pathname = usePathname();
  const router = useRouter();
  const { user, isInitializing, isProfileSettling } = useAuth();
  const isRTL = i18n.language === "ar"
  const isAssistant = pathname === '/dashboard/assistant';
  const isTenantSuperAdmin = user?.role === 'TENANT_SUPER_ADMIN';
  const shouldRedirectFromDashboard = user != null && requiresStaffOnboarding(user);

  useEffect(() => {
    if (isInitializing || isProfileSettling || !user) {
      return;
    }

    if (requiresStaffOnboarding(user)) {
      router.replace('/onboard');
    }
  }, [isInitializing, isProfileSettling, user, router]);

  if (isInitializing || isProfileSettling || shouldRedirectFromDashboard) {
    return null;
  }

  const shell = (
    <PushNotificationProvider>
      <SidebarProvider>
        <DashboardSidebar side={isRTL ? 'right' : 'left'} />
        <SidebarInset className="h-svh overflow-hidden flex flex-col">
          <div className="flex-1 flex flex-col bg-background text-foreground md:m-2 md:ml-0 md:rounded-xl shadow-sm overflow-hidden border">
            <DashboardHeader />
            <main
              id="dashboard-main"
              className={cn(
                'flex-1 overflow-auto p-4 md:p-6 custom-scrollbar',
                isAssistant && 'no-scrollbar',
              )}
            >
              {children}
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </PushNotificationProvider>
  );

  if (isTenantSuperAdmin) {
    return <TenantSuperAdminDashboardProvider>{shell}</TenantSuperAdminDashboardProvider>;
  }

  return shell;
}
