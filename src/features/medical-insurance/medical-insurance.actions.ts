'use server';

import { gqlRequest, GraphQLService } from '@/lib/graphql-client';
import {
  CREATE_MEDICAL_INSURANCE_MUTATION,
  REMOVE_MEDICAL_INSURANCE_MUTATION,
  UPDATE_MEDICAL_INSURANCE_MUTATION,
  GET_MEDICAL_INSURANCES_QUERY,
} from './medical-insurance.queries';
import {
  MedicalInsurance,
  CreateMedicalInsuranceInput,
  UpdateMedicalInsuranceInput,
} from './medical-insurance.types';
import { revalidatePath } from 'next/cache';

export async function fetchMedicalInsurances(employeeId: string): Promise<MedicalInsurance[]> {
  try {
    const data = await gqlRequest<{ medicalInsurances: MedicalInsurance[] }>(
      GraphQLService.CORE_HR,
      GET_MEDICAL_INSURANCES_QUERY,
      { employeeId }
    );
    return data.medicalInsurances;
  } catch (error) {
    console.error(`Failed to fetch medical insurances for employee ${employeeId}:`, error);
    return [];
  }
}

export async function createMedicalInsurance(input: CreateMedicalInsuranceInput): Promise<MedicalInsurance> {
  const data = await gqlRequest<{ createMedicalInsurance: MedicalInsurance }>(
    GraphQLService.CORE_HR,
    CREATE_MEDICAL_INSURANCE_MUTATION,
    { input }
  );
  revalidatePath('/dashboard/employees');
  return data.createMedicalInsurance;
}

export async function updateMedicalInsurance(id: string, input: UpdateMedicalInsuranceInput): Promise<MedicalInsurance> {
  const data = await gqlRequest<{ updateMedicalInsurance: MedicalInsurance }>(
    GraphQLService.CORE_HR,
    UPDATE_MEDICAL_INSURANCE_MUTATION,
    { id, input }
  );
  revalidatePath('/dashboard/employees');
  return data.updateMedicalInsurance;
}

export async function removeMedicalInsurance(id: string): Promise<MedicalInsurance> {
  const data = await gqlRequest<{ removeMedicalInsurance: MedicalInsurance }>(
    GraphQLService.CORE_HR,
    REMOVE_MEDICAL_INSURANCE_MUTATION,
    { id }
  );
  revalidatePath('/dashboard/employees');
  return data.removeMedicalInsurance;
}
