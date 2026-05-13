"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import InsurancePage from "@/components/dashboard/benefits/InsurancePage";

export default function Page() {
  return <ProtectedRoute module="benefits_insurance"><InsurancePage /></ProtectedRoute>;
}
