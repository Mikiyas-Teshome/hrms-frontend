"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import EmployeeDirectory from "@/components/dashboard/employees/EmployeeDirectory";

export default function Page() {
  return (
    <ProtectedRoute module="employees">
      <EmployeeDirectory />
    </ProtectedRoute>
  );
}
