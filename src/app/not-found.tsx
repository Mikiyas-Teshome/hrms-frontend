"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MoveLeft, Home } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { user, permissionsMap } = useAuth();
  const router = useRouter();
  const { t } = useTranslation("dashboard");

  const getHomeRoute = () => {
    if (!user) return "/login";
    
    const modules = [
      { id: "dashboard", path: "/dashboard" },
      { id: "employees", path: "/dashboard/employees" },
      { id: "attendance", path: "/dashboard/attendance" },
      { id: "leave_requests", path: "/dashboard/leave" },
      { id: "payroll_runs", path: "/dashboard/payroll" },
    ];

    for (const mod of modules) {
      if (permissionsMap[mod.id]?.['read'] || permissionsMap[mod.id]?.['manage']) {
        return mod.path;
      }
    }

    return "/dashboard";
  };

  return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-primary/10 rounded-full blur-[120px] opacity-50" />
          <div className="relative z-10 flex flex-col items-center max-w-lg w-full animate-in fade-in zoom-in duration-700">
              <div className="relative mb-8 flex items-center justify-center">
                  <div className="text-[140px] md:text-[180px] font-black tracking-tighter text-zinc-800 select-none leading-none">
                      404
                  </div>
              </div>
              <div className="text-center space-y-2 mb-8">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                      {t('common.pageNotFound', { defaultValue: 'Page Not Found' })}
                  </h1>
                  <p className="text-muted-foreground text-sm md:text-base max-w-70 mx-auto leading-relaxed font-normal">
                      {t('common.pageNotFoundDesc', {
                          defaultValue:
                              "Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.",
                      })}
                  </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                  <Button
                      variant="ghost"
                      size="lg"
                      onClick={() => router.back()}
                      className="w-full sm:w-auto gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all h-12 px-6"
                  >
                      <MoveLeft className="w-4 h-4" />
                      {t('common.goBack', { defaultValue: 'Go Back' })}
                  </Button>

                  <Button
                      asChild
                      size="lg"
                      className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 rounded-xl transition-all hover:scale-105 active:scale-95 h-12 px-8"
                  >
                      <Link href={getHomeRoute()}>
                          <Home className="w-4 h-4" />
                          {t('common.backToHome', { defaultValue: 'Back to Home' })}
                      </Link>
                  </Button>
              </div>
          </div>
      </div>
  );
}
