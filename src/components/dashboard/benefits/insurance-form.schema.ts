import * as z from 'zod';
import {
  InsuranceCoverageType,
  InsuranceRenewalType,
  InsuranceIncludedService,
  DependentRelationship,
  EmploymentType,
} from '@/features/insurance/insurance.types';

export const MIN_TENURE_MONTH_OPTIONS = [
  { label: 'No minimum', value: '0' },
  { label: '3 months', value: '3' },
  { label: '6 months', value: '6' },
  { label: '12 months', value: '12' },
] as const;

export const insuranceFormSchema = z.object({
  ouId: z.string().min(1, 'Company is required'),
  insuranceName: z.string().min(1, 'Insurance name is required'),
  providerName: z.string().min(1, 'Provider name is required'),
  policyNumber: z.string().min(1, 'Policy number is required'),
  cardId: z.string().optional(),
  coverageType: z.nativeEnum(InsuranceCoverageType),
  coverageAmount: z.coerce.number().min(0).optional(),
  renewalType: z.nativeEnum(InsuranceRenewalType),
  hasDependentsCoverage: z.boolean().default(false),
  maxDependents: z.coerce.number().min(0).optional(),
  allowedDependents: z.array(z.nativeEnum(DependentRelationship)).default([]),
  includedServices: z.array(z.nativeEnum(InsuranceIncludedService)).default([]),
  employmentType: z.nativeEnum(EmploymentType).optional(),
  minTenureMonths: z.coerce.number().min(0).optional(),
  employerContribution: z.coerce.number().min(0).max(100).default(100),
  employeeContribution: z.coerce.number().min(0).max(100).default(0),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  status: z.string().default('active'),
});

export type InsuranceFormValues = z.infer<typeof insuranceFormSchema>;

export const defaultInsuranceFormValues: InsuranceFormValues = {
  ouId: '',
  insuranceName: '',
  providerName: '',
  policyNumber: '',
  coverageType: InsuranceCoverageType.HEALTH,
  renewalType: InsuranceRenewalType.YEARLY,
  hasDependentsCoverage: false,
  allowedDependents: [],
  includedServices: [],
  employerContribution: 100,
  employeeContribution: 0,
  employmentType: EmploymentType.full_time,
  minTenureMonths: 0,
  status: 'active',
  startDate: '',
  endDate: '',
};
