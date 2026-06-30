'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { useOrganizationUnitOptions } from '@/features/organization/hooks/useOrganization';
import { fetchAllPaginatedAttendance } from '@/lib/fetch-all-paginated-attendance';
import type { EmployeesInsightsChartRange } from '../admin-chart.types';
import {
  chartScopeReady,
  getEmployeesInsightsRangeBounds,
} from '../admin-chart.utils';
import { fetchAllPaginatedEmployees } from '../fetch-all-paginated-employees';
import {
  aggregateHiresByDepartment,
  aggregateOnLeaveByDepartment,
  filterEmployeesHiredInRange,
  mergeEmployeesInsightsRows,
} from '../employees-insights-chart.utils';

const STALE_TIME_MS = 60_000;

export function useAdminEmployeesInsightsChart(companyOuId: string, enabled = true) {
  const { hasPermission } = usePermissions();
  const canReadEmployees = hasPermission('employees:read');
  const canReadAttendance = hasPermission('attendance:read');
  const scopeReady = chartScopeReady(enabled, companyOuId);
  const [range, setRange] = useState<EmployeesInsightsChartRange>('3m');

  const { unitOptions } = useOrganizationUnitOptions();
  const departmentNameById = useMemo(
    () => new Map(unitOptions.map((unit) => [unit.id, unit.name])),
    [unitOptions],
  );

  const queryEnabled = scopeReady && (canReadEmployees || canReadAttendance);

  const { data, isLoading } = useQuery({
    queryKey: [
      'admin-dashboard',
      'employees-insights',
      companyOuId,
      range,
      canReadEmployees,
      canReadAttendance,
    ],
    queryFn: async () => {
      const { start, end } = getEmployeesInsightsRangeBounds(range);
      const dateFilter = {
        companyOuId,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      };

      const [employees, attendanceRecords] = await Promise.all([
        canReadEmployees
          ? fetchAllPaginatedEmployees({ companyOuId })
          : Promise.resolve([]),
        canReadAttendance
          ? fetchAllPaginatedAttendance(dateFilter)
          : Promise.resolve([]),
      ]);

      const hiresInRange = filterEmployeesHiredInRange(employees, range);
      const hiresByDepartment = canReadEmployees
        ? aggregateHiresByDepartment(hiresInRange, departmentNameById)
        : new Map<string, number>();
      const leaveByDepartment = canReadAttendance
        ? aggregateOnLeaveByDepartment(attendanceRecords)
        : new Map<string, number>();

      return mergeEmployeesInsightsRows(hiresByDepartment, leaveByDepartment);
    },
    enabled: queryEnabled,
    staleTime: STALE_TIME_MS,
    refetchOnWindowFocus: false,
  });

  const chartData = data ?? [];
  const hasData = chartData.some((row) => row.hires > 0 || row.leave > 0);

  return {
    range,
    setRange,
    chartData,
    isLoading: queryEnabled && isLoading,
    canReadEmployees,
    canReadAttendance,
    scopeReady,
    hasData,
    hasNoSources: !canReadEmployees && !canReadAttendance,
  };
}
