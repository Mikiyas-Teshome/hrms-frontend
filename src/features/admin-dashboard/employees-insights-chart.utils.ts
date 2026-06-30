import { isWithinInterval, parseISO, startOfDay } from 'date-fns';
import { AttendanceStatus, type AttendanceRecord } from '@/features/attendance/attendance.types';
import type { EmployeeResponse } from '@/features/employee/employee.types';
import type { EmployeesInsightsChartRange, EmployeesInsightsChartRow } from './admin-chart.types';
import { getEmployeesInsightsRangeBounds } from './admin-chart.utils';

const MAX_DEPARTMENTS = 8;
const UNKNOWN_DEPARTMENT = 'Unknown';

export function filterEmployeesHiredInRange(
  employees: EmployeeResponse[],
  range: EmployeesInsightsChartRange,
): EmployeeResponse[] {
  const { start, end } = getEmployeesInsightsRangeBounds(range);
  return employees.filter((employee) => {
    if (!employee.hireDate) {
      return false;
    }
    const hireDate = startOfDay(parseISO(employee.hireDate));
    return isWithinInterval(hireDate, { start, end });
  });
}

export function aggregateHiresByDepartment(
  employees: EmployeeResponse[],
  departmentNameById: Map<string, string>,
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const employee of employees) {
    const deptId = employee.departmentId;
    const label = deptId
      ? (departmentNameById.get(deptId) ?? UNKNOWN_DEPARTMENT)
      : UNKNOWN_DEPARTMENT;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return counts;
}

export function aggregateOnLeaveByDepartment(records: AttendanceRecord[]): Map<string, number> {
  const usersByDepartment = new Map<string, Set<string>>();

  for (const record of records) {
    if (record.status !== AttendanceStatus.ON_LEAVE) {
      continue;
    }
    const label = record.departmentOuName?.trim() || UNKNOWN_DEPARTMENT;
    let users = usersByDepartment.get(label);
    if (!users) {
      users = new Set<string>();
      usersByDepartment.set(label, users);
    }
    users.add(record.userId);
  }

  const counts = new Map<string, number>();
  for (const [label, users] of usersByDepartment) {
    counts.set(label, users.size);
  }
  return counts;
}

export function mergeEmployeesInsightsRows(
  hiresByDepartment: Map<string, number>,
  leaveByDepartment: Map<string, number>,
  maxDepartments = MAX_DEPARTMENTS,
): EmployeesInsightsChartRow[] {
  const departments = new Set<string>([
    ...hiresByDepartment.keys(),
    ...leaveByDepartment.keys(),
  ]);

  const rows: EmployeesInsightsChartRow[] = [...departments].map((department) => ({
    department,
    hires: hiresByDepartment.get(department) ?? 0,
    leave: leaveByDepartment.get(department) ?? 0,
  }));

  rows.sort((a, b) => b.hires + b.leave - (a.hires + a.leave));

  if (rows.length <= maxDepartments) {
    return rows;
  }

  return rows.slice(0, maxDepartments);
}
