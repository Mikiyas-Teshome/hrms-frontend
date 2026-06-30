import {
  eachDayOfInterval,
  eachWeekOfInterval,
  format,
  isWithinInterval,
} from 'date-fns';
import type { AttendanceRecord } from '@/features/attendance/attendance.types';
import { toDateKey } from '@/lib/fetch-all-paginated-attendance';
import type { AttendanceChartRange, AttendanceRateChartPoint } from './admin-chart.types';
import {
  ATTENDED_STATUSES,
  getAttendanceChartRangeBounds,
  getWeekStart,
} from './admin-chart.utils';

function recordDate(record: AttendanceRecord): Date {
  return new Date(record.date);
}

function bucketKeyForRecord(record: AttendanceRecord, range: AttendanceChartRange): string {
  const date = recordDate(record);
  if (range === '3m') {
    return toDateKey(getWeekStart(date));
  }
  return toDateKey(date);
}

function buildBucketKeys(range: AttendanceChartRange): string[] {
  const { start, end } = getAttendanceChartRangeBounds(range);
  if (range === '3m') {
    return eachWeekOfInterval({ start, end }, { weekStartsOn: 1 }).map((weekStart) =>
      toDateKey(weekStart),
    );
  }
  return eachDayOfInterval({ start, end }).map((day) => toDateKey(day));
}

function labelForBucketKey(key: string): string {
  const date = new Date(`${key}T00:00:00.000Z`);
  return format(date, 'MMM d');
}

export function aggregateAttendanceRateByBucket(
  records: AttendanceRecord[],
  range: AttendanceChartRange,
): AttendanceRateChartPoint[] {
  const bucketKeys = buildBucketKeys(range);
  const totals = new Map<string, number>();
  const attended = new Map<string, number>();

  for (const key of bucketKeys) {
    totals.set(key, 0);
    attended.set(key, 0);
  }

  const { start, end } = getAttendanceChartRangeBounds(range);

  for (const record of records) {
    const date = recordDate(record);
    if (!isWithinInterval(date, { start, end })) {
      continue;
    }
    const key = bucketKeyForRecord(record, range);
    if (!totals.has(key)) {
      continue;
    }
    totals.set(key, (totals.get(key) ?? 0) + 1);
    if (ATTENDED_STATUSES.has(record.status)) {
      attended.set(key, (attended.get(key) ?? 0) + 1);
    }
  }

  return bucketKeys.map((key) => {
    const total = totals.get(key) ?? 0;
    const attendedCount = attended.get(key) ?? 0;
    const rate = total === 0 ? 0 : Math.round((attendedCount / total) * 100);
    return {
      label: labelForBucketKey(key),
      rate,
    };
  });
}
