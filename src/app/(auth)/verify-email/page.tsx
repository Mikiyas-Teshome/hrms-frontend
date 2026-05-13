"use client";

import { VerificationForm } from '@/components/auth/verification-form';
import { PublicHeader } from "@/components/common/public-header";

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen">
      <PublicHeader />
      <div className="mt-20">
        <VerificationForm />
      </div>
    </main>
  );
}
