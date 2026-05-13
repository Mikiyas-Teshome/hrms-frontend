export const LEAVE_TYPE_FIELDS_FRAGMENT = `
  fragment LeaveTypeFields on LeaveTypeResponse {
    id
    code
    name
    paid
    carryForwardAllowed
    maxDaysPerYear
    companyOuId
    createdAt
    updatedAt
  }
`;

export const CREATE_LEAVE_TYPE_MUTATION = `
  mutation CreateLeaveType($input: CreateLeaveTypeInput!) {
    createLeaveType(input: $input) {
      ...LeaveTypeFields
    }
  }
  ${LEAVE_TYPE_FIELDS_FRAGMENT}
`;

export const DELETE_LEAVE_TYPE_MUTATION = `
  mutation DeleteLeaveType($id: ID!) {
    deleteLeaveType(id: $id)
  }
`;

export const UPDATE_LEAVE_TYPE_MUTATION = `
  mutation UpdateLeaveType($id: ID!, $input: UpdateLeaveTypeInput!) {
    updateLeaveType(id: $id, input: $input) {
      ...LeaveTypeFields
    }
  }
  ${LEAVE_TYPE_FIELDS_FRAGMENT}
`;

export const GET_LEAVE_TYPE_QUERY = `
  query GetLeaveType($id: ID!) {
    leaveType(id: $id) {
      ...LeaveTypeFields
    }
  }
  ${LEAVE_TYPE_FIELDS_FRAGMENT}
`;

export const GET_LEAVE_TYPES_QUERY = `
  query GetLeaveTypes($companyOuId: String!) {
    leaveTypes(companyOuId: $companyOuId) {
      ...LeaveTypeFields
    }
  }
  ${LEAVE_TYPE_FIELDS_FRAGMENT}
`;
