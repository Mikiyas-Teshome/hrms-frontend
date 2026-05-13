import { OrgUnitList } from '@/components/dashboard/organization/org-unit-list';

export default function DepartmentPage() {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Department</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    View all departments across your organization.
                </p>
            </div>
            <OrgUnitList
                type="DEPARTMENT"
                title="Departments"
                description="All department units in your organization hierarchy"
            />
        </div>
    );
}
