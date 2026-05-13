"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import LeavePolicies from "@/components/dashboard/leave-policies/LeavePolicies";

export default function Page() {
  return <ProtectedRoute module="leave_policies"><LeavePolicies /></ProtectedRoute>;
}
