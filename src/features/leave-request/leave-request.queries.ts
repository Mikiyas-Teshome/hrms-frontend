export const LEAVE_REQUEST_FIELDS_FRAGMENT = `
  fragment LeaveRequestFields on LeaveRequestResponse {
    id
    employeeId
    leavePolicyId
    startDate
    endDate
    totalDays
    reason
    status
    companyId
    createdAt
    updatedAt
    attachments {
      id
      requestId
      fileName
      fileUrl
      storageKey
      mimeType
      size
      uploadedById
      createdAt
    }
    amendments {
      id
      requestId
      proposedStart
      proposedEnd
      comment
      status
      createdById
      acceptedByEmployeeAt
      rejectedByEmployeeAt
      createdAt
      updatedAt
    }
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
      id
      employeeId
      employeeName
      leavePolicyId
      leavePolicyName
      startDate
      endDate
      totalDays
      status
      displayStatus
      reason
      companyId
      createdAt
      updatedAt
      hasPendingAmendment
      pendingAmendmentId
      pendingAmendmentProposedStart
      pendingAmendmentProposedEnd
      pendingAmendmentComment
    }
  }
`;

export const LEAVE_REQUEST_STATS_QUERY = `
  query LeaveRequestStats($companyOuId: String!) {
    leaveRequestStats(companyOuId: $companyOuId) {
      total
      pending
      approved
      rejected
    }
  }
`;

export const LEAVE_REQUEST_REVIEW_QUERY = `
  query LeaveRequestReview($id: ID!) {
    leaveRequestReview(id: $id) {
      id
      employeeId
      employeeName
      employeeJobTitle
      employeeDepartment
      companyId
      leavePolicyId
      leavePolicyName
      startDate
      endDate
      totalDays
      status
      displayStatus
      reason
      createdAt
      updatedAt
      canApprove
      canCurrentUserApprove
      attachments {
        id
        requestId
        fileName
        fileUrl
        storageKey
        mimeType
        size
        uploadedById
        createdAt
      }
      amendments {
        id
        requestId
        proposedStart
        proposedEnd
        comment
        status
        createdById
        acceptedByEmployeeAt
        rejectedByEmployeeAt
        createdAt
        updatedAt
      }
      leaveBalanceSnapshot {
        allocatedDays
        usedDays
        carriedForwardDays
        remainingDays
      }
      approvals {
        id
        requestId
        approverRole
        status
        approverId
        remarks
        actedAt
        createdAt
        updatedAt
      }
    }
  }
`;

export const REQUEST_LEAVE_AMENDMENT_MUTATION = `
  mutation RequestLeaveAmendment($input: RequestLeaveAmendmentInput!) {
    requestLeaveAmendment(input: $input) {
      id
      requestId
      proposedStart
      proposedEnd
      comment
      status
      createdById
      acceptedByEmployeeAt
      rejectedByEmployeeAt
      createdAt
      updatedAt
    }
  }
`;

export const RESPOND_LEAVE_AMENDMENT_MUTATION = `
  mutation RespondLeaveAmendment($input: RespondLeaveAmendmentInput!) {
    respondLeaveAmendment(input: $input) {
      id
      requestId
      proposedStart
      proposedEnd
      comment
      status
      createdById
      acceptedByEmployeeAt
      rejectedByEmployeeAt
      createdAt
      updatedAt
    }
  }
`;

export const LEAVE_REQUESTS_PAGINATED_QUERY = `
  query LeaveRequestsPaginated(
    $companyOuId: String!
    $filter: LeaveRequestFilterInput
    $pagination: LeaveRequestPaginationInput
  ) {
    leaveRequestsPaginated(companyOuId: $companyOuId, filter: $filter, pagination: $pagination) {
      items {
        id
        employeeId
        employeeName
        leavePolicyId
        leavePolicyName
        startDate
        endDate
        totalDays
        status
        displayStatus
        reason
        companyId
        createdAt
        updatedAt
      }
      totalCount
      page
      pageSize
      totalPages
    }
  }
`;
