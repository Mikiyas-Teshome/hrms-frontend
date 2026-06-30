"use client";

import { use } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { PayrollRunDetailPage } from "@/components/dashboard/payroll/payroll-run-detail-page";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function Page({ params }: PageProps) {
  const { id } = use(params);

  return (
    <ProtectedRoute module="payroll_runs">
      <PayrollRunDetailPage runId={id} />
    </ProtectedRoute>
  );
}
