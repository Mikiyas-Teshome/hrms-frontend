import { OrgUnitList } from '@/components/dashboard/organization/org-unit-list';

export default function CompanyPage() {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Company</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    View all companies in your organization.
                </p>
            </div>
            <OrgUnitList
                type="COMPANY"
                title="Companies"
                description="All company units in your organization hierarchy"
            />
        </div>
    );
}
