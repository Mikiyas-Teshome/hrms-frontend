"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import LeaveTypesPage from "@/components/dashboard/leave-types/LeaveTypes";

export default function Page() {
  return <ProtectedRoute module="leave_types"><LeaveTypesPage /></ProtectedRoute>;
}
