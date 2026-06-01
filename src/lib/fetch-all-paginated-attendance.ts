import { getPaginatedAttendanceRecords } from '@/features/attendance/attendance.actions';
import type {
  AttendanceRecord,
  PaginatedAttendanceRecordsFilterInput,
} from '@/features/attendance/attendance.types';

const EXPORT_PAGE_SIZE = 100;

export async function fetchAllPaginatedAttendance(
  filter?: PaginatedAttendanceRecordsFilterInput,
): Promise<AttendanceRecord[]> {
  const allRecords: AttendanceRecord[] = [];
  let page = 1;
  let totalPages = 1;

  const exportFilter: PaginatedAttendanceRecordsFilterInput = {
    ...filter,
    forExport: true,
  };

  while (page <= totalPages) {
    const result = await getPaginatedAttendanceRecords(page, EXPORT_PAGE_SIZE, exportFilter);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch attendance records for export');
    }

    const batch = result.data;
    if (!batch) {
      break;
    }

    allRecords.push(...batch.data);
    totalPages = batch.metaData.totalPages || 1;
    page += 1;
  }

  return allRecords;
}

export function buildAttendanceRecordIndex(
  records: AttendanceRecord[],
): Map<string, string> {
  const index = new Map<string, string>();

  for (const record of records) {
    const dateKey = toDateKey(record.date);
    if (!dateKey) continue;
    index.set(`${record.userId}_${dateKey}`, record.id);
  }

  return index;
}

export function toDateKey(dateValue: string | Date): string {
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return '';
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
