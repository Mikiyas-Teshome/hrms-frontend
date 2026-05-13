import { z } from "zod";

export const companySignupSchema = z
    .object({
        firstName: z.string().min(2, "firstNameRequired"),
        lastName: z.string().min(2, "lastNameRequired"),
        companyName: z.string().min(2, "companyNameRequired"),
        email: z.string().email("emailInvalid"),
        password: z
            .string()
            .min(6, "passwordMin")
            .regex(/[a-z]/, "passwordLowercase")
            .regex(/[A-Z]/, "passwordUppercase")
            .regex(/[0-9!@#$%^&*(),.?":{}|<> ]/, "passwordSpecial"),
        confirmPassword: z.string(),
        planId: z.string().min(1, "planRequired"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "passwordsMatch",
        path: ["confirmPassword"],
    });

export type CompanySignupFormValues = z.infer<typeof companySignupSchema>;
