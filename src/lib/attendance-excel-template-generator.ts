import ExcelJS from 'exceljs';
import { AttendanceStatus } from '@/features/attendance/attendance.types';
import { toDateKey } from '@/lib/fetch-all-paginated-attendance';

export interface AttendanceTemplateEmployee {
  label: string;
  email: string;
  userId: string;
}

export interface AttendanceTemplateMetadata {
  employees: AttendanceTemplateEmployee[];
  statuses: { label: string; value: AttendanceStatus }[];
  recordIndex: Map<string, string>;
  startDate?: string;
  endDate?: string;
}

export interface ParsedAttendanceRow {
  userId?: string;
  employeeEmail: string;
  date: string;
  dateKey: string;
  clockIn?: string;
  clockOut?: string;
  status?: AttendanceStatus;
  remarks?: string;
  recordId?: string;
  isValid: boolean;
  errors: string[];
}

const ATTENDANCE_STATUS_VALUES = Object.values(AttendanceStatus);

function parseClockValue(raw: string, dateKey: string): Date | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (trimmed.includes('T') || /^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    const parsed = new Date(trimmed);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  const timeMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!timeMatch) return null;

  let hours = parseInt(timeMatch[1], 10);
  const minutes = parseInt(timeMatch[2], 10);
  const seconds = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
  const meridiem = timeMatch[4]?.toUpperCase();

  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
}

function isWithinRange(dateKey: string, startDate?: string, endDate?: string): boolean {
  if (!startDate && !endDate) return true;
  const start = startDate ? toDateKey(startDate) : null;
  const end = endDate ? toDateKey(endDate) : null;
  if (start && dateKey < start) return false;
  if (end && dateKey > end) return false;
  return true;
}

export async function generateAttendanceTemplate({
  employees,
  statuses,
}: Pick<AttendanceTemplateMetadata, 'employees' | 'statuses'>): Promise<Blob> {
  const workbook = new ExcelJS.Workbook();
  const mainSheet = workbook.addWorksheet('Attendance');
  const listSheet = workbook.addWorksheet('Data_Lists');
  listSheet.state = 'hidden';

  employees.forEach((emp, index) => {
    listSheet.getCell(`A${index + 2}`).value = emp.email;
  });
  statuses.forEach((status, index) => {
    listSheet.getCell(`B${index + 2}`).value = status.label;
  });

  const columns = [
    { header: 'Employee Email *', key: 'email', width: 28 },
    { header: 'Date *', key: 'date', width: 14 },
    { header: 'Clock In', key: 'clockIn', width: 18 },
    { header: 'Clock Out', key: 'clockOut', width: 18 },
    { header: 'Status *', key: 'status', width: 16 },
    { header: 'Remarks', key: 'remarks', width: 30 },
  ];

  mainSheet.columns = columns;

  const headerRow = mainSheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '2865E3' },
  };
  headerRow.height = 25;
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

  const maxRows = 100;
  const emailRange = employees.length > 0 ? `Data_Lists!$A$2:$A$${employees.length + 1}` : null;
  const statusRange = statuses.length > 0 ? `Data_Lists!$B$2:$B$${statuses.length + 1}` : null;

  for (let r = 2; r <= maxRows; r++) {
    if (emailRange) {
      mainSheet.getCell(`A${r}`).dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: [emailRange],
        error: 'Please select an employee email from the dropdown list.',
        errorTitle: 'Invalid Selection',
        showErrorMessage: true,
      };
    }
    if (statusRange) {
      mainSheet.getCell(`E${r}`).dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: [statusRange],
        error: 'Please select a status from the dropdown list.',
        errorTitle: 'Invalid Selection',
        showErrorMessage: true,
      };
    }
  }

  if (employees.length > 0 && statuses.length > 0) {
    const sampleRow = mainSheet.getRow(2);
    sampleRow.getCell(1).value = employees[0].email;
    sampleRow.getCell(2).value = new Date().toISOString().split('T')[0];
    sampleRow.getCell(5).value = statuses[0].label;
    sampleRow.eachCell((cell) => {
      cell.font = { italic: true, color: { argb: '888888' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F8F9FC' },
      };
    });
    sampleRow.commit();
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

export async function parseAttendanceExcel(
  file: File,
  metadata: AttendanceTemplateMetadata,
): Promise<ParsedAttendanceRow[]> {
  const workbook = new ExcelJS.Workbook();
  const arrayBuffer = await file.arrayBuffer();
  await workbook.xlsx.load(arrayBuffer);
  const worksheet = workbook.getWorksheet('Attendance');

  if (!worksheet) {
    throw new Error(
      'Could not find the "Attendance" sheet in the uploaded file. Please use the original template.',
    );
  }

  const parsedData: ParsedAttendanceRow[] = [];
  const cleanStr = (s: string | undefined | null) => (s || '').trim().toLowerCase();

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const email = row.getCell(1).text?.trim().toLowerCase();
    const dateRaw = row.getCell(2).text?.trim() || String(row.getCell(2).value ?? '').trim();
    const clockInRaw = row.getCell(3).text?.trim();
    const clockOutRaw = row.getCell(4).text?.trim();
    const statusLabel = row.getCell(5).text?.trim();
    const remarks = row.getCell(6).text?.trim();

    if (!email && !dateRaw && !statusLabel) return;

    const errors: string[] = [];

    if (!email) {
      errors.push('Employee email is required.');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Invalid email format.');
    }

    let dateKey = '';
    if (!dateRaw) {
      errors.push('Date is required.');
    } else {
      dateKey = toDateKey(dateRaw);
      if (!dateKey) {
        errors.push('Invalid date format.');
      } else if (!isWithinRange(dateKey, metadata.startDate, metadata.endDate)) {
        errors.push('Date is outside the selected overview date range.');
      }
    }

    const matchedEmployee = metadata.employees.find((e) => cleanStr(e.email) === cleanStr(email));
    if (email && !matchedEmployee) {
      errors.push(`Employee "${email}" was not found.`);
    }

    let matchedStatus = metadata.statuses.find((s) => cleanStr(s.label) === cleanStr(statusLabel));
    if (!statusLabel && metadata.statuses.length > 0) {
      matchedStatus = metadata.statuses[0];
    } else if (statusLabel && !matchedStatus) {
      const directEnum = ATTENDANCE_STATUS_VALUES.find((s) => cleanStr(s) === cleanStr(statusLabel));
      if (directEnum) {
        matchedStatus = { label: directEnum, value: directEnum };
      } else {
        errors.push(`Status "${statusLabel}" is invalid.`);
      }
    } else if (!statusLabel) {
      errors.push('Status is required.');
    }

    let clockInIso: string | undefined;
    let clockOutIso: string | undefined;
    if (dateKey && clockInRaw) {
      const parsedIn = parseClockValue(clockInRaw, dateKey);
      if (!parsedIn) {
        errors.push('Clock in time is invalid.');
      } else {
        clockInIso = parsedIn.toISOString();
      }
    }
    if (dateKey && clockOutRaw) {
      const parsedOut = parseClockValue(clockOutRaw, dateKey);
      if (!parsedOut) {
        errors.push('Clock out time is invalid.');
      } else {
        clockOutIso = parsedOut.toISOString();
      }
    }
    if (clockInIso && clockOutIso && new Date(clockOutIso) <= new Date(clockInIso)) {
      errors.push('Clock out must be after clock in.');
    }

    const userId = matchedEmployee?.userId;
    let recordId: string | undefined;
    if (userId && dateKey) {
      recordId = metadata.recordIndex.get(`${userId}_${dateKey}`);
      if (!recordId) {
        errors.push('No attendance record exists for this employee on this date.');
      }
    }

    parsedData.push({
      userId,
      employeeEmail: email || '',
      date: dateRaw,
      dateKey,
      clockIn: clockInIso,
      clockOut: clockOutIso,
      status: matchedStatus?.value,
      remarks: remarks || undefined,
      recordId,
      isValid: errors.length === 0,
      errors,
    });
  });

  return parsedData;
}
