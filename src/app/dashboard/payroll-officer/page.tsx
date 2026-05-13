"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { PayrollOfficerView } from "@/components/dashboard/payroll/payroll-officer-view";

export default function Page() {
  return <ProtectedRoute module="payroll_runs"><PayrollOfficerView /></ProtectedRoute>;
}
