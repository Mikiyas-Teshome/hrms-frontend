import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createTaxRuleAction,
  deleteTaxRuleAction,
  fetchTaxRules,
  updateTaxRuleAction,
} from '../tax-rules.actions';
import { CreateTaxRuleInput, UpdateTaxRuleInput } from '../tax-rules.types';

export const useTaxRules = (companyId?: string) => {
  return useQuery({
    queryKey: ['tax-rules', { companyId }],
    queryFn: () => fetchTaxRules(companyId),
    enabled: !!companyId,
  });
};

export const useCreateTaxRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTaxRuleInput) => createTaxRuleAction(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-rules'] });
    },
  });
};

export const useUpdateTaxRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaxRuleInput }) =>
      updateTaxRuleAction(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-rules'] });
    },
  });
};

export const useDeleteTaxRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTaxRuleAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-rules'] });
    },
  });
};
