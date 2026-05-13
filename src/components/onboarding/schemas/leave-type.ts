import * as zod from "zod";

export const leaveTypeSchema = zod.object({
  name: zod.string().min(1, "leaveNameRequired"),
  code: zod.string().min(1, "leaveCodeRequired"),
  carryForwardAllowed: zod.boolean(),
  status: zod.enum(["active", "inactive"]),
  maxDays: zod.number().min(0, "maxDaysRequired"),
  condition: zod.enum(["paid", "unpaid"]),
  description: zod.string().optional(),
});

export type LeaveTypeValues = zod.infer<typeof leaveTypeSchema>;
