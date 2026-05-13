"use client";

import { Castle } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { PublicHeader } from '@/components/common/public-header';

export default function CompleteSetupPage() {
  const router = useRouter();
  const { t } = useTranslation("companySuccess");

  return (
      <div className="min-h-screen bg-background flex flex-col">
          {/* Header */}
          <PublicHeader showLanguage={true} />

          {/* Main Content */}
          <main className="grow flex items-center justify-center p-6">
              <div className="w-full max-w-300 flex flex-col items-center justify-center gap-12 lg:flex-row lg:gap-32">
                  {/* Illustration */}
                  <div className="flex w-full max-w-100 flex-1 justify-center lg:justify-end">
                      <div className="relative flex size-64 items-center justify-center rounded-2xl bg-background sm:size-80 lg:size-100">
                          <Castle
                              className="size-48 text-foreground sm:size-64 lg:size-100"
                              strokeWidth={1}
                          />
                      </div>
                  </div>

                  {/* Text Content */}
                  <div className="flex max-w-100 flex-1 flex-col items-center text-center lg:items-start lg:text-start rtl:lg:items-end rtl:lg:text-end">
                      <h1 className="mb-4 text-[32px] font-bold tracking-tight text-foreground leading-[1.2]">
                          {t('title')}
                      </h1>

                      <p className="mb-10 text-base leading-relaxed text-muted-foreground">
                          {t('subtitle')}
                      </p>

                      <Button
                          onClick={() => router.push('/dashboard')}
                          className="h-9 w-full max-w-80 "
                      >
                          {t('openDashboard')}
                      </Button>
                  </div>
              </div>
          </main>
      </div>
  );
}