'use client';

import { Suspense } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import AssistantPage from '@/components/dashboard/assistant/AssistantPage';
import { DashboardSkeleton } from '@/components/dashboard/layout/dashboard-skeleton';

export default function Page() {
  return (
    <ProtectedRoute module="assistant" action="query">
      <Suspense fallback={<DashboardSkeleton />}>
        <AssistantPage />
      </Suspense>
    </ProtectedRoute>
  );
}
