'use client';

import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCreateAndPublishAnnouncement } from '@/features/announcement/hooks/useAnnouncement';
import type { AnnouncementAudience } from '@/features/announcement/announcement.types';

interface CreateAnnouncementSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  managerOnly?: boolean;
}

export function CreateAnnouncementSheet({
  open,
  onOpenChange,
  managerOnly = false,
}: CreateAnnouncementSheetProps) {
  const { t } = useTranslation('dashboard');
  const { toast } = useToast();
  const { mutateAsync, isPending } = useCreateAndPublishAnnouncement();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<AnnouncementAudience>(
    managerOnly ? 'department' : 'company',
  );

  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (!open) {
      setTitle('');
      setBody('');
      setAudience(managerOnly ? 'department' : 'company');
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !body.trim()) {
      return;
    }

    try {
      await mutateAsync({
        title: title.trim(),
        body: body.trim(),
        audience,
      });
      toast({
        title: t('comms.announcementPublishedTitle', 'Announcement published'),
        description: t(
          'comms.announcementPublishedMsg',
          'Your announcement is now visible on the dashboard.',
        ),
      });
      onOpenChange(false);
    } catch {
      toast({
        variant: 'destructive',
        title: t('comms.announcementPublishErrorTitle', 'Could not publish'),
        description: t(
          'comms.announcementPublishErrorMsg',
          'Please check your permissions and try again.',
        ),
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <SheetTitle>{t('comms.createAnnouncementTitle', 'Create announcement')}</SheetTitle>
          <SheetClose asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </SheetClose>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="announcement-title">{t('comms.titleLabel', 'Title')}</Label>
            <Input
              id="announcement-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={200}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="announcement-body">{t('comms.bodyLabel', 'Message')}</Label>
            <Textarea
              id="announcement-body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={6}
              required
            />
          </div>

          {!managerOnly && (
            <div className="flex flex-col gap-2">
              <Label>{t('comms.audienceLabel', 'Audience')}</Label>
              <Select
                value={audience}
                onValueChange={(value) => setAudience(value as AnnouncementAudience)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="company">
                    {t('comms.audienceCompany', 'Entire company')}
                  </SelectItem>
                  <SelectItem value="department">
                    {t('comms.audienceDepartment', 'My department')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {managerOnly && (
            <p className="text-xs text-muted-foreground">
              {t(
                'comms.managerAudienceHint',
                'This announcement will be published to your department.',
              )}
            </p>
          )}

          <Button type="submit" disabled={isPending} className="mt-2">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('comms.publishAnnouncement', 'Publish announcement')}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
