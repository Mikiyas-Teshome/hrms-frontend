import { z } from 'zod';

export const requestForChangeSchema = z.object({
    acceptedFrom: z.string().min(1, 'Date is required'),
    acceptedTo: z.string().min(1, 'Date is required'),
    comment: z.string().min(1, 'Comment is required'),
});

export type RequestForChangeFormValues = z.infer<typeof requestForChangeSchema>;
