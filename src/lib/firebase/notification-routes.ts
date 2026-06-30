const NOTIFICATION_ROUTES: Record<string, string> = {
  LEAVE_REQUEST: '/dashboard/leave/leave-requests',
  LEAVE_APPROVED: '/dashboard/leave/leave-requests',
  LEAVE_REJECTED: '/dashboard/leave/leave-requests',
  LEAVE_CANCELLED: '/dashboard/leave/leave-requests',
  COMP_OFF_REQUEST: '/dashboard/leave/leave-requests',
  COMP_OFF_APPROVED: '/dashboard/leave/leave-requests',
  COMP_OFF_REJECTED: '/dashboard/leave/leave-requests',
  COMP_OFF_CREDITED: '/dashboard/leave/leave-requests',
  OVERTIME_REQUEST: '/dashboard/attendance/overtime',
  OVERTIME_APPROVED: '/dashboard/attendance/overtime',
  OVERTIME_REJECTED: '/dashboard/attendance/overtime',
  EMPLOYEE_ONBOARDED: '/dashboard/employees/directory',
  PROBATION_ENDING: '/dashboard/employees/directory',
  DOCUMENT_EXPIRY: '/dashboard/documents/employee-documents',
  DOCUMENT_VERIFIED: '/dashboard/documents/employee-documents',
  DOCUMENT_REJECTED: '/dashboard/documents/employee-documents',
  COMPLIANCE_REMINDER: '/dashboard/documents/employee-documents',
};

export function resolveNotificationDeepLink(
  type?: string,
  metadata?: Record<string, unknown>,
): string {
  const basePath = type ? NOTIFICATION_ROUTES[type] : undefined;
  if (!basePath) {
    return '/dashboard';
  }

  const employeeId = metadata?.employeeId;
  if (typeof employeeId === 'string' && employeeId.length > 0) {
    return `${basePath}/${employeeId}`;
  }

  return basePath;
}
