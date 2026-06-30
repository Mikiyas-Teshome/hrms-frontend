'use client';

import * as React from 'react';
import { LoaderCircle, ArrowRight, ChevronDown, Lightbulb, X, History, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { AssistantMarkdown } from '@/components/dashboard/assistant/assistant-markdown';
import { useAssistantTyping } from '@/components/dashboard/assistant/use-assistant-typing';
import {
  AssistantSuggestion,
  getAssistantSuggestionSourceLabel,
} from '@/components/dashboard/assistant/assistant-suggestions.util';

export function UserMessage({ 
  content, 
  filters = [] 
}: { 
  content: string; 
  filters?: { label: string; rounded?: boolean }[] 
}) {
  return (
      <div className="flex flex-col items-end gap-2 py-2.75 w-full max-w-[85%] ml-auto">
          <div className="flex items-center">
              <span className="text-sm leading-5 font-semibold text-foreground">You</span>
          </div>
          <div className="bg-muted/50 border border-border rounded-[10px] p-3 flex flex-col gap-3 min-w-70">
              <p className="text-sm font-normal leading-5 text-foreground">{content}</p>
              {filters.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap mt-1">
                      {filters.map((f, i) => (
                          <div
                              key={i}
                              className={cn(
                                  'flex items-center justify-center px-3 py-0.75 bg-secondary text-xs leading-4 text-muted-foreground rounded-[8px]',
                              )}
                          >
                              {f.label}
                          </div>
                      ))}
                  </div>
              )}
          </div>
      </div>
  );
}

export function AssistantThreadSkeleton() {
  return (
    <div className="flex w-full flex-col gap-8" role="status" aria-label="Loading conversation">
      <div className="flex flex-col items-end gap-2 py-2.75 w-full max-w-[85%] ml-auto">
        <Skeleton className="h-5 w-10" />
        <div className="flex w-full min-w-70 flex-col gap-3 rounded-[10px] border border-border bg-muted/30 p-3">
          <Skeleton className="h-4 w-[88%]" />
          <Skeleton className="h-4 w-[62%]" />
          <div className="flex flex-wrap gap-1.5">
            <Skeleton className="h-6 w-28 rounded-[8px]" />
            <Skeleton className="h-6 w-24 rounded-[8px]" />
            <Skeleton className="h-6 w-20 rounded-[8px]" />
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col items-start gap-3 px-2 md:px-4">
        <div className="flex items-center gap-2">
          <Skeleton className="size-[50px] shrink-0 rounded-full" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="flex w-full max-w-3xl flex-col gap-2.5 pl-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[92%]" />
          <Skeleton className="h-4 w-[78%]" />
          <Skeleton className="h-4 w-[55%]" />
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 py-2.75 w-full max-w-[70%] ml-auto">
        <Skeleton className="h-5 w-10" />
        <div className="flex w-full min-w-52 flex-col gap-2 rounded-[10px] border border-border bg-muted/30 p-3">
          <Skeleton className="h-4 w-[75%]" />
          <Skeleton className="h-4 w-[45%]" />
        </div>
      </div>
    </div>
  );
}

export function AssistantMessage({ 
  content, 
  isThinking,
  animateTyping = false,
  followUps = [],
  onFollowUpSelect,
  onTypingComplete,
  onTypingProgress,
}: { 
  content?: string; 
  isThinking?: boolean;
  animateTyping?: boolean;
  followUps?: { icon: React.ReactNode; label: string }[];
  onFollowUpSelect?: (label: string) => void;
  onTypingComplete?: () => void;
  onTypingProgress?: () => void;
}) {
  const [followUpsExpanded, setFollowUpsExpanded] = React.useState(false);
  const { displayedText, isTyping, isComplete } = useAssistantTyping(
    content ?? '',
    Boolean(content && animateTyping),
    onTypingProgress,
  );

  React.useEffect(() => {
    if (animateTyping && isComplete) {
      onTypingComplete?.();
    }
  }, [animateTyping, isComplete, onTypingComplete]);

  const visibleFollowUps = animateTyping && !isComplete ? [] : followUps;

  return (
      <div className="flex flex-col items-start gap-3 w-full min-w-0 px-2 md:px-4">
          <div className="flex items-center gap-2">
              <Image
                  src={'/assets/assistantSvg.svg'}
                  width={50}
                  height={50}
                  alt="assistant url"
                  className="object-cover "
              />
              <span className="text-sm font-semibold leading-5 text-foreground">Assistant</span>
          </div>

          <div className="flex flex-col gap-6 w-full">
              {content && (
                <div className="flex items-end gap-0.5">
                  <AssistantMarkdown content={displayedText} className="min-w-0 flex-1" />
                  {isTyping && (
                    <span
                      className="mb-1 inline-block h-4 w-0.5 shrink-0 animate-pulse bg-foreground"
                      aria-hidden
                    />
                  )}
                </div>
              )}

              {isThinking && (
                  <div className="flex items-center gap-3 py-2">
                      <div className="relative">
                          <LoaderCircle size={24} className="text-brand-600 animate-spin" />
                          <div className="absolute inset-0 bg-brand-600/10 rounded-full animate-ping" />
                      </div>
                      <span className="text-base text-muted-foreground animate-pulse">
                          Thinking
                      </span>
                  </div>
              )}

              {visibleFollowUps.length > 0 && (
                  <div className="flex flex-col gap-1 w-full">
                      <button
                          type="button"
                          onClick={() => setFollowUpsExpanded((prev) => !prev)}
                          className="flex items-center justify-between gap-2 text-sm leading-5 font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                          <span>Suggestion follow ups ({visibleFollowUps.length})</span>
                          <ChevronDown
                              size={16}
                              className={cn(
                                  'shrink-0 transition-transform',
                                  followUpsExpanded && 'rotate-180',
                              )}
                          />
                      </button>
                      {followUpsExpanded && (
                          <div className="grid grid-cols-1 gap-2">
                              {visibleFollowUps.map((f, i) => (
                                  <button
                                      key={i}
                                      type="button"
                                      onClick={() => onFollowUpSelect?.(f.label)}
                                      className="flex justify-between items-center gap-2 py-3 text-muted-foreground border-b border-border/80 cursor-pointer"
                                  >
                                      <div className="flex gap-2">
                                          <div className="text-xl shrink-0">{f.icon}</div>
                                          <span className="text-sm leading-5 font-normal">
                                              {f.label}
                                          </span>
                                      </div>
                                      <ArrowRight size={16} className="text-muted-foreground/50" />
                                  </button>
                              ))}
                          </div>
                      )}
                  </div>
              )}
          </div>
      </div>
  );
}

function SuggestionIcon({ source }: { source: AssistantSuggestion['source'] }) {
  if (source === 'history' || source === 'thread') {
    return <History size={18} className="shrink-0" />;
  }
  if (source === 'follow-up') {
    return <MessageSquare size={18} className="shrink-0" />;
  }
  return <Lightbulb size={18} className="shrink-0" />;
}

export function AssistantSuggestionList({
  suggestions,
  onSelect,
  compact = false,
}: {
  suggestions: AssistantSuggestion[];
  onSelect: (text: string) => void;
  compact?: boolean;
}) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className={cn('grid grid-cols-1', compact ? 'gap-1' : 'gap-2')}>
      {suggestions.map((item) => (
        <button
          key={`${item.source}-${item.text}`}
          type="button"
          onClick={() => onSelect(item.text)}
          className={cn(
            'flex items-start gap-2 text-left text-muted-foreground border-b border-border/80 cursor-pointer hover:text-foreground transition-colors',
            compact ? 'py-2 px-1' : 'py-3',
          )}
        >
          <SuggestionIcon source={item.source} />
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-sm leading-5 font-normal">{item.text}</span>
            {!compact && item.source !== 'suggested' && (
              <span className="text-xs text-muted-foreground/70">
                {getAssistantSuggestionSourceLabel(item.source)}
              </span>
            )}
          </span>
          {!compact && <ArrowRight size={14} className="mt-1 shrink-0 opacity-50" />}
        </button>
      ))}
    </div>
  );
}

export function DiscoverySuggestions({
  suggestions,
  query,
  onSelect,
  onDismiss,
}: {
  suggestions: AssistantSuggestion[];
  query: string;
  onSelect: (q: string) => void;
  onDismiss?: () => void;
}) {
  const hasQuery = Boolean(query.trim());

  return (
    <div className="flex flex-col w-full px-1">
      <div className="w-full flex shrink-0 justify-between items-center py-2">
        <span className="text-sm leading-5 font-semibold text-foreground/80">
          {hasQuery ? 'Matching questions' : 'Here what you can do with HRMS assistant'}
        </span>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-foreground/50 hover:text-foreground"
            aria-label="Hide suggestions"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {suggestions.length > 0 ? (
        <AssistantSuggestionList suggestions={suggestions} onSelect={onSelect} />
      ) : (
        <p className="py-3 text-sm text-muted-foreground">
          No matching questions. Try a different phrase or send your own question.
        </p>
      )}
    </div>
  );
}
