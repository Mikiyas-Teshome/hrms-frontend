"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { PayrollComponentsPage } from "@/components/dashboard/payroll/payroll-components-page";

export default function Page() {
  return (
    <ProtectedRoute module="payroll_components">
      <PayrollComponentsPage />
    </ProtectedRoute>
  );
}
