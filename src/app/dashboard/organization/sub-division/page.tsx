import { OrgUnitTable } from '@/components/dashboard/organization/org-unit-table';

export default function SubDivisionPage() {
    return (
        <div className="p-6 min-h-full">
            <OrgUnitTable type="SUB_DIVISION" />
        </div>
    );
}
