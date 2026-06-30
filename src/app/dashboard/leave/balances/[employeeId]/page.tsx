'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import LeaveBalancesByEmployeePage from '@/components/dashboard/leave-balances/LeaveBalancesByEmployeePage';

interface LeaveBalancesByEmployeeRouteProps {
    params: Promise<{
        employeeId: string;
    }>;
}

export default function LeaveBalancesByEmployeeRoute({
    params,
}: LeaveBalancesByEmployeeRouteProps) {
    const { employeeId } = React.use(params);

    return (
        <ProtectedRoute module="leave_balances">
            <LeaveBalancesByEmployeePage employeeId={employeeId} />
        </ProtectedRoute>
    );
}
