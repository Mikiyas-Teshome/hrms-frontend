import * as z from 'zod';

export const assignShiftSchema = z.object({
  companyId: z.string().min(1, 'Please select a company'),
  shiftTemplateId: z.string().min(1, 'Please select a shift template'),
});

export type AssignShiftFormValues = z.infer<typeof assignShiftSchema>;
