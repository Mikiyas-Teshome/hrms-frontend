"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { PayslipsPage } from "@/components/dashboard/payroll/payslips-page";

export default function Page() {
  return (
    <ProtectedRoute module="payslips">
      <PayslipsPage />
    </ProtectedRoute>
  );
}
