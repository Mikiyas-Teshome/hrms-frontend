export type AdminActivityTab = 'all' | 'alert' | 'announcements' | 'notifications';

export type AdminActivityType = 'Announcements' | 'Alert' | 'Notification';

export type AdminActivityPriority = 'High' | 'Mid' | 'Low';

export type AdminActivityStatus = 'Unread' | 'Read' | 'Resolved' | 'Published';

export interface AdminRecentActivityRow {
  id: string;
  tabType: AdminActivityType;
  content: string;
  source: string;
  dateLabel: string;
  sortAt: string;
  priority: AdminActivityPriority;
  status: AdminActivityStatus;
  notificationId?: string;
}
