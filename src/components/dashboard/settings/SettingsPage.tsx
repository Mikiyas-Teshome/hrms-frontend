'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { GeneralSection } from './sections/GeneralSection';
import { AppearanceSection } from './sections/AppearanceSection';
import { OrgPreferencesSection } from './sections/OrgPreferencesSection';
import { AttendanceTimeSection } from './sections/AttendanceTimeSection';
import { LeaveManagementSection } from './sections/LeaveManagementSection';
import { PayrollSection } from './sections/PayrollSection';
import { NotificationSection } from './sections/NotificationSection';
import { SecuritySection } from './sections/SecuritySection';

export function SettingsPage() {
    const { t } = useTranslation('settings');
    const [activeSection, setActiveSection] = useState('general');

    const NAV_ITEMS = [
        { id: 'general', label: t('nav.general', 'General') },
        { id: 'appearance', label: t('nav.appearance', 'Appearance') },
        { id: 'org-preferences', label: t('nav.orgPreferences', 'Org Preferences') },
        { id: 'attendance', label: t('nav.attendance', 'Attendance & Time') },
        { id: 'leave', label: t('nav.leave', 'Leave Management') },
        { id: 'payroll', label: t('nav.payroll', 'Payroll') },
        { id: 'notification', label: t('nav.notification', 'Notification') },
        { id: 'security', label: t('nav.security', 'Security') },
    ];

    const renderSection = () => {
        switch (activeSection) {
            case 'general': return <GeneralSection />;
            case 'appearance': return <AppearanceSection />;
            case 'org-preferences': return <OrgPreferencesSection />;
            case 'attendance': return <AttendanceTimeSection />;
            case 'leave': return <LeaveManagementSection />;
            case 'payroll': return <PayrollSection />;
            case 'notification': return <NotificationSection />;
            case 'security': return <SecuritySection />;
            default: return <GeneralSection />;
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground">{t('title', 'Settings')}</h1>
                <p className="text-sm text-muted-foreground mt-1">{t('subtitle', 'Core platform behavior and workspace preferences.')}</p>
            </div>

            <div className="border-t border-border" />

            {/* Mobile: horizontal scrollable tab bar */}
            <div className="md:hidden -mx-4 px-4 mb-2">
                <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={cn(
                                'shrink-0 px-3 py-1.5 cursor-pointer rounded-full text-xs font-medium transition-colors whitespace-nowrap',
                                activeSection === item.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:text-foreground'
                            )}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Desktop: sidebar + content; Mobile: content only */}
            <div className="flex gap-8">
                {/* Sidebar — hidden on mobile */}
                <nav className="hidden md:block w-48 shrink-0">
                    <ul className="flex flex-col gap-0.5">
                        {NAV_ITEMS.map((item) => (
                            <li key={item.id}>
                                <button
                                    onClick={() => setActiveSection(item.id)}
                                    className={cn(
                                        'w-full text-left px-3 py-2 cursor-pointer rounded-md text-sm transition-colors',
                                        activeSection === item.id
                                            ? 'bg-primary/10 text-primary font-semibold'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                    )}
                                >
                                    {item.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {renderSection()}
                </div>
            </div>
        </div>
    );
}
