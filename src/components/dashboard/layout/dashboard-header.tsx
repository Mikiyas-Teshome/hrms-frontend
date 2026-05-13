/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LanguageSwitcher } from '@/components/common/language-switcher';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { DashboardHeaderSkeleton } from '@/components/dashboard/layout/dashboard-header-skeleton';
import { AttendanceClock } from '@/components/dashboard/layout/attendance-clock';
import { Bell, MessageSquare, Search, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DashboardHeader() {
    const { t, i18n } = useTranslation('dashboard');
    const searchParams = useSearchParams();
    const isEditing = searchParams.get('edit') === 'true';
    const { user, isInitializing } = useAuth();
    const isRTL = i18n.language === 'ar';
    const isTenantSuperAdmin = user?.role === 'TENANT_SUPER_ADMIN';

    if (isInitializing) {
        return <DashboardHeaderSkeleton />;
    }

    return (
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
            {isEditing ? (
                <>
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-foreground">{t('edit.title')}</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end text-right md:flex">
                            <span className="text-sm font-bold text-foreground leading-none">
                                {user?.fullName || 'Alex Johnson'}
                            </span>
                            <span className="text-xs text-muted-foreground mt-1">
                                {user?.role || 'HR Director'}
                            </span>
                        </div>
                        <Avatar className="h-10 w-10 rounded-full border-none bg-[#FFE5B8]">
                            <AvatarImage src="" alt={user?.fullName || 'User'} />
                            <AvatarFallback className="rounded-full">
                                {user
                                    ? `${user.firstName?.[0]?.toUpperCase() || ''}${user.lastName?.[0]?.toUpperCase() || ''}`
                                    : 'AJ'}
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
                                    <AvatarImage src="" alt={user?.fullName || 'User'} />
                                    <AvatarFallback className="rounded-full">
                                        {user
                                            ? `${user.firstName?.[0]?.toUpperCase() || ''}${user.lastName?.[0]?.toUpperCase() || ''}`
                                            : 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="hidden flex-col items-start text-left md:flex">
                                    <span className="text-sm font-bold text-[#0F172A] leading-none">
                                        {user?.fullName || 'مستخدم'}
                                    </span>
                                    <span className="text-xs text-[#64748B] mt-1">
                                        {user?.role || 'موظف'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    {!isTenantSuperAdmin && <AttendanceClock />}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 rounded-full relative"
                                    >
                                        <Bell
                                            className="h-5 w-5 text-foreground"
                                            strokeWidth={1.4}
                                        />
                                        <span className="absolute top-[7.5px] right-[8.92px] h-1 w-1 rounded-full bg-[#EF4444]" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 rounded-full"
                                    >
                                        <MessageSquare
                                            className="h-5 w-5 text-foreground"
                                            strokeWidth={1.4}
                                        />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 order-2" />

                    {/* Right Block (LTR: User Profile/Actions, RTL: Sidebar/Logo/Search) */}
                    <div className="flex items-center gap-4 order-3 rtl:order-1">
                        {!isRTL ? (
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-3">
                                    {!isTenantSuperAdmin && <AttendanceClock />}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 rounded-full relative"
                                    >
                                        <Bell
                                            className="h-5 w-5 text-foreground"
                                            strokeWidth={1.4}
                                        />
                                        <span className="absolute top-[7.5px] right-[8.92px] h-1 w-1 rounded-full bg-[#EF4444]" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 rounded-full"
                                    >
                                        <MessageSquare
                                            className="h-5 w-5 text-foreground"
                                            strokeWidth={1.4}
                                        />
                                    </Button>
                                </div>
                                <div className="mx-2 h-8 w-px bg-background hidden md:block" />
                                <Link
                                    href="/dashboard/my-profile"
                                    className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                                >
                                    <div className="hidden flex-col items-end text-right md:flex">
                                        <span className="text-sm font-bold text-foreground leading-none">
                                            {user?.fullName || 'User'}
                                        </span>
                                        <span className="text-xs text-muted-foreground mt-1">
                                            {user?.role || 'Employee'}
                                        </span>
                                    </div>
                                    <Avatar className="h-10 w-10 rounded-full border-none bg-[#FFE5B8]">
                                        <AvatarImage src="" alt={user?.fullName || 'User'} />
                                        <AvatarFallback className="rounded-full">
                                            {user
                                                ? `${user.firstName?.[0]?.toUpperCase() || ''}${user.lastName?.[0]?.toUpperCase() || ''}`
                                                : 'U'}
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
