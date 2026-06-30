'use client';

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { useLeaveRequestsPaginated } from '@/features/leave-request/hooks/useLeaveRequest';
import { usePaginatedAttendanceRecords } from '@/features/attendance/hooks/useAttendance';
import type { AdminRequestTab } from '../admin-request.types';
import {
  leaveFilterForTab,
  mergeAdminRequestRows,
  mapLeaveItemToAdminRow,
  mapOvertimeRecordToAdminRow,
  overtimeStatusForTab,
  adminRequestsDateRange,
  ADMIN_REQUESTS_FETCH_SIZE,
} from '../admin-request.utils';

export function useAdminEmployeeRequests(
  companyOuId: string,
  activeTab: AdminRequestTab,
  enabled = true,
) {
  const { i18n } = useTranslation();
  const { hasPermission } = usePermissions();

  const canReadLeave = hasPermission('leave_requests:read');
  const canReadOvertime = hasPermission('attendance:read');

  const scopeReady = enabled && !!companyOuId;
  const leaveFilter = useMemo(() => leaveFilterForTab(activeTab), [activeTab]);
  const { startDate, endDate } = useMemo(() => adminRequestsDateRange(), []);

  const overtimeStatus = overtimeStatusForTab(activeTab);

  const { data: leaveConnection, isLoading: isLeaveLoading } = useLeaveRequestsPaginated(
    scopeReady && canReadLeave ? companyOuId : undefined,
    leaveFilter,
    {
      page: 1,
      pageSize: ADMIN_REQUESTS_FETCH_SIZE,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    },
  );

  const { data: attendancePage, isLoading: isOvertimeLoading } = usePaginatedAttendanceRecords(
    1,
    ADMIN_REQUESTS_FETCH_SIZE,
    {
      hasOvertime: true,
      companyOuId,
      startDate,
      endDate,
      overtimeStatus,
    },
    scopeReady && canReadOvertime,
  );

  const rows = useMemo(() => {
    const leaveRows = (leaveConnection?.items ?? []).map((item) =>
      mapLeaveItemToAdminRow(item, i18n.language),
    );
    const overtimeRows = (attendancePage?.data ?? []).map(mapOvertimeRecordToAdminRow);
    return mergeAdminRequestRows(leaveRows, overtimeRows);
  }, [leaveConnection?.items, attendancePage?.data, i18n.language]);

  const isLoading =
    scopeReady &&
    ((canReadLeave && isLeaveLoading) || (canReadOvertime && isOvertimeLoading));

  const hasNoSources = !canReadLeave && !canReadOvertime;
  const isEmpty = scopeReady && !isLoading && !hasNoSources && rows.length === 0;

  return {
    rows,
    isLoading,
    isEmpty,
    hasNoSources,
    canReadLeave,
    canReadOvertime,
  };
}
