'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePersonalDashboardStats } from './use-personal-dashboard-stats';

export function OvertimeSummaryCard() {
  const { t } = useTranslation('dashboard');
  const { overtimeSummary, showOvertime, canViewOvertimePage, isAttendanceLoading } =
    usePersonalDashboardStats();

  if (!showOvertime) {
    return null;
  }

  const entries = [
    {
      label: t('employeeDashboard.overtimeApproved', 'Approved'),
      value: overtimeSummary.approvedHours,
    },
    {
      label: t('employeeDashboard.overtimePending', 'Pending'),
      value: overtimeSummary.pendingHours,
    },
    {
      label: t('employeeDashboard.overtimeTotal', 'Total Hours'),
      value: overtimeSummary.totalHours,
    },
  ];

  return (
    <div className="flex flex-col w-full border border-border rounded-[10px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] overflow-hidden bg-card">
      <div className="flex flex-row items-center justify-between px-6 py-4 bg-[linear-gradient(0deg,rgba(255,255,255,0.5),rgba(255,255,255,0.5)),#F5F5F5] dark:bg-[linear-gradient(0deg,rgba(0,0,0,0.3),rgba(0,0,0,0.3)),#1D1D1D] h-[60px]">
        <h3 className="text-lg font-semibold leading-7 text-foreground tracking-[-0.4px]">
          {t('employeeDashboard.overtime', 'Overtime')}
        </h3>
      </div>

      <div className="flex flex-col gap-3 p-6">
        {entries.map((entry) => (
          <div key={entry.label} className="flex flex-row justify-between items-center gap-8">
            <span className="text-sm font-normal text-muted-foreground">{entry.label}</span>
            <span className="text-sm font-medium text-foreground">
              {isAttendanceLoading ? <Skeleton className="h-4 w-12 rounded-md" /> : entry.value}
            </span>
          </div>
        ))}

        {!isAttendanceLoading && !overtimeSummary.hasData && (
          <p className="text-xs text-muted-foreground">
            {t('employeeDashboard.noOvertime', 'No overtime recorded this month.')}
          </p>
        )}

        <div className="my-2 h-px bg-border w-full" />

        {canViewOvertimePage ? (
          <Button
            variant="ghost"
            className="w-full h-9 text-sm font-medium text-primary underline hover:no-underline rounded-lg px-4 justify-center"
            asChild
          >
            <Link href="/dashboard/attendance/overtime">
              {t('employeeDashboard.viewAll', 'View all overtime')}
            </Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
