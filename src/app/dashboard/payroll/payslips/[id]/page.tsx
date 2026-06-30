"use client";

import { use } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { PayslipDetailPage } from "@/components/dashboard/payroll/payslip-detail-page";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function Page({ params }: PageProps) {
  const { id } = use(params);

  return (
    <ProtectedRoute module="payslips">
      <PayslipDetailPage payslipId={id} />
    </ProtectedRoute>
  );
}
