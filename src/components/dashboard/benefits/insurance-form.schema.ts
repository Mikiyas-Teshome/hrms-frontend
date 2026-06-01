import * as z from 'zod';
import {
  InsuranceCoverageType,
  InsuranceAssignment,
  InsuranceRenewalType,
  InsuranceIncludedService,
  DependentRelationship,
  EmploymentType,
} from '@/features/insurance/insurance.types';

export const insuranceFormSchema = z.object({
  companyOuId: z.string().min(1, 'Company is required'),
  insuranceName: z.string().min(1, 'Insurance name is required'),
  providerName: z.string().min(1, 'Provider name is required'),
  policyNumber: z.string().min(1, 'Policy number is required'),
  cardId: z.string().optional(),
  coverageType: z.nativeEnum(InsuranceCoverageType),
  coverageAmount: z.coerce.number().min(0).optional(),
  assignment: z.nativeEnum(InsuranceAssignment),
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
  companyOuId: '',
  insuranceName: '',
  providerName: '',
  policyNumber: '',
  coverageType: InsuranceCoverageType.HEALTH,
  assignment: InsuranceAssignment.ALL_EMPLOYEES,
  renewalType: InsuranceRenewalType.YEARLY,
  hasDependentsCoverage: false,
  allowedDependents: [],
  includedServices: [],
  employerContribution: 100,
  employeeContribution: 0,
  status: 'active',
  startDate: '',
  endDate: '',
};
