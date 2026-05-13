import { OrgUnitList } from '@/components/dashboard/organization/org-unit-list';

export default function SubDivisionPage() {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Sub-division</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    View all sub-divisions across your organization.
                </p>
            </div>
            <OrgUnitList
                type="SUB_DIVISION"
                title="Sub-divisions"
                description="All sub-division units in your organization hierarchy"
            />
        </div>
    );
}
