"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import ComplianceTrackingPage from "@/components/dashboard/documents/ComplianceTrackingPage";

const Page = () => {
    return (
        <ProtectedRoute module="compliance">
            <ComplianceTrackingPage />
        </ProtectedRoute>
    );
};

export default Page;
