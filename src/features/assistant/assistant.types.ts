export type AssistantMessageRole = 'user' | 'assistant' | 'USER' | 'ASSISTANT';

export type AssistantMessageStatus =
  | 'answered'
  | 'clarification'
  | 'unsupported'
  | 'permission_denied'
  | 'error';

export type AssistantContextInput = {
  companyOuId?: string;
  divisionOuId?: string;
  datePreset?: string;
  focusArea?: string;
};

export type AssistantSummaryCard = {
  label: string;
  value: string;
  trend?: string;
};

export type AssistantMessage = {
  id: string;
  role: AssistantMessageRole;
  content: string;
  status: AssistantMessageStatus;
  followUpSuggestions?: string[];
  summaryCards?: AssistantSummaryCard[];
  toolCalls?: Array<{ name: string; scopeApplied?: string }>;
  executionTimeMs?: number;
  createdAt: string;
};

export type AssistantThread = {
  id: string;
  title: string;
  contextFilters?: string;
  createdAt: string;
  updatedAt: string;
  messages?: AssistantMessage[];
};

export type AssistantThreadsListResponse = {
  total: number;
  items: AssistantThread[];
};

export type SendAssistantMessageInput = {
  threadId?: string;
  query: string;
  context?: AssistantContextInput;
};

export type SendAssistantMessageResponse = {
  threadId: string;
  filtersApplied?: string;
  message: AssistantMessage;
};

export type CreateAssistantThreadInput = {
  title?: string;
  context?: AssistantContextInput;
};

export type AssistantFilterChip = {
  label: string;
  rounded?: boolean;
};

export type AssistantSelectOption = {
  id: string;
  label: string;
};

export type AssistantFilterOptionsResponse = {
  organizations: AssistantSelectOption[];
  focusAreas: AssistantSelectOption[];
  datePresets: AssistantSelectOption[];
};
