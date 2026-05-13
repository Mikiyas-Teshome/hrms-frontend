export const GET_AUDIT_LOGS_QUERY = `
  query GetAuditLogs($companyId: ID, $entityId: String, $entityType: String) {
    auditLogs(companyId: $companyId, entityId: $entityId, entityType: $entityType) {
      id
      action
      companyId
      entityId
      entityType
      newValues
      oldValues
      ipAddress
      userAgent
      userId
      createdAt
    }
  }
`;

export const CREATE_AUDIT_LOG_MUTATION = `
  mutation CreateAuditLog($input: CreateAuditLogInput!) {
    createAuditLog(input: $input) {
      id
      action
      companyId
      entityId
      entityType
      createdAt
    }
  }
`;
