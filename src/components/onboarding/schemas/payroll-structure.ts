import * as zod from "zod";

export const payrollStructureSchema = zod.object({
  companyId: zod.string().optional(),
  payrollCycle: zod.enum(["monthly", "bi-weekly", "weekly"]),
  processingDay: zod.number().min(1, "processingDayRequired").max(31),
  allowances: zod.array(
    zod.object({
      id: zod.string(),
      dbId: zod.string().optional(),
      enabled: zod.boolean(),
      description: zod.string().optional(),
      type: zod.string().optional(),
      value: zod.number().optional(),
      taxable: zod.boolean().optional(),
      recurring: zod.boolean().optional(),
    })
  ),
  deductions: zod.array(
    zod.object({
      id: zod.string(),
      dbId: zod.string().optional(),
      enabled: zod.boolean(),
      description: zod.string().optional(),
      type: zod.string().optional(),
      value: zod.number().optional(),
      taxable: zod.boolean().optional(),
      recurring: zod.boolean().optional(),
    })
  ),
  overtimeRules: zod.object({
    standard: zod.string().min(1),
    weekend: zod.string().min(1),
    publicHoliday: zod.string().min(1),
    enableNightShift: zod.boolean(),
  }),
});

export type PayrollStructureValues = zod.infer<typeof payrollStructureSchema>;
