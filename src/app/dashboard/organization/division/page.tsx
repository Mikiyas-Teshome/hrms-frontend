import { OrgUnitTable } from '@/components/dashboard/organization/org-unit-table';

export default function DivisionPage() {
    return (
        <div className="p-6 min-h-full">
            <OrgUnitTable type="DIVISION" />
        </div>
    );
}
