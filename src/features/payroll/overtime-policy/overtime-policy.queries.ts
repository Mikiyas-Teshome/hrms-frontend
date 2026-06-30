export const OVERTIME_POLICY_FIELDS_FRAGMENT = `
  fragment OvertimePolicyFields on OvertimePolicyResponse {
    id
    companyId
    name
    description
    rateValue
    type
    createdAt
    updatedAt
  }
`;

export const GET_OVERTIME_POLICIES_QUERY = `
  query GetOvertimePolicies($companyId: String!) {
    overtimePolicies(companyId: $companyId) {
      ...OvertimePolicyFields
    }
  }
  ${OVERTIME_POLICY_FIELDS_FRAGMENT}
`;

export const GET_OVERTIME_POLICY_QUERY = `
  query GetOvertimePolicy($id: ID!) {
    overtimePolicy(id: $id) {
      ...OvertimePolicyFields
    }
  }
  ${OVERTIME_POLICY_FIELDS_FRAGMENT}
`;

export const CREATE_OVERTIME_POLICY_MUTATION = `
  mutation CreateOvertimePolicy($input: CreateOvertimePolicyInput!) {
    createOvertimePolicy(input: $input) {
      ...OvertimePolicyFields
    }
  }
  ${OVERTIME_POLICY_FIELDS_FRAGMENT}
`;

export const UPDATE_OVERTIME_POLICY_MUTATION = `
  mutation UpdateOvertimePolicy($id: ID!, $input: UpdateOvertimePolicyInput!) {
    updateOvertimePolicy(id: $id, input: $input) {
      ...OvertimePolicyFields
    }
  }
  ${OVERTIME_POLICY_FIELDS_FRAGMENT}
`;

export const DELETE_OVERTIME_POLICY_MUTATION = `
  mutation DeleteOvertimePolicy($id: ID!) {
    deleteOvertimePolicy(id: $id)
  }
`;
