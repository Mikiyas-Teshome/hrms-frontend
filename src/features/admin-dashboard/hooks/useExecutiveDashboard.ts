'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getExecutiveDashboard,
  updateExecutiveDashboard,
} from '@/features/admin-dashboard/executive-dashboard.actions';
import type {
  ExecutiveDashboardResponse,
  UpdateExecutiveDashboardInput,
} from '@/features/admin-dashboard/executive-dashboard.types';

export const EXECUTIVE_DASHBOARD_QUERY_KEY = ['executive-dashboard'] as const;

export function useExecutiveDashboard(enabled = true) {
  return useQuery({
    queryKey: EXECUTIVE_DASHBOARD_QUERY_KEY,
    queryFn: async () => {
      const result = await getExecutiveDashboard();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateExecutiveDashboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateExecutiveDashboardInput) => {
      const result = await updateExecutiveDashboard(input);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data: ExecutiveDashboardResponse) => {
      queryClient.setQueryData(EXECUTIVE_DASHBOARD_QUERY_KEY, data);
    },
  });
}
