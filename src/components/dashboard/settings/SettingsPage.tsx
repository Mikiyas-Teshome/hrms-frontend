'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { getVisibleSettingsNavItems } from '@/features/settings/settings-navigation.util';
import { GeneralSection } from './sections/GeneralSection';
import { AppearanceSection } from './sections/AppearanceSection';
import { OrgPreferencesSection } from './sections/OrgPreferencesSection';
// import { AttendanceTimeSection } from './sections/AttendanceTimeSection';
// import { LeaveManagementSection } from './sections/LeaveManagementSection';
// import { PayrollSection } from './sections/PayrollSection';
import { SecuritySection } from './sections/SecuritySection';
// import { CompOffPolicySection } from './sections/CompOffPolicySection';
import { GeneralSectionSkeleton } from './SettingsSectionSkeleton';

export function SettingsPage() {
    const { t } = useTranslation('settings');
    const router = useRouter();
    const { permissionsMap, isInitializing, isAuthenticated } = useAuth();
    const [selectedSection, setSelectedSection] = useState<string | null>(null);

    const visibleNavItems = useMemo(() => {
        const items = getVisibleSettingsNavItems(permissionsMap);
        // Temporarily hidden: leave management, payroll, comp-off policy
        return items.filter((item) => !['leave', 'payroll', 'comp-off', 'attendance'].includes(item.id));
    }, [permissionsMap]);

    const activeSection = useMemo(() => {
        if (selectedSection && visibleNavItems.some((item) => item.id === selectedSection)) {
            return selectedSection;
        }
        return visibleNavItems[0]?.id || 'security';
    }, [selectedSection, visibleNavItems]);

    useEffect(() => {
        if (isInitializing) {
            return;
        }

        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        if (visibleNavItems.length === 0) {
            router.replace('/dashboard');
        }
    }, [isAuthenticated, isInitializing, router, visibleNavItems.length]);

    const renderSection = () => {
        switch (activeSection) {
            case 'general':
                return <GeneralSection />;
            case 'appearance':
                return <AppearanceSection />;
            case 'org-preferences':
                return <OrgPreferencesSection />;
            // case 'attendance':
            //     return <AttendanceTimeSection />;
            // case 'leave':
            //     return <LeaveManagementSection />;
            // case 'payroll':
            //     return <PayrollSection />;
            case 'security':
                return <SecuritySection />;
            // case 'comp-off':
            //     return <CompOffPolicySection />;
            default:
                return <SecuritySection />;
        }
    };

    if (isInitializing || visibleNavItems.length === 0) {
        return (
            <div className="flex flex-col gap-6">
                <GeneralSectionSkeleton />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <div>
                <h1 className="text-2xl font-bold text-foreground">{t('title', 'Settings')}</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    {t('subtitle', 'Core platform behavior and workspace preferences.')}
                </p>
            </div>

            <div className="border-t border-border" />

            <div className="md:hidden -mx-4 px-4 mb-2">
                <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                    {visibleNavItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setSelectedSection(item.id)}
                            className={cn(
                                'shrink-0 px-3 py-1.5 cursor-pointer rounded-full text-xs font-medium transition-colors whitespace-nowrap',
                                activeSection === item.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:text-foreground',
                            )}
                        >
                            {t(item.labelKey)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex gap-8">
                <nav className="hidden md:block w-48 shrink-0">
                    <ul className="flex flex-col gap-0.5">
                        {visibleNavItems.map((item) => (
                            <li key={item.id}>
                                <button
                                    onClick={() => setSelectedSection(item.id)}
                                    className={cn(
                                        'w-full text-left px-3 py-2 cursor-pointer rounded-md text-sm transition-colors',
                                        activeSection === item.id
                                            ? 'bg-primary/10 text-primary font-semibold'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                                    )}
                                >
                                    {t(item.labelKey)}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="flex-1 min-w-0">{renderSection()}</div>
            </div>
        </div>
    );
}
