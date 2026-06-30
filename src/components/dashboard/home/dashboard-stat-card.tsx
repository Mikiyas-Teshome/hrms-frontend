'use client';

import type { ElementType } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export interface DashboardStatCardProps {
  icon: ElementType;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
  isLoading?: boolean;
}

export function DashboardStatCard({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  value,
  isLoading = false,
}: DashboardStatCardProps) {
  return (
    <div className="flex flex-col items-start p-4 sm:p-[16px_24px] bg-card border border-border rounded-[14px] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] flex-1 min-w-0 gap-3 h-[140px]">
      <div className="flex flex-row items-start w-full gap-6">
        <div
          className="flex items-center justify-center w-9 h-9 rounded-lg border shrink-0"
          style={{ background: iconBg, borderColor: `${iconColor}80` }}
        >
          <Icon className="w-5 h-5" style={{ color: iconColor }} strokeWidth={1.5} />
        </div>
      </div>
      <div className="flex flex-col justify-center gap-1 w-full">
        <span className="text-sm font-normal leading-5 text-muted-foreground line-clamp-1">{label}</span>
        {isLoading ? (
          <Skeleton className="h-9 w-20 rounded-md mt-1" />
        ) : (
          <span className="text-[30px] font-semibold leading-9 text-foreground">{value}</span>
        )}
      </div>
    </div>
  );
}
