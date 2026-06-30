'use client';

import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  useMarkNotificationRead,
  useMyInAppNotifications,
} from '@/features/notification/hooks/useNotification';
import { Skeleton } from '@/components/ui/skeleton';

export function NotificationsCard() {
  const { t } = useTranslation('dashboard');
  const { data = [], isLoading, isError } = useMyInAppNotifications(5);
  const { mutate: markRead } = useMarkNotificationRead();

  return (
    <div className="flex flex-col flex-1 min-w-0 border border-border rounded-[10px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] overflow-hidden bg-card">
      <div className="flex flex-row items-center justify-between px-6 py-4 bg-[linear-gradient(0deg,rgba(255,255,255,0.5),rgba(255,255,255,0.5)),#F5F5F5] dark:bg-[linear-gradient(0deg,rgba(0,0,0,0.3),rgba(0,0,0,0.3)),#1D1D1D] h-[60px]">
        <h3 className="text-lg font-semibold leading-7 text-foreground tracking-[-0.4px]">
          {t('recentActivity.notifications', 'Notifications')}
        </h3>
      </div>

      <div className="flex flex-col gap-3 p-6">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex flex-col gap-2 rounded-lg p-3 border border-border">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-3 w-3/4 rounded-md" />
                <Skeleton className="h-3 w-20 rounded-md" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <p className="text-sm text-muted-foreground">
            {t('comms.notificationsError', 'Unable to load notifications.')}
          </p>
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t('comms.noNotifications', 'No notifications yet.')}
          </p>
        ) : (
          data.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (!item.read) {
                  markRead(item.id);
                }
              }}
              className={cn(
                'flex flex-col gap-1 text-left rounded-lg p-3 border border-border transition-colors',
                !item.read ? 'bg-muted/60 hover:bg-muted' : 'bg-background hover:bg-muted/30',
              )}
            >
              <span className="text-sm font-medium text-foreground line-clamp-1">{item.title}</span>
              <span className="text-xs text-muted-foreground line-clamp-1">{item.body}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
