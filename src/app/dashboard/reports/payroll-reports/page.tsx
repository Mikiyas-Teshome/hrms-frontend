"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import PayrollReportsPage from "@/components/dashboard/reports/PayrollReportsPage";

export default function Page() {
  return <ProtectedRoute module="reports_payroll"><PayrollReportsPage /></ProtectedRoute>;
}
