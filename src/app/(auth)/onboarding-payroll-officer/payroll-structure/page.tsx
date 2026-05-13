"use client";

import { useTranslation } from "react-i18next";
import { OnboardingHeader } from '@/components/onboarding/shared/onboarding-header';
import { PublicHeader } from '@/components/common/public-header';
import { PayrollOfficerStructure } from '@/components/onboarding/payroll/payroll-officer-structure';

export default function PayrollOfficerStructurePage() {
  const { t } = useTranslation("payrollOfficerStructure");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader showSave={true} />
      
      <main className="mx-auto max-w-7xl px-6 py-6 sm:px-10 lg:py-8">
        <div className="mx-auto flex max-w-4xl flex-col gap-8">
          <div className="flex flex-col gap-1.5">
            <OnboardingHeader 
              title={t("title")}
              subtitle={t("subtitle")}
            />
          </div>
          
          <PayrollOfficerStructure />
        </div>
      </main>
    </div>
  );
}
