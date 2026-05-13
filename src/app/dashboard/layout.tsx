"use client"

import { usePathname } from 'next/navigation';
import { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DashboardSidebar } from '@/components/dashboard/layout/dashboard-sidebar';
import { DashboardHeader } from '@/components/dashboard/layout/dashboard-header';
import { cn } from '@/lib/utils';

interface Props {
  children: ReactNode
}

export default function DashboardLayout({ children }: Props) {
  const { i18n } = useTranslation('dashboard');
  const pathname = usePathname();
  const isRTL = i18n.language === "ar"
  const isAssistant = pathname === '/dashboard/assistant';

  return (
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
  );
}
