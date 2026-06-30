export type NotificationType = 'email' | 'sms' | 'push' | 'in_app';
export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'read';

export interface NotificationRecord {
  id: string;
  companyId: string;
  recipientId?: string | null;
  recipient: string;
  type: NotificationType;
  subject?: string | null;
  content: string;
  status: NotificationStatus;
  errorMessage?: string | null;
  metadata?: Record<string, unknown> | null;
  sentAt?: string | null;
  readAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InAppNotificationView {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}
