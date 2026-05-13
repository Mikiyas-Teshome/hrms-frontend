"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import CustomReportsPage from "@/components/dashboard/reports/CustomReportsPage";

export default function Page() {
  return <ProtectedRoute module="reports_custom"><CustomReportsPage /></ProtectedRoute>;
}
