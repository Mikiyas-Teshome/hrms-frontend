import { z } from 'zod';

export const landingContactInquiryTypes = ['sales', 'demo', 'support'] as const;

export const landingContactSchema = z.object({
    inquiryType: z.enum(landingContactInquiryTypes),
    fullName: z.string().trim().min(2, 'fullNameMin'),
    workEmail: z.string().trim().email('workEmailInvalid'),
    companyName: z.string().trim().min(2, 'companyNameMin'),
    message: z.string().trim().min(10, 'messageMin'),
});

export type LandingContactFormValues = z.infer<typeof landingContactSchema>;
