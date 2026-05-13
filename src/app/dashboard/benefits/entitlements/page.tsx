"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import EntitlementsPage from "@/components/dashboard/benefits/EntitlementsPage";

export default function Page() {
  return <ProtectedRoute module="benefits_entitlements"><EntitlementsPage /></ProtectedRoute>;
}
