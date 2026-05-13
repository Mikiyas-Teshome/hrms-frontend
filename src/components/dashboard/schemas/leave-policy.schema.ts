import * as z from 'zod';

export const leavePolicySchema = z.object({
    policyName: z.string().min(1, 'Policy name is required'),
    leaveType: z.string().min(1, 'Leave type is required'),
    description: z.string().optional(),
    
    // Entitlement rules
    maxDaysPerYear: z.union([z.string(), z.number()])
        .transform((val) => val === '' ? undefined : Number(val))
        .refine((val) => val !== undefined && val >= 0, 'Required'),
    accrualMethod: z.string().min(1, 'Required'),
    accrualRate: z.union([z.string(), z.number()])
        .transform((val) => val === '' ? 0 : Number(val))
        .refine((val) => !isNaN(val) && val >= 0, 'Must be a non-negative number'),
    maxCarryForwardDays: z.union([z.string(), z.number()])
        .optional()
        .transform((val) => (val === '' || val === undefined) ? undefined : Number(val)),
    expiryPeriod: z.string().optional(),
    carryForward: z.boolean().default(false),

    // Request rules
    minDaysPerRequest: z.union([z.string(), z.number()])
        .optional()
        .transform((val) => (val === '' || val === undefined) ? undefined : Number(val)),
    maxDaysPerRequest: z.union([z.string(), z.number()])
        .optional()
        .transform((val) => (val === '' || val === undefined) ? undefined : Number(val)),
    noticePeriod: z.union([z.string(), z.number()])
        .optional()
        .transform((val) => (val === '' || val === undefined) ? undefined : Number(val)),

    // Approval flow
    managerApproval: z.boolean().default(true),
    hrApproval: z.boolean().default(true),
    probationRequired: z.boolean().default(false),
    applyTo: z.string().min(1, 'Required'),

    // Documentation
    requireAttachment: z.boolean().default(false),
    attachmentCondition: z.string().optional(),

    // Payroll impact
    paidLeave: z.boolean().default(true),
    payType: z.string().optional(),
    fullPayDays: z.union([z.string(), z.number()])
        .optional()
        .transform((val) => (val === '' || val === undefined) ? undefined : Number(val)),
    halfPayDays: z.union([z.string(), z.number()])
        .optional()
        .transform((val) => (val === '' || val === undefined) ? undefined : Number(val)),
    noPayDays: z.string().optional(),
    deductFromSalary: z.string().optional(),
});

export type LeavePolicyFormValues = z.infer<typeof leavePolicySchema>;
