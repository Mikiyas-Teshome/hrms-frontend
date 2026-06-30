"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { PayrollRunsPage } from "@/components/dashboard/payroll/payroll-runs-page";

export default function Page() {
  return (
    <ProtectedRoute module="payroll_runs">
      <PayrollRunsPage />
    </ProtectedRoute>
  );
}
