import {
  endOfDay,
  startOfDay,
  startOfWeek,
  subDays,
  subMonths,
} from 'date-fns';
import { AttendanceStatus } from '@/features/attendance/attendance.types';
import type { AttendanceChartRange, EmployeesInsightsChartRange } from './admin-chart.types';

export const ATTENDED_STATUSES = new Set<AttendanceStatus>([
  AttendanceStatus.PRESENT,
  AttendanceStatus.LATE,
  AttendanceStatus.HALF_DAY,
  AttendanceStatus.ACTIVE,
]);

export function chartScopeReady(enabled: boolean, companyOuId: string): boolean {
  return enabled && !!companyOuId;
}

export function getAttendanceChartRangeBounds(range: AttendanceChartRange): {
  start: Date;
  end: Date;
} {
  const end = endOfDay(new Date());
  if (range === '7d') {
    return { start: startOfDay(subDays(end, 6)), end };
  }
  if (range === '30d') {
    return { start: startOfDay(subDays(end, 29)), end };
  }
  return { start: startOfDay(subMonths(end, 3)), end };
}

export function getEmployeesInsightsRangeBounds(range: EmployeesInsightsChartRange): {
  start: Date;
  end: Date;
} {
  const end = endOfDay(new Date());
  if (range === '30d') {
    return { start: startOfDay(subDays(end, 29)), end };
  }
  return { start: startOfDay(subMonths(end, 3)), end };
}

export function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}
