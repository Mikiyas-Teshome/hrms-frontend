export const GRATUITY_FIELDS_FRAGMENT = `
  fragment GratuityFields on GratuityCalculation {
    id
    companyId
    employeeId
    contractType
    reason
    lastBasicSalary
    totalDaysWorked
    totalYearsWorked
    gratuityAmount
    createdAt
  }
`;

export const EOS_RESULT_FIELDS_FRAGMENT = `
  fragment EosResultFields on EosResult {
    employeeId
    currency
    gratuity
    serviceYears
  }
`;

export const GET_COMPANY_GRATUITIES_QUERY = `
  query GetCompanyGratuities($companyId: ID!) {
    companyGratuities(companyId: $companyId) {
      ...GratuityFields
    }
  }
  ${GRATUITY_FIELDS_FRAGMENT}
`;

export const GET_EMPLOYEE_GRATUITY_QUERY = `
  query GetEmployeeGratuity($employeeId: ID!) {
    employeeGratuity(employeeId: $employeeId) {
      ...GratuityFields
    }
  }
  ${GRATUITY_FIELDS_FRAGMENT}
`;

export const CALCULATE_GRATUITY_MUTATION = `
  mutation CalculateGratuity($input: CalculateGratuityInput!) {
    calculateGratuity(input: $input) {
      ...GratuityFields
    }
  }
  ${GRATUITY_FIELDS_FRAGMENT}
`;

export const CALCULATE_EOS_MUTATION = `
  mutation CalculateEos($input: CalculateEosInput!) {
    calculateEos(input: $input) {
      ...EosResultFields
    }
  }
  ${EOS_RESULT_FIELDS_FRAGMENT}
`;
