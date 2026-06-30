import { OVERTIME_POLICY_FIELDS_FRAGMENT } from '../overtime-policy/overtime-policy.queries';
import { PAYROLL_COMPONENT_FIELDS_FRAGMENT } from '../payroll.queries';

export const SALARY_STRUCTURE_FIELDS_FRAGMENT = `
  fragment SalaryStructureFields on SalaryStructureResponse {
    id
    companyId
    name
    code
    description
    ouId
    isActive
    employeeId
    baseSalary
    currency
    assignmentId
    assignedEmployeeCount
    allowances {
      ...PayrollComponentFields
    }
    deductions {
      ...PayrollComponentFields
    }
    normalOvertimePolicy {
      ...OvertimePolicyFields
    }
    weekendOvertimePolicy {
      ...OvertimePolicyFields
    }
    holidayOvertimePolicy {
      ...OvertimePolicyFields
    }
    dutyOvertimePolicy {
      ...OvertimePolicyFields
    }
    createdAt
    updatedAt
  }
  ${PAYROLL_COMPONENT_FIELDS_FRAGMENT}
  ${OVERTIME_POLICY_FIELDS_FRAGMENT}
`;

export const GET_SALARY_STRUCTURES_QUERY = `
  query GetSalaryStructures($companyId: ID!) {
    salaryStructures(companyId: $companyId) {
      ...SalaryStructureFields
    }
  }
  ${SALARY_STRUCTURE_FIELDS_FRAGMENT}
`;

export const GET_SALARY_STRUCTURE_BY_ID_QUERY = `
  query GetSalaryStructureById($id: ID!) {
    salaryStructureById(id: $id) {
      ...SalaryStructureFields
    }
  }
  ${SALARY_STRUCTURE_FIELDS_FRAGMENT}
`;

export const GET_EMPLOYEE_SALARY_STRUCTURE_QUERY = `
  query GetEmployeeSalaryStructure($employeeId: ID!, $companyId: ID!) {
    salaryStructure(employeeId: $employeeId, companyId: $companyId) {
      ...SalaryStructureFields
    }
  }
  ${SALARY_STRUCTURE_FIELDS_FRAGMENT}
`;

export const GET_MY_SALARY_STRUCTURE_QUERY = `
  query GetMySalaryStructure {
    mySalaryStructure {
      ...SalaryStructureFields
    }
  }
  ${SALARY_STRUCTURE_FIELDS_FRAGMENT}
`;

export const CREATE_SALARY_STRUCTURE_MUTATION = `
  mutation CreateSalaryStructure($input: CreateSalaryStructureInput!) {
    createSalaryStructure(input: $input) {
      ...SalaryStructureFields
    }
  }
  ${SALARY_STRUCTURE_FIELDS_FRAGMENT}
`;

export const UPDATE_SALARY_STRUCTURE_MUTATION = `
  mutation UpdateSalaryStructure($id: ID!, $input: UpdateSalaryStructureInput!) {
    updateSalaryStructure(id: $id, input: $input) {
      ...SalaryStructureFields
    }
  }
  ${SALARY_STRUCTURE_FIELDS_FRAGMENT}
`;

export const DELETE_SALARY_STRUCTURE_MUTATION = `
  mutation DeleteSalaryStructure($id: ID!, $companyId: ID!) {
    deleteSalaryStructure(id: $id, companyId: $companyId)
  }
`;

export const ASSIGN_EMPLOYEE_SALARY_MUTATION = `
  mutation AssignEmployeeSalary($input: CreateEmployeeSalaryAssignmentInput!) {
    assignEmployeeSalary(input: $input) {
      ...SalaryStructureFields
    }
  }
  ${SALARY_STRUCTURE_FIELDS_FRAGMENT}
`;

export const ADD_ALLOWANCE_TO_SALARY_STRUCTURE_MUTATION = `
  mutation AddAllowanceToSalaryStructure($id: ID!, $allowanceId: ID!) {
    addAllowanceToSalaryStructure(id: $id, allowanceId: $allowanceId) {
      ...SalaryStructureFields
    }
  }
  ${SALARY_STRUCTURE_FIELDS_FRAGMENT}
`;

export const REMOVE_ALLOWANCE_FROM_SALARY_STRUCTURE_MUTATION = `
  mutation RemoveAllowanceFromSalaryStructure($id: ID!, $allowanceId: ID!) {
    removeAllowanceFromSalaryStructure(id: $id, allowanceId: $allowanceId) {
      ...SalaryStructureFields
    }
  }
  ${SALARY_STRUCTURE_FIELDS_FRAGMENT}
`;

export const ADD_DEDUCTION_TO_SALARY_STRUCTURE_MUTATION = `
  mutation AddDeductionToSalaryStructure($id: ID!, $deductionId: ID!) {
    addDeductionToSalaryStructure(id: $id, deductionId: $deductionId) {
      ...SalaryStructureFields
    }
  }
  ${SALARY_STRUCTURE_FIELDS_FRAGMENT}
`;

export const REMOVE_DEDUCTION_FROM_SALARY_STRUCTURE_MUTATION = `
  mutation RemoveDeductionFromSalaryStructure($id: ID!, $deductionId: ID!) {
    removeDeductionFromSalaryStructure(id: $id, deductionId: $deductionId) {
      ...SalaryStructureFields
    }
  }
  ${SALARY_STRUCTURE_FIELDS_FRAGMENT}
`;
