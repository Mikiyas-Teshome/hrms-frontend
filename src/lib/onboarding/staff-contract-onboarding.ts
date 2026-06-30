import { ContractStatus } from '@/features/contracts/contracts.types';
import type { EmployeeContract } from '@/features/contracts/employee-contract.types';

export function hasPendingStaffContract(assignments: EmployeeContract[]): boolean {
    return assignments.some((assignment) => assignment.status === ContractStatus.draft);
}
