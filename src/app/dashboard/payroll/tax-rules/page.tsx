"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { TaxRulesPage } from "@/components/dashboard/payroll/tax-rules-page";

export default function Page() {
  return (
    <ProtectedRoute module="payroll_components">
      <TaxRulesPage />
    </ProtectedRoute>
  );
}
