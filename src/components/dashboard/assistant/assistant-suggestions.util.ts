import { AssistantUiMessage } from '@/components/dashboard/assistant/assistant-message.util';

export const DEFAULT_ASSISTANT_SUGGESTIONS = [
  'Show employees on leave today',
  'How many employees are active?',
  'Generate payroll summary',
  'Who has missing documents?',
  'How many active employees do we have?',
  'List employees on leave this month',
  'Attendance summary for last month',
  'Pending leave requests in my department',
  'Payroll summary for last month',
  'Total payroll cost this quarter',
];

export type AssistantSuggestionSource = 'suggested' | 'history' | 'follow-up' | 'thread';

export type AssistantSuggestion = {
  text: string;
  source: AssistantSuggestionSource;
};

const normalizeText = (value: string) => value.trim().toLowerCase();

export function buildAssistantSuggestionPool(input: {
  messages?: AssistantUiMessage[];
  threadTitles?: string[];
}): AssistantSuggestion[] {
  const seen = new Set<string>();
  const pool: AssistantSuggestion[] = [];

  const add = (text: string, source: AssistantSuggestionSource) => {
    const trimmed = text.trim();
    const key = normalizeText(trimmed);
    if (!trimmed || seen.has(key)) {
      return;
    }
    seen.add(key);
    pool.push({ text: trimmed, source });
  };

  DEFAULT_ASSISTANT_SUGGESTIONS.forEach((item) => add(item, 'suggested'));

  for (const message of input.messages ?? []) {
    if (message.type === 'user') {
      add(message.content, 'history');
    }
    for (const followUp of message.followUps ?? []) {
      add(followUp.label, 'follow-up');
    }
  }

  for (const title of input.threadTitles ?? []) {
    add(title, 'thread');
  }

  return pool;
}

export function filterAssistantSuggestions(
  pool: AssistantSuggestion[],
  query: string,
  limit = 8,
): AssistantSuggestion[] {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return pool.filter((item) => item.source === 'suggested').slice(0, 6);
  }

  const normalizedQuery = normalizeText(trimmedQuery);

  return pool
    .filter((item) => normalizeText(item.text).includes(normalizedQuery))
    .slice(0, limit);
}

export function getAssistantSuggestionSourceLabel(source: AssistantSuggestionSource): string {
  switch (source) {
    case 'history':
      return 'From this chat';
    case 'follow-up':
      return 'Suggested follow-up';
    case 'thread':
      return 'Past conversation';
    default:
      return 'Suggested question';
  }
}
