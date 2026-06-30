'use client';

import MyEmployeeView from '@/components/dashboard/my-employee/MyEmployeeView';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function MyEmployeePage() {
    return (
        <ProtectedRoute module="dashboard">
            <MyEmployeeView />
        </ProtectedRoute>
    );
}
