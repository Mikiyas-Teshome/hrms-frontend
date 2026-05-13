import { OrgUnitList } from '@/components/dashboard/organization/org-unit-list';

export default function DivisionPage() {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Division</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    View all divisions across your organization.
                </p>
            </div>
            <OrgUnitList
                type="DIVISION"
                title="Divisions"
                description="All division units in your organization hierarchy"
            />
        </div>
    );
}
