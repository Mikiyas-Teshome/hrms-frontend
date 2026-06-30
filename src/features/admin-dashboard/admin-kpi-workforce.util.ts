import { endOfMonth, isWithinInterval, parseISO, startOfDay, startOfMonth } from 'date-fns';
import type { EmployeeResponse } from '@/features/employee/employee.types';
import { EmployeeStatus } from '@/features/employee/employee.types';

export function countNewHiresThisMonth(employees: EmployeeResponse[]): number {
  const start = startOfMonth(new Date());
  const end = endOfMonth(new Date());

  return employees.filter((employee) => {
    if (!employee.hireDate) {
      return false;
    }
    const hireDate = startOfDay(parseISO(employee.hireDate));
    return isWithinInterval(hireDate, { start, end });
  }).length;
}

export function calculateAttritionRate(employees: EmployeeResponse[]): number {
  if (employees.length === 0) {
    return 0;
  }

  const terminated = employees.filter((employee) => employee.status === EmployeeStatus.TERMINATED).length;
  return Math.round((terminated / employees.length) * 100);
}
