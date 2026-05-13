"use client";

import { OnboardingHeader } from '@/components/onboarding/shared/onboarding-header';
import { PublicHeader } from '@/components/common/public-header';
import { PayrollStructureForm } from '@/components/onboarding/payroll/payroll-structure-form';
import { useTranslation } from "react-i18next";

export default function DashboardPayrollStructurePage() {
  const { t } = useTranslation("payrollStructure");

  return (
    <div className="min-h-[calc(100vh-(--spacing(20)))] bg-background text-foreground">
      <PublicHeader showSave={true} />
      
      <main className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:py-4 lg:my-2">
        <div className="mx-auto flex max-w-4xl flex-col gap-2">
          <div className="flex flex-col gap-[32px] pt-6">
            <OnboardingHeader 
              title={t("header.title")}
              subtitle={t("header.subtitle")}
            />
          </div>
          
          <div className="mt-[40px]">
            <PayrollStructureForm mode="dashboard" />
          </div>
        </div>
      </main>
    </div>
  );
}
