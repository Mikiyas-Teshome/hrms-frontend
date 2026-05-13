import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    assignEmployeeShift,
    bulkAssignEmployeeShift,
    clockIn,
    clockOut,
    createHoliday,
    createShiftTemplate,
    createTimesheet,
    removeHoliday,
    updateHoliday,
    updateTimesheetStatus,
    adminUpdateAttendanceRecord,
    getAttendanceRecords,
    getEmployeeShifts,
    getHolidays,
    getShiftTemplates,
    getTimesheet,
    getTimesheets,
    getAttendanceOverviewStats,
    getPaginatedAttendanceRecords,
    getAttendanceFilterOptions,
    getShiftStats,
    healthCheck
} from '../attendance.actions';
import {
    ClockInInput,
    ClockOutInput,
    CreateEmployeeShiftInput,
    CreateHolidayInput,
    CreateShiftTemplateInput,
    CreateTimesheetInput,
    UpdateHolidayInput,
    UpdateTimesheetStatusInput,
    AdminUpdateAttendanceInput,
    PaginatedAttendanceRecordsFilterInput
} from '../attendance.types';

export const useHealthCheck = () => {
    return useQuery({
        queryKey: ['attendance', 'health-check'],
        queryFn: async () => {
            const result = await healthCheck();
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useAssignEmployeeShift = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (input: CreateEmployeeShiftInput) => {
            const result = await assignEmployeeShift(input);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance'] });
        },
    });
};

export const useBulkAssignEmployeeShift = () => {
    return useMutation({
        mutationFn: async (inputs: CreateEmployeeShiftInput[]) => {
            const result = await bulkAssignEmployeeShift(inputs);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useClockIn = () => {
    return useMutation({
        mutationFn: async (input: ClockInInput) => {
            const result = await clockIn(input);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useClockOut = () => {
    return useMutation({
        mutationFn: async (input: ClockOutInput) => {
            const result = await clockOut(input);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useCreateHoliday = () => {
    return useMutation({
        mutationFn: async (input: CreateHolidayInput) => {
            const result = await createHoliday(input);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useCreateShiftTemplate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (input: CreateShiftTemplateInput) => {
            const result = await createShiftTemplate(input);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance', 'shift-templates'] });
        },
    });
};

export const useCreateTimesheet = () => {
    return useMutation({
        mutationFn: async (input: CreateTimesheetInput) => {
            const result = await createTimesheet(input);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useRemoveHoliday = () => {
    return useMutation({
        mutationFn: async (id: string) => {
            const result = await removeHoliday(id);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useUpdateHoliday = () => {
    return useMutation({
        mutationFn: async ({ id, input }: { id: string; input: UpdateHolidayInput }) => {
            const result = await updateHoliday(id, input);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useUpdateTimesheetStatus = () => {
    return useMutation({
        mutationFn: async (input: UpdateTimesheetStatusInput) => {
            const result = await updateTimesheetStatus(input);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useAdminUpdateAttendanceRecord = () => {
    return useMutation({
        mutationFn: async (input: AdminUpdateAttendanceInput) => {
            const result = await adminUpdateAttendanceRecord(input);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

// Query Hooks

export const useAttendanceRecords = (userId: string, startDate?: string, endDate?: string) => {
    return useQuery({
        queryKey: ['attendance', 'records', userId, startDate, endDate],
        queryFn: async () => {
            const result = await getAttendanceRecords({ userId, startDate, endDate });
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        enabled: !!userId,
    });
};

export const useEmployeeShifts = (userId: string) => {
    return useQuery({
        queryKey: ['attendance', 'shifts', userId],
        queryFn: async () => {
            const result = await getEmployeeShifts(userId);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        enabled: !!userId,
    });
};

export const useHolidays = (companyOuId: string, year?: number) => {
    return useQuery({
        queryKey: ['attendance', 'holidays', companyOuId, year],
        queryFn: async () => {
            const result = await getHolidays(companyOuId, year);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        enabled: !!companyOuId,
    });
};

export const useShiftTemplates = (companyOuId: string) => {
    return useQuery({
        queryKey: ['attendance', 'shift-templates', companyOuId],
        queryFn: async () => {
            const result = await getShiftTemplates(companyOuId);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        enabled: !!companyOuId,
    });
};

export const useTimesheet = (id: string) => {
    return useQuery({
        queryKey: ['attendance', 'timesheet', id],
        queryFn: async () => {
            const result = await getTimesheet(id);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        enabled: !!id,
    });
};

export const useTimesheets = (companyId: string, userId?: string) => {
    return useQuery({
        queryKey: ['attendance', 'timesheets', companyId, userId],
        queryFn: async () => {
            const result = await getTimesheets(companyId, userId);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        enabled: !!companyId,
    });
};

export const useAttendanceOverviewStats = (startDate: string, endDate: string) => {
    return useQuery({
        queryKey: ['attendance', 'overview-stats', startDate, endDate],
        queryFn: async () => {
            const result = await getAttendanceOverviewStats(startDate, endDate);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        enabled: !!startDate && !!endDate,
    });
};

export const usePaginatedAttendanceRecords = (limit: number, page: number, filter?: PaginatedAttendanceRecordsFilterInput) => {
    return useQuery({
        queryKey: ['attendance', 'paginated-records', limit, page, filter],
        queryFn: async () => {
            const offset = (page - 1) * limit;
            const result = await getPaginatedAttendanceRecords(limit, offset, filter);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useAttendanceFilterOptions = () => {
    return useQuery({
        queryKey: ['attendance', 'filter-options'],
        queryFn: async () => {
            const result = await getAttendanceFilterOptions();
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useShiftStats = () => {
    return useQuery({
        queryKey: ['attendance', 'shift-stats'],
        queryFn: async () => {
            const result = await getShiftStats();
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};
