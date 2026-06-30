import * as zod from "zod";

export const organizationProfileSchema = zod.object({
  city: zod.string().optional().or(zod.literal("")),
  timezone: zod.string().optional().or(zod.literal("")),
  currency: zod.string().optional().or(zod.literal("")),
  logo: zod.any().optional(),
  website: zod.string().optional().or(zod.literal("")),
  org_email: zod.string().email("invalidEmail").optional().or(zod.literal("")),
  themeColor: zod.string().optional().or(zod.literal("")),
  name: zod.string().optional(),
  industry: zod.string().optional(),
  size: zod.string().optional(),
});

export type OrganizationProfileValues = zod.infer<typeof organizationProfileSchema>;
