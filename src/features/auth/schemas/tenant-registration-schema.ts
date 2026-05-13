import { z } from "zod";

export const tenantRegistrationSchema = z.object({
  firstName: z.string().min(1, "firstNameRequired"),
  lastName: z.string().min(1, "lastNameRequired"),
  email: z.string().email("invalidEmail"),
  password: z
    .string()
    .min(6, "passwordMin")
    .regex(/[a-z]/, "passwordLowercase")
    .regex(/[A-Z]/, "passwordUppercase")
    .regex(/[0-9!@#$%^&*(),.?":{}|<>]/, "passwordSpecial"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "passwordsDoNotMatch",
  path: ["confirmPassword"],
});

export type TenantRegistrationFormValues = z.infer<typeof tenantRegistrationSchema>;
