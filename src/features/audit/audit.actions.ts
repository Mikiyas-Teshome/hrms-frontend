'use server';

import { gqlRequest, GraphQLService } from '@/lib/graphql-client';
import { GET_AUDIT_LOGS_QUERY, CREATE_AUDIT_LOG_MUTATION } from './audit.queries';
import { AuditLog, CreateAuditLogInput } from './audit.types';
import { revalidatePath } from 'next/cache';

export async function fetchAuditLogs(filters: { companyId?: string; entityId?: string; entityType?: string } = {}): Promise<AuditLog[]> {
  try {
    const data = await gqlRequest<{ auditLogs: AuditLog[] }>(
      GraphQLService.AUDIT_LOG,
      GET_AUDIT_LOGS_QUERY,
      { ...filters }
    );
    return data.auditLogs;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Cannot query field "auditLogs"')) {
      return [];
    }
    console.error('Failed to fetch audit logs:', error);
    return [];
  }
}

export async function createAuditLog(input: CreateAuditLogInput): Promise<AuditLog> {
  const data = await gqlRequest<{ createAuditLog: AuditLog }>(
    GraphQLService.AUDIT_LOG,
    CREATE_AUDIT_LOG_MUTATION,
    { input }
  );
  revalidatePath('/dashboard/reports/audit');
  return data.createAuditLog;
}
