'use server';

import { gqlRequest, GraphQLService } from '@/lib/graphql-client';
import { ActionResult, safeAction } from '@/lib/safe-action';
import { revalidatePath } from 'next/cache';
import {
  GET_SALARY_STRUCTURES_QUERY,
  GET_SALARY_STRUCTURE_BY_ID_QUERY,
  GET_EMPLOYEE_SALARY_STRUCTURE_QUERY,
  GET_MY_SALARY_STRUCTURE_QUERY,
  CREATE_SALARY_STRUCTURE_MUTATION,
  UPDATE_SALARY_STRUCTURE_MUTATION,
  DELETE_SALARY_STRUCTURE_MUTATION,
  ASSIGN_EMPLOYEE_SALARY_MUTATION,
  ADD_ALLOWANCE_TO_SALARY_STRUCTURE_MUTATION,
  REMOVE_ALLOWANCE_FROM_SALARY_STRUCTURE_MUTATION,
  ADD_DEDUCTION_TO_SALARY_STRUCTURE_MUTATION,
  REMOVE_DEDUCTION_FROM_SALARY_STRUCTURE_MUTATION,
} from './salary-structure.queries';
import {
  AssignEmployeeSalaryInput,
  CreateSalaryStructureInput,
  UpdateSalaryStructureInput,
  SalaryStructureResponse,
} from './salary-structure.types';

export async function fetchSalaryStructures(
  companyId: string,
): Promise<SalaryStructureResponse[]> {
  try {
    const data = await gqlRequest<{ salaryStructures: SalaryStructureResponse[] }>(
      GraphQLService.PAYROLL,
      GET_SALARY_STRUCTURES_QUERY,
      { companyId },
    );
    return data.salaryStructures;
  } catch (error) {
    console.error('Failed to fetch salary structures:', error);
    return [];
  }
}

export async function fetchSalaryStructureById(
  id: string,
): Promise<SalaryStructureResponse | null> {
  try {
    const data = await gqlRequest<{ salaryStructureById: SalaryStructureResponse | null }>(
      GraphQLService.PAYROLL,
      GET_SALARY_STRUCTURE_BY_ID_QUERY,
      { id },
    );
    return data.salaryStructureById;
  } catch (error) {
    console.error(`Failed to fetch salary structure ${id}:`, error);
    return null;
  }
}

export async function fetchEmployeeSalaryStructure(
  employeeId: string,
  companyId: string,
): Promise<SalaryStructureResponse | null> {
  try {
    const data = await gqlRequest<{ salaryStructure: SalaryStructureResponse | null }>(
      GraphQLService.PAYROLL,
      GET_EMPLOYEE_SALARY_STRUCTURE_QUERY,
      { employeeId, companyId },
    );
    return data.salaryStructure;
  } catch (error) {
    console.error(`Failed to fetch salary structure for employee ${employeeId}:`, error);
    return null;
  }
}

export async function fetchMySalaryStructure(): Promise<SalaryStructureResponse | null> {
  try {
    const data = await gqlRequest<{ mySalaryStructure: SalaryStructureResponse | null }>(
      GraphQLService.PAYROLL,
      GET_MY_SALARY_STRUCTURE_QUERY,
    );
    return data.mySalaryStructure;
  } catch (error) {
    console.error('Failed to fetch my salary structure:', error);
    return null;
  }
}

export async function createSalaryStructure(
  input: CreateSalaryStructureInput,
): Promise<ActionResult<SalaryStructureResponse>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ createSalaryStructure: SalaryStructureResponse }>(
      GraphQLService.PAYROLL,
      CREATE_SALARY_STRUCTURE_MUTATION,
      { input },
    );
    revalidatePath('/dashboard/payroll/salary-structures');
    return data.createSalaryStructure;
  });
}

export async function updateSalaryStructure(
  id: string,
  input: UpdateSalaryStructureInput,
): Promise<ActionResult<SalaryStructureResponse>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ updateSalaryStructure: SalaryStructureResponse }>(
      GraphQLService.PAYROLL,
      UPDATE_SALARY_STRUCTURE_MUTATION,
      { id, input },
    );
    revalidatePath('/dashboard/payroll/salary-structures');
    revalidatePath(`/dashboard/payroll/salary-structures/${id}`);
    return data.updateSalaryStructure;
  });
}

export async function deleteSalaryStructure(
  id: string,
  companyId: string,
): Promise<ActionResult<boolean>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ deleteSalaryStructure: boolean }>(
      GraphQLService.PAYROLL,
      DELETE_SALARY_STRUCTURE_MUTATION,
      { id, companyId },
    );
    revalidatePath('/dashboard/payroll/salary-structures');
    return data.deleteSalaryStructure;
  });
}

export async function assignEmployeeSalary(
  input: AssignEmployeeSalaryInput,
): Promise<ActionResult<SalaryStructureResponse>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ assignEmployeeSalary: SalaryStructureResponse }>(
      GraphQLService.PAYROLL,
      ASSIGN_EMPLOYEE_SALARY_MUTATION,
      { input },
    );
    revalidatePath('/dashboard/payroll/salaries');
    revalidatePath(`/dashboard/payroll/salaries/${input.employeeId}`);
    return data.assignEmployeeSalary;
  });
}

export async function addAllowanceToSalaryStructure(
  id: string,
  allowanceId: string,
): Promise<ActionResult<SalaryStructureResponse>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ addAllowanceToSalaryStructure: SalaryStructureResponse }>(
      GraphQLService.PAYROLL,
      ADD_ALLOWANCE_TO_SALARY_STRUCTURE_MUTATION,
      { id, allowanceId },
    );
    revalidatePath('/dashboard/payroll/salary-structures');
    revalidatePath(`/dashboard/payroll/salary-structures/${id}`);
    return data.addAllowanceToSalaryStructure;
  });
}

export async function removeAllowanceFromSalaryStructure(
  id: string,
  allowanceId: string,
): Promise<ActionResult<SalaryStructureResponse>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ removeAllowanceFromSalaryStructure: SalaryStructureResponse }>(
      GraphQLService.PAYROLL,
      REMOVE_ALLOWANCE_FROM_SALARY_STRUCTURE_MUTATION,
      { id, allowanceId },
    );
    revalidatePath('/dashboard/payroll/salary-structures');
    revalidatePath(`/dashboard/payroll/salary-structures/${id}`);
    return data.removeAllowanceFromSalaryStructure;
  });
}

export async function addDeductionToSalaryStructure(
  id: string,
  deductionId: string,
): Promise<ActionResult<SalaryStructureResponse>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ addDeductionToSalaryStructure: SalaryStructureResponse }>(
      GraphQLService.PAYROLL,
      ADD_DEDUCTION_TO_SALARY_STRUCTURE_MUTATION,
      { id, deductionId },
    );
    revalidatePath('/dashboard/payroll/salary-structures');
    revalidatePath(`/dashboard/payroll/salary-structures/${id}`);
    return data.addDeductionToSalaryStructure;
  });
}

export async function removeDeductionFromSalaryStructure(
  id: string,
  deductionId: string,
): Promise<ActionResult<SalaryStructureResponse>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ removeDeductionFromSalaryStructure: SalaryStructureResponse }>(
      GraphQLService.PAYROLL,
      REMOVE_DEDUCTION_FROM_SALARY_STRUCTURE_MUTATION,
      { id, deductionId },
    );
    revalidatePath('/dashboard/payroll/salary-structures');
    revalidatePath(`/dashboard/payroll/salary-structures/${id}`);
    return data.removeDeductionFromSalaryStructure;
  });
}
