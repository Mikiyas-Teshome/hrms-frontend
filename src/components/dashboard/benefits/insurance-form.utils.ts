import { CreateInsuranceInput, Insurance } from '@/features/insurance/insurance.types';
import { InsuranceFormValues } from './insurance-form.schema';

export function mapInsuranceToFormValues(insurance: Insurance): InsuranceFormValues {
  return {
    ouId: insurance.ouId || '',
    insuranceName: insurance.insuranceName,
    providerName: insurance.providerName,
    policyNumber: insurance.policyNumber,
    cardId: insurance.cardId || '',
    coverageType: insurance.coverageType,
    coverageAmount: insurance.coverageAmount ?? undefined,
    renewalType: insurance.renewalType,
    hasDependentsCoverage: insurance.hasDependentsCoverage,
    maxDependents: insurance.maxDependents ?? undefined,
    allowedDependents: insurance.allowedDependents ?? [],
    includedServices: insurance.includedServices ?? [],
    employmentType: insurance.employmentType,
    minTenureMonths: insurance.minTenureMonths ?? undefined,
    employerContribution: insurance.employerContribution,
    employeeContribution: insurance.employeeContribution,
    startDate: insurance.startDate.split('T')[0],
    endDate: insurance.endDate.split('T')[0],
    status: insurance.status,
  };
}

export function mapInsuranceToContractCreateInput(
  insurance: Insurance,
  fallbackOuId: string,
): CreateInsuranceInput {
  const ouId = insurance.ouId || fallbackOuId;
  if (!ouId) {
    throw new Error('Organization unit is required for contract insurance');
  }
  return {
    ouId,
    insuranceName: insurance.insuranceName,
    providerName: insurance.providerName,
    policyNumber: insurance.policyNumber,
    cardId: insurance.cardId || undefined,
    coverageType: insurance.coverageType,
    coverageAmount: insurance.coverageAmount ?? undefined,
    renewalType: insurance.renewalType,
    hasDependentsCoverage: insurance.hasDependentsCoverage,
    maxDependents: insurance.maxDependents ?? undefined,
    allowedDependents: insurance.allowedDependents,
    includedServices: insurance.includedServices,
    employmentType: insurance.employmentType,
    minTenureMonths: insurance.minTenureMonths ?? undefined,
    employerContribution: insurance.employerContribution,
    employeeContribution: insurance.employeeContribution,
    startDate: insurance.startDate,
    endDate: insurance.endDate,
    status: insurance.status,
  };
}

export function formatInsuranceFormPayload(data: InsuranceFormValues) {
  return {
    ...data,
    startDate: new Date(data.startDate).toISOString(),
    endDate: new Date(data.endDate).toISOString(),
    employmentType: data.employmentType || undefined,
    cardId: data.cardId || undefined,
    coverageAmount: data.coverageAmount ?? undefined,
    maxDependents: data.maxDependents ?? undefined,
    minTenureMonths: data.minTenureMonths ?? undefined,
  };
}
