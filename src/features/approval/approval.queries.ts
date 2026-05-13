export const APPROVAL_FIELDS_FRAGMENT = `
  fragment ApprovalFields on ApprovalResponse {
    id
    requestId
    approverId
    approverRole
    actedAt
    remarks
    status
    createdAt
    updatedAt
  }
`;

export const ACT_ON_APPROVAL_MUTATION = `
  mutation ActOnApproval($input: ApprovalActInput!) {
    actOnApproval(input: $input) {
      ...ApprovalFields
    }
  }
  ${APPROVAL_FIELDS_FRAGMENT}
`;

export const GET_APPROVALS_BY_REQUEST_QUERY = `
  query GetApprovalsByRequest($requestId: ID!) {
    approvalsByRequest(requestId: $requestId) {
      ...ApprovalFields
    }
  }
  ${APPROVAL_FIELDS_FRAGMENT}
`;
