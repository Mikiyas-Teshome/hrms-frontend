import { CONTRACT_QUERY_FRAGMENTS } from './contracts.queries';

export const CONTRACT_TEMPLATE_SUMMARY_FRAGMENT = `
  fragment ContractTemplateSummaryFields on Contract {
    id
    ouId
    contractNumber
    contractName
    description
    contractType
    employmentType
    status
    durationMonths
    isRenewable
    probationPeriodMonths
    noticePeriodDays
    documentUrl
    createdAt
    updatedAt
  }
`;

export const EMPLOYEE_CONTRACT_SUMMARY_FIELDS_FRAGMENT = `
  fragment EmployeeContractSummaryFields on EmployeeContract {
    id
    employeeId
    contractId
    effectiveDate
    endDate
    probationEndDate
    terminationDate
    terminationReason
    terminatedBy
    renewedFromId
    signedDate
    jobTitle
    employmentType
    salary
    status
    contract {
      ...ContractTemplateSummaryFields
    }
    createdAt
    updatedAt
  }
  ${CONTRACT_TEMPLATE_SUMMARY_FRAGMENT}
`;

export const EMPLOYEE_CONTRACT_FIELDS_FRAGMENT = `
  fragment EmployeeContractFields on EmployeeContract {
    id
    employeeId
    contractId
    effectiveDate
    endDate
    probationEndDate
    terminationDate
    terminationReason
    terminatedBy
    renewedFromId
    signedDate
    jobTitle
    employmentType
    salary
    status
    contract {
      ...ContractFields
    }
    createdAt
    updatedAt
  }
`;

export const GET_MY_EMPLOYEE_CONTRACTS_QUERY = `
  query GetMyEmployeeContracts($filter: EmployeeContractFilterInput) {
    myEmployeeContracts(filter: $filter) {
      data {
        ...EmployeeContractSummaryFields
      }
      pagination {
        limit
        page
        total
        totalPages
      }
    }
  }
  ${EMPLOYEE_CONTRACT_SUMMARY_FIELDS_FRAGMENT}
`;

export const GET_EMPLOYEE_CONTRACTS_SUMMARY_QUERY = `
  query GetEmployeeContractsSummary($filter: EmployeeContractFilterInput) {
    employeeContracts(filter: $filter) {
      data {
        ...EmployeeContractSummaryFields
      }
      pagination {
        limit
        page
        total
        totalPages
      }
    }
  }
  ${EMPLOYEE_CONTRACT_SUMMARY_FIELDS_FRAGMENT}
`;

export const GET_EMPLOYEE_CONTRACTS_QUERY = `
  query GetEmployeeContracts($filter: EmployeeContractFilterInput) {
    employeeContracts(filter: $filter) {
      data {
        ...EmployeeContractFields
      }
      pagination {
        limit
        page
        total
        totalPages
      }
    }
  }
  ${EMPLOYEE_CONTRACT_FIELDS_FRAGMENT}
  ${CONTRACT_QUERY_FRAGMENTS}
`;

export const GET_EMPLOYEE_CONTRACT_QUERY = `
  query GetEmployeeContract($id: ID!) {
    employeeContract(id: $id) {
      ...EmployeeContractFields
    }
  }
  ${EMPLOYEE_CONTRACT_FIELDS_FRAGMENT}
  ${CONTRACT_QUERY_FRAGMENTS}
`;

export const GET_ACTIVE_EMPLOYEE_CONTRACT_BY_TEMPLATE_QUERY = `
  query GetActiveEmployeeContractByTemplate($filter: EmployeeContractFilterInput!) {
    employeeContracts(filter: $filter) {
      data {
        ...EmployeeContractFields
      }
      pagination {
        limit
        page
        total
        totalPages
      }
    }
  }
  ${EMPLOYEE_CONTRACT_FIELDS_FRAGMENT}
  ${CONTRACT_QUERY_FRAGMENTS}
`;

export const ASSIGN_EMPLOYEE_CONTRACT_MUTATION = `
  mutation AssignEmployeeContract($input: AssignEmployeeContractInput!) {
    assignEmployeeContract(input: $input) {
      ...EmployeeContractFields
    }
  }
  ${EMPLOYEE_CONTRACT_FIELDS_FRAGMENT}
  ${CONTRACT_QUERY_FRAGMENTS}
`;

export const UPDATE_DRAFT_EMPLOYEE_CONTRACT_MUTATION = `
  mutation UpdateDraftEmployeeContract($id: ID!, $input: UpdateDraftEmployeeContractInput!) {
    updateDraftEmployeeContract(id: $id, input: $input) {
      ...EmployeeContractFields
    }
  }
  ${EMPLOYEE_CONTRACT_FIELDS_FRAGMENT}
  ${CONTRACT_QUERY_FRAGMENTS}
`;

export const RENEW_EMPLOYEE_CONTRACT_MUTATION = `
  mutation RenewEmployeeContract($id: ID!, $input: RenewEmployeeContractInput!) {
    renewEmployeeContract(id: $id, input: $input) {
      ...EmployeeContractFields
    }
  }
  ${EMPLOYEE_CONTRACT_FIELDS_FRAGMENT}
  ${CONTRACT_QUERY_FRAGMENTS}
`;

export const ACTIVATE_EMPLOYEE_CONTRACT_MUTATION = `
  mutation ActivateEmployeeContract($id: ID!) {
    activateEmployeeContract(id: $id) {
      ...EmployeeContractSummaryFields
    }
  }
  ${EMPLOYEE_CONTRACT_SUMMARY_FIELDS_FRAGMENT}
`;

export const ACTIVATE_MY_EMPLOYEE_CONTRACT_MUTATION = `
  mutation ActivateMyEmployeeContract($id: ID!) {
    activateMyEmployeeContract(id: $id) {
      ...EmployeeContractSummaryFields
    }
  }
  ${EMPLOYEE_CONTRACT_SUMMARY_FIELDS_FRAGMENT}
`;

export const REJECT_MY_EMPLOYEE_CONTRACT_MUTATION = `
  mutation RejectMyEmployeeContract($id: ID!) {
    rejectMyEmployeeContract(id: $id) {
      ...EmployeeContractSummaryFields
    }
  }
  ${EMPLOYEE_CONTRACT_SUMMARY_FIELDS_FRAGMENT}
`;

export const ACTIVATE_EMPLOYEE_CONTRACT_FULL_MUTATION = `
  mutation ActivateEmployeeContract($id: ID!) {
    activateEmployeeContract(id: $id) {
      ...EmployeeContractFields
    }
  }
  ${EMPLOYEE_CONTRACT_FIELDS_FRAGMENT}
  ${CONTRACT_QUERY_FRAGMENTS}
`;
