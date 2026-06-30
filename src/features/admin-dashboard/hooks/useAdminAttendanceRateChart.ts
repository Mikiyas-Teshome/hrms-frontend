'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { fetchAllPaginatedAttendance } from '@/lib/fetch-all-paginated-attendance';
import type { AttendanceChartRange } from '../admin-chart.types';
import { aggregateAttendanceRateByBucket } from '../attendance-chart.utils';
import {
  chartScopeReady,
  getAttendanceChartRangeBounds,
} from '../admin-chart.utils';

const STALE_TIME_MS = 60_000;

export function useAdminAttendanceRateChart(companyOuId: string, enabled = true) {
  const { hasPermission } = usePermissions();
  const canReadAttendance = hasPermission('attendance:read');
  const scopeReady = chartScopeReady(enabled, companyOuId);
  const [range, setRange] = useState<AttendanceChartRange>('7d');

  const queryEnabled = scopeReady && canReadAttendance;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard', 'attendance-rate', companyOuId, range],
    queryFn: async () => {
      const { start, end } = getAttendanceChartRangeBounds(range);
      const records = await fetchAllPaginatedAttendance({
        companyOuId,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });
      const points = aggregateAttendanceRateByBucket(records, range);
      return { points, recordCount: records.length };
    },
    enabled: queryEnabled,
    staleTime: STALE_TIME_MS,
    refetchOnWindowFocus: false,
  });

  const chartData = data?.points ?? [];
  const hasData = (data?.recordCount ?? 0) > 0;

  return {
    range,
    setRange,
    chartData,
    isLoading: queryEnabled && isLoading,
    canReadAttendance,
    scopeReady,
    hasData,
  };
}
