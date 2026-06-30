import * as zod from "zod";
import { CALENDAR_TYPES } from "@/features/attendance/attendance.utils";

export const hrPoliciesSchema = zod.object({
  scheduleType: zod.enum(CALENDAR_TYPES),
  scheduleName: zod.string().min(1, "hrPolicies.scheduleNameRequired"),
  breakDuration: zod.number().min(0),
  flexibleMinutes: zod.number().min(0),
  overtimeAllowed: zod.boolean(),
  workDays: zod.array(zod.string()).min(1, "hrPolicies.workDaysRequired"),
  shiftStart: zod.string().min(1, "hrPolicies.shiftStartRequired"),
  shiftEnd: zod.string().min(1, "hrPolicies.shiftEndRequired"),
  leavePolicies: zod.array(
    zod.object({
      id: zod.string(),
      enabled: zod.boolean(),
      formSnapshot: zod.any().optional(),
      name: zod.string().optional(),
      code: zod.string().optional(),
      maxDaysPerYear: zod.number().optional(),
      entitlementGrantMode: zod
        .enum(["yearly_allocation", "monthly_accrual", "manual"])
        .optional(),
      paidLeave: zod.boolean().optional(),
      carryForwardEnabled: zod.boolean().optional(),
      description: zod.string().optional(),
    })
  ),
  holidays: zod.array(
    zod.object({
      id: zod.string(),
      name: zod.string().optional(),
      enabled: zod.boolean(),
      date: zod.string().optional(),
    })
  ),
  companyOuId: zod.string().min(1, "setup.selectCompanyRequired").optional(),
});

export type HrPoliciesValues = zod.infer<typeof hrPoliciesSchema>;
