import { z } from 'zod';

export const leaveRequestSchema = z.object({
    leavePolicyId: z.string().min(1, 'Leave policy is required'),
    startDate: z.date({
        message: 'Start date is required',
    }),
    endDate: z.date({
        message: 'End date is required',
    }),
    reason: z.string().optional(),
}).refine((data) => data.endDate >= data.startDate, {
    message: "End date must be after or equal to start date",
    path: ["endDate"],
});

export type LeaveRequestFormValues = z.infer<typeof leaveRequestSchema>;
