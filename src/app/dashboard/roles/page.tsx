"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import RolesPage from "@/components/dashboard/roles/Roles";

export default function Page() {
  return <ProtectedRoute module="roles"><RolesPage /></ProtectedRoute>;
}
