'use client';

import { useTranslation } from 'react-i18next';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
    getUserDisplayName,
    getUserInitials,
    getUserRoleLabel,
} from '@/features/auth/utils/user-display.util';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { SecureAvatar } from '@/components/common/secure-avatar';
import { LanguageSwitcher } from '@/components/common/language-switcher';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { DashboardHeaderSkeleton } from '@/components/dashboard/layout/dashboard-header-skeleton';
import { AttendanceClock } from '@/components/dashboard/layout/attendance-clock';
import { DashboardQuickSearch } from '@/components/dashboard/layout/dashboard-quick-search';
import { NotificationBell } from '@/components/dashboard/layout/notification-panel';
import { TenantDashboardHeaderControls } from '@/components/dashboard/layout/tenant-dashboard-header-controls';
import { useMyEmployeeProfile } from '@/features/employee/hooks/useEmployee';

export function DashboardHeader() {
    const { t, i18n } = useTranslation('dashboard');
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isEditing = searchParams.get('edit') === 'true';
    const { user, isInitializing } = useAuth();
    const isRTL = i18n.language === 'ar';
    const isTenantSuperAdmin = user?.role === 'TENANT_SUPER_ADMIN';
    const { data: employee } = useMyEmployeeProfile({
        enabled: Boolean(user) && !isTenantSuperAdmin,
    });
    const avatarReference = user?.avatarUrl ?? employee?.avatarUrl ?? null;
    const isTenantDashboardHome = pathname === '/dashboard';
    const isDashboardEditMode = isEditing && isTenantDashboardHome;

    const searchSlot = isDashboardEditMode ? (
        <h1 className="text-xl font-normal text-foreground whitespace-nowrap truncate">
            {t('edit.title')}
        </h1>
    ) : (
        <DashboardQuickSearch isRTL={isRTL} className="w-full" />
    );
    const displayName = getUserDisplayName(user);
    const roleLabel = getUserRoleLabel(user, t);
    const initials = getUserInitials(user);

    const profileBlock = (
        <Link
            href="/dashboard/my-profile"
            className="flex items-center gap-3 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
        >
            <div className="hidden sm:flex flex-col items-end text-right min-w-0 max-w-32 rtl:items-start rtl:text-left">
                <span className="text-sm font-bold text-foreground leading-none truncate w-full">
                    {displayName}
                </span>
                <span className="text-xs text-muted-foreground mt-1 truncate w-full">{roleLabel}</span>
            </div>
            <SecureAvatar
                className="h-10 w-10 shrink-0 rounded-full border-none bg-[#FFE5B8] dark:bg-amber-900/40"
                reference={avatarReference}
                alt={displayName}
                fallback={initials}
                fallbackClassName="rounded-full text-foreground"
            />
        </Link>
    );

    if (isInitializing) {
        return <DashboardHeaderSkeleton />;
    }

    return (
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-2 sm:gap-3 border-b bg-background px-4 md:px-6 overflow-visible">
            {isTenantSuperAdmin ? (
                <>
                    <SidebarTrigger className="lg:hidden shrink-0 order-1" />
                    {isTenantDashboardHome && !isDashboardEditMode ? (
                        <div className="flex items-center min-w-0 shrink order-1 lg:order-none">
                            <TenantDashboardHeaderControls />
                        </div>
                    ) : !isTenantDashboardHome ? (
                        <div className="flex flex-1 min-w-0 order-1 lg:order-none max-w-md xl:max-w-87.5">
                            {searchSlot}
                        </div>
                    ) : (
                        <div className="flex items-center min-w-0 shrink order-1 lg:order-none max-w-md xl:max-w-87.5">
                            {searchSlot}
                        </div>
                    )}
                    {isTenantDashboardHome && !isDashboardEditMode && (
                        <div className="hidden lg:flex flex-1 justify-center min-w-0 px-3 order-2 max-w-md xl:max-w-87.5 mx-auto">
                            <DashboardQuickSearch isRTL={isRTL} className="w-full max-w-87.5" />
                        </div>
                    )}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0 order-3 ms-auto">
                        {isTenantDashboardHome && !isDashboardEditMode && (
                            <div className="lg:hidden shrink-0 min-w-0">
                                <DashboardQuickSearch isRTL={isRTL} className="w-36 sm:w-44" />
                            </div>
                        )}
                        <LanguageSwitcher />
                        <ThemeToggle />
                        <NotificationBell align={isRTL ? 'left' : 'right'} />
                        {profileBlock}
                    </div>
                </>
            ) : (
                <>
                    <div className="flex items-center gap-4 order-1 rtl:order-3 min-w-0">
                        <SidebarTrigger className="lg:hidden shrink-0" />
                        {!isRTL ? (
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="hidden lg:flex min-w-0 max-w-87.5">
                                    {searchSlot}
                                </div>
                                <LanguageSwitcher />
                                <ThemeToggle />
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 min-w-0">
                                <LanguageSwitcher />
                                <ThemeToggle />
                                {profileBlock}
                                <div className="flex items-center gap-3 shrink-0">
                                    <AttendanceClock />
                                    <NotificationBell align="left" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 order-2 min-w-0" />

                    <div className="flex items-center gap-4 order-3 rtl:order-1 shrink-0 min-w-0">
                        {!isRTL ? (
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="flex items-center gap-3 shrink-0">
                                    <AttendanceClock />
                                    <NotificationBell align="right" />
                                </div>
                                <div className="mx-2 h-8 w-px bg-background hidden md:block shrink-0" />
                                <Link
                                    href="/dashboard/my-employee"
                                    className="flex items-center gap-3 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                                >
                                    <div className="hidden flex-col items-end text-right md:flex">
                                        <span className="text-sm font-bold text-foreground leading-none">
                                            {user?.fullName || 'User'}
                                        </span>
                                        <span className="text-xs text-muted-foreground mt-1">
                                            {user?.role || 'Employee'}
                                        </span>
                                    </div>
                                    <SecureAvatar
                                        className="h-10 w-10 rounded-full border-none bg-[#FFE5B8]"
                                        reference={avatarReference}
                                        alt={user?.fullName || 'User'}
                                        fallback={
                                            user
                                                ? `${user.firstName?.[0]?.toUpperCase() || ''}${user.lastName?.[0]?.toUpperCase() || ''}`
                                                : 'U'
                                        }
                                        fallbackClassName="rounded-full"
                                    />
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="hidden lg:flex min-w-0 max-w-87.5">
                                    {searchSlot}
                                </div>
                                <SidebarTrigger className="lg:hidden shrink-0" />
                            </div>
                        )}
                    </div>
                </>
            )}
        </header>
    );
}
