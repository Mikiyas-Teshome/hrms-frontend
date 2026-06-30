'use client';

import { useTranslation } from 'react-i18next';
import { DashboardWelcomeHeader } from './dashboard-welcome-header';
import { PersonalStatsRow } from './personal-stats-row';
import { OperationalActionCards } from './operational-action-cards';
import { MyLeaveRequestsTable } from './my-leave-requests-table';
import { OvertimeSummaryCard } from './overtime-summary-card';
import { AnnouncementsCard } from './announcements-card';
import { NotificationsCard } from './notifications-card';
import { PersonalHomeDashboardSkeleton } from '@/components/dashboard/layout/dashboard-skeleton';
import { useDashboardHomeSections } from './use-dashboard-home-sections';
import { usePersonalHomeInitialLoading } from './use-personal-home-initial-loading';

export function UnifiedHomeView() {
  const { t } = useTranslation('dashboard');
  const {
    showOperationalCards,
    showPersonalStats,
    showLeaveRequests,
    showOvertime,
    showAnnouncements,
    showNotifications,
    showLeaveAndOvertimeRow,
    showCommsRow,
  } = useDashboardHomeSections();

  const isInitialLoading = usePersonalHomeInitialLoading({
    showOperationalCards,
    showPersonalStats,
  });

  if (isInitialLoading) {
    return (
      <PersonalHomeDashboardSkeleton
        showOperationalCards={showOperationalCards}
        showPersonalStats={showPersonalStats}
      />
    );
  }

  return (
    <div className="flex flex-col w-full gap-6 lg:gap-10 pb-8">
      <div className="flex flex-col gap-6 w-full">
        <DashboardWelcomeHeader
          subtitle={t(
            'homeDashboard.subtitle',
            "Here's what's happening with your work and team today.",
          )}
        />
        {showOperationalCards && <OperationalActionCards />}
        {showPersonalStats && <PersonalStatsRow />}
      </div>

      {showLeaveAndOvertimeRow && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 w-full">
          {showLeaveRequests && (
            <div className={showOvertime ? 'lg:col-span-3' : 'lg:col-span-4'}>
              <MyLeaveRequestsTable />
            </div>
          )}
          {showOvertime && (
            <div className={showLeaveRequests ? 'lg:col-span-1' : 'lg:col-span-4'}>
              <OvertimeSummaryCard />
            </div>
          )}
        </div>
      )}

      {showCommsRow && (
        <div className="flex flex-col md:flex-row gap-6 w-full">
          {showAnnouncements && <AnnouncementsCard />}
          {showNotifications && <NotificationsCard />}
        </div>
      )}
    </div>
  );
}
