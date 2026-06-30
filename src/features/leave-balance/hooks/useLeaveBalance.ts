import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchLeaveBalanceStats,
  fetchLeaveBalancesPaginated,
  fetchLeaveBalanceDetail,
  fetchLeaveBalanceFilterOptions,
  updateLeaveBalance,
  deleteLeaveBalance,
} from '../leave-balance.actions';
import {
  LeaveBalanceFilterInput,
  LeaveBalancePaginationInput,
  UpdateLeaveBalanceInput,
} from '../leave-balance.types';

export const useLeaveBalanceStats = (companyOuId?: string, year?: number) => {
  return useQuery({
    queryKey: ['leaveBalanceStats', companyOuId, year],
    queryFn: () => fetchLeaveBalanceStats(companyOuId!, year),
    enabled: !!companyOuId,
  });
};

export const useLeaveBalancesPaginated = (
  companyOuId?: string,
  filter: LeaveBalanceFilterInput = {},
  pagination: LeaveBalancePaginationInput = {},
) => {
  return useQuery({
    queryKey: ['leaveBalances', companyOuId, filter, pagination],
    queryFn: () => fetchLeaveBalancesPaginated(companyOuId!, filter, pagination),
    enabled: !!companyOuId,
  });
};

export const useLeaveBalance = (id: string) => {
  return useQuery({
    queryKey: ['leaveBalance', id],
    queryFn: () => fetchLeaveBalanceDetail(id),
    enabled: !!id,
  });
};

export const useLeaveBalanceFilterOptions = (companyOuId?: string) => {
  return useQuery({
    queryKey: ['leaveBalanceFilterOptions', companyOuId],
    queryFn: () => fetchLeaveBalanceFilterOptions(companyOuId!),
    enabled: !!companyOuId,
  });
};

export const useUpdateLeaveBalance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateLeaveBalanceInput }) =>
      updateLeaveBalance(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveBalances'] });
      queryClient.invalidateQueries({ queryKey: ['leaveBalanceStats'] });
      queryClient.invalidateQueries({ queryKey: ['leaveBalance'] });
    },
  });
};

export const useDeleteLeaveBalance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLeaveBalance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveBalances'] });
      queryClient.invalidateQueries({ queryKey: ['leaveBalanceStats'] });
    },
  });
};
