import { DefaultOptions } from "@tanstack/react-query";

export const QUERY_STALE_TIME = 60 * 1000;
export const QUERY_GC_TIME = 5 * 60 * 1000;

interface ErrorWithStatus {
  response?: { status?: number };
  status?: number;
}

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= 1) return false;

  const status = (error as ErrorWithStatus)?.response?.status || (error as ErrorWithStatus)?.status;

  if (status) {
    // Don't retry with auth or client errors (4xx)
    if (status === 401 || status === 403 || (status >= 400 && status < 500)) {
      return false;
    }
  }

  return true;
}

export const defaultQueryOptions: DefaultOptions = {
  queries: {
    staleTime: QUERY_STALE_TIME,
    gcTime: QUERY_GC_TIME,
    retry: shouldRetry,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: true,
  },
};