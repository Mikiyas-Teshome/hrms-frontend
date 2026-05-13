"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import HRReportsPage from "@/components/dashboard/reports/HRReportsPage";

export default function Page() {
  return <ProtectedRoute module="reports_hr"><HRReportsPage /></ProtectedRoute>;
}
