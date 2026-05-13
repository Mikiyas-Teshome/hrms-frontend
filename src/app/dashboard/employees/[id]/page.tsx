import EmployeeProfile from '@/components/dashboard/employees/EmployeeProfile';

interface EmployeeProfilePageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EmployeeProfilePage({ params }: EmployeeProfilePageProps) {
    const resolvedParams = await params;
    return <EmployeeProfile employeeId={resolvedParams.id} />;
}
