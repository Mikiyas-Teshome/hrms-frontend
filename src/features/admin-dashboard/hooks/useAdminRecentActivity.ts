'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchAnnouncementsForCurrentUser } from '@/features/announcement/announcement.actions';
import { fetchAuditLogs } from '@/features/audit/audit.actions';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { fetchMyNotifications } from '@/features/notification/notification.actions';
import { chartScopeReady } from '../admin-chart.utils';
import {
  DASHBOARD_ACTIVITY_LIMIT,
  mapAnnouncementToActivityRow,
  mapAuditLogToActivityRow,
  mapNotificationToActivityRow,
  mergeRecentActivityRows,
} from '../recent-activity.utils';

const STALE_TIME_MS = 60_000;

export function useAdminRecentActivity(companyId: string, enabled = true) {
  const { hasPermission } = usePermissions();
  const canReadAnnouncements = hasPermission('announcements:read');
  const canReadAudit = hasPermission('audit_logs:read');
  const scopeReady = chartScopeReady(enabled, companyId);

  const queryEnabled = scopeReady;

  const { data, isLoading } = useQuery({
    queryKey: [
      'admin-dashboard',
      'recent-activity',
      companyId,
      canReadAnnouncements,
      canReadAudit,
    ],
    queryFn: async () => {
      const [announcements, notifications, auditLogs] = await Promise.all([
        canReadAnnouncements
          ? fetchAnnouncementsForCurrentUser(DASHBOARD_ACTIVITY_LIMIT)
          : Promise.resolve([]),
        fetchMyNotifications(),
        canReadAudit ? fetchAuditLogs({ companyId }) : Promise.resolve([]),
      ]);

      const announcementRows = announcements
        .filter((item) => item.companyId === companyId)
        .map(mapAnnouncementToActivityRow);

      const notificationRows = notifications
        .filter(
          (record) =>
            record.type === 'in_app' && record.companyId === companyId,
        )
        .map(mapNotificationToActivityRow);

      const auditRows = auditLogs.map(mapAuditLogToActivityRow);

      return mergeRecentActivityRows([
        ...announcementRows,
        ...notificationRows,
        ...auditRows,
      ]);
    },
    enabled: queryEnabled,
    staleTime: STALE_TIME_MS,
    refetchOnWindowFocus: false,
  });

  const rows = data ?? [];

  return {
    rows,
    isLoading: queryEnabled && isLoading,
    scopeReady,
    canReadAnnouncements,
    canReadAudit,
  };
}
