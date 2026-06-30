"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import EmployeeDocumentsPage from "@/components/dashboard/documents/EmployeeDocumentsPage";

const Page = () => {
    return (
        <ProtectedRoute module="documents" allowAnyModulePermission>
            <EmployeeDocumentsPage />
        </ProtectedRoute>
    );
};

export default Page;
