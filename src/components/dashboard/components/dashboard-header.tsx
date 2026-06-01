"use client";

import { useTranslation } from "react-i18next"
import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
// import { LanguageSwitcher } from "@/components/language-switcher";
// import { ThemeToggle } from "@/components/theme-toggle";
// import { DashboardHeaderSkeleton } from "./dashboard-header-skeleton";
import { useAttendanceRecords, useClockIn, useClockOut } from "@/features/attendance/hooks/useAttendance";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogIn, LogOut, Bell, MessageSquare, Search, Calendar } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DashboardHeaderSkeleton } from "../layout/dashboard-header-skeleton";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { ThemeToggle } from "@/components/common/theme-toggle";

export function DashboardHeader() {
  const { t, i18n } = useTranslation("dashboard")
  const searchParams = useSearchParams()
  const isEditing = searchParams.get("edit") === "true"
  const { user, isInitializing } = useAuth()
  const { toast } = useToast()
  
  const locale = i18n.language
  const isRTL = locale === "ar"

  const todayStr = format(new Date(), 'yyyy-MM-dd')
  
  const { data: attendanceRecords, refetch: refetchAttendance } = useAttendanceRecords(
    user?.id || '', 
    todayStr, 
    todayStr
  );
  
  const { mutate: doClockIn, isPending: isClockingIn } = useClockIn();
  const { mutate: doClockOut, isPending: isClockingOut } = useClockOut();

  const currentRecord = attendanceRecords?.[0];
  const isClockedIn = !!currentRecord?.clockIn && !currentRecord?.clockOut;
  const hasFinishedDay = !!currentRecord?.clockIn && !!currentRecord?.clockOut;
  const isTenantSuperAdmin = user?.role === 'TENANT_SUPER_ADMIN';

  const handleClockAction = () => {
    if (isClockedIn) {
      const clockOutInput = { 
        recordId: currentRecord.id,
        clockOut: new Date().toISOString()
      };
      doClockOut(clockOutInput, {
        onSuccess: () => {
          toast({ title: t('attendance.clockOutSuccess', 'Clocked Out'), description: t('attendance.clockOutDesc', 'You have successfully clocked out.'), variant: "success" });
          refetchAttendance();
        },
        onError: (err: any) => {
          toast({ title: t('common.error', 'Error'), description: err.message || "Failed to clock out", variant: "destructive" });
        }
      });
    } else {
      const clockInInput = {
        userId: user?.id || '',
        date: new Date().toISOString(),
        clockIn: new Date().toISOString()
      };
      doClockIn(clockInInput, {
        onSuccess: () => {
          toast({ title: t('attendance.clockInSuccess', 'Clocked In'), description: t('attendance.clockInDesc', 'You have successfully clocked in.'), variant: "success" });
          refetchAttendance();
        },
        onError: (err: any) => {
          toast({ title: t('common.error', 'Error'), description: err.message || "Failed to clock in", variant: "destructive" });
        }
      });
    }
  };

  const currentDate = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date())

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (isInitializing) {
    return <DashboardHeaderSkeleton />;
  }

  const formattedTime = currentTime.toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const formattedDate = currentTime.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const clockButton = !isTenantSuperAdmin && (
    <div 
      className="hidden lg:flex flex-row items-center justify-center p-[6px_12px_6px_16px] gap-3 bg-[rgba(19,109,236,0.12)] dark:bg-blue-500/10 rounded-[12px] h-12 rtl:flex-row-reverse"
      style={{ width: isClockedIn ? "218px" : "221px" }}
    >
      {/* Welcome Section / Clock Display */}
      <div className="flex flex-col items-start rtl:items-end p-0 gap-[2px] flex-none">
        <div className="text-[14px] font-bold leading-[17px] text-[#0F172A] dark:text-slate-100 flex items-center">
          {formattedTime}
        </div>
        <div className="text-[12px] font-normal leading-[14px] text-[#64748B] dark:text-slate-400 flex items-center">
          {isClockedIn ? t('attendance.totalTime', 'Total time') : formattedDate}
        </div>
      </div>

      {/* Button Section */}
      <Button
        onClick={handleClockAction}
        disabled={isClockingIn || isClockingOut || hasFinishedDay}
        size="sm"
        className={cn(
          "flex flex-row justify-center items-center p-[8px_16px] gap-2 h-9 rounded-lg font-medium transition-all flex-none",
          isClockedIn 
            ? "bg-[#DC2626] border border-[#EF4444] text-[#FEF2F2] w-[122px]" 
            : "bg-[#2865E3] text-[#FAFAFA] w-[109px]"
        )}
      >
        {isClockingIn || isClockingOut ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isClockedIn ? (
          <LogOut className="h-4 w-4" />
        ) : (
          <LogIn className="h-4 w-4" />
        )}
        <span className="text-[14px] font-medium leading-[20px] flex items-center">
          {isClockingIn || isClockingOut 
            ? t('attendance.processing', '...') 
            : isClockedIn 
              ? t('attendance.clockOut', 'Clock Out') 
              : hasFinishedDay 
                ? t('attendance.finished', 'Finished')
                : t('attendance.clockIn', 'Clock In')}
        </span>
      </Button>
    </div>
  );


  return (
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
          {isEditing ? (
              <>
                  <div className="flex items-center gap-4">
                      <h1 className="text-xl font-bold text-foreground">
                          {t("edit.title")}
                      </h1>
                  </div>
                  <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end text-right md:flex">
                          <span className="text-sm font-bold text-foreground leading-none">
                              {user?.fullName || "Alex Johnson"}
                          </span>
                          <span className="text-xs text-muted-foreground mt-1">
                              {user?.role || "HR Director"}
                          </span>
                      </div>
                      <Avatar className="h-10 w-10 rounded-full border-none bg-[#FFE5B8]">
                          <AvatarImage src="" alt={user?.fullName || "User"} />
                          <AvatarFallback className="rounded-full">
                              {user ? `${user.firstName?.[0]?.toUpperCase() || ""}${user.lastName?.[0]?.toUpperCase() || ""}` : "AJ"}
                          </AvatarFallback>
                      </Avatar>
                  </div>
              </>
          ) : (
              <>
                  {/* Left Block (LTR: Sidebar/Logo/Search, RTL: User Profile/Actions) */}
                  <div className="flex items-center gap-4 order-1 rtl:order-3">
                      <SidebarTrigger className="lg:hidden" />
                      {!isRTL ? (
                          <div className="flex items-center gap-4">
                              <div className="hidden lg:flex relative w-87.5">
                                  <Search
                                      className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                                      strokeWidth={1.33}
                                  />
                                  <Input
                                      placeholder={t('header.searchPlaceholder')}
                                      className="h-9 w-full rounded-lg border border-border bg-white pl-9 pr-3 shadow-xs text-sm placeholder:text-[#6B7280] focus-visible:ring-0"
                                  />
                              </div>
                              <LanguageSwitcher />
                              <ThemeToggle />
                          </div>
                      ) : (
                          <div className="flex items-center gap-3">
                              <LanguageSwitcher />
                              <ThemeToggle />
                              <Avatar className="h-10 w-10 rounded-full border-none bg-[#FFE5B8]">
                                  <AvatarImage src="" alt={user?.fullName || "User"} />
                                  <AvatarFallback className="rounded-full">
                                      {user ? `${user.firstName?.[0]?.toUpperCase() || ""}${user.lastName?.[0]?.toUpperCase() || ""}` : "U"}
                                  </AvatarFallback>
                              </Avatar>
                              <div className="hidden flex-col items-start text-left md:flex">
                                  <span className="text-sm font-bold text-[#0F172A] leading-none">
                                      {user?.fullName || "مستخدم"}
                                  </span>
                                  <span className="text-xs text-[#64748B] mt-1">{user?.role || "موظف"}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                  {clockButton}
                                  <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-9 w-9 rounded-full relative"
                                  >
                                      <Bell className="h-5 w-5 text-foreground" strokeWidth={1.4} />
                                      <span className="absolute top-[7.5px] right-[8.92px] h-1 w-1 rounded-full bg-[#EF4444]" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                                      <MessageSquare className="h-5 w-5 text-foreground" strokeWidth={1.4} />
                                  </Button>
                              </div>
                              <div className="hidden lg:flex relative md:flex h-9 w-36 items-center rounded-lg border border-border bg-background pr-3 pl-10 shadow-xs cursor-pointer">
                                  <span className="text-sm font-medium text-foreground">{currentDate}</span>
                                  <div className="absolute left-2 top-1.5 flex size-6 items-center justify-center rounded-lg">
                                      <Calendar className="size-3.5 text-foreground" strokeWidth={1.33} />
                                  </div>
                              </div>
                          </div>
                      )}
                  </div>

                  <div className="flex-1 order-2" />

                  {/* Right Block (LTR: User Profile/Actions, RTL: Sidebar/Logo/Search) */}
                  <div className="flex items-center gap-4 order-3 rtl:order-1">
                      {!isRTL ? (
                          <div className="flex items-center gap-3">
                              <div className="hidden lg:flex relative md:flex h-9 w-36 items-center rounded-lg border border-border bg-background pl-3 pr-10 shadow-xs cursor-pointer">
                                  <span className="text-sm font-medium text-foreground">{currentDate}</span>
                                  <div className="absolute right-2 top-1.5 flex size-6 items-center justify-center rounded-lg">
                                      <Calendar className="size-3.5 text-foreground" strokeWidth={1.33} />
                                  </div>
                              </div>
                              <div className="flex items-center gap-3">
                                  {clockButton}
                                  <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-9 w-9 rounded-full relative"
                                  >
                                      <Bell className="h-5 w-5 text-foreground" strokeWidth={1.4} />
                                      <span className="absolute top-[7.5px] right-[8.92px] h-1 w-1 rounded-full bg-[#EF4444]" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                                      <MessageSquare className="h-5 w-5 text-foreground" strokeWidth={1.4} />
                                  </Button>
                              </div>
                              <div className="mx-2 h-8 w-px bg-background hidden md:block" />
                              <Link href="/dashboard/my-profile" className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                                  <div className="hidden flex-col items-end text-right md:flex">
                                      <span className="text-sm font-bold text-foreground leading-none">
                                          {user?.fullName || "User"}
                                      </span>
                                      <span className="text-xs text-muted-foreground mt-1">{user?.role || "Employee"}</span>
                                  </div>
                                  <Avatar className="h-10 w-10 rounded-full border-none bg-[#FFE5B8]">
                                      <AvatarImage src="" alt={user?.fullName || "User"} />
                                      <AvatarFallback className="rounded-full">
                                          {user ? `${user.firstName?.[0]?.toUpperCase() || ""}${user.lastName?.[0]?.toUpperCase() || ""}` : "U"}
                                      </AvatarFallback>
                                  </Avatar>
                              </Link>
                          </div>
                      ) : (
                          <div className="flex items-center gap-4">
                              <div className="hidden lg:flex relative w-87.5">
                                  <Search
                                      className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                                      strokeWidth={1.33}
                                  />
                                  <Input
                                      placeholder={t('header.searchPlaceholder')}
                                      className="h-9 w-full rounded-lg border border-border bg-white pr-9 pl-3 shadow-xs text-right text-sm placeholder:text-[#6B7280] focus-visible:ring-0"
                                  />
                              </div>
                              <SidebarTrigger className="lg:hidden" />
                          </div>
                      )}
                  </div>
              </>
          )}
      </header>
  );
}
