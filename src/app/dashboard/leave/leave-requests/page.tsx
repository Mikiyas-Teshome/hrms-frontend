"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import LeaveRequests from "@/components/dashboard/leave-requests/LeaveRequests";

export default function Page() {
  return <ProtectedRoute module="leave_requests"><LeaveRequests /></ProtectedRoute>;
}
