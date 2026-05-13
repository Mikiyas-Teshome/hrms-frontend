"use client";

import { useSearchParams } from 'next/navigation';
import { TenantSuperAdminRegistrationForm } from '@/components/auth/tenant-super-admin-registration-form';
import { PublicHeader } from '@/components/common/public-header';

export default function RegisterTenantSuperAdminPage() {
      const searchParams = useSearchParams();
    const token = searchParams.get('token') || undefined;
    const email = searchParams.get('email') || undefined;
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
            <main>
                <TenantSuperAdminRegistrationForm 
                    invitationToken={token} 
                    initialEmail={email}
                    title="Invitation Tenant Super Admin" 
                />
            </main>
    </div>
  );
}
