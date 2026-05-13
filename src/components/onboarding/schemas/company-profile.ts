import * as zod from "zod";

export const companyProfileSchema = zod.object({
  city: zod.string().min(1, "cityRequired"),
  timezone: zod.string().min(1, "timezoneRequired"),
  currency: zod.string().min(1, "currencyRequired"),
  logo: zod.any().optional(),
  website: zod.string().url("invalidWebsite").optional().or(zod.literal("")),
  email: zod.string().email("invalidEmail").optional().or(zod.literal("")),
  themeColor: zod.string().min(1, "themeColorRequired"),
});

export type CompanyProfileValues = zod.infer<typeof companyProfileSchema>;
