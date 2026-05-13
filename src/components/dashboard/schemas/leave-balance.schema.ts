import * as z from 'zod';

export const getLeaveBalanceSchema = (t: any) => z.object({
    employeeName: z.string().min(1, t('leaveBalances.edit.validation.employeeRequired', 'Employee name is required')),
    leaveType: z.string().min(1, t('leaveBalances.edit.validation.leaveTypeRequired', 'Leave type is required')),
    year: z.string().min(1, t('leaveBalances.edit.validation.yearRequired', 'Year is required')),
    allocatedDays: z.union([z.string(), z.number()])
        .transform((val) => val === '' ? 0 : Number(val))
        .refine((val) => !isNaN(val) && val >= 0, t('leaveBalances.edit.validation.positiveNumber', 'Must be a positive number')),
    usedDays: z.union([z.string(), z.number()])
        .transform((val) => val === '' ? 0 : Number(val))
        .refine((val) => !isNaN(val) && val >= 0, t('leaveBalances.edit.validation.positiveNumber', 'Must be a positive number')),
    remainingDays: z.union([z.string(), z.number()])
        .transform((val) => val === '' ? 0 : Number(val))
        .refine((val) => !isNaN(val) && val >= 0, t('leaveBalances.edit.validation.positiveNumber', 'Must be a positive number')),
    carryForwardDays: z.union([z.string(), z.number()])
        .transform((val) => val === '' ? 0 : Number(val))
        .refine((val) => !isNaN(val) && val >= 0, t('leaveBalances.edit.validation.positiveNumber', 'Must be a positive number')),
    reason: z.string().min(1, t('leaveBalances.edit.validation.reasonRequired', 'Reason for edit is required')),
});

export type LeaveBalanceFormValues = z.infer<ReturnType<typeof getLeaveBalanceSchema>>;
