"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import EmployeeLifecycle from "@/components/dashboard/employees/EmployeeLifecycle";

export default function EmployeeLifecyclePage() {
  return (
    <ProtectedRoute module="employee_lifecycle">
      <EmployeeLifecycle />
    </ProtectedRoute>
  );
}
