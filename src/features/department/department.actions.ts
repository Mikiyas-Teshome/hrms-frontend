'use server';

import { gqlRequest, GraphQLService } from '@/lib/graphql-client';
import {
  GET_DEPARTMENTS_QUERY,
  GET_DEPARTMENT_QUERY,
  CREATE_DEPARTMENT_MUTATION,
  UPDATE_DEPARTMENT_MUTATION,
  DELETE_DEPARTMENT_MUTATION,
} from './department.queries';
import {
  DepartmentResponse,
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from './department.types';
import { revalidatePath } from 'next/cache';

export async function fetchDepartments(): Promise<DepartmentResponse[]> {
  try {
    const data = await gqlRequest<{ departments: DepartmentResponse[] }>(
      GraphQLService.CORE_HR,
      GET_DEPARTMENTS_QUERY,
      {}
    );
    return data.departments;
  } catch (error) {
    console.error('Failed to fetch departments:', error);
    return [];
  }
}

export async function fetchDepartment(id: string): Promise<DepartmentResponse | null> {
  try {
    const data = await gqlRequest<{ department: DepartmentResponse }>(
      GraphQLService.CORE_HR,
      GET_DEPARTMENT_QUERY,
      { id }
    );
    return data.department;
  } catch (error) {
    console.error(`Failed to fetch department with id ${id}:`, error);
    return null;
  }
}

export async function createDepartment(input: CreateDepartmentInput): Promise<DepartmentResponse> {
  const data = await gqlRequest<{ createDepartment: DepartmentResponse }>(
    GraphQLService.CORE_HR,
    CREATE_DEPARTMENT_MUTATION,
    { input }
  );
  revalidatePath('/dashboard/settings/departments');
  return data.createDepartment;
}

export async function updateDepartment(id: string, input: UpdateDepartmentInput): Promise<DepartmentResponse> {
  const data = await gqlRequest<{ updateDepartment: DepartmentResponse }>(
    GraphQLService.CORE_HR,
    UPDATE_DEPARTMENT_MUTATION,
    { id, input }
  );
  revalidatePath('/dashboard/settings/departments');
  return data.updateDepartment;
}

export async function deleteDepartment(id: string): Promise<boolean> {
  const data = await gqlRequest<{ deleteDepartment: boolean }>(
    GraphQLService.CORE_HR,
    DELETE_DEPARTMENT_MUTATION,
    { id }
  );
  revalidatePath('/dashboard/settings/departments');
  return data.deleteDepartment;
}
