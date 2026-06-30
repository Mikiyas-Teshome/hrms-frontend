import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createLeavePolicy,
  deleteLeavePolicy,
  fetchLeavePoliciesPaginated,
  fetchLeavePolicyDetail,
  fetchLeavePolicyStats,
  updateLeavePolicy,
  updateLeavePolicyStatus,
} from '../leave-policy.actions';
import {
  CreateLeavePolicyInput,
  LeavePolicyFilterInput,
  LeavePolicyPaginationInput,
  LeavePolicyStatus,
  UpdateLeavePolicyInput,
} from '../leave-policy.types';

const invalidateLeavePolicyQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  companyOuId?: string,
) => {
  queryClient.invalidateQueries({ queryKey: ['leave-policy-stats'] });
  queryClient.invalidateQueries({ queryKey: ['leave-policies'] });
  queryClient.invalidateQueries({ queryKey: ['leaveBalances'] });
  queryClient.invalidateQueries({ queryKey: ['leaveBalanceStats'] });
  queryClient.invalidateQueries({ queryKey: ['leaveBalanceFilterOptions'] });
  if (companyOuId) {
    queryClient.invalidateQueries({ queryKey: ['leave-policy-stats', companyOuId] });
    queryClient.invalidateQueries({ queryKey: ['leave-policies', companyOuId] });
    queryClient.invalidateQueries({ queryKey: ['leaveBalances', companyOuId] });
    queryClient.invalidateQueries({ queryKey: ['leaveBalanceStats', companyOuId] });
    queryClient.invalidateQueries({ queryKey: ['leaveBalanceFilterOptions', companyOuId] });
  }
};

export const useLeavePolicyStats = (companyOuId?: string) => {
  return useQuery({
    queryKey: ['leave-policy-stats', companyOuId],
    queryFn: () => fetchLeavePolicyStats(companyOuId!),
    enabled: !!companyOuId,
  });
};

export const useLeavePoliciesPaginated = (
  companyOuId?: string,
  filter?: LeavePolicyFilterInput,
  pagination?: LeavePolicyPaginationInput,
) => {
  return useQuery({
    queryKey: ['leave-policies', companyOuId, filter, pagination],
    queryFn: () => fetchLeavePoliciesPaginated(companyOuId!, filter, pagination),
    enabled: !!companyOuId,
  });
};

export const useLeavePolicy = (id: string) => {
  return useQuery({
    queryKey: ['leave-policy', id],
    queryFn: () => fetchLeavePolicyDetail(id),
    enabled: !!id,
  });
};

export const useCreateLeavePolicy = (companyOuId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLeavePolicyInput) => createLeavePolicy(input),
    onSuccess: (_data, input) =>
      invalidateLeavePolicyQueries(queryClient, input.companyOuId ?? companyOuId),
  });
};

export const useUpdateLeavePolicy = (companyOuId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateLeavePolicyInput }) =>
      updateLeavePolicy(id, input),
    onSuccess: (_data, variables) => {
      invalidateLeavePolicyQueries(queryClient, companyOuId);
      queryClient.invalidateQueries({ queryKey: ['leave-policy', variables.id] });
    },
  });
};

export const useUpdateLeavePolicyStatus = (companyOuId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeavePolicyStatus }) =>
      updateLeavePolicyStatus(id, status),
    onSuccess: () => invalidateLeavePolicyQueries(queryClient, companyOuId),
  });
};

export const useDeleteLeavePolicy = (companyOuId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLeavePolicy(id),
    onSuccess: () => invalidateLeavePolicyQueries(queryClient, companyOuId),
  });
};
