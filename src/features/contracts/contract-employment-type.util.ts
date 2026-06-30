import type { Contract } from './contracts.types';
import { EmploymentType } from './contracts.types';

const CONTRACT_TYPE_EMPLOYMENT_FALLBACK: Record<string, EmploymentType> = {
    permanent: EmploymentType.full_time,
    fixed_term: EmploymentType.full_time,
    probation: EmploymentType.full_time,
    internship: EmploymentType.intern,
    consultant: EmploymentType.consultant,
    part_time: EmploymentType.part_time,
};

export function resolveContractEmploymentType(contract?: Contract | null): string | undefined {
    if (!contract) {
        return undefined;
    }

    if (contract.employmentType) {
        return contract.employmentType;
    }

    if (!contract.contractType) {
        return undefined;
    }

    return CONTRACT_TYPE_EMPLOYMENT_FALLBACK[contract.contractType];
}
