import { INSURANCE_FIELDS_FRAGMENT } from '../insurance/insurance.queries';
import { BENEFIT_ENTITLEMENT_FIELDS_FRAGMENT } from '../entitlements/entitlements.queries';

export const CONTRACT_FIELDS_FRAGMENT = `
  fragment ContractFields on Contract {
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
    createdBy
    createdAt
    updatedAt
    insurances {
      ...InsuranceFields
    }
    benefitEntitlements {
      ...BenefitEntitlementFields
    }
  }
`;

export const CONTRACT_QUERY_FRAGMENTS = `
  ${INSURANCE_FIELDS_FRAGMENT}
  ${BENEFIT_ENTITLEMENT_FIELDS_FRAGMENT}
  ${CONTRACT_FIELDS_FRAGMENT}
`;

export const GET_CONTRACTS_QUERY = `
  query GetContracts($filter: ContractFilterInput) {
    contracts(filter: $filter) {
      data {
        ...ContractFields
      }
      pagination {
        limit
        page
        total
        totalPages
      }
    }
  }
  ${CONTRACT_QUERY_FRAGMENTS}
`;

export const GET_CONTRACT_QUERY = `
  query GetContract($id: ID!) {
    contract(id: $id) {
      ...ContractFields
    }
  }
  ${CONTRACT_QUERY_FRAGMENTS}
`;

export const CREATE_CONTRACT_MUTATION = `
  mutation CreateContract($input: CreateContractInput!) {
    createContract(input: $input) {
      ...ContractFields
    }
  }
  ${CONTRACT_QUERY_FRAGMENTS}
`;

export const UPDATE_CONTRACT_MUTATION = `
  mutation UpdateContract($id: ID!, $input: UpdateContractInput!) {
    updateContract(id: $id, input: $input) {
      ...ContractFields
    }
  }
  ${CONTRACT_QUERY_FRAGMENTS}
`;

export const REMOVE_CONTRACT_MUTATION = `
  mutation RemoveContract($id: ID!) {
    removeContract(id: $id) {
      id
    }
  }
`;
