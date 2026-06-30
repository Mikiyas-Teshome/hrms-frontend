'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { useAnnouncementsForUser } from '@/features/announcement/hooks/useAnnouncement';
import { CreateAnnouncementSheet } from './create-announcement-sheet';
import { Skeleton } from '@/components/ui/skeleton';

export function AnnouncementsCard() {
  const { t } = useTranslation('dashboard');
  const { hasPermission, isSystemAdmin, hasScope } = usePermissions();
  const canRead = hasPermission('announcements:read');
  const { data = [], isLoading, isError } = useAnnouncementsForUser(5, canRead);
  const [sheetOpen, setSheetOpen] = useState(false);
  const canCreate = hasPermission('announcements:create');
  const canCreateCompanyWide =
    isSystemAdmin || hasScope('announcements', 'create', 'ALL');
  const managerOnly = canCreate && !canCreateCompanyWide;

  return (
    <>
      <div className="flex flex-col flex-1 min-w-0 border border-border rounded-[10px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] overflow-hidden bg-card">
        <div className="flex flex-row items-center justify-between px-6 py-4 bg-[linear-gradient(0deg,rgba(255,255,255,0.5),rgba(255,255,255,0.5)),#F5F5F5] dark:bg-[linear-gradient(0deg,rgba(0,0,0,0.3),rgba(0,0,0,0.3)),#1D1D1D] h-[60px]">
          <h3 className="text-lg font-semibold leading-7 text-foreground tracking-[-0.4px]">
            {t('recentActivity.announcements', 'Announcements')}
          </h3>
          {canCreate && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-primary"
              onClick={() => setSheetOpen(true)}
            >
              <Plus className="h-4 w-4" />
              {t('comms.createAnnouncement', 'Create')}
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-3 p-6">
          {!canRead ? (
            <p className="text-sm text-muted-foreground">
              {t('comms.noAnnouncements', 'No announcements yet.')}
            </p>
          ) : isLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex flex-col gap-2 rounded-lg p-3 border border-border">
                  <Skeleton className="h-4 w-full rounded-md" />
                  <Skeleton className="h-3 w-4/5 rounded-md" />
                  <Skeleton className="h-3 w-24 rounded-md" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <p className="text-sm text-muted-foreground">
              {t('comms.announcementsError', 'Unable to load announcements.')}
            </p>
          ) : data.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('comms.noAnnouncements', 'No announcements yet.')}
            </p>
          ) : (
            data.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-1 rounded-lg p-3 border border-border bg-background"
              >
                <span className="text-sm font-medium text-foreground line-clamp-1">{item.title}</span>
                <span className="text-xs text-muted-foreground line-clamp-2">{item.body}</span>
                <span className="text-xs text-muted-foreground">
                  {format(
                    new Date(item.publishedAt ?? item.createdAt),
                    'MMM d, yyyy',
                  )}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {canCreate && (
        <CreateAnnouncementSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          managerOnly={managerOnly}
        />
      )}
    </>
  );
}
