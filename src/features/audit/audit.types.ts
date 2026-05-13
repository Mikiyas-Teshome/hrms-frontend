export interface AuditLog {
  id: string;
  action: string;
  companyId: string;
  entityId: string;
  entityType: string;
  newValues?: any;
  oldValues?: any;
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
  newValues?: any;
  oldValues?: any;
  userAgent?: string;
  userId: string;
}
