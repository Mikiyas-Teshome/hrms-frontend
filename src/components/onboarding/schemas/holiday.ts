import * as zod from "zod";
import { CALENDAR_TYPES } from "@/features/attendance/attendance.utils";

export const holidaySchema = zod.object({
  name: zod.string().min(1, "hrPolicies.errors.holidayNameRequired"),
  date: zod.string().min(1, "hrPolicies.errors.holidayDateRequired"),
  isReligious: zod.boolean(),
  type: zod.enum(CALENDAR_TYPES),
});

export type HolidayValues = zod.infer<typeof holidaySchema>;
