import z from 'zod';

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'Email or phone number is required')
        .refine(
            (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || /^\+?[\d\s\-()]{7,15}$/.test(val),
            'Enter a valid email address or phone number',
        ),
    password: z
        .string()
        .min(1, 'Password is required')
        .min(6, 'Password must be at least 6 characters'),
    remember: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
