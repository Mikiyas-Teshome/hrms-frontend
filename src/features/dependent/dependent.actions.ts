'use server';

import { gqlRequest, GraphQLService } from '@/lib/graphql-client';
import {
  CREATE_DEPENDENT_MUTATION,
  REMOVE_DEPENDENT_MUTATION,
  UPDATE_DEPENDENT_MUTATION,
  GET_DEPENDENTS_QUERY,
} from './dependent.queries';
import {
  Dependent,
  CreateDependentInput,
  UpdateDependentInput,
} from './dependent.types';
import { revalidatePath } from 'next/cache';

export async function fetchDependents(employeeId: string): Promise<Dependent[]> {
  try {
    const data = await gqlRequest<{ dependents: Dependent[] }>(
      GraphQLService.CORE_HR,
      GET_DEPENDENTS_QUERY,
      { employeeId }
    );
    return data.dependents;
  } catch (error) {
    console.error(`Failed to fetch dependents for employee ${employeeId}:`, error);
    return [];
  }
}

export async function createDependent(input: CreateDependentInput): Promise<Dependent> {
  const data = await gqlRequest<{ createDependent: Dependent }>(
    GraphQLService.CORE_HR,
    CREATE_DEPENDENT_MUTATION,
    { input }
  );
  revalidatePath('/dashboard/employees');
  return data.createDependent;
}

export async function updateDependent(id: string, input: UpdateDependentInput): Promise<Dependent> {
  const data = await gqlRequest<{ updateDependent: Dependent }>(
    GraphQLService.CORE_HR,
    UPDATE_DEPENDENT_MUTATION,
    { id, input }
  );
  revalidatePath('/dashboard/employees');
  return data.updateDependent;
}

export async function removeDependent(id: string): Promise<Dependent> {
  const data = await gqlRequest<{ removeDependent: Dependent }>(
    GraphQLService.CORE_HR,
    REMOVE_DEPENDENT_MUTATION,
    { id }
  );
  revalidatePath('/dashboard/employees');
  return data.removeDependent;
}
