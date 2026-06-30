export type CalendarType = 'custom' | 'gregorian' | 'hijri';

export type TimesheetStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'processed';

export enum AttendanceStatus {
    ABSENT = 'ABSENT',
    ACTIVE = 'ACTIVE',
    HALF_DAY = 'HALF_DAY',
    LATE = 'LATE',
    ON_LEAVE = 'ON_LEAVE',
    PRESENT = 'PRESENT'
}

export enum ShiftType {
    DAY = 'DAY',
    FLEXIBLE = 'FLEXIBLE',
    NIGHT = 'NIGHT'
}

export enum ShiftPolicyScopeType {
    COMPANY = 'COMPANY',
    DEPARTMENT = 'DEPARTMENT',
    DIVISION = 'DIVISION',
    EMPLOYEE = 'EMPLOYEE',
    SUB_DIVISION = 'SUB_DIVISION'
}

export interface ShiftTemplate {
    breakDuration: number;
    companyId?: string;
    companyOuId?: string;
    createdAt: string;
    endTime: string;
    flexibleMinutes: number;
    id: string;
    isActive: boolean;
    name: string;
    overtimeAllowed: boolean;
    startTime: string;
    type: ShiftType;
    updatedAt: string;
    workingDays: number[];
    overtimePayable?: boolean;
}

export interface EmployeeShift {
    companyId: string;
    endDate?: string | null;
    id: string;
    shiftTemplate?: ShiftTemplate;
    shiftTemplateId: string;
    startDate: string;
    userId: string;
}

export interface AttendanceRecord {
    clockIn?: string | null;
    clockOut?: string | null;
    companyId: string;
    createdAt: string;
    date: string;
    employeeName?: string | null;
    id: string;
    overtimeMinutes: number;
    remarks?: string | null;
    status: AttendanceStatus;
    totalMinutes: number;
    overtimeStatus?: string;
    updatedAt: string;
    userId: string;
    shiftType?: string | null;
    contractType?: string | null;
    employmentType?: string | null;
    departmentOuId?: string | null;
    departmentOuName?: string | null;
    divisionOuId?: string | null;
    subDivisionOuId?: string | null;
    companyOuId?: string | null;
    groupOuId?: string | null;
}

export interface PaginationInput {
    page?: number;
    size?: number;
}

export interface PaginatedMetaData {
    page: number;
    size: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    timestamp?: string;
}

export interface PaginatedAttendanceRecords {
    data: AttendanceRecord[];
    metaData: PaginatedMetaData;
}

export interface Holiday {
    companyId: string;
    companyOuId?: string;
    createdAt: string;
    date: string;
    id: string;
    isReligious: boolean;
    name: string;
    type: CalendarType;
    updatedAt: string;
    year: number;
}

export interface Timesheet {
    approvedAt?: string | null;
    approvedBy?: string | null;
    companyId: string;
    createdAt: string;
    id: string;
    periodEnd: string;
    periodStart: string;
    records?: AttendanceRecord[];
    remarks?: string | null;
    status: TimesheetStatus;
    totalHours: number;
    totalOvertime: number;
    updatedAt: string;
    userId: string;
}

export interface AttendanceOverviewStats {
    totalEmployees: number;
    activeEmployees: number;
    onLeave: number;
    totalOvertimeHours: number;
    overtimeEmployees: number;
    approvedOvertime: number;
    pendingOvertime: number;
}

export interface ShiftStats {
    eveningEmployees: number;
    morningEmployees: number;
    nightEmployees: number;
    totalShifts: number;
}

export interface AttendanceOrgUnitOption {
    id: string;
    name: string;
    type: string;
    parentId?: string | null;
}

export interface AttendanceFilterOptions {
    groups: AttendanceOrgUnitOption[];
    companies: AttendanceOrgUnitOption[];
    divisions: AttendanceOrgUnitOption[];
    subDivisions: AttendanceOrgUnitOption[];
    departments: AttendanceOrgUnitOption[];
    shiftTypes: string[];
    attendanceStatuses: string[];
    contractTypes: string[];
}

export interface CreateEmployeeShiftInput {
    companyOuId?: string | null;
    endDate?: string | null;
    shiftTemplateId: string;
    startDate: string;
    userId: string;
}

export interface CreateShiftPolicyAssignmentInput {
    actorId?: string | null;
    scopeRefId: string;
    scopeType: ShiftPolicyScopeType;
    shiftTemplateId: string;
    validFrom: string;
    validTo?: string | null;
}

export interface ClockInInput {
    clockIn?: string | null;
    date?: string | null;
    userId: string;
}

export interface ClockOutInput {
    clockOut?: string | null;
    isDutyShift?: boolean;
    recordId: string;
    remarks?: string | null;
}

export interface AdminUpdateAttendanceInput {
    clockIn?: string | null;
    clockOut?: string | null;
    recordId: string;
    remarks?: string | null;
    status: AttendanceStatus;
}

export interface UpdateOvertimeStatusInput {
    recordId: string;
    status: string;
}

export interface CreateHolidayInput {
    companyOuId: string;
    date: string;
    isReligious?: boolean;
    name: string;
    type?: CalendarType;
    year: number;
}

export interface CreateShiftTemplateInput {
    breakDuration?: number;
    companyOuId: string;
    endTime: string;
    flexibleMinutes?: number;
    isActive?: boolean;
    name: string;
    overtimeAllowed?: boolean;
    overtimePayable?: boolean;
    startTime: string;
    type: ShiftType;
    workingDays: number[];
}

export interface UpdateShiftTemplateInput {
    id: string;
    breakDuration?: number;
    companyOuId?: string;
    endTime?: string;
    flexibleMinutes?: number;
    isActive?: boolean;
    name?: string;
    overtimeAllowed?: boolean;
    overtimePayable?: boolean;
    startTime?: string;
    type?: ShiftType;
    workingDays?: number[];
}

export interface CreateTimesheetInput {
    periodEnd: string;
    periodStart: string;
    remarks?: string | null;
    userId: string;
}

export interface UpdateHolidayInput {
    date?: string;
    isReligious?: boolean;
    name?: string;
    type?: CalendarType;
    year?: number;
}

export interface UpdateTimesheetStatusInput {
    id: string;
    remarks?: string;
    status: string;
}

export interface PaginatedAttendanceRecordsFilterInput {
    startDate?: string | Date;
    endDate?: string | Date;
    groupOuId?: string;
    companyOuId?: string;
    divisionOuId?: string;
    subDivisionOuId?: string;
    departmentOuId?: string;
    shiftType?: ShiftType;
    status?: AttendanceStatus;
    overtimeStatus?: string;
    contractType?: string;
    search?: string;
    hasOvertime?: boolean;
    forExport?: boolean;
}
