export const LEAVE_REQUEST_FIELDS_FRAGMENT = `
  fragment LeaveRequestFields on LeaveRequestResponse {
    id
    employeeId
    leaveTypeId
    startDate
    endDate
    totalDays
    reason
    status
    companyId
    createdAt
    updatedAt
  }
`;

export const CREATE_LEAVE_REQUEST_MUTATION = `
  mutation CreateLeaveRequest($input: CreateLeaveRequestInput!) {
    createLeaveRequest(input: $input) {
      ...LeaveRequestFields
    }
  }
  ${LEAVE_REQUEST_FIELDS_FRAGMENT}
`;

export const CANCEL_LEAVE_REQUEST_MUTATION = `
  mutation CancelLeaveRequest($id: ID!) {
    cancelLeaveRequest(id: $id)
  }
`;

export const GET_LEAVE_REQUEST_QUERY = `
  query GetLeaveRequest($id: ID!) {
    leaveRequest(id: $id) {
      ...LeaveRequestFields
    }
  }
  ${LEAVE_REQUEST_FIELDS_FRAGMENT}
`;

export const GET_LEAVE_REQUESTS_BY_COMPANY_QUERY = `
  query GetLeaveRequestsByCompany {
    leaveRequestsByCompany {
      ...LeaveRequestFields
    }
  }
  ${LEAVE_REQUEST_FIELDS_FRAGMENT}
`;

export const GET_LEAVE_REQUESTS_BY_EMPLOYEE_QUERY = `
  query GetLeaveRequestsByEmployee($employeeId: ID!) {
    leaveRequestsByEmployee(employeeId: $employeeId) {
      ...LeaveRequestFields
    }
  }
  ${LEAVE_REQUEST_FIELDS_FRAGMENT}
`;
