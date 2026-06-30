import { OVERTIME_POLICY_FIELDS_FRAGMENT } from './overtime-policy/overtime-policy.queries';

export const PAYROLL_COMPONENT_FIELDS_FRAGMENT = `
  fragment PayrollComponentFields on PayrollComponentResponse {
    id
    ouId
    name
    description
    category
    type
    value
    taxable
    recurring
    isActive
    createdAt
    updatedAt
  }
`;

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
    employeeCount
    grossPay
    netPay
    currency
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
    currency
    basicSalary
    totalAllowances
    totalDeductions
    totalOvertime
    totalDutyOvertime
    unpaidLeaveDeduction
    loanDeduction
    incomeTaxAmount
    taxRuleId
    taxRuleName
    grossPay
    netPay
    createdAt
  }
`;

export const PAYSLIP_DETAIL_FIELDS_FRAGMENT = `
  fragment PayslipDetailFields on PayslipDetailResponse {
    id
    companyId
    employeeId
    payrollRunId
    currency
    basicSalary
    totalAllowances
    totalDeductions
    totalOvertime
    totalDutyOvertime
    unpaidLeaveDeduction
    loanDeduction
    incomeTaxAmount
    taxRuleId
    taxRuleName
    grossPay
    netPay
    createdAt
    periodStart
    periodEnd
    payrollEligible
    ineligibilityReason
    monthlyBasicSalary
    allowances {
      id
      name
      type
      rawValue
      amount
    }
    deductions {
      id
      name
      type
      rawValue
      amount
    }
    lines {
      code
      label
      category
      amount
      componentType
      rawValue
    }
    attendance {
      workingDays
      presentDays
      halfDays
      absentDays
      paidLeaveDays
      unpaidLeaveDays
      overtimeHours
      attendanceRate
    }
    rates {
      hourlyRate
      dailyRate
      scalingFactor
      daysInPeriod
      eligibleCalendarDays
    }
    tax {
      taxRuleId
      taxRuleName
      taxableIncome
      taxAmount
      brackets {
        minAmount
        maxAmount
        rate
        taxAmount
      }
    }
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

export const GET_PAYROLL_RUNS_PAGINATED_QUERY = `
  query GetPayrollRunsPaginated(
    $companyId: String!
    $filter: PayrollRunFilterInput
    $pagination: PayrollRunPaginationInput
    $displayCurrency: String
  ) {
    payrollRunsPaginated(companyId: $companyId, filter: $filter, pagination: $pagination, displayCurrency: $displayCurrency) {
      data {
        ...PayrollRunFields
      }
      metaData {
        page
        size
        total
        totalPages
        hasNext
        hasPrevious
      }
      summary {
        totalRuns
        completedRuns
        pendingRuns
        totalGrossPay
      }
    }
  }
  ${PAYROLL_RUN_FIELDS_FRAGMENT}
`;

export const GET_PAYSLIP_QUERY = `
  query GetPayslip($id: ID!) {
    payslip(id: $id) {
      ...PayslipDetailFields
    }
  }
  ${PAYSLIP_DETAIL_FIELDS_FRAGMENT}
`;

export const GET_PAYSLIPS_PAGINATED_QUERY = `
  query GetPayslipsPaginated(
    $companyId: String!
    $filter: PayslipFilterInput
    $pagination: PayslipPaginationInput
    $displayCurrency: String
  ) {
    payslipsPaginated(companyId: $companyId, filter: $filter, pagination: $pagination, displayCurrency: $displayCurrency) {
      data {
        ...PayslipFields
      }
      metaData {
        page
        size
        total
        totalPages
        hasNext
        hasPrevious
      }
      summary {
        totalGrossPay
        totalNetPay
      }
    }
  }
  ${PAYSLIP_FIELDS_FRAGMENT}
`;

export const GET_SALARY_STRUCTURE_QUERY = `
  query GetSalaryStructure($employeeId: ID!) {
    salaryStructure(employeeId: $employeeId) {
      ...SalaryStructureFields
    }
  }
  ${SALARY_STRUCTURE_FIELDS_FRAGMENT}
`;

export const GET_PAYROLL_COMPONENTS_QUERY = `
  query GetPayrollComponents(
    $ouId: String!
    $filter: PayrollComponentFilterInput
    $pagination: PayrollComponentPaginationInput
  ) {
    payrollComponents(ouId: $ouId, filter: $filter, pagination: $pagination) {
      data {
        ...PayrollComponentFields
      }
      metaData {
        page
        size
        total
        totalPages
        hasNext
        hasPrevious
      }
      summary {
        activeCount
        fixedCount
        totalFixedValue
      }
    }
  }
  ${PAYROLL_COMPONENT_FIELDS_FRAGMENT}
`;

export const EMPLOYEE_PAYROLL_PREVIEW_QUERY = `
  query EmployeePayrollPreview($input: PreviewEmployeePayrollInput!) {
    employeePayrollPreview(input: $input) {
      currency
      periodStart
      periodEnd
      payrollEligible
      ineligibilityReason
      monthlyBasicSalary
      basicSalary
      totalAllowances
      totalDeductions
      totalOvertime
      totalDutyOvertime
      unpaidLeaveDeduction
      loanDeduction
      incomeTaxAmount
      grossPay
      netPay
      allowances {
        id
        name
        type
        rawValue
        amount
        taxable
      }
      deductions {
        id
        name
        type
        rawValue
        amount
      }
      tax {
        taxRuleId
        taxRuleName
        taxableIncome
        taxAmount
        brackets {
          minAmount
          maxAmount
          rate
          taxAmount
        }
      }
      attendance {
        workingDays
        presentDays
        halfDays
        absentDays
        paidLeaveDays
        unpaidLeaveDays
        overtimeHours
        attendanceRate
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

export const DELETE_PAYROLL_RUN_MUTATION = `
  mutation DeletePayrollRun($id: ID!) {
    deletePayrollRun(id: $id)
  }
`;

export const GENERATE_PAYSLIP_MUTATION = `
  mutation GeneratePayslip($input: GeneratePayslipInput!) {
    generatePayslip(input: $input) {
      ...PayslipFields
    }
  }
  ${PAYSLIP_FIELDS_FRAGMENT}
`;

export const REGENERATE_PAYSLIP_MUTATION = `
  mutation RegeneratePayslip($input: GeneratePayslipInput!) {
    regeneratePayslip(input: $input) {
      ...PayslipFields
    }
  }
  ${PAYSLIP_FIELDS_FRAGMENT}
`;

export const GENERATE_PAYROLL_RUN_PAYSLIPS_MUTATION = `
  mutation GeneratePayrollRunPayslips($input: GeneratePayrollRunPayslipsInput!) {
    generatePayrollRunPayslips(input: $input) {
      generatedCount
      skippedCount
      payslips {
        ...PayslipFields
      }
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
  mutation UpsertPayrollComponents($inputs: [PayrollComponentInput!]!) {
    upsertPayrollComponents(inputs: $inputs) {
      ...PayrollComponentFields
    }
  }
  ${PAYROLL_COMPONENT_FIELDS_FRAGMENT}
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
  mutation CreatePayrollComponent($input: PayrollComponentInput!) {
    createPayrollComponent(input: $input) {
      ...PayrollComponentFields
    }
  }
  ${PAYROLL_COMPONENT_FIELDS_FRAGMENT}
`;

export const UPDATE_PAYROLL_COMPONENT_MUTATION = `
  mutation UpdatePayrollComponent($id: String!, $input: UpdatePayrollComponentInput!) {
    updatePayrollComponent(id: $id, input: $input) {
      ...PayrollComponentFields
    }
  }
  ${PAYROLL_COMPONENT_FIELDS_FRAGMENT}
`;

export const DELETE_PAYROLL_COMPONENT_MUTATION = `
  mutation DeletePayrollComponent($id: String!, $category: PayrollComponentType!) {
    deletePayrollComponent(id: $id, category: $category)
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
