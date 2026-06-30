"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { SalaryStructuresPage } from "@/components/dashboard/payroll/salary-structures-page";

export default function Page() {
  return (
    <ProtectedRoute module="employee_salaries">
      <SalaryStructuresPage />
    </ProtectedRoute>
  );
}
