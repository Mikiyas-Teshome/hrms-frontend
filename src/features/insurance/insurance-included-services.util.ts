import {
  InsuranceCoverageType,
  InsuranceIncludedService,
} from '@/features/insurance/insurance.types';

export const INCLUDED_SERVICES_BY_COVERAGE_TYPE: Record<
  InsuranceCoverageType,
  InsuranceIncludedService[]
> = {
  [InsuranceCoverageType.HEALTH]: [
    InsuranceIncludedService.HOSPITALIZATION,
    InsuranceIncludedService.OUTPATIENT,
  ],
  [InsuranceCoverageType.DENTAL]: [InsuranceIncludedService.DENTAL],
  [InsuranceCoverageType.VISION]: [InsuranceIncludedService.VISION],
  [InsuranceCoverageType.LIFE]: [],
  [InsuranceCoverageType.OTHER]: [
    InsuranceIncludedService.HOSPITALIZATION,
    InsuranceIncludedService.OUTPATIENT,
  ],
};

const SERVICE_LABELS: Record<InsuranceIncludedService, string> = {
  [InsuranceIncludedService.HOSPITALIZATION]: 'Hospitalization',
  [InsuranceIncludedService.OUTPATIENT]: 'Outpatient',
  [InsuranceIncludedService.DENTAL]: 'Dental',
  [InsuranceIncludedService.VISION]: 'Vision',
};

export function getIncludedServicesForCoverageType(
  coverageType: InsuranceCoverageType,
): InsuranceIncludedService[] {
  return INCLUDED_SERVICES_BY_COVERAGE_TYPE[coverageType] ?? [];
}

export function pruneIncludedServicesForCoverageType(
  coverageType: InsuranceCoverageType,
  selected: InsuranceIncludedService[],
): InsuranceIncludedService[] {
  const allowed = new Set(getIncludedServicesForCoverageType(coverageType));
  return selected.filter((service) => allowed.has(service));
}

export function getIncludedServiceOptionsForCoverageType(
  coverageType: InsuranceCoverageType,
): { label: string; value: InsuranceIncludedService }[] {
  return getIncludedServicesForCoverageType(coverageType).map((service) => ({
    label: SERVICE_LABELS[service],
    value: service,
  }));
}

export function coverageTypeSupportsIncludedServices(
  coverageType: InsuranceCoverageType,
): boolean {
  return getIncludedServicesForCoverageType(coverageType).length > 0;
}
