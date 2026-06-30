import { z } from 'zod';

export const requestForChangeSchema = z
  .object({
    acceptedFrom: z.date({
        message: 'Date is required',
    }),
    acceptedTo: z.date({
        message: 'Date is required',
    }),
    comment: z.string().min(1, 'Comment is required'),
  })
  .refine((data) => data.acceptedTo >= data.acceptedFrom, {
    message: 'End date must be on or after start date',
    path: ['acceptedTo'],
  });

export type RequestForChangeFormValues = z.infer<typeof requestForChangeSchema>;
