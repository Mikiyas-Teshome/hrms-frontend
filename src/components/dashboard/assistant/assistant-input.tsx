'use client';

import { ChevronDown, Calendar, Send, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';

interface AssistantInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  isThinking: boolean;
  className?: string;
  isActive: boolean;
}

const ORGANIZATION_OPTIONS = ['Full organization', 'Engineering', 'HR', 'Finance', 'Operations'];
const MODULE_OPTIONS = ['Module', 'Payroll', 'Attendance', 'Recruitment', 'Leave', 'Performance'];
const DATE_OPTIONS_INACTIVE = ['Today', 'Yesterday', 'Last 7 days', 'Last 30 days'];
const DATE_OPTIONS_ACTIVE   = ['Date range', 'Today', 'Yesterday', 'Last 7 days', 'Last 30 days', 'This month'];

export function AssistantInput({
  value,
  onChange,
  onSend,
  onStop,
  isThinking,
  className,
  isActive,
}: AssistantInputProps) {
  const isValueEmpty = !value.trim();

  const [org,  setOrg]  = useState('Full organization');
  const [mod,  setMod]  = useState('Module');
  const [date, setDate] = useState<string | null>(null);

  const dateLabel = date ?? (isActive ? 'Date range' : 'Today');
  const dateOptions = isActive ? DATE_OPTIONS_ACTIVE : DATE_OPTIONS_INACTIVE;

  return (
      <div
          className={cn(
              'w-full bg-card max-w-175 rounded-[16px] shadow-lg border border-border px-4 py-3 transition-all duration-500 ease-in-out',
              isActive
                  ? 'h-auto min-h-37.5 shadow-sm ring-1 ring-border'
                  : 'h-auto min-h-37.5 hover:shadow-xl',
              className,
          )}
      >
          <div className="flex flex-col h-full justify-between gap-2.25">
              {/* Textarea Area */}
              <div className="flex-1 min-h-0 flex items-start">
                  <Textarea
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                      placeholder="Ask about employees, payroll, or reports..."
                      className={cn(
                          'w-full resize-none border-none focus-visible:ring-0 p-0 py-1 text-base leading-6 text-foreground placeholder:text-foreground/40 h-full shadow-none bg-transparent dark:bg-transparent',
                          isActive ? 'max-h-32' : 'max-h-none',
                      )}
                      onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey && !isValueEmpty && !isThinking) {
                              e.preventDefault();
                              onSend();
                          }
                      }}
                  />
              </div>

              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-y-3">
                  <div className="flex flex-wrap items-center gap-3 flex-1">

                      {/* Filter: Organization */}
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <button className="flex items-center gap-1.5 text-xs text-foreground/60 font-normal hover:text-foreground/80 transition-colors outline-none">
                                  <span>{org}</span>
                                  <ChevronDown size={12} className="opacity-60" />
                              </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="min-w-[160px]">
                              {ORGANIZATION_OPTIONS.map((opt) => (
                                  <DropdownMenuItem
                                      key={opt}
                                      onSelect={() => setOrg(opt)}
                                      className={cn('text-xs', org === opt && 'font-medium')}
                                  >
                                      {opt}
                                  </DropdownMenuItem>
                              ))}
                          </DropdownMenuContent>
                      </DropdownMenu>

                      <div className="w-px h-4 bg-muted-foreground/20" />

                      {/* Filter: Module */}
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <button className="flex items-center gap-1.5 text-[12px] text-foreground/60 font-normal hover:text-foreground/80 transition-colors outline-none">
                                  <span>{mod}</span>
                                  <ChevronDown size={12} className="opacity-60" />
                              </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="min-w-[150px]">
                              {MODULE_OPTIONS.map((opt) => (
                                  <DropdownMenuItem
                                      key={opt}
                                      onSelect={() => setMod(opt)}
                                      className={cn('text-xs', mod === opt && 'font-medium')}
                                  >
                                      {opt}
                                  </DropdownMenuItem>
                              ))}
                          </DropdownMenuContent>
                      </DropdownMenu>

                      <div className="w-px h-4 bg-muted-foreground/20" />

                      {/* Filter: Date */}
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <button className="flex items-center gap-1.5 text-[12px] text-foreground/60 font-normal whitespace-nowrap hover:text-foreground/80 transition-colors outline-none">
                                  <span>{dateLabel}</span>
                                  <ChevronDown size={12} className="opacity-60" />
                              </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="min-w-[150px]">
                              {dateOptions.map((opt) => (
                                  <DropdownMenuItem
                                      key={opt}
                                      onSelect={() => setDate(opt)}
                                      className={cn('text-xs', dateLabel === opt && 'font-medium')}
                                  >
                                      {opt}
                                  </DropdownMenuItem>
                              ))}
                          </DropdownMenuContent>
                      </DropdownMenu>

                      {isActive && (
                          <>
                              <div className="w-px h-4 bg-muted-foreground/20" />
                              <div className="flex items-center gap-1 text-[12px] text-foreground/60 font-normal">
                                  <Calendar size={12} className="opacity-60" />
                                  <span>Mar 20, 2026 - Mar 21, 2026</span>
                              </div>
                          </>
                      )}
                  </div>

                  {/* Interaction Button */}
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
  );
}
