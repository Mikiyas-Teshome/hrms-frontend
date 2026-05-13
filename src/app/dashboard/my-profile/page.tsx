'use client';

import MyProfileView from '@/components/dashboard/my-profile/MyProfileView';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Loader2 } from 'lucide-react';

export default function MyProfilePage() {
    const { user, isInitializing } = useAuth();

    if (isInitializing) {
        return (
            <div className="flex w-full h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
            </div>
        );
    }

    if (!user?.id) {
        return (
            <div className="flex w-full h-[50vh] items-center justify-center">
                <p className="text-muted-foreground">User not found.</p>
            </div>
        );
    }

    // We can use the 'dashboard' or 'employees' module for their own profile, 
    // or just let ProtectedRoute pass it if they are logged in.
    return (
        <ProtectedRoute module="dashboard">
            <MyProfileView employeeId={user.id} />
        </ProtectedRoute>
    );
}
