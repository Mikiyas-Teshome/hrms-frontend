'use client';

import { useTranslation } from 'react-i18next';
import { DashboardOrganizationHierarchy } from '@/components/dashboard/organization/dashboard-org-hierarchy';

export default function OrganizationHierarchyPage() {
    const { t } = useTranslation('orgStructure');

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">{t('page.title')}</h1>
                <p className="text-sm text-muted-foreground mt-1">{t('page.subtitle')}</p>
            </div>
            <DashboardOrganizationHierarchy />
        </div>
    );
}
