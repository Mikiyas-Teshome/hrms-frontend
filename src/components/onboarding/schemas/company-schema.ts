import { z } from "zod";

export const companySchema = z.object({
  name: z.string().min(2, "nameRequired"),
  legalName: z.string().min(2, "legalNameRequired"),
  size: z.string().min(1, "sizeRequired"),
  industry: z.string().min(1, "industryRequired"),
  country: z.string().min(1, "countryRequired"),
});

export type CompanyFormValues = z.infer<typeof companySchema>;
