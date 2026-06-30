import * as React from 'react';
import { BarChart3, Files, Filter } from 'lucide-react';
import { AssistantMessage as AssistantMessageType } from '@/features/assistant/assistant.types';

export type AssistantUiMessage = {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  followUps?: { icon: React.ReactNode; label: string }[];
};

const followUpIcon = (label: string) => {
  const value = label.toLowerCase();
  if (value.includes('report') || value.includes('summary')) return React.createElement(BarChart3, { size: 16 });
  if (value.includes('filter') || value.includes('department')) return React.createElement(Filter, { size: 16 });
  return React.createElement(Files, { size: 16 });
};

const normalizeRole = (role: string): 'user' | 'assistant' =>
  role.toLowerCase() === 'user' ? 'user' : 'assistant';

export const mapAssistantMessages = (messages: AssistantMessageType[]): AssistantUiMessage[] =>
  messages.map((message) => ({
    id: message.id,
    type: normalizeRole(message.role),
    content: message.content,
    followUps: message.followUpSuggestions?.map((label) => ({
      icon: followUpIcon(label),
      label,
    })),
  }));
