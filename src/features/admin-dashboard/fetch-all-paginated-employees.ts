import { fetchPaginatedEmployees } from '@/features/employee/employee.actions';
import type { EmployeeListFilterInput, EmployeeResponse } from '@/features/employee/employee.types';

const EXPORT_PAGE_SIZE = 100;

export async function fetchAllPaginatedEmployees(
  filter: EmployeeListFilterInput = {},
): Promise<EmployeeResponse[]> {
  const allEmployees: EmployeeResponse[] = [];
  let page = 1;
  let hasNext = true;

  while (hasNext) {
    const batch = await fetchPaginatedEmployees({ page, size: EXPORT_PAGE_SIZE }, filter);
    allEmployees.push(...batch.data);
    hasNext = batch.metaData.hasNext;
    page += 1;
  }

  return allEmployees;
}
