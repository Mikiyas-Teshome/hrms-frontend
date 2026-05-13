import { z } from "zod";

export const managerSignupSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("invalidEmail"),
  phoneNumber: z.string().optional(),
  password: z
    .string()
    .min(8, "passwordMin8")
    .regex(/[a-z]/, "passwordLowercase")
    .regex(/[A-Z]/, "passwordUppercase")
    .regex(/[0-9!@#$%^&*(),.?":{}|<>]/, "passwordSpecial"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "passwordsDoNotMatch",
  path: ["confirmPassword"],
});

export type ManagerSignupFormValues = z.infer<typeof managerSignupSchema>;
