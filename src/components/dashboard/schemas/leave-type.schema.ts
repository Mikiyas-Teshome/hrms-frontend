import * as z from 'zod';

export const leaveTypeSchema = z.object({
    code: z.string().min(1, 'Code is required'),
    name: z.string().min(1, 'Name is required'),
    status: z.enum(['Active', 'Inactive']),
    condition: z.enum(['Paid', 'Unpaid']),
    maxDaysPerYear: z.union([z.string(), z.number()])
        .optional()
        .transform((val) => {
            if (val === '' || val === undefined) return undefined;
            const parsed = Number(val);
            return isNaN(parsed) ? undefined : parsed;
        }),
    carryForwardAllowed: z.boolean().default(false),
    companyOuId: z.string().min(1, 'Required'),
    description: z.string().optional(),
});

export type LeaveTypeFormValues = z.infer<typeof leaveTypeSchema>;
