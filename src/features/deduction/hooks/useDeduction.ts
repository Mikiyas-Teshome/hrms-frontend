import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchDeductions,
  createDeduction,
  deleteDeduction,
} from '../deduction.actions';
import { CreateDeductionInput } from '../deduction.types';

export const useDeductions = (companyId?: string) => {
  return useQuery({
    queryKey: ['deductions', { companyId }],
    queryFn: () => fetchDeductions(companyId!),
    enabled: !!companyId,
  });
};

export const useCreateDeduction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDeductionInput) => createDeduction(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deductions'] });
    },
  });
};

export const useDeleteDeduction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDeduction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deductions'] });
    },
  });
};
