import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchMyNotifications, markNotificationAsRead } from '../notification.actions';
import { InAppNotificationView, NotificationRecord } from '../notification.types';

const mapInAppNotifications = (
  records: NotificationRecord[],
  limit?: number,
): InAppNotificationView[] => {
  const filtered = records
    .filter((record) => record.type === 'in_app')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const sliced = typeof limit === 'number' ? filtered.slice(0, limit) : filtered;

  return sliced.map((record) => ({
    id: record.id,
    title: record.subject?.trim() || record.content.split('\n')[0]?.trim() || 'Notification',
    body: record.content,
    createdAt: record.createdAt,
    read: record.status === 'read' || Boolean(record.readAt),
  }));
};

export const useMyNotifications = () => {
  return useQuery({
    queryKey: ['my-notifications'],
    queryFn: () => fetchMyNotifications(),
    refetchInterval: 60_000,
  });
};

export const useMyInAppNotifications = (limit = 5) => {
  return useQuery({
    queryKey: ['my-notifications', 'in_app', limit],
    queryFn: async () => {
      const records = await fetchMyNotifications();
      return mapInAppNotifications(records, limit);
    },
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await markNotificationAsRead(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-notifications'] });
    },
  });
};
