import { format, isToday, parseISO } from 'date-fns';
import type { AnnouncementRecord } from '@/features/announcement/announcement.types';
import type { AuditLog } from '@/features/audit/audit.types';
import type { NotificationRecord } from '@/features/notification/notification.types';
import type {
  AdminActivityTab,
  AdminActivityType,
  AdminRecentActivityRow,
} from './admin-recent-activity.types';
import { ADMIN_REQUESTS_FETCH_SIZE } from './admin-request.utils';

export const DASHBOARD_ACTIVITY_LIMIT = ADMIN_REQUESTS_FETCH_SIZE;

const HIGH_PRIORITY_ACTION = /delete|remove|fail|denied|unauthorized/i;
const MID_PRIORITY_ACTION = /update|transfer/i;

const TAB_TO_TYPE: Record<Exclude<AdminActivityTab, 'all'>, AdminActivityType> = {
  alert: 'Alert',
  announcements: 'Announcements',
  notifications: 'Notification',
};

function formatActivityDate(iso: string): string {
  const date = parseISO(iso);
  if (isNaN(date.getTime())) {
    return '—';
  }
  if (isToday(date)) {
    return 'Today';
  }
  return format(date, 'MMM d');
}

function auditPriority(action: string): AdminRecentActivityRow['priority'] {
  if (HIGH_PRIORITY_ACTION.test(action)) {
    return 'High';
  }
  if (MID_PRIORITY_ACTION.test(action)) {
    return 'Mid';
  }
  return 'Low';
}

function humanizeAuditContent(action: string, entityType: string): string {
  const normalizedAction = action.replace(/_/g, ' ').toLowerCase();
  const normalizedEntity = entityType.replace(/_/g, ' ').toLowerCase();
  return `${normalizedAction} on ${normalizedEntity}`;
}

export function mapAnnouncementToActivityRow(
  item: AnnouncementRecord,
): AdminRecentActivityRow {
  const sortAt = item.publishedAt ?? item.createdAt;
  return {
    id: `announcement-${item.id}`,
    tabType: 'Announcements',
    content: item.title?.trim() || item.body.slice(0, 120),
    source: item.audience === 'company' ? 'Company' : 'Department',
    dateLabel: formatActivityDate(sortAt),
    sortAt,
    priority: 'Low',
    status: 'Published',
  };
}

export function mapNotificationToActivityRow(
  record: NotificationRecord,
): AdminRecentActivityRow {
  const read = record.status === 'read' || Boolean(record.readAt);
  const metadataSource =
    record.metadata && typeof record.metadata.source === 'string'
      ? record.metadata.source
      : null;

  return {
    id: `notification-${record.id}`,
    tabType: 'Notification',
    content:
      record.subject?.trim() ||
      record.content.split('\n')[0]?.trim() ||
      'Notification',
    source: metadataSource ?? 'System',
    dateLabel: formatActivityDate(record.createdAt),
    sortAt: record.createdAt,
    priority: 'Low',
    status: read ? 'Read' : 'Unread',
    notificationId: record.id,
  };
}

export function mapAuditLogToActivityRow(log: AuditLog): AdminRecentActivityRow {
  return {
    id: `audit-${log.id}`,
    tabType: 'Alert',
    content: humanizeAuditContent(log.action, log.entityType),
    source: log.entityType || 'System',
    dateLabel: formatActivityDate(log.createdAt),
    sortAt: log.createdAt,
    priority: auditPriority(log.action),
    status: 'Resolved',
  };
}

export function mergeRecentActivityRows(
  rows: AdminRecentActivityRow[],
  limit = DASHBOARD_ACTIVITY_LIMIT,
): AdminRecentActivityRow[] {
  return [...rows]
    .sort((a, b) => new Date(b.sortAt).getTime() - new Date(a.sortAt).getTime())
    .slice(0, limit);
}

export function filterActivityByTab(
  rows: AdminRecentActivityRow[],
  tab: AdminActivityTab,
): AdminRecentActivityRow[] {
  if (tab === 'all') {
    return rows;
  }
  const type = TAB_TO_TYPE[tab];
  return rows.filter((row) => row.tabType === type);
}

export function filterActivityBySearch(
  rows: AdminRecentActivityRow[],
  search: string,
): AdminRecentActivityRow[] {
  const query = search.trim().toLowerCase();
  if (!query) {
    return rows;
  }
  return rows.filter(
    (row) =>
      row.content.toLowerCase().includes(query) ||
      row.source.toLowerCase().includes(query) ||
      row.tabType.toLowerCase().includes(query),
  );
}
