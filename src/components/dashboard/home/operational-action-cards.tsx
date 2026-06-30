'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ArrowRight, FileClock, Users, CalendarOff, BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { useOperationalDashboardStats } from './use-operational-dashboard-stats';

export function OperationalActionCards() {
  const { t } = useTranslation('dashboard');
  const { hasPermission } = usePermissions();
  const {
    pendingApprovals,
    isLeaveStatsLoading,
    employeeCount,
    isEmployeesLoading,
    onLeaveCount,
    isAttendanceStatsLoading,
    showAttendanceStats,
    canReadLeaveRequests,
  } = useOperationalDashboardStats();

  const cards: Array<{
    key: string;
    show: boolean;
    href: string;
    icon: typeof FileClock;
    title: string;
    value: string;
    isLoading: boolean;
  }> = [
    {
      key: 'pending-approvals',
      show: canReadLeaveRequests,
      href: '/dashboard/leave/leave-requests',
      icon: FileClock,
      title: hasPermission('employees:read')
        ? t('stats.pendingApprove', 'Pending approvals')
        : t('managerDashboard.pendingLeave', 'Pending leave approvals'),
      value: String(pendingApprovals),
      isLoading: isLeaveStatsLoading,
    },
    {
      key: 'employees',
      show: hasPermission('employees:read'),
      href: '/dashboard/employees/directory',
      icon: Users,
      title: t('stats.totalEmployees', 'Total employees'),
      value: employeeCount !== null ? String(employeeCount) : '—',
      isLoading: isEmployeesLoading,
    },
    {
      key: 'on-leave',
      show: showAttendanceStats,
      href: '/dashboard/attendance/overview',
      icon: CalendarOff,
      title: t('managerDashboard.onLeave', 'On leave today'),
      value: onLeaveCount !== null ? String(onLeaveCount) : '—',
      isLoading: isAttendanceStatsLoading,
    },
    {
      key: 'reports',
      show: hasPermission('reports_hr:read'),
      href: '/dashboard/reports/hr-reports',
      icon: BarChart3,
      title: t('sidebar.reports.hr', 'HR reports'),
      value: t('home.openReports', 'View'),
      isLoading: false,
    },
  ].filter((card) => card.show);

  if (cards.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {cards.map((card) => (
        <Link key={card.key} href={card.href} className="group block">
          <Card className="h-full border-border shadow-sm transition-colors hover:border-primary/40">
            <CardContent className="flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <card.icon className="h-4 w-4" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <div className="text-2xl font-semibold text-foreground">
                  {card.isLoading ? <Skeleton className="h-8 w-12 rounded-md" /> : card.value}
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
