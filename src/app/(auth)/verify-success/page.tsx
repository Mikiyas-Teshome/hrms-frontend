"use client";

import { VerificationSuccess } from '@/components/auth/verification-success';
import { PublicHeader } from "@/components/common/public-header";
import { useTranslation } from "react-i18next";

export default function VerifySuccessPage() {
  const { t } = useTranslation("verification");

  return (
    <main className="min-h-screen">
      <PublicHeader />
      <div className="mt-10" suppressHydrationWarning>
        <VerificationSuccess
          title={t("success.title")}
          subtitle={t("success.subtitle")}
          buttonLabel={t("success.button")}
        />
      </div>
    </main>
  );
}
