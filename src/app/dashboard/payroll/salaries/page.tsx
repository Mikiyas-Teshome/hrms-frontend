"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { EmployeeSalariesPage } from "@/components/dashboard/payroll/employee-salaries-page";

export default function Page() {
  return (
    <ProtectedRoute module="employee_salaries">
      <EmployeeSalariesPage />
    </ProtectedRoute>
  );
}
