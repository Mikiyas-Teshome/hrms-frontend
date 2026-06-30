'use client';

import React from 'react';
import EmployeeDocumentsByOwnerPage from '@/components/dashboard/documents/EmployeeDocumentsByOwnerPage';
import { ProtectedRoute } from '@/components/auth/protected-route';

interface EmployeeDocumentsByOwnerRouteProps {
  params: Promise<{
    ownerId: string;
  }>;
}

export default function EmployeeDocumentsByOwnerRoute({
  params,
}: EmployeeDocumentsByOwnerRouteProps) {
  const { ownerId } = React.use(params);

  return (
    <ProtectedRoute module="documents" allowAnyModulePermission>
      <EmployeeDocumentsByOwnerPage ownerId={ownerId} />
    </ProtectedRoute>
  );
}
