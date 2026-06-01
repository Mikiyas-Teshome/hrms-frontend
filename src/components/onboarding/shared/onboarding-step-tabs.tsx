"use client"

import * as React from "react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const onboardingTabsListClassName =
  "h-9 w-full max-w-154.5 bg-secondary p-0.75 rounded-[10px] border-none"

const onboardingTabTriggerClassName =
  "flex-1 h-7 rounded-[8px] data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground font-medium text-sm transition-all"

interface OnboardingStepTabsProps {
  value: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

function OnboardingStepTabs({
  value,
  onValueChange,
  children,
  className,
}: OnboardingStepTabsProps) {
  return (
    <Tabs
      value={value}
      onValueChange={onValueChange}
      className={cn("w-full gap-4", className)}
    >
      {children}
    </Tabs>
  )
}

function OnboardingStepTabsList({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className="flex">
      <TabsList className={cn(onboardingTabsListClassName, className)}>
        {children}
      </TabsList>
    </div>
  )
}

function OnboardingStepTabTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsTrigger>) {
  return (
    <TabsTrigger
      className={cn(onboardingTabTriggerClassName, className)}
      {...props}
    />
  )
}

function OnboardingStepTabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsContent>) {
  return (
    <TabsContent
      className={cn("space-y-6 focus-visible:outline-none", className)}
      {...props}
    />
  )
}

export {
  OnboardingStepTabs,
  OnboardingStepTabsList,
  OnboardingStepTabTrigger,
  OnboardingStepTabsContent,
  onboardingTabsListClassName,
  onboardingTabTriggerClassName,
}
