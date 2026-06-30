'use client';

import * as React from 'react';
import { ChevronDown, Send, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useAssistantFilterOptions } from '@/features/assistant/assistant.hooks';
import {
  AssistantUiContextState,
  DEFAULT_ASSISTANT_UI_CONTEXT,
  resolveAssistantFilterOptions,
} from '@/features/assistant/assistant-context.util';
import { useHrReportFilterOptions } from '@/features/reports/reports.hooks';
import { AssistantSuggestion } from '@/components/dashboard/assistant/assistant-suggestions.util';
import { AssistantSuggestionList } from '@/components/dashboard/assistant/assistant-chat';
import { useClientHydrated } from '@/hooks/use-client-hydrated';

interface AssistantInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  isThinking: boolean;
  className?: string;
  isActive: boolean;
  contextState: AssistantUiContextState;
  onContextChange: (state: AssistantUiContextState) => void;
  suggestions?: AssistantSuggestion[];
  onSuggestionSelect?: (text: string) => void;
  showSuggestionDropdown?: boolean;
  showFilters?: boolean;
}

export function AssistantInput({
  value,
  onChange,
  onSend,
  onStop,
  isThinking,
  className,
  isActive,
  contextState,
  onContextChange,
  suggestions = [],
  onSuggestionSelect,
  showSuggestionDropdown = false,
  showFilters = true,
}: AssistantInputProps) {
  const isHydrated = useClientHydrated();
  const isValueEmpty = !value.trim();
  const { permissionsMap } = useAuth();
  const { data: filterOptions, isLoading: isLoadingFilters } = useAssistantFilterOptions();
  const { data: hrFilterOptions } = useHrReportFilterOptions();

  const resolvedOptions = React.useMemo(
    () => resolveAssistantFilterOptions(filterOptions, permissionsMap, hrFilterOptions),
    [filterOptions, permissionsMap, hrFilterOptions],
  );

  const organizations = resolvedOptions.organizations;
  const focusAreas = resolvedOptions.focusAreas;
  const datePresets = resolvedOptions.datePresets;

  const organizationLabel =
    organizations.find((item) => item.id === contextState.organizationId)?.label ??
    'Full organization';
  const focusLabel =
    focusAreas.find((item) => item.id === contextState.focusAreaId)?.label ?? 'All modules';
  const dateLabel =
    datePresets.find((item) => item.id === contextState.datePresetId)?.label ?? 'This month';

  const updateContext = (patch: Partial<AssistantUiContextState>) => {
    onContextChange({ ...contextState, ...patch });
  };

  const shouldShowSuggestions =
    showSuggestionDropdown && suggestions.length > 0 && !isThinking;

  return (
    <div className={cn('relative w-full max-w-175', className)}>
      {shouldShowSuggestions && (
        <div className="absolute bottom-full left-0 right-0 z-40 mb-2 rounded-[12px] border border-border bg-card p-2 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
          <AssistantSuggestionList
            suggestions={suggestions}
            onSelect={(text) => onSuggestionSelect?.(text)}
            compact
          />
        </div>
      )}

      <div
        className={cn(
          'w-full bg-card rounded-[16px] shadow-lg border border-border px-4 py-3',
          isActive
            ? showFilters
              ? 'min-h-37.5 shadow-sm ring-1 ring-border'
              : 'shadow-sm ring-1 ring-border'
            : 'min-h-37.5 hover:shadow-xl',
        )}
      >
      <div className="flex flex-col h-full justify-between gap-2.25">
        <div className="flex-1 min-h-0 flex items-start">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Ask about employees, payroll, or reports..."
            className={cn(
              'w-full resize-none border-none focus-visible:ring-0 p-0 py-1 text-base leading-6 text-foreground placeholder:text-foreground/40 h-full shadow-none bg-transparent dark:bg-transparent max-h-32 overflow-y-auto',
            )}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !isValueEmpty && !isThinking) {
                e.preventDefault();
                onSend();
              }
            }}
          />
        </div>

        <div
          className={cn(
            'flex flex-wrap items-center gap-y-3',
            showFilters ? 'justify-between' : 'justify-end',
          )}
        >
          {showFilters && (
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  disabled={isHydrated && isLoadingFilters}
                  className="flex items-center gap-1.5 text-xs text-foreground/60 font-normal hover:text-foreground/80 transition-colors outline-none disabled:opacity-50"
                >
                  <span className="max-w-40 truncate">{organizationLabel}</span>
                  <ChevronDown size={12} className="opacity-60 shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-h-60 min-w-[180px] overflow-y-auto">
                {organizations.map((opt) => (
                  <DropdownMenuItem
                    key={opt.id}
                    onSelect={() => updateContext({ organizationId: opt.id })}
                    className={cn('text-xs', contextState.organizationId === opt.id && 'font-medium')}
                  >
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="w-px h-4 bg-muted-foreground/20" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  disabled={isHydrated && isLoadingFilters}
                  className="flex items-center gap-1.5 text-[12px] text-foreground/60 font-normal hover:text-foreground/80 transition-colors outline-none disabled:opacity-50"
                >
                  <span>{focusLabel}</span>
                  <ChevronDown size={12} className="opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[150px]">
                {focusAreas.map((opt) => (
                  <DropdownMenuItem
                    key={opt.id}
                    onSelect={() => updateContext({ focusAreaId: opt.id })}
                    className={cn('text-xs', contextState.focusAreaId === opt.id && 'font-medium')}
                  >
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="w-px h-4 bg-muted-foreground/20" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  disabled={isHydrated && isLoadingFilters}
                  className="flex items-center gap-1.5 text-[12px] text-foreground/60 font-normal whitespace-nowrap hover:text-foreground/80 transition-colors outline-none disabled:opacity-50"
                >
                  <span>{dateLabel}</span>
                  <ChevronDown size={12} className="opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[150px]">
                {datePresets.map((opt) => (
                  <DropdownMenuItem
                    key={opt.id}
                    onSelect={() => updateContext({ datePresetId: opt.id })}
                    className={cn('text-xs', contextState.datePresetId === opt.id && 'font-medium')}
                  >
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          )}

          {isThinking ? (
            <Button
              onClick={onStop}
              className="w-10 h-10 bg-destructive hover:bg-destructive/90 rounded-[8px] p-0 shrink-0"
            >
              <Square size={12} fill="currentColor" className="text-destructive-foreground" />
            </Button>
          ) : (
            <Button
              onClick={onSend}
              disabled={!!isValueEmpty}
              className={cn(
                'w-10 h-10 rounded-[8px] p-0 shrink-0',
                isValueEmpty
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-brand-600 hover:bg-brand-700 text-[#FAFAFA]',
              )}
            >
              <Send size={16} />
            </Button>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}

export { DEFAULT_ASSISTANT_UI_CONTEXT };
