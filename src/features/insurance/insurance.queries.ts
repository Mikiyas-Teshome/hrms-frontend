export const INSURANCE_FIELDS_FRAGMENT = `
  fragment InsuranceFields on Insurance {
    id
    employeeId
    ouId
    dependentId
    insuranceName
    providerName
    policyNumber
    cardId
    coverageType
    coverageAmount
    assignment
    renewalType
    hasDependentsCoverage
    maxDependents
    allowedDependents
    includedServices
    employmentType
    minTenureMonths
    employerContribution
    employeeContribution
    startDate
    endDate
    status
    createdAt
    updatedAt
  }
`;

export const CREATE_INSURANCE_MUTATION = `
  mutation CreateInsurance($input: CreateInsuranceInput!) {
    createInsurance(input: $input) {
      ...InsuranceFields
    }
  }
  ${INSURANCE_FIELDS_FRAGMENT}
`;

export const REMOVE_INSURANCE_MUTATION = `
  mutation RemoveInsurance($id: ID!) {
    removeInsurance(id: $id) {
      ...InsuranceFields
    }
  }
  ${INSURANCE_FIELDS_FRAGMENT}
`;

export const UPDATE_INSURANCE_MUTATION = `
  mutation UpdateInsurance($id: ID!, $input: UpdateInsuranceInput!) {
    updateInsurance(id: $id, input: $input) {
      ...InsuranceFields
    }
  }
  ${INSURANCE_FIELDS_FRAGMENT}
`;

export const UPDATE_INSURANCE_STATUS_MUTATION = `
  mutation UpdateInsuranceStatus($id: ID!, $input: UpdateInsuranceStatusInput!) {
    updateInsuranceStatus(id: $id, input: $input) {
      ...InsuranceFields
    }
  }
  ${INSURANCE_FIELDS_FRAGMENT}
`;

export const GET_INSURANCE_STATS_QUERY = `
  query InsuranceStats($ouId: ID) {
    insuranceStats(ouId: $ouId) {
      totalPlans
      activePlans
      providerCount
      monthlySpending
    }
  }
`;

export const GET_INSURANCES_QUERY = `
  query GetInsurances($filter: InsuranceFilterInput) {
    insurances(filter: $filter) {
      data {
        ...InsuranceFields
      }
      pagination {
        limit
        page
        total
        totalPages
      }
    }
  }
  ${INSURANCE_FIELDS_FRAGMENT}
`;
