export const LEAVE_POLICY_FIELDS_FRAGMENT = `
  fragment LeavePolicyFields on LeavePolicyResponse {
    id
    leaveTypeId
    accrualMethod
    accrualRate
    maxBalance
    probationRequired
    createdAt
    updatedAt
  }
`;

export const CREATE_LEAVE_POLICY_MUTATION = `
  mutation CreateLeavePolicy($input: CreateLeavePolicyInput!) {
    createLeavePolicy(input: $input) {
      ...LeavePolicyFields
    }
  }
  ${LEAVE_POLICY_FIELDS_FRAGMENT}
`;

export const DELETE_LEAVE_POLICY_MUTATION = `
  mutation DeleteLeavePolicy($id: ID!) {
    deleteLeavePolicy(id: $id)
  }
`;

export const GET_LEAVE_POLICIES_QUERY = `
  query GetLeavePolicies {
    leavePolicies {
      ...LeavePolicyFields
    }
  }
  ${LEAVE_POLICY_FIELDS_FRAGMENT}
`;

export const GET_LEAVE_POLICY_QUERY = `
  query GetLeavePolicy($id: ID!) {
    leavePolicy(id: $id) {
      ...LeavePolicyFields
    }
  }
  ${LEAVE_POLICY_FIELDS_FRAGMENT}
`;
