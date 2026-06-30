"use client";

import { VerificationSuccess } from '@/components/auth/verification-success';
import { PublicHeader } from "@/components/common/public-header";
import { useTranslation } from "react-i18next";

export default function EmployeeSuccessPage() {
  const { t } = useTranslation("employeeSuccess");

  return (
    <main className="min-h-screen">
      <PublicHeader />
      <div className="flex min-h-[calc(100vh-48px)] items-center justify-center px-4" suppressHydrationWarning>
        <VerificationSuccess
          title={t("title")}
          subtitle={t("subtitle")}
          buttonLabel={t("button")}
          redirectTo="/dashboard"
        />
      </div>
    </main>
  );
}
