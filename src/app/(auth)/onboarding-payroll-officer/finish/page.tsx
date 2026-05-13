"use client";

import { Castle } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { PublicHeader } from '@/components/common/public-header';

export default function PayrollOfficerFinishPage() {
  const router = useRouter();
  const { t } = useTranslation("payrollOfficerFinish");

  return (
      <div className="flex min-h-screen flex-col bg-background text-foreground">
          <PublicHeader showLanguage={true} />

          <main className="flex flex-1 items-center justify-center px-6 py-10">
              <div className="flex w-full max-w-300 flex-col items-center gap-14 lg:flex-row lg:gap-24">
                  <div className="flex w-full max-w-115 justify-center lg:flex-1 lg:justify-start">
                      <Castle
                          className="size-70 text-foreground sm:size-85 lg:size-105"
                          strokeWidth={1.2}
                      />
                  </div>

                  <div className="w-full max-w-125 text-center lg:flex-1 lg:text-left rtl:lg:text-right">
                      <h1 className="text-[44px] font-bold leading-[1.05] text-foreground md:text-[56px]">
                          {t('title')}
                      </h1>
                      <p className="mt-6 text-[22px] leading-[1.45] text-muted-foreground md:text-[24px]">
                          {t('subtitle')}
                      </p>
                      <Button
                          onClick={() => router.push('/dashboard/payroll-officer')}
                          className="mt-10 h-12 w-full rounded-[8px] bg-primary text-[15px] font-medium text-primary-foreground hover:bg-primary/90"
                      >
                          {t('action')}
                      </Button>
                  </div>
              </div>
          </main>
      </div>
  );
}