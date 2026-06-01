import { ProtectedRoute } from '@/components/auth/protected-route';
import { SettingsPage } from '@/components/dashboard/settings/SettingsPage';

export default function SettingsRoute() {
    return (
        <ProtectedRoute module="dashboard">
            <SettingsPage />
        </ProtectedRoute>
    );
}
