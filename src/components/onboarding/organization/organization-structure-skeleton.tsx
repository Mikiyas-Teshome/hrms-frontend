"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  OnboardingStepTabs,
  OnboardingStepTabsList,
  OnboardingStepTabTrigger,
  OnboardingStepTabsContent,
} from "@/components/onboarding/shared/onboarding-step-tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { OnboardingFormActions } from "@/components/onboarding/shared/onboarding-form-actions";

interface HierarchyNodeSkeletonProps {
  index: number;
  isLast?: boolean;
  inner?: React.ReactNode;
  t: any;
}

function HierarchyNodeSkeleton({
  index,
  isLast,
  inner,
  t,
}: HierarchyNodeSkeletonProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-end isolate gap-8",
        index === 0 && "min-w-max pb-4"
      )}
    >
      {/* Row: Icon + Card */}
      <div className="relative flex flex-row items-center gap-3 self-stretch z-1">
        {isLast && (
          <div
            className="absolute top-1/2 -translate-y-1/2 h-[1.5px] bg-primary/20 dark:h-0.5 dark:bg-white z-0"
            style={{
              left: `calc(-1 * (${index} * var(--indent-size) - 24px))`,
              width: `calc(${index} * var(--indent-size) - 24px)`,
            }}
            aria-hidden="true"
          />
        )}

        {/* Icon circle skeleton */}
        <div
          className="shrink-0 w-12 h-12 rounded-full bg-primary/20 dark:bg-primary/40 flex items-center justify-center z-2 animate-pulse"
          style={{
            boxShadow: "0px 10px 15px -3px rgba(53, 37, 205, 0.1), 0px 4px 6px -4px rgba(53, 37, 205, 0.1)",
          }}
        >
          <div className="size-6 rounded-full bg-white/20" />
        </div>

        {/* Card skeleton */}
        <div
          className="flex-1 min-w-50 sm:min-w-75 flex flex-row justify-between items-center gap-4 px-4 py-4 rounded-[16px] border bg-primary/4 border-primary/20 dark:bg-[rgba(40,101,227,0.06)] dark:border-[rgba(40,101,227,0.3)] shadow-sm"
        >
          {/* Left: label + input skeleton */}
          <div className="flex flex-col gap-2 min-w-0">
            <span className="text-[10px] font-bold text-primary/60 dark:text-[#136DEC]/60 uppercase tracking-[1px] leading-3.75 font-inter">
              {t("hierarchy.level", { number: index + 1 })}
            </span>
            <div className="relative w-45 sm:w-65 lg:w-75">
              <Skeleton className="h-9 w-full rounded-[8px] bg-primary/5 border border-primary/10 dark:bg-[rgba(181,212,255,0.05)] dark:border-[rgba(107,168,255,0.15)]" />
            </div>
          </div>

          {/* Right: Switch skeleton */}
          <Skeleton className="shrink-0 h-5 w-9 rounded-full bg-primary/20 dark:bg-primary/40" />
        </div>
      </div>

      {/* Nested child level node — Indented by var(--indent-size) to the right */}
      {inner && (
        <div className="w-full pl-(--indent-size) relative">
          <div
            className="absolute left-5.75 -top-20 bottom-0 w-[1.5px] bg-primary/20 dark:w-0.5 dark:bg-white z-0"
            aria-hidden="true"
          />
          {inner}
        </div>
      )}
      
      {isLast && (
        <div
          className="absolute right-full top-1/2 -bottom-25 bg-card dark:bg-[#1D1D1D] z-1"
          style={{
            left: `calc(-1 * ${index} * var(--indent-size))`,
            width: `calc(${index} * var(--indent-size) - 4px)`,
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export function OrganizationStructureSkeleton() {
  const { t } = useTranslation("orgStructure");

  // Build a skeleton tree of 5 levels
  const levelsCount = 5;
  let tree: React.ReactNode = null;
  for (let i = levelsCount - 1; i >= 0; i--) {
    tree = (
      <HierarchyNodeSkeleton
        key={`skeleton-level-${i}`}
        index={i}
        isLast={i === levelsCount - 1}
        inner={tree || undefined}
        t={t}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <OnboardingStepTabs value="hierarchy">
        <OnboardingStepTabsList>
          <OnboardingStepTabTrigger value="hierarchy">
            {t("tabs.hierarchy")}
          </OnboardingStepTabTrigger>
          <OnboardingStepTabTrigger value="builder">
            {t("tabs.builder")}
          </OnboardingStepTabTrigger>
        </OnboardingStepTabsList>

        <OnboardingStepTabsContent value="hierarchy">
          <Card className="rounded-[12px] border border-border/80 dark:border-[rgba(0,0,0,0.24)] bg-card dark:bg-[#1D1D1D] shadow-none dark:shadow-[0px_1px_3px_rgba(0,0,0,0.04),0px_1px_2px_-1px_rgba(0,0,0,0.04)] overflow-hidden">
            <CardHeader className="bg-muted/40 dark:bg-[rgba(10,10,10,0.5)] px-6 py-4 dark:py-4.5 border-b border-border/40 dark:border-border/10">
              <CardTitle className="text-sm font-semibold text-foreground dark:text-white font-albert-sans">
                {t("hierarchy.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 sm:px-10 pb-4 space-y-4">
              <div className="overflow-x-auto overflow-y-hidden -mx-2 px-2 [--indent-size:32px] sm:[--indent-size:48px]">
                {tree}
              </div>

              <div className="flex justify-end pt-1.5">
                <Skeleton className="h-9 w-40 rounded-[8px]" />
              </div>

              <div className="flex items-center gap-3 rounded-[12px] bg-primary/5 dark:bg-[rgba(19,109,236,0.12)] border border-primary/10 dark:border-[rgba(19,109,236,0.1)] py-3 px-4 rtl:flex-row-reverse">
                <div className="shrink-0 flex items-center justify-center">
                  <Info className="size-4.5 text-primary dark:text-[#136DEC]" />
                </div>
                <p className="text-sm text-foreground/80 dark:text-white/80 font-normal leading-relaxed font-albert-sans">
                  {t("hierarchy.customizeAlert")}
                </p>
              </div>
            </CardContent>
          </Card>
        </OnboardingStepTabsContent>
      </OnboardingStepTabs>

      <OnboardingFormActions
        backLabel={t("actions.back")}
        continueLabel={t("actions.continue")}
        continueType="button"
        showBorder={true}
        isSubmitting={true}
      />
    </div>
  );
}
