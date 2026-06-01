export interface AuditLog {
  id: string;
  action: string;
  companyId: string;
  entityId: string;
  entityType: string;
  newValues?: Record<string, unknown>;
  oldValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  userId: string;
  createdAt: string;
}

export interface CreateAuditLogInput {
  action: string;
  companyId: string;
  entityId: string;
  entityType: string;
  ipAddress?: string;
  newValues?: Record<string, unknown>;
  oldValues?: Record<string, unknown>;
  userAgent?: string;
  userId: string;
}
