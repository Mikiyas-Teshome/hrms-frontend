"use client";

import { use } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { EmployeeSalaryDetailPage } from "@/components/dashboard/payroll/employee-salary-detail-page";

type PageProps = {
  params: Promise<{ employeeId: string }>;
};

export default function Page({ params }: PageProps) {
  const { employeeId } = use(params);

  return (
    <ProtectedRoute module="employee_salaries">
      <EmployeeSalaryDetailPage employeeId={employeeId} />
    </ProtectedRoute>
  );
}
