import { gql } from 'graphql-request';

export const GET_EMPLOYEE_SALARY_HISTORY_QUERY = gql`
  query GetEmployeeSalaryHistory($employeeId: ID!) {
    employeeSalaryHistory(employeeId: $employeeId) {
      id
      employeeId
      companyId
      oldBasicSalary
      newBasicSalary
      effectiveDate
      changeReason
      processedBy
      createdAt
    }
  }
`;

export const GET_EMPLOYEE_TRANSFER_HISTORY_QUERY = gql`
  query GetEmployeeTransferHistory($employeeId: ID!) {
    employeeTransferHistory(employeeId: $employeeId) {
      id
      employeeId
      companyId
      fromDepartmentId
      toDepartmentId
      fromManagerId
      toManagerId
      transferDate
      reason
      processedBy
      createdAt
    }
  }
`;

export interface SalaryHistoryRecord {
    id: string;
    employeeId: string;
    companyId: string;
    oldBasicSalary: number;
    newBasicSalary: number;
    effectiveDate: string;
    changeReason?: string;
    processedBy: string;
    createdAt: string;
}

export interface TransferHistoryRecord {
    id: string;
    employeeId: string;
    companyId: string;
    fromDepartmentId: string;
    toDepartmentId: string;
    fromManagerId?: string;
    toManagerId?: string;
    transferDate: string;
    reason?: string;
    processedBy: string;
    createdAt: string;
}
