import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchOvertimePolicies,
  fetchOvertimePolicy,
  createOvertimePolicy,
  createOvertimePoliciesBatch,
  updateOvertimePolicy,
  deleteOvertimePolicy,
} from '../overtime-policy.actions';
import { CreateOvertimePolicyInput, UpdateOvertimePolicyInput } from '../overtime-policy.types';

export const useOvertimePolicies = (companyId?: string) => {
  return useQuery({
    queryKey: ['overtime-policies', { companyId }],
    queryFn: () => fetchOvertimePolicies(companyId!),
    enabled: !!companyId,
  });
};

export const useOvertimePolicy = (id: string) => {
  return useQuery({
    queryKey: ['overtime-policy', id],
    queryFn: () => fetchOvertimePolicy(id),
    enabled: !!id,
  });
};

export const useCreateOvertimePolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateOvertimePolicyInput) => {
      const result = await createOvertimePolicy(input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['overtime-policies'] });
    },
  });
};

export const useCreateOvertimePoliciesBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (inputs: CreateOvertimePolicyInput[]) => {
      const result = await createOvertimePoliciesBatch(inputs);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['overtime-policies'] });
    },
  });
};

export const useUpdateOvertimePolicy = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateOvertimePolicyInput) => {
      const result = await updateOvertimePolicy(id, input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['overtime-policy', id] });
      queryClient.invalidateQueries({ queryKey: ['overtime-policies'] });
    },
  });
};

export const useDeleteOvertimePolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteOvertimePolicy(id);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['overtime-policies'] });
    },
  });
};
