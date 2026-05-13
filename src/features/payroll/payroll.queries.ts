import { ALLOWANCE_FIELDS_FRAGMENT } from '../allowance/allowance.queries';
import { DEDUCTION_FIELDS_FRAGMENT } from '../deduction/deduction.queries';
import { OVERTIME_POLICY_FIELDS_FRAGMENT } from '../overtime-policy/overtime-policy.queries';

export const PAYROLL_CONFIG_FIELDS_FRAGMENT = `
  fragment PayrollConfigFields on PayrollConfigResponse {
    id
    companyId
    cycleType
    payDay
    autoFinalize
    createdAt
    updatedAt
  }
`;

export const UPCOMING_PAYROLL_FIELDS_FRAGMENT = `
  fragment UpcomingPayrollFields on UpcomingPayrollResponse {
    date
    periodStart
    periodEnd
    daysRemaining
  }
`;

export const PAYROLL_RUN_FIELDS_FRAGMENT = `
  fragment PayrollRunFields on PayrollRunResponse {
    id
    companyId
    startDate
    endDate
    status
    createdAt
    updatedAt
  }
`;

export const PAYSLIP_FIELDS_FRAGMENT = `
  fragment PayslipFields on PayslipResponse {
    id
    companyId
    employeeId
    payrollRunId
    basicSalary
    totalAllowances
    totalDeductions
    grossPay
    netPay
    createdAt
  }
`;

export const SALARY_STRUCTURE_FIELDS_FRAGMENT = `
  fragment SalaryStructureFields on SalaryStructureResponse {
    id
    companyId
    employeeId
    basicSalary
    currency
    allowances {
      ...AllowanceFields
    }
    deductions {
      ...DeductionFields
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
  ${ALLOWANCE_FIELDS_FRAGMENT}
  ${DEDUCTION_FIELDS_FRAGMENT}
  ${OVERTIME_POLICY_FIELDS_FRAGMENT}
`;

export const WPS_FILE_RESULT_FIELDS_FRAGMENT = `
  fragment WpsFileResultFields on WpsFileResult {
    filename
    content
    format
    generatedAt
  }
`;

export const GET_PAYROLL_CONFIG_QUERY = `
  query GetPayrollConfig($companyId: String!) {
    getPayrollConfig(companyId: $companyId) {
      ...PayrollConfigFields
    }
  }
  ${PAYROLL_CONFIG_FIELDS_FRAGMENT}
`;

export const GET_UPCOMING_PAYROLL_DATE_QUERY = `
  query GetUpcomingPayrollDate($companyId: String!) {
    getUpcomingPayrollDate(companyId: $companyId) {
      ...UpcomingPayrollFields
    }
  }
  ${UPCOMING_PAYROLL_FIELDS_FRAGMENT}
`;

export const GET_PAYROLL_RUN_QUERY = `
  query GetPayrollRun($id: ID!) {
    payrollRun(id: $id) {
      ...PayrollRunFields
    }
  }
  ${PAYROLL_RUN_FIELDS_FRAGMENT}
`;

export const GET_PAYROLL_RUNS_QUERY = `
  query GetPayrollRuns($companyId: String!) {
    payrollRuns(companyId: $companyId) {
      ...PayrollRunFields
    }
  }
  ${PAYROLL_RUN_FIELDS_FRAGMENT}
`;

export const GET_PAYSLIP_QUERY = `
  query GetPayslip($id: ID!) {
    payslip(id: $id) {
      ...PayslipFields
    }
  }
  ${PAYSLIP_FIELDS_FRAGMENT}
`;

export const GET_PAYSLIPS_BY_EMPLOYEE_QUERY = `
  query GetPayslipsByEmployee($employeeId: ID!) {
    payslipsByEmployee(employeeId: $employeeId) {
      ...PayslipFields
    }
  }
  ${PAYSLIP_FIELDS_FRAGMENT}
`;

export const GET_PAYSLIPS_BY_PAYROLL_RUN_QUERY = `
  query GetPayslipsByPayrollRun($payrollRunId: ID!) {
    payslipsByPayrollRun(payrollRunId: $payrollRunId) {
      ...PayslipFields
    }
  }
  ${PAYSLIP_FIELDS_FRAGMENT}
`;

export const GET_SALARY_STRUCTURE_QUERY = `
  ${SALARY_STRUCTURE_FIELDS_FRAGMENT}
`;

export const GET_PAYROLL_COMPONENTS_QUERY = `
  query GetPayrollComponents($companyId: String!, $isActive: Boolean) {
    payrollComponents(companyId: $companyId, isActive: $isActive) {
      __typename
      ... on AllowanceResponse {
        id
        name
        description
        type
        value
        taxable
        isActive
        createdAt
      }
      ... on DeductionResponse {
        id
        name
        description
        type
        value
        recurring
        isActive
        createdAt
      }
    }
  }
`;

export const CREATE_PAYROLL_RUN_MUTATION = `
  mutation CreatePayrollRun($input: CreatePayrollRunInput!) {
    createPayrollRun(input: $input) {
      ...PayrollRunFields
    }
  }
  ${PAYROLL_RUN_FIELDS_FRAGMENT}
`;

export const FINALIZE_PAYROLL_RUN_MUTATION = `
  mutation FinalizePayrollRun($id: ID!) {
    finalizePayrollRun(id: $id) {
      ...PayrollRunFields
    }
  }
  ${PAYROLL_RUN_FIELDS_FRAGMENT}
`;

export const MARK_PAYROLL_RUN_PAID_MUTATION = `
  mutation MarkPayrollRunPaid($id: ID!) {
    markPayrollRunPaid(id: $id) {
      ...PayrollRunFields
    }
  }
  ${PAYROLL_RUN_FIELDS_FRAGMENT}
`;

export const GENERATE_PAYSLIP_MUTATION = `
  mutation GeneratePayslip($input: GeneratePayslipInput!) {
    generatePayslip(input: $input) {
      ...PayslipFields
    }
  }
  ${PAYSLIP_FIELDS_FRAGMENT}
`;

export const GENERATE_WPS_FILE_MUTATION = `
  mutation GenerateWpsFile($input: GenerateWpsInput!) {
    generateWpsFile(input: $input) {
      ...WpsFileResultFields
    }
  }
  ${WPS_FILE_RESULT_FIELDS_FRAGMENT}
`;

export const UPDATE_PAYROLL_CONFIG_MUTATION = `
  mutation UpdatePayrollConfig($input: UpdatePayrollConfigInput!) {
    updatePayrollConfig(input: $input) {
      ...PayrollConfigFields
    }
  }
  ${PAYROLL_CONFIG_FIELDS_FRAGMENT}
`;

export const CREATE_SALARY_STRUCTURE_MUTATION = `
  mutation CreateSalaryStructure($input: CreateSalaryStructureInput!) {
    createSalaryStructure(input: $input) {
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

export const UPSERT_PAYROLL_COMPONENTS_MUTATION = `
  mutation UpsertPayrollComponents($inputs: [UpsertPayrollComponentInput!]!) {
    upsertPayrollComponents(inputs: $inputs) {
      __typename
      ... on AllowanceResponse {
        id
        name
        type
        value
        taxable
        isActive
      }
      ... on DeductionResponse {
        id
        name
        type
        value
        recurring
        isActive
      }
    }
  }
`;

export const REMOVE_DEDUCTION_FROM_SALARY_STRUCTURE_MUTATION = `
  mutation RemoveDeductionFromSalaryStructure($id: ID!, $deductionId: ID!) {
    removeDeductionFromSalaryStructure(id: $id, deductionId: $deductionId) {
      ...SalaryStructureFields
    }
  }
  ${SALARY_STRUCTURE_FIELDS_FRAGMENT}
`;

export const CREATE_PAYROLL_COMPONENT_MUTATION = `
  mutation CreatePayrollComponent($input: CreatePayrollComponentInput!) {
    createPayrollComponent(input: $input) {
      __typename
      ... on AllowanceResponse {
        id
        name
        type
        value
        taxable
        isActive
      }
      ... on DeductionResponse {
        id
        name
        type
        value
        recurring
        isActive
      }
    }
  }
`;

export const UPDATE_PAYROLL_COMPONENT_MUTATION = `
  mutation UpdatePayrollComponent($id: String!, $input: UpdatePayrollComponentInput!) {
    updatePayrollComponent(id: $id, input: $input) {
      __typename
      ... on AllowanceResponse {
        id
        name
        type
        value
        taxable
        isActive
      }
      ... on DeductionResponse {
        id
        name
        type
        value
        recurring
        isActive
      }
    }
  }
`;

export const DELETE_PAYROLL_COMPONENT_MUTATION = `
  mutation DeletePayrollComponent($id: String!, $componentType: PayrollComponentType!) {
    deletePayrollComponent(id: $id, componentType: $componentType)
  }
`;

export const GET_EMPLOYEE_SALARY_HISTORY_QUERY = `
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
