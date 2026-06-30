export type DashboardHomeSectionId =
  | 'operationalCards'
  | 'personalStats'
  | 'leaveRequests'
  | 'overtime'
  | 'announcements'
  | 'notifications';

export interface DashboardHomeSectionConfig {
  id: DashboardHomeSectionId;
  permissionsAny?: string[];
  alwaysShow?: boolean;
}

export const DASHBOARD_HOME_SECTIONS: DashboardHomeSectionConfig[] = [
  {
    id: 'operationalCards',
    permissionsAny: [
      'leave_requests:read',
      'employees:read',
      'attendance:read',
      'reports_hr:read',
    ],
  },
  {
    id: 'personalStats',
    alwaysShow: true,
  },
  {
    id: 'leaveRequests',
    permissionsAny: ['leave_requests:read', 'leave_requests:create'],
  },
  {
    id: 'overtime',
    permissionsAny: ['attendance:read', 'overtime:read'],
  },
  {
    id: 'announcements',
    permissionsAny: ['announcements:read', 'announcements:create'],
  },
  {
    id: 'notifications',
    alwaysShow: true,
  },
];
