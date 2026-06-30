'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Bell, RefreshCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  useMyNotifications,
  useMarkNotificationRead,
} from '@/features/notification/hooks/useNotification';

type Tab = 'all' | 'read' | 'unread';

interface NotificationPanelContentProps {
  onClose?: () => void;
}

function NotificationPanelContent({ onClose }: NotificationPanelContentProps) {
  const { t } = useTranslation('dashboard');
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const { data: notifications = [], refetch, isFetching } = useMyNotifications();
  const { mutate: markRead } = useMarkNotificationRead();

  const filtered = notifications.filter((n) => {
    if (activeTab === 'read') return n.status === 'read';
    if (activeTab === 'unread') return n.status !== 'read';
    return true;
  });

  const handleRefresh = () => {
    refetch();
  };

  const markAsRead = (id: string, status: string) => {
    if (status !== 'read') {
      markRead(id);
    }
    onClose?.();
  };

  const TABS: { id: Tab; label: string; count?: number }[] = [
    { id: 'all', label: t('common.all', 'All'), count: notifications.length },
    { id: 'read', label: t('comms.readTab', 'Read') },
    { id: 'unread', label: t('comms.unreadTab', 'Unread') },
  ];

  return (
    <div className="flex flex-col max-h-[668px]">
      <div className="flex items-center justify-between px-4 pt-3 pb-0">
        <h2 className="text-lg font-bold text-foreground leading-8">
          {t('recentActivity.notifications', 'Notifications')}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground',
            isFetching && 'animate-spin',
          )}
          onClick={handleRefresh}
          disabled={isFetching}
        >
          <RefreshCcw className="h-5 w-5" strokeWidth={1.33} />
        </Button>
      </div>

      <div className="px-4 pt-3">
        <div className="flex items-center gap-0.5 bg-muted p-[3px] rounded-[10px]">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full text-[11px] font-semibold leading-none',
                    activeTab === tab.id
                      ? 'bg-foreground text-background'
                      : 'bg-transparent text-muted-foreground',
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5 px-4 py-3 overflow-y-auto max-h-[544px] scrollbar-none">
        {isFetching && notifications.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            {t('comms.loading', 'Loading…')}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            {t('comms.noNotifications', 'No notifications yet.')}
          </div>
        ) : (
          filtered.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => markAsRead(n.id, n.status)}
              className={cn(
                'flex flex-col gap-2 p-3 rounded-[10px] border border-border text-left cursor-pointer transition-colors w-full',
                n.status !== 'read'
                  ? 'bg-muted/60 hover:bg-muted'
                  : 'bg-background hover:bg-muted/30',
              )}
            >
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-foreground leading-4 line-clamp-1">
                  {n.subject || (n.type ? n.type.replace(/_/g, ' ') : 'Notification')}
                </span>
                <p className="text-xs text-muted-foreground leading-4 line-clamp-2">
                  {n.content}
                </p>
              </div>
              <span
                className={cn(
                  'text-xs leading-4',
                  n.status !== 'read' ? 'text-foreground/70 font-medium' : 'text-muted-foreground',
                )}
              >
                {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : ''}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

interface NotificationBellProps {
  align?: 'left' | 'right';
}

export function NotificationBell({ align = 'right' }: NotificationBellProps) {
  const { data: notifications = [] } = useMyNotifications();
  const hasUnread = notifications.some((n) => n.status !== 'read');
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 rounded-full relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-foreground" strokeWidth={1.4} />
          {hasUnread && (
            <span className="absolute top-[7.5px] right-[8.92px] h-1 w-1 rounded-full bg-[#EF4444]" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align={align === 'right' ? 'end' : 'start'}
        side="bottom"
        sideOffset={14}
        className="w-[372px] max-w-[calc(100vw-2rem)] p-0 border-border/60 shadow-[0px_0px_10px_rgba(0,0,0,0.12)] rounded-xl"
      >
        <NotificationPanelContent onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
