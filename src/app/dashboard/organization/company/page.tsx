import { OrgUnitTable } from '@/components/dashboard/organization/org-unit-table';

export default function CompanyPage() {
    return (
        <div className="p-6 min-h-full">
            <OrgUnitTable type="COMPANY" />
        </div>
    );
}
