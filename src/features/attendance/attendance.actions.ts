'use server';

import { gqlRequest, GraphQLService } from '@/lib/graphql-client';
import { ActionResult, safeAction } from '@/lib/safe-action';
import { revalidatePath } from 'next/cache';
import {
    ASSIGN_EMPLOYEE_SHIFT_MUTATION,
    BULK_ASSIGN_EMPLOYEE_SHIFT_MUTATION,
    CLOCK_IN_MUTATION,
    CLOCK_OUT_MUTATION,
    CREATE_HOLIDAY_MUTATION,
    CREATE_SHIFT_TEMPLATE_MUTATION,
    CREATE_TIMESHEET_MUTATION,
    REMOVE_HOLIDAY_MUTATION,
    UPDATE_HOLIDAY_MUTATION,
    UPDATE_TIMESHEET_STATUS_MUTATION,
    ADMIN_UPDATE_ATTENDANCE_RECORD_MUTATION,
    IMPORT_ATTENDANCE_RECORD_MUTATION,
    UPDATE_OVERTIME_STATUS_MUTATION,
    GET_ATTENDANCE_RECORDS_QUERY,
    GET_EMPLOYEE_SHIFTS_QUERY,
    GET_HOLIDAYS_QUERY,
    GET_SHIFT_TEMPLATES_QUERY,
    GET_TIMESHEET_QUERY,
    GET_TIMESHEETS_QUERY,
    GET_ATTENDANCE_OVERVIEW_STATS_QUERY,
    GET_PAGINATED_ATTENDANCE_RECORDS_QUERY,
    GET_SHIFT_STATS_QUERY,
    GET_ATTENDANCE_FILTER_OPTIONS_QUERY,
    HEALTH_CHECK_QUERY,
    CREATE_SHIFT_POLICY_ASSIGNMENT_MUTATION,
    UPDATE_SHIFT_TEMPLATE_MUTATION,
    TOGGLE_SHIFT_TEMPLATE_STATUS_MUTATION
} from './attendance.queries';
import {
    AttendanceOverviewStats,
    AttendanceRecord,
    ClockInInput,
    ClockOutInput,
    CreateEmployeeShiftInput,
    CreateHolidayInput,
    CreateShiftTemplateInput,
    CreateTimesheetInput,
    EmployeeShift,
    Holiday,
    ShiftTemplate,
    Timesheet,
    UpdateHolidayInput,
    UpdateTimesheetStatusInput,
    UpdateShiftTemplateInput,
    AdminUpdateAttendanceInput,
    UpdateOvertimeStatusInput,
    PaginatedAttendanceRecords,
    PaginatedAttendanceRecordsFilterInput,
    AttendanceFilterOptions,
    ShiftStats,
    CreateShiftPolicyAssignmentInput
} from './attendance.types';

export async function healthCheck(): Promise<ActionResult<string>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ healthCheck: string }>(
            GraphQLService.ATTENDANCE,
            HEALTH_CHECK_QUERY,
            {}
        );
        return data.healthCheck;
    });
}

export async function assignEmployeeShift(input: CreateEmployeeShiftInput): Promise<ActionResult<EmployeeShift>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ assignEmployeeShift: EmployeeShift }>(
            GraphQLService.ATTENDANCE,
            ASSIGN_EMPLOYEE_SHIFT_MUTATION,
            { input }
        );
        revalidatePath('/dashboard/attendance');
        return data.assignEmployeeShift;
    });
}

export async function createShiftPolicyAssignment(input: CreateShiftPolicyAssignmentInput): Promise<ActionResult<any>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ createShiftPolicyAssignment: any }>(
            GraphQLService.ATTENDANCE,
            CREATE_SHIFT_POLICY_ASSIGNMENT_MUTATION,
            { input }
        );
        return data.createShiftPolicyAssignment;
    });
}

export async function bulkAssignEmployeeShift(inputs: CreateEmployeeShiftInput[]): Promise<ActionResult<number>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ bulkAssignEmployeeShift: number }>(
            GraphQLService.ATTENDANCE,
            BULK_ASSIGN_EMPLOYEE_SHIFT_MUTATION,
            { inputs }
        );
        revalidatePath('/dashboard/attendance');
        return data.bulkAssignEmployeeShift;
    });
}

export async function clockIn(input: ClockInInput): Promise<ActionResult<AttendanceRecord>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ clockIn: AttendanceRecord }>(
            GraphQLService.ATTENDANCE,
            CLOCK_IN_MUTATION,
            { input }
        );
        revalidatePath('/dashboard/attendance');
        return data.clockIn;
    });
}

export async function clockOut(input: ClockOutInput): Promise<ActionResult<AttendanceRecord>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ clockOut: AttendanceRecord }>(
            GraphQLService.ATTENDANCE,
            CLOCK_OUT_MUTATION,
            { input }
        );
        revalidatePath('/dashboard/attendance');
        return data.clockOut;
    });
}

export async function createHoliday(input: CreateHolidayInput): Promise<ActionResult<Holiday>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ createHoliday: Holiday }>(
            GraphQLService.ATTENDANCE,
            CREATE_HOLIDAY_MUTATION,
            { input }
        );
        revalidatePath('/dashboard/attendance/settings');
        return data.createHoliday;
    });
}

export async function updateOvertimeStatus(input: UpdateOvertimeStatusInput): Promise<ActionResult<AttendanceRecord>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ updateOvertimeStatus: AttendanceRecord }>(
            GraphQLService.ATTENDANCE,
            UPDATE_OVERTIME_STATUS_MUTATION,
            { input }
        );
        revalidatePath('/dashboard/attendance/overtime');
        return data.updateOvertimeStatus;
    });
}

export async function createShiftTemplate(input: CreateShiftTemplateInput): Promise<ActionResult<ShiftTemplate>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ createShiftTemplate: ShiftTemplate }>(
            GraphQLService.ATTENDANCE,
            CREATE_SHIFT_TEMPLATE_MUTATION,
            { input }
        );
        revalidatePath('/dashboard/attendance/settings');
        return data.createShiftTemplate;
    });
}
export async function updateShiftTemplate(input: UpdateShiftTemplateInput): Promise<ActionResult<ShiftTemplate>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ updateShiftTemplate: ShiftTemplate }>(
            GraphQLService.ATTENDANCE,
            UPDATE_SHIFT_TEMPLATE_MUTATION,
            { input }
        );
        revalidatePath('/dashboard/attendance/settings');
        revalidatePath('/dashboard/attendance/shifts');
        return data.updateShiftTemplate;
    });
}

export async function toggleShiftTemplateStatus(id: string): Promise<ActionResult<{ id: string; isActive: boolean }>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ toggleShiftTemplateStatus: { id: string; isActive: boolean } }>(
            GraphQLService.ATTENDANCE,
            TOGGLE_SHIFT_TEMPLATE_STATUS_MUTATION,
            { id }
        );
        revalidatePath('/dashboard/attendance/settings');
        revalidatePath('/dashboard/attendance/shifts');
        return data.toggleShiftTemplateStatus;
    });
}

export async function createTimesheet(input: CreateTimesheetInput): Promise<ActionResult<Timesheet>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ createTimesheet: Timesheet }>(
            GraphQLService.ATTENDANCE,
            CREATE_TIMESHEET_MUTATION,
            { input }
        );
        revalidatePath('/dashboard/timesheets');
        return data.createTimesheet;
    });
}

export async function removeHoliday(id: string): Promise<ActionResult<Holiday>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ removeHoliday: Holiday }>(
            GraphQLService.ATTENDANCE,
            REMOVE_HOLIDAY_MUTATION,
            { id }
        );
        revalidatePath('/dashboard/attendance/settings');
        return data.removeHoliday;
    });
}

export async function updateHoliday(id: string, input: UpdateHolidayInput): Promise<ActionResult<Holiday>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ updateHoliday: Holiday }>(
            GraphQLService.ATTENDANCE,
            UPDATE_HOLIDAY_MUTATION,
            { id, input }
        );
        revalidatePath('/dashboard/attendance/settings');
        return data.updateHoliday;
    });
}

export async function updateTimesheetStatus(input: UpdateTimesheetStatusInput): Promise<ActionResult<Timesheet>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ updateTimesheetStatus: Timesheet }>(
            GraphQLService.ATTENDANCE,
            UPDATE_TIMESHEET_STATUS_MUTATION,
            { input }
        );
        revalidatePath('/dashboard/timesheets');
        return data.updateTimesheetStatus;
    });
}

export async function adminUpdateAttendanceRecord(input: AdminUpdateAttendanceInput): Promise<ActionResult<AttendanceRecord>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ adminUpdateAttendanceRecord: AttendanceRecord }>(
            GraphQLService.ATTENDANCE,
            ADMIN_UPDATE_ATTENDANCE_RECORD_MUTATION,
            { input }
        );
        revalidatePath('/dashboard/attendance');
        return data.adminUpdateAttendanceRecord;
    });
}

export async function importAttendanceRecord(input: AdminUpdateAttendanceInput): Promise<ActionResult<AttendanceRecord>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ importAttendanceRecord: AttendanceRecord }>(
            GraphQLService.ATTENDANCE,
            IMPORT_ATTENDANCE_RECORD_MUTATION,
            { input }
        );
        revalidatePath('/dashboard/attendance');
        return data.importAttendanceRecord;
    });
}

export async function getAttendanceRecords(params: { userId: string; startDate?: string; endDate?: string }): Promise<ActionResult<AttendanceRecord[]>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ attendanceRecords: AttendanceRecord[] }>(
            GraphQLService.ATTENDANCE,
            GET_ATTENDANCE_RECORDS_QUERY,
            params
        );
        return data.attendanceRecords;
    });
}

export async function getEmployeeShifts(userId: string): Promise<ActionResult<EmployeeShift[]>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ employeeShifts: EmployeeShift[] }>(
            GraphQLService.ATTENDANCE,
            GET_EMPLOYEE_SHIFTS_QUERY,
            { userId }
        );
        return data.employeeShifts;
    });
}

export async function getHolidays(companyOuId: string, year?: number): Promise<ActionResult<Holiday[]>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ holidays: Holiday[] }>(
            GraphQLService.ATTENDANCE,
            GET_HOLIDAYS_QUERY,
            { companyOuId, year }
        );
        return data.holidays;
    });
}

export async function getShiftTemplates(companyOuId: string): Promise<ActionResult<ShiftTemplate[]>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ shiftTemplates: ShiftTemplate[] }>(
            GraphQLService.ATTENDANCE,
            GET_SHIFT_TEMPLATES_QUERY,
            { companyOuId }
        );
        return data.shiftTemplates;
    });
}

export async function getTimesheet(id: string): Promise<ActionResult<Timesheet>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ timesheet: Timesheet }>(
            GraphQLService.ATTENDANCE,
            GET_TIMESHEET_QUERY,
            { id }
        );
        return data.timesheet;
    });
}

export async function getTimesheets(companyId: string, userId?: string): Promise<ActionResult<Timesheet[]>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ timesheets: Timesheet[] }>(
            GraphQLService.ATTENDANCE,
            GET_TIMESHEETS_QUERY,
            { companyId, userId }
        );
        return data.timesheets;
    });
}

export async function getAttendanceOverviewStats(
    startDate: string,
    endDate: string,
    forOvertime = false,
): Promise<ActionResult<AttendanceOverviewStats>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ attendanceOverviewStats: AttendanceOverviewStats }>(
            GraphQLService.ATTENDANCE,
            GET_ATTENDANCE_OVERVIEW_STATS_QUERY,
            { startDate, endDate, forOvertime },
        );
        return data.attendanceOverviewStats;
    });
}

export async function getPaginatedAttendanceRecords(
    page: number,
    size: number,
    filter?: PaginatedAttendanceRecordsFilterInput,
): Promise<ActionResult<PaginatedAttendanceRecords>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ paginatedAttendanceRecords: PaginatedAttendanceRecords }>(
            GraphQLService.ATTENDANCE,
            GET_PAGINATED_ATTENDANCE_RECORDS_QUERY,
            { pagination: { page, size }, filter },
        );
        return data.paginatedAttendanceRecords;
    });
}

export async function getAttendanceFilterOptions(): Promise<ActionResult<AttendanceFilterOptions>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ attendanceFilterOptions: AttendanceFilterOptions }>(
            GraphQLService.ATTENDANCE,
            GET_ATTENDANCE_FILTER_OPTIONS_QUERY,
            {}
        );
        return data.attendanceFilterOptions;
    });
}

export async function getShiftStats(companyOuId?: string): Promise<ActionResult<ShiftStats>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ shiftStats: ShiftStats }>(
            GraphQLService.ATTENDANCE,
            GET_SHIFT_STATS_QUERY,
            { companyOuId: companyOuId || null }
        );
        return data.shiftStats;
    });
}
