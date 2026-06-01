'use client';

import MyProfileView from '@/components/dashboard/my-profile/MyProfileView';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function MyProfilePage() {
    return (
        <ProtectedRoute module="dashboard">
            <MyProfileView />
        </ProtectedRoute>
    );
}
