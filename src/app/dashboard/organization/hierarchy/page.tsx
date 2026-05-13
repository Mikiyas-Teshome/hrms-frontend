import { DashboardOrganizationHierarchy } from '@/components/dashboard/organization/dashboard-org-hierarchy';

export default function OrganizationHierarchyPage() {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Organisational hierarchy</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage your organization structure, levels, and units.
                </p>
            </div>
            <DashboardOrganizationHierarchy />
        </div>
    );
}
