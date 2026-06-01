import * as zod from "zod";

export const teamSetupSchema = zod.object({
  employees: zod.array(
    zod.object({
      id: zod.string(),
      name: zod.string().min(1, "nameRequired"),
      email: zod.string().email("invalidEmail"),
      department: zod.string().min(1, "departmentRequired"),
      role: zod.string().min(1, "roleRequired"),
      gccId: zod.string().optional(),
      employmentType: zod.string().optional(),
      contractId: zod.string().optional(),
      jobTitle: zod.string().optional(),
      salary: zod.union([zod.string(), zod.number()]).optional(),
    })
  ),
});

export type TeamSetupValues = zod.infer<typeof teamSetupSchema>;
