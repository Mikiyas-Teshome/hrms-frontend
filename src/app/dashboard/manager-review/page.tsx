"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { ManagerReviewView } from "@/components/dashboard/manager/manager-review-view";

export default function Page() {
  return <ProtectedRoute module="team"><ManagerReviewView /></ProtectedRoute>;
}
