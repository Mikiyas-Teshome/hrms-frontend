import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAssistantThread,
  deleteAssistantThread,
  getAssistantFilterOptions,
  getAssistantThread,
  getAssistantThreads,
  sendAssistantMessage,
} from './assistant.actions';
import { CreateAssistantThreadInput, SendAssistantMessageInput } from './assistant.types';

export const useAssistantFilterOptions = () =>
  useQuery({
    queryKey: ['assistant-filter-options'],
    queryFn: () => getAssistantFilterOptions(),
    staleTime: 5 * 60 * 1000,
  });

export const useAssistantThreads = (limit = 20, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: ['assistant-threads', limit],
    queryFn: () => getAssistantThreads(limit),
    enabled: options?.enabled ?? true,
  });

export const useAssistantThread = (threadId?: string) =>
  useQuery({
    queryKey: ['assistant-thread', threadId],
    queryFn: () => getAssistantThread(threadId as string),
    enabled: !!threadId,
    staleTime: 0,
  });

export const useCreateAssistantThread = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input?: CreateAssistantThreadInput) => createAssistantThread(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assistant-threads'] });
    },
  });
};

export const useSendAssistantMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SendAssistantMessageInput) => sendAssistantMessage(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assistant-threads'] });
    },
  });
};

export const useDeleteAssistantThread = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAssistantThread(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assistant-threads'] });
    },
  });
};
