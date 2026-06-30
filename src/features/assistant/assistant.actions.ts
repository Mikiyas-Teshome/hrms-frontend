'use server';

import { gqlRequest, GraphQLService } from '@/lib/graphql-client';
import {
  CREATE_ASSISTANT_THREAD_MUTATION,
  DELETE_ASSISTANT_THREAD_MUTATION,
  GET_ASSISTANT_FILTER_OPTIONS_QUERY,
  GET_ASSISTANT_THREAD_QUERY,
  GET_ASSISTANT_THREADS_QUERY,
  SEND_ASSISTANT_MESSAGE_MUTATION,
} from './assistant.queries';
import {
  AssistantFilterOptionsResponse,
  AssistantThread,
  AssistantThreadsListResponse,
  CreateAssistantThreadInput,
  SendAssistantMessageInput,
  SendAssistantMessageResponse,
} from './assistant.types';

export const getAssistantFilterOptions = async (): Promise<AssistantFilterOptionsResponse> => {
  const data = await gqlRequest<{ assistantFilterOptions: AssistantFilterOptionsResponse }>(
    GraphQLService.REPORTING,
    GET_ASSISTANT_FILTER_OPTIONS_QUERY,
  );
  return data.assistantFilterOptions;
};

export const getAssistantThreads = async (limit = 20): Promise<AssistantThreadsListResponse> => {
  const data = await gqlRequest<{ assistantThreads: AssistantThreadsListResponse }>(
    GraphQLService.REPORTING,
    GET_ASSISTANT_THREADS_QUERY,
    { limit },
  );
  return data.assistantThreads;
};

export const getAssistantThread = async (id: string): Promise<AssistantThread> => {
  const data = await gqlRequest<{ assistantThread: AssistantThread }>(
    GraphQLService.REPORTING,
    GET_ASSISTANT_THREAD_QUERY,
    { id },
  );
  return data.assistantThread;
};

export const createAssistantThread = async (
  input?: CreateAssistantThreadInput,
): Promise<AssistantThread> => {
  const data = await gqlRequest<{ createAssistantThread: AssistantThread }>(
    GraphQLService.REPORTING,
    CREATE_ASSISTANT_THREAD_MUTATION,
    { input: input ?? null },
  );
  return data.createAssistantThread;
};

export const sendAssistantMessage = async (
  input: SendAssistantMessageInput,
): Promise<SendAssistantMessageResponse> => {
  const data = await gqlRequest<{ sendAssistantMessage: SendAssistantMessageResponse }>(
    GraphQLService.REPORTING,
    SEND_ASSISTANT_MESSAGE_MUTATION,
    { input },
  );
  return data.sendAssistantMessage;
};

export const deleteAssistantThread = async (id: string): Promise<boolean> => {
  const data = await gqlRequest<{ deleteAssistantThread: boolean }>(
    GraphQLService.REPORTING,
    DELETE_ASSISTANT_THREAD_MUTATION,
    { id },
  );
  return data.deleteAssistantThread;
};
