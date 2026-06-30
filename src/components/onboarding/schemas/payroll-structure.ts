import * as zod from "zod";

export const payrollStructureSchema = zod.object({
  companyId: zod.string().optional(),
  defaultStructureName: zod.string().min(1, "defaultStructureNameRequired").max(150),
  payrollCycle: zod.enum(["monthly", "bi-weekly", "weekly"]),
  processingDay: zod.number().min(1, "processingDayRequired").max(31),
  allowances: zod.array(
    zod.object({
      id: zod.string(),
      dbId: zod.string().optional(),
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
      description: zod.string().optional(),
      type: zod.string().optional(),
      value: zod.number().optional(),
      taxable: zod.boolean().optional(),
      recurring: zod.boolean().optional(),
    })
  ),
});

export type PayrollStructureValues = zod.infer<typeof payrollStructureSchema>;
