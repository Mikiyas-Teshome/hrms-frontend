export const LEAVE_POLICY_DETAIL_FRAGMENT = `
  fragment LeavePolicyDetailFields on LeavePolicyDetail {
    id
    companyOuId
    code
    name
    description
    status
    maxBalance
    entitlementGrantMode
    grantRatePerPeriod
    usageLimitScope
    probationRequired
    carryForwardEnabled
    maxCarryForwardDays
    carryForwardExpiryMonths
    minDaysPerRequest
    maxDaysPerRequest
    noticePeriodDays
    applyToAllDepartments
    departmentIds
    requireAttachment
    attachmentCondition
    requiredDocumentCategoryId
    paidLeave
    payType
    fullPayDays
    halfPayDays
    noPayAfterDays
    deductFromSalary
    compoundingEnabled
    compoundingDays
    compoundingYears
    isCompOffPolicy
    createdAt
    updatedAt
  }
`;

export const LEAVE_POLICY_STATS_QUERY = `
  query LeavePolicyStats($companyOuId: String!) {
    leavePolicyStats(companyOuId: $companyOuId) {
      total
      active
    }
  }
`;

export const LEAVE_POLICIES_PAGINATED_QUERY = `
  query LeavePoliciesPaginated(
    $companyOuId: String!
    $filter: LeavePolicyFilterInput
    $pagination: LeavePolicyPaginationInput
  ) {
    leavePoliciesPaginated(
      companyOuId: $companyOuId
      filter: $filter
      pagination: $pagination
    ) {
      items {
        id
        policyName
        code
        maxDaysPerYear
        entitlementGrantMode
        usageLimitScope
        carryForward
        status
      }
      totalCount
      page
      pageSize
      totalPages
    }
  }
`;

export const LEAVE_POLICY_DETAIL_QUERY = `
  query LeavePolicy($id: ID!) {
    leavePolicy(id: $id) {
      ...LeavePolicyDetailFields
    }
  }
  ${LEAVE_POLICY_DETAIL_FRAGMENT}
`;

export const CREATE_LEAVE_POLICY_MUTATION = `
  mutation CreateLeavePolicy($input: CreateLeavePolicyInput!) {
    createLeavePolicy(input: $input) {
      policy {
        ...LeavePolicyDetailFields
      }
      balanceSeed {
        success
        seededCount
        message
      }
    }
  }
  ${LEAVE_POLICY_DETAIL_FRAGMENT}
`;

export const UPDATE_LEAVE_POLICY_MUTATION = `
  mutation UpdateLeavePolicy($id: ID!, $input: UpdateLeavePolicyInput!) {
    updateLeavePolicy(id: $id, input: $input) {
      ...LeavePolicyDetailFields
    }
  }
  ${LEAVE_POLICY_DETAIL_FRAGMENT}
`;

export const UPDATE_LEAVE_POLICY_STATUS_MUTATION = `
  mutation UpdateLeavePolicyStatus($id: ID!, $status: LeavePolicyStatus!) {
    updateLeavePolicyStatus(id: $id, status: $status) {
      id
      policyName
      code
      maxDaysPerYear
      entitlementGrantMode
      usageLimitScope
      carryForward
      status
    }
  }
`;

export const DELETE_LEAVE_POLICY_MUTATION = `
  mutation DeleteLeavePolicy($id: ID!) {
    deleteLeavePolicy(id: $id)
  }
`;
