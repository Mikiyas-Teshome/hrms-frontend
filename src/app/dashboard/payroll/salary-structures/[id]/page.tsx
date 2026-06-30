"use client";

import { use } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { SalaryStructureDetailPage } from "@/components/dashboard/payroll/salary-structure-detail-page";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function Page({ params }: PageProps) {
  const { id } = use(params);

  return (
    <ProtectedRoute module="employee_salaries">
      <SalaryStructureDetailPage structureId={id} />
    </ProtectedRoute>
  );
}
