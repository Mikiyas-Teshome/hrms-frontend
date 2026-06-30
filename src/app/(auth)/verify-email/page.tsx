"use client";

import { VerificationForm } from '@/components/auth/verification-form';
import { PublicHeader } from "@/components/common/public-header";

export default function VerifyEmailPage() {
  return (
      <main className="min-h-screen">
          <PublicHeader />
          <div className="flex min-h-[calc(100vh-48px)] items-center justify-center px-4">
              <VerificationForm />
          </div>
      </main>
  );
}
