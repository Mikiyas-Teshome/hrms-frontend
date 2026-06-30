'use client';

import { useMemo } from 'react';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import {
  DASHBOARD_HOME_SECTIONS,
  type DashboardHomeSectionId,
} from './dashboard-home-sections.config';

export function useDashboardHomeSections() {
  const { hasPermission } = usePermissions();

  const visibleSections = useMemo(() => {
    const sections = new Set<DashboardHomeSectionId>();

    for (const section of DASHBOARD_HOME_SECTIONS) {
      if (section.alwaysShow) {
        sections.add(section.id);
        continue;
      }

      const permissions = section.permissionsAny ?? [];
      if (permissions.some((permission) => hasPermission(permission))) {
        sections.add(section.id);
      }
    }

    return sections;
  }, [hasPermission]);

  const isSectionVisible = (sectionId: DashboardHomeSectionId) => visibleSections.has(sectionId);

  const showOperationalCards = isSectionVisible('operationalCards');
  const showPersonalStats = isSectionVisible('personalStats');
  const showLeaveRequests = isSectionVisible('leaveRequests');
  const showOvertime = isSectionVisible('overtime');
  const showAnnouncements = isSectionVisible('announcements');
  const showNotifications = isSectionVisible('notifications');
  const showLeaveAndOvertimeRow = showLeaveRequests || showOvertime;
  const showCommsRow = showAnnouncements || showNotifications;

  return {
    visibleSections,
    isSectionVisible,
    showOperationalCards,
    showPersonalStats,
    showLeaveRequests,
    showOvertime,
    showAnnouncements,
    showNotifications,
    showLeaveAndOvertimeRow,
    showCommsRow,
  };
}
