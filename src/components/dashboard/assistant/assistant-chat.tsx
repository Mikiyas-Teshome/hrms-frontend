'use client';

import * as React from 'react';
import { LoaderCircle, ArrowRight, Lightbulb, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

// --- User Message ---
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

// --- Assistant Message ---
export function AssistantMessage({ 
  content, 
  isThinking, 
  followUps = [] 
}: { 
  content?: string; 
  isThinking?: boolean; 
  followUps?: { icon: React.ReactNode; label: string }[] 
}) {
  return (
      <div className="flex flex-col items-start gap-3 w-full px-4">
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
              {content && <div className="text-sm leading-6 text-foreground">{content}</div>}

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

              {followUps.length > 0 && (
                  <div className="flex flex-col gap-1 w-full">
                      <p className="text-sm leading-5 font-medium text-muted-foreground">
                          Suggestion follow ups
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                          {followUps.map((f, i) => (
                              <button
                                  key={i}
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
                  </div>
              )}
          </div>
      </div>
  );
}

// --- Suggestion List (Discovery) ---
export function DiscoverySuggestions({ 
  onSelect 
}: { 
  onSelect: (q: string) => void 
}) {
  const items = [
    "Show employees on leave today",
    "How many employees are active?",
    "Generate payroll summary",
    "Who has missing documents?"
  ];

  return (
      <div className="flex flex-col w-full max-w-175 px-5.75 space-y-1">
          <div className="w-full flex justify-between items-center py-2 ">
              <div className="flex justify-center translate-x-2">
                  <span className="text-sm leading-5 font-semibold text-foreground/80">
                      Here what you can do with HRMS assistant
                  </span>
              </div>
              <button className="text-foreground/50 hover:text-foreground">
                  <X size={20} />
              </button>
          </div>

          <div className="grid grid-cols-1 gap-2">
              {items.map((text, i) => (
                  <button
                      key={i}
                      onClick={() => onSelect(text)}
                      className="flex items-center gap-2 py-3 text-muted-foreground border-b border-border/80 cursor-pointer"
                  >
                      <Lightbulb size={20} className="shrink-0" />
                      <span className="text-sm leading-5 font-normal">{text}</span>
                  </button>
              ))}
          </div>
      </div>
  );
}
