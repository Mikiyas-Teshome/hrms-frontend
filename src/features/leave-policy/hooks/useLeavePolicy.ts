import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchLeavePolicies,
  fetchLeavePolicy,
  createLeavePolicy,
  deleteLeavePolicy,
} from '../leave-policy.actions';
import {
  CreateLeavePolicyInput,
} from '../leave-policy.types';

export const useLeavePolicies = () => {
  return useQuery({
    queryKey: ['leave-policies'],
    queryFn: () => fetchLeavePolicies(),
  });
};

export const useLeavePolicy = (id: string) => {
  return useQuery({
    queryKey: ['leave-policy', id],
    queryFn: () => fetchLeavePolicy(id),
    enabled: !!id,
  });
};

export const useCreateLeavePolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLeavePolicyInput) => createLeavePolicy(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-policies'] });
    },
  });
};

export const useDeleteLeavePolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLeavePolicy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-policies'] });
    },
  });
};
