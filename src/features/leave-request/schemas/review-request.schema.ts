import { z } from 'zod';

export const reviewRequestSchema = z.object({
    status: z.enum(['Approved', 'Rejected', 'Request for change']),
    comment: z.string().optional(),
});

export type ReviewRequestFormValues = z.infer<typeof reviewRequestSchema>;
