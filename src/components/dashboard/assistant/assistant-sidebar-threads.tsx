'use client';

import * as React from 'react';
import Link from 'next/link';
import { MessageSquare, Trash2 } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebarCollapsedInteraction,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  useAssistantThreads,
  useDeleteAssistantThread,
} from '@/features/assistant/assistant.hooks';

const ASSISTANT_PATH = '/dashboard/assistant';
const SESSION_LIST_MAX_HEIGHT = 'max-h-52';

type AssistantNavLinkProps = {
  title: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

export function AssistantNavLink({ title, icon: Icon }: AssistantNavLinkProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleItemClick } = useSidebarCollapsedInteraction();
  const activeThreadId = searchParams.get('thread');
  const isAssistantRoute = pathname === ASSISTANT_PATH;

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    handleItemClick(event, () => {
      if (isAssistantRoute && activeThreadId) {
        event.preventDefault();
        router.replace(ASSISTANT_PATH, { scroll: false });
      }
    });
  };

  return (
    <SidebarMenuButton
      asChild
      tooltip={title}
      isActive={isAssistantRoute && !activeThreadId}
    >
      <Link href={ASSISTANT_PATH} onClick={handleClick}>
        {Icon && <Icon />}
        <span>{title}</span>
      </Link>
    </SidebarMenuButton>
  );
}

function AssistantThreadList({
  isLoading,
  threads,
  isAssistantRoute,
  activeThreadId,
  onNavigate,
  onDelete,
  t,
}: {
  isLoading: boolean;
  threads: Array<{ id: string; title: string }>;
  isAssistantRoute: boolean;
  activeThreadId: string | null;
  onNavigate: (event: React.MouseEvent) => void;
  onDelete: (event: React.MouseEvent, threadId: string) => void;
  t: (key: string, options?: { defaultValue?: string }) => string;
}) {
  if (!isLoading && threads.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        SESSION_LIST_MAX_HEIGHT,
        'overflow-y-auto overflow-x-hidden pr-1',
        '[scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5',
        '[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border',
      )}
    >
      {isLoading && (
        <SidebarMenuSubItem>
          <SidebarMenuSubButton className="pointer-events-none opacity-60">
            <span className="text-xs">
              {t('sidebar.assistantLoadingChats', { defaultValue: 'Loading chats...' })}
            </span>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
      )}

      {!isLoading &&
        threads.map((thread) => (
          <SidebarMenuSubItem key={thread.id}>
            <SidebarMenuSubButton
              asChild
              isActive={isAssistantRoute && activeThreadId === thread.id}
              className="group/thread pr-1"
            >
              <Link
                href={`${ASSISTANT_PATH}?thread=${thread.id}`}
                onClick={onNavigate}
                className="flex min-w-0 flex-1 items-center gap-2"
              >
                <MessageSquare className="size-4 shrink-0" />
                <span className="truncate">{thread.title}</span>
                <button
                  type="button"
                  aria-label={t('sidebar.assistantDeleteChat', { defaultValue: 'Delete chat' })}
                  className={cn(
                    'ml-auto shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity',
                    'hover:text-destructive group-hover/thread:opacity-100',
                  )}
                  onClick={(event) => onDelete(event, thread.id)}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </Link>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        ))}
    </div>
  );
}

export function AssistantSidebarThreads() {
  const { t } = useTranslation('dashboard');
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleItemClick } = useSidebarCollapsedInteraction();
  const activeThreadId = searchParams.get('thread');
  const { toast } = useToast();
  const isAssistantRoute = pathname === ASSISTANT_PATH;
  const { data, isLoading } = useAssistantThreads(20, { enabled: isAssistantRoute });

  const deleteThread = useDeleteAssistantThread();

  const threads = data?.items ?? [];

  if (!isAssistantRoute) {
    return null;
  }

  const handleDelete = async (event: React.MouseEvent, threadId: string) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      await deleteThread.mutateAsync(threadId);
      if (activeThreadId === threadId) {
        router.replace(ASSISTANT_PATH, { scroll: false });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete conversation';
      toast({ title: 'Delete failed', description: message, variant: 'destructive' });
    }
  };

  const hasThreadList = isLoading || threads.length > 0;
  if (!hasThreadList) {
    return null;
  }

  return (
    <SidebarMenuSub className="group-data-[collapsible=icon]:hidden">
      <AssistantThreadList
        isLoading={isLoading}
        threads={threads}
        isAssistantRoute={isAssistantRoute}
        activeThreadId={activeThreadId}
        onNavigate={(event) => handleItemClick(event)}
        onDelete={handleDelete}
        t={t}
      />
    </SidebarMenuSub>
  );
}
