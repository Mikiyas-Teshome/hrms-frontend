const LEAVE_BALANCE_SHARED_FIELDS = `
  id
  employeeId
  name
  avatar
  leavePolicy
  leavePolicyId
  leavePolicyCode
  year
  allocated
  used
  remaining
  carriedForward
`;

export const LEAVE_BALANCE_LIST_ITEM_FIELDS = `
  fragment LeaveBalanceListItemFields on LeaveBalanceListItem {
    ${LEAVE_BALANCE_SHARED_FIELDS}
  }
`;

export const LEAVE_BALANCE_DETAIL_FIELDS = `
  fragment LeaveBalanceDetailFields on LeaveBalanceDetail {
    ${LEAVE_BALANCE_SHARED_FIELDS}
  }
`;

export const LEAVE_BALANCE_STATS_QUERY = `
  query LeaveBalanceStats($companyOuId: String!, $year: Int) {
    leaveBalanceStats(companyOuId: $companyOuId, year: $year) {
      employeeCount
      totalAllocatedDays
      totalRemainingDays
      totalCarriedForwardDays
    }
  }
`;

export const LEAVE_BALANCES_PAGINATED_QUERY = `
  query LeaveBalancesPaginated(
    $companyOuId: String!
    $filter: LeaveBalanceFilterInput
    $pagination: LeaveBalancePaginationInput
  ) {
    leaveBalancesPaginated(companyOuId: $companyOuId, filter: $filter, pagination: $pagination) {
      items {
        ...LeaveBalanceListItemFields
      }
      totalCount
      page
      pageSize
      totalPages
    }
  }
  ${LEAVE_BALANCE_LIST_ITEM_FIELDS}
`;

export const LEAVE_BALANCE_DETAIL_QUERY = `
  query LeaveBalance($id: ID!) {
    leaveBalance(id: $id) {
      ...LeaveBalanceDetailFields
    }
  }
  ${LEAVE_BALANCE_DETAIL_FIELDS}
`;

export const LEAVE_BALANCE_FILTER_OPTIONS_QUERY = `
  query LeaveBalanceFilterOptions($companyOuId: String!) {
    leaveBalanceFilterOptions(companyOuId: $companyOuId) {
      years
      policies {
        id
        name
        code
      }
      departments {
        id
        name
      }
    }
  }
`;

export const UPDATE_LEAVE_BALANCE_MUTATION = `
  mutation UpdateLeaveBalance($id: ID!, $input: UpdateLeaveBalanceInput!) {
    updateLeaveBalance(id: $id, input: $input) {
      ...LeaveBalanceDetailFields
    }
  }
  ${LEAVE_BALANCE_DETAIL_FIELDS}
`;

export const DELETE_LEAVE_BALANCE_MUTATION = `
  mutation DeleteLeaveBalance($id: ID!) {
    deleteLeaveBalance(id: $id)
  }
`;
