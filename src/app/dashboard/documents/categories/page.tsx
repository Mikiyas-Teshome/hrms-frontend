"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import DocumentCategoriesPage from "@/components/dashboard/documents/DocumentCategoriesPage";

const Page = () => {
    return (
        <ProtectedRoute module="document_categories" action="create">
            <DocumentCategoriesPage />
        </ProtectedRoute>
    );
};

export default Page;
