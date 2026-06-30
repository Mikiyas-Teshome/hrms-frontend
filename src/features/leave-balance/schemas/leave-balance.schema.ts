import * as z from 'zod';


export const getLeaveBalanceSchema = (t: any) =>
  z.object({
    allocatedDays: z
      .union([z.string(), z.number()])
      .transform((val) => (val === '' ? 0 : Number(val)))
      .refine(
        (val) => !isNaN(val) && val >= 0,
        t('leaveBalances.edit.validation.positiveNumber', 'Must be zero or greater'),
      ),
    usedDays: z
      .union([z.string(), z.number()])
      .transform((val) => (val === '' ? 0 : Number(val)))
      .refine(
        (val) => !isNaN(val) && val >= 0,
        t('leaveBalances.edit.validation.positiveNumber', 'Must be zero or greater'),
      ),
    carryForwardDays: z
      .union([z.string(), z.number()])
      .transform((val) => (val === '' ? 0 : Number(val)))
      .refine(
        (val) => !isNaN(val) && val >= 0,
        t('leaveBalances.edit.validation.positiveNumber', 'Must be zero or greater'),
      ),
    reason: z
      .string()
      .min(1, t('leaveBalances.edit.validation.reasonRequired', 'Reason for edit is required')),
  });

export type LeaveBalanceFormValues = z.infer<ReturnType<typeof getLeaveBalanceSchema>>;
