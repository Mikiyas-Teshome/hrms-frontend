'use server';

import { gqlRequest, GraphQLService } from '@/lib/graphql-client';
import {
  GET_COMPANY_GRATUITIES_QUERY,
  GET_EMPLOYEE_GRATUITY_QUERY,
  CALCULATE_GRATUITY_MUTATION,
  CALCULATE_EOS_MUTATION,
} from './gratuity.queries';
import {
  GratuityCalculation,
  EosResult,
  CalculateGratuityInput,
  CalculateEosInput,
} from './gratuity.types';

export async function fetchCompanyGratuities(companyId: string): Promise<GratuityCalculation[]> {
  try {
    const data = await gqlRequest<{ companyGratuities: GratuityCalculation[] }>(
      GraphQLService.PAYROLL,
      GET_COMPANY_GRATUITIES_QUERY,
      { companyId }
    );
    return data.companyGratuities;
  } catch (error) {
    console.error('Failed to fetch company gratuities:', error);
    return [];
  }
}

export async function fetchEmployeeGratuity(
  employeeId: string
): Promise<GratuityCalculation | null> {
  try {
    const data = await gqlRequest<{ employeeGratuity: GratuityCalculation | null }>(
      GraphQLService.PAYROLL,
      GET_EMPLOYEE_GRATUITY_QUERY,
      { employeeId }
    );
    return data.employeeGratuity;
  } catch (error) {
    console.error(`Failed to fetch gratuity for employee ${employeeId}:`, error);
    return null;
  }
}

export async function calculateGratuity(input: CalculateGratuityInput): Promise<GratuityCalculation> {
  const data = await gqlRequest<{ calculateGratuity: GratuityCalculation }>(
    GraphQLService.PAYROLL,
    CALCULATE_GRATUITY_MUTATION,
    { input }
  );
  return data.calculateGratuity;
}

export async function calculateEos(input: CalculateEosInput): Promise<EosResult> {
  const data = await gqlRequest<{ calculateEos: EosResult }>(
    GraphQLService.PAYROLL,
    CALCULATE_EOS_MUTATION,
    { input }
  );
  return data.calculateEos;
}
