'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { startTransition } from 'react';
import { AssistantInput } from '@/components/dashboard/assistant/assistant-input';
import {
  UserMessage,
  AssistantMessage,
  AssistantThreadSkeleton,
  DiscoverySuggestions,
} from '@/components/dashboard/assistant/assistant-chat';
import { mapAssistantMessages, AssistantUiMessage } from '@/components/dashboard/assistant/assistant-message.util';
import {
  buildAssistantSuggestionPool,
  filterAssistantSuggestions,
} from '@/components/dashboard/assistant/assistant-suggestions.util';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import {
  useAssistantFilterOptions,
  useAssistantThread,
  useAssistantThreads,
  useSendAssistantMessage,
} from '@/features/assistant/assistant.hooks';
import {
  AssistantUiContextState,
  buildAssistantContextInput,
  DEFAULT_ASSISTANT_UI_CONTEXT,
  getAssistantContextLabel,
  parseStoredAssistantContext,
  resolveAssistantFilterOptions,
} from '@/features/assistant/assistant-context.util';
import { useAuth } from '@/contexts/AuthContext';
import { useHrReportFilterOptions } from '@/features/reports/reports.hooks';

const ASSISTANT_PATH = '/dashboard/assistant';

export default function AssistantPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const threadFromUrl = searchParams.get('thread') ?? undefined;

  const [prompt, setPrompt] = React.useState('');
  const [activeThreadId, setActiveThreadId] = React.useState<string | undefined>(threadFromUrl);
  const [ownedThreadId, setOwnedThreadId] = React.useState<string | undefined>();
  const [messages, setMessages] = React.useState<AssistantUiMessage[]>([]);
  const [contextState, setContextState] = React.useState<AssistantUiContextState>(DEFAULT_ASSISTANT_UI_CONTEXT);
  const [showScrollDown, setShowScrollDown] = React.useState(false);
  const [showDiscoverySuggestions, setShowDiscoverySuggestions] = React.useState(true);
  const [typingMessageId, setTypingMessageId] = React.useState<string | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);
  const pendingThreadIdRef = React.useRef<string | null>(null);

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const { state, isMobile } = useSidebar();
  const { toast } = useToast();
  const { permissionsMap } = useAuth();
  const sendMessage = useSendAssistantMessage();
  const { data: filterOptions } = useAssistantFilterOptions();
  const { data: hrFilterOptions } = useHrReportFilterOptions();
  const { data: threadsData } = useAssistantThreads(20);
  const {
    data: activeThread,
    isLoading: isThreadLoading,
    isFetching: isThreadFetching,
    isError: isThreadError,
    error: threadError,
    refetch: refetchThread,
  } = useAssistantThread(threadFromUrl);

  const isThinking = sendMessage.isPending;
  const isOwnedThread = Boolean(threadFromUrl && ownedThreadId === threadFromUrl);
  const isLoadingHistory = Boolean(
    threadFromUrl &&
      !isOwnedThread &&
      (isThreadLoading || isThreadFetching) &&
      messages.length === 0,
  );
  const isDiscovery = messages.length === 0 && !isThinking && !isLoadingHistory && !threadFromUrl;
  const sidebarWidth = isMobile ? '0px' : state === 'expanded' ? '256px' : '48px';

  const resolvedFilterOptions = React.useMemo(
    () => resolveAssistantFilterOptions(filterOptions, permissionsMap, hrFilterOptions),
    [filterOptions, permissionsMap, hrFilterOptions],
  );

  const suggestionPool = React.useMemo(
    () =>
      buildAssistantSuggestionPool({
        messages,
        threadTitles: threadsData?.items.map((thread) => thread.title) ?? [],
      }),
    [messages, threadsData?.items],
  );

  const filteredSuggestions = React.useMemo(
    () => filterAssistantSuggestions(suggestionPool, prompt),
    [suggestionPool, prompt],
  );

  React.useEffect(() => {
    setActiveThreadId(threadFromUrl);

    if (!threadFromUrl) {
      if (pendingThreadIdRef.current) {
        return;
      }
      setOwnedThreadId(undefined);
      setMessages([]);
      setContextState(DEFAULT_ASSISTANT_UI_CONTEXT);
      setShowDiscoverySuggestions(true);
      setTypingMessageId(null);
      return;
    }

    if (pendingThreadIdRef.current === threadFromUrl) {
      pendingThreadIdRef.current = null;
      setOwnedThreadId(threadFromUrl);
      return;
    }

    if (ownedThreadId === threadFromUrl) {
      return;
    }

    setOwnedThreadId(undefined);
    setMessages([]);
    setTypingMessageId(null);
  }, [threadFromUrl, ownedThreadId]);

  React.useEffect(() => {
    if (isOwnedThread) {
      return;
    }

    if (!threadFromUrl || !activeThread || activeThread.id !== threadFromUrl) {
      return;
    }

    const mappedMessages = mapAssistantMessages(activeThread.messages ?? []);
    setMessages(mappedMessages);
    if (activeThread.contextFilters) {
      setContextState(parseStoredAssistantContext(activeThread.contextFilters));
    }
  }, [threadFromUrl, activeThread, isOwnedThread]);

  React.useEffect(() => {
    const mainContainer = document.getElementById('dashboard-main');
    if (mainContainer) {
      mainContainer.scrollTop = mainContainer.scrollHeight;
    }
  }, [messages, isThinking, typingMessageId]);

  const scrollToBottomDuringTyping = React.useCallback(() => {
    const mainContainer = document.getElementById('dashboard-main');
    if (mainContainer) {
      mainContainer.scrollTop = mainContainer.scrollHeight;
    }
  }, []);

  React.useEffect(() => {
    const mainContainer = document.getElementById('dashboard-main');
    if (!mainContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = mainContainer;
      const isNearBottom = scrollHeight - scrollTop <= clientHeight + 150;
      setShowScrollDown(!isNearBottom && messages.length > 0);
    };

    mainContainer.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => mainContainer.removeEventListener('scroll', handleScroll);
  }, [messages]);

  const scrollToBottom = () => {
    const mainContainer = document.getElementById('dashboard-main');
    if (mainContainer) {
      mainContainer.scrollTo({
        top: mainContainer.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  const handleSend = async (text: string = prompt) => {
    if (!text.trim() || isThinking) return;

    const userMsg: AssistantUiMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setPrompt('');

    try {
      abortRef.current = new AbortController();
      const response = await sendMessage.mutateAsync({
        threadId: activeThreadId,
        query: text.trim(),
        context: buildAssistantContextInput(contextState),
      });

      pendingThreadIdRef.current = response.threadId;
      setOwnedThreadId(response.threadId);
      setActiveThreadId(response.threadId);

      const botMsg: AssistantUiMessage = {
        id: response.message.id,
        type: 'assistant',
        content: response.message.content,
        followUps: mapAssistantMessages([response.message])[0]?.followUps,
      };

      setMessages((prev) => [...prev, botMsg]);
      setTypingMessageId(botMsg.id);

      startTransition(() => {
        router.replace(`${ASSISTANT_PATH}?thread=${response.threadId}`, { scroll: false });
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to send message';
      toast({ title: 'Assistant error', description: message, variant: 'destructive' });
      setMessages((prev) => prev.filter((item) => item.id !== userMsg.id));
    } finally {
      abortRef.current = null;
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
  };

  const contextLabel = getAssistantContextLabel(resolvedFilterOptions, contextState);

  return (
    <div className="flex flex-col bg-background relative min-h-full">
      <div
        ref={scrollRef}
        className={cn(
          'flex-1 flex flex-col items-center px-4 md:px-6 no-scrollbar transition-[padding] duration-300 ease-out',
          isDiscovery ? 'justify-start pb-8' : 'justify-start pt-6 pb-50 md:pb-45',
        )}
      >
        {isDiscovery ? (
          <div className="flex w-full max-w-175 flex-col items-center pt-[12vh] md:pt-[14vh]">
            <div className="flex shrink-0 flex-col items-center">
              <Image
                src="/assets/assistantSvg.svg"
                width={50}
                height={50}
                alt="assistant url"
                className="object-cover"
              />
              <h3 className="mt-4 text-center text-2xl font-semibold leading-8 text-foreground">
                How can i help you?
              </h3>
            </div>

            <div className="mt-8 w-full shrink-0">
              <AssistantInput
                value={prompt}
                onChange={setPrompt}
                onSend={() => handleSend()}
                onStop={handleStop}
                isThinking={isThinking}
                isActive={false}
                contextState={contextState}
                onContextChange={setContextState}
                suggestions={filteredSuggestions}
                onSuggestionSelect={handleSend}
              />
            </div>

            {showDiscoverySuggestions && (
              <div className="mt-4.5 w-full">
                <DiscoverySuggestions
                  suggestions={filteredSuggestions}
                  query={prompt}
                  onSelect={handleSend}
                  onDismiss={() => setShowDiscoverySuggestions(false)}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="w-full max-w-5xl flex flex-col gap-2.5">
            {isLoadingHistory ? (
              <AssistantThreadSkeleton />
            ) : isThreadError ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  {threadError instanceof Error
                    ? threadError.message
                    : 'Failed to load this conversation.'}
                </p>
                <button
                  type="button"
                  onClick={() => refetchThread()}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : (
              messages.map((msg) => (
                <React.Fragment key={msg.id}>
                  {msg.type === 'user' ? (
                    <UserMessage
                      content={msg.content}
                      filters={[{ label: contextLabel }]}
                    />
                  ) : (
                    <AssistantMessage
                      content={msg.content}
                      animateTyping={msg.id === typingMessageId}
                      followUps={msg.followUps}
                      onFollowUpSelect={handleSend}
                      onTypingComplete={() => setTypingMessageId(null)}
                      onTypingProgress={scrollToBottomDuringTyping}
                    />
                  )}
                </React.Fragment>
              ))
            )}

            {isThinking && <AssistantMessage isThinking />}
          </div>
        )}
      </div>

      {!isDiscovery && (
        <div
          className="fixed bottom-0 z-30 p-4 md:p-6 pb-6 md:pb-8 bg-linear-to-t from-background via-background/80 to-transparent flex flex-col items-center justify-end pointer-events-none transition-all duration-200 ease-linear"
          style={{
            left: isMobile ? '0' : sidebarWidth,
            width: isMobile ? '100%' : `calc(100% - ${sidebarWidth})`,
          }}
        >
          <div className="pointer-events-auto w-full max-w-5xl flex flex-col items-end">
            {showScrollDown && (
              <button
                onClick={scrollToBottom}
                className="mb-4 w-10 h-10 bg-card border border-border rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:border-primary/30 text-muted-foreground hover:text-primary transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
              >
                <ChevronDown size={20} />
              </button>
            )}
            <AssistantInput
              value={prompt}
              onChange={setPrompt}
              onSend={() => handleSend()}
              onStop={handleStop}
              isThinking={isThinking}
              isActive
              className="max-w-5xl"
              contextState={contextState}
              onContextChange={setContextState}
            />
          </div>
        </div>
      )}
    </div>
  );
}
