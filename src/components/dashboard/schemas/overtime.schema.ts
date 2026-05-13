import * as z from 'zod';

export const overtimeRequestSchema = z.object({
  dateWorked: z.date({
    message: 'Please select a date',
  }),
  hoursWorked: z.number().min(0.5, 'Minimum 0.5 hours').max(24, 'Maximum 24 hours'),
  reason: z.string().min(1, 'Please select a reason'),
  justification: z.string().optional(),
});

export type OvertimeRequestFormValues = z.infer<typeof overtimeRequestSchema>;
