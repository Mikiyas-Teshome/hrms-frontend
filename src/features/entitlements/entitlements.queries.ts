export const BENEFIT_ENTITLEMENT_FIELDS_FRAGMENT = `
  fragment BenefitEntitlementFields on BenefitEntitlement {
    id
    employeeId
    ouId
    name
    type
    valueDefinition
    frequency
    accessBasedOn
    assignment
    amount
    currency
    status
    createdAt
    updatedAt
  }
`;

export const CREATE_BENEFIT_ENTITLEMENT_MUTATION = `
  mutation CreateBenefitEntitlement($input: CreateBenefitEntitlementInput!) {
    createBenefitEntitlement(input: $input) {
      ...BenefitEntitlementFields
    }
  }
  ${BENEFIT_ENTITLEMENT_FIELDS_FRAGMENT}
`;

export const UPDATE_BENEFIT_ENTITLEMENT_MUTATION = `
  mutation UpdateBenefitEntitlement($id: ID!, $input: UpdateBenefitEntitlementInput!) {
    updateBenefitEntitlement(id: $id, input: $input) {
      ...BenefitEntitlementFields
    }
  }
  ${BENEFIT_ENTITLEMENT_FIELDS_FRAGMENT}
`;

export const UPDATE_BENEFIT_ENTITLEMENT_STATUS_MUTATION = `
  mutation UpdateBenefitEntitlementStatus($id: ID!, $input: UpdateBenefitEntitlementStatusInput!) {
    updateBenefitEntitlementStatus(id: $id, input: $input) {
      ...BenefitEntitlementFields
    }
  }
  ${BENEFIT_ENTITLEMENT_FIELDS_FRAGMENT}
`;

export const REMOVE_BENEFIT_ENTITLEMENT_MUTATION = `
  mutation RemoveBenefitEntitlement($id: ID!) {
    removeBenefitEntitlement(id: $id) {
      ...BenefitEntitlementFields
    }
  }
  ${BENEFIT_ENTITLEMENT_FIELDS_FRAGMENT}
`;

export const GET_BENEFIT_ENTITLEMENT_STATS_QUERY = `
  query BenefitEntitlementStats($ouId: ID) {
    benefitEntitlementStats(ouId: $ouId) {
      totalEntitlements
      activeEntitlements
      assignedToAll
      monthlySpending
    }
  }
`;

export const GET_BENEFIT_ENTITLEMENTS_QUERY = `
  query GetBenefitEntitlements($filter: BenefitEntitlementFilterInput) {
    benefitEntitlements(filter: $filter) {
      data {
        ...BenefitEntitlementFields
      }
      pagination {
        limit
        page
        total
        totalPages
      }
    }
  }
  ${BENEFIT_ENTITLEMENT_FIELDS_FRAGMENT}
`;
