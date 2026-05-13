import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchAllowances,
  createAllowance,
  deleteAllowance,
} from '../allowance.actions';
import { CreateAllowanceInput } from '../allowance.types';

export const useAllowances = (companyId?: string) => {
  return useQuery({
    queryKey: ['allowances', { companyId }],
    queryFn: () => fetchAllowances(companyId!),
    enabled: !!companyId,
  });
};

export const useCreateAllowance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAllowanceInput) => createAllowance(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allowances'] });
    },
  });
};

export const useDeleteAllowance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAllowance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allowances'] });
    },
  });
};
