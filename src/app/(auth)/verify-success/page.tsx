"use client";

import { VerificationSuccess } from '@/components/auth/verification-success';
import { PublicHeader } from "@/components/common/public-header";
import { useTranslation } from "react-i18next";

export default function VerifySuccessPage() {
  const { t } = useTranslation("verification");

  return (
    <main className="min-h-screen">
      <PublicHeader />
      <div className="flex min-h-[calc(100vh-48px)] items-center justify-center px-4" suppressHydrationWarning>
        <VerificationSuccess
          title={t("success.title")}
          subtitle={t("success.subtitle")}
          buttonLabel={t("success.button")}
        />
      </div>
    </main>
  );
}
