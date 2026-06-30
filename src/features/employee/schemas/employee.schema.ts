import * as z from 'zod';
import { optionalPhoneValidation, pastDateValidation, numericValidation } from '@/lib/validations';

export const employeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  employeeId: z.string().optional(),
  phoneNumber: optionalPhoneValidation('phoneInvalid'),
  dateOfBirth: pastDateValidation('pastDateRequired'),
  gender: z.string().optional(),
  gccid: z.string().optional(),

  company: z.string().optional(),
  division: z.string().optional(),
  subDivision: z.string().optional(),
  department: z.string().optional(),
  ouId: z.string().optional(),
  role: z.string().min(1, 'Role is required'),
  dateOfEmployment: z.string().optional(),
  employmentType: z.string().optional(),
  employmentStatus: z.string().optional(),

  branch: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  postalCode: numericValidation('numbersOnly').optional(),

  emergencyName: z.string().optional(),
  emergencyRelationship: z.string().optional(),
  emergencyEmail: z.string().optional(),
  emergencyPhone: optionalPhoneValidation('phoneInvalid'),

  bankName: z.string().optional(),
  bankBranch: z.string().optional(),
  accountHolderName: z.string().optional(),
  accountNumber: z.string().optional(),
  swiftCode: z.string().optional(),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;