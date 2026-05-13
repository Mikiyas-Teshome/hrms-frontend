'use server';

import { gqlRequest, GraphQLService } from '@/lib/graphql-client';
import {
  GET_LOAN_QUERY,
  GET_LOANS_QUERY,
  CREATE_LOAN_MUTATION,
  UPDATE_LOAN_MUTATION,
} from './loan.queries';
import { EmployeeLoan, CreateLoanInput, UpdateLoanInput } from './loan.types';
import { revalidatePath } from 'next/cache';

export async function fetchLoan(id: string): Promise<EmployeeLoan | null> {
  try {
    const data = await gqlRequest<{ loan: EmployeeLoan }>(
      GraphQLService.PAYROLL,
      GET_LOAN_QUERY,
      { id }
    );
    return data.loan;
  } catch (error) {
    console.error(`Failed to fetch loan ${id}:`, error);
    return null;
  }
}

export async function fetchLoans(companyId: string, employeeId?: string): Promise<EmployeeLoan[]> {
  try {
    const data = await gqlRequest<{ loans: EmployeeLoan[] }>(
      GraphQLService.PAYROLL,
      GET_LOANS_QUERY,
      { companyId, employeeId }
    );
    return data.loans;
  } catch (error) {
    console.error('Failed to fetch loans:', error);
    return [];
  }
}

export async function createLoan(input: CreateLoanInput): Promise<EmployeeLoan> {
  const data = await gqlRequest<{ createLoan: EmployeeLoan }>(
    GraphQLService.PAYROLL,
    CREATE_LOAN_MUTATION,
    { input }
  );
  revalidatePath('/dashboard/payroll/loans');
  return data.createLoan;
}

export async function updateLoan(id: string, input: UpdateLoanInput): Promise<EmployeeLoan> {
  const data = await gqlRequest<{ updateLoan: EmployeeLoan }>(
    GraphQLService.PAYROLL,
    UPDATE_LOAN_MUTATION,
    { id, input }
  );
  revalidatePath('/dashboard/payroll/loans');
  return data.updateLoan;
}
