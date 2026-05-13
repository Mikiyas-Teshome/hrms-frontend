"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import LeaveBalances from "@/components/dashboard/leave-balances/LeaveBalances";

export default function LeaveBalancesPage() {
  return (
    <ProtectedRoute module="leave_balances">
      <LeaveBalances />
    </ProtectedRoute>
  );
}
