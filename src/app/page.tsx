import { cookies } from 'next/headers';
import { LandingPage } from '@/components/landing/landing-page';
import { AuthenticatedHomeRedirect } from '@/components/auth/authenticated-home-redirect';

export default async function HomePage() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('hrms.accessToken')?.value;
    const refreshToken = cookieStore.get('hrms.refreshToken')?.value;

    if (accessToken || refreshToken) {
        return <AuthenticatedHomeRedirect />;
    }

    return <LandingPage />;
}
