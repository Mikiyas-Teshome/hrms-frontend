import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchInsurances,
  fetchInsuranceStats,
  createInsurance,
  updateInsurance,
  updateInsuranceStatus,
  deleteInsurance,
} from '../insurance.actions';
import {
  CreateInsuranceInput,
  UpdateInsuranceInput,
  UpdateInsuranceStatusInput,
  InsuranceFilterInput,
} from '../insurance.types';

export const useInsurances = (
  filter: InsuranceFilterInput = {},
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ['insurances', filter],
    queryFn: () => fetchInsurances(filter),
    enabled: options?.enabled ?? true,
  });
};

export const useInsuranceStats = (ouId?: string) => {
  return useQuery({
    queryKey: ['insuranceStats', ouId],
    queryFn: () => fetchInsuranceStats(ouId),
  });
};

export const useCreateInsurance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInsuranceInput) => createInsurance(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurances'] });
      queryClient.invalidateQueries({ queryKey: ['insuranceStats'] });
    },
  });
};

export const useUpdateInsurance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateInsuranceInput }) =>
      updateInsurance(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurances'] });
      queryClient.invalidateQueries({ queryKey: ['insuranceStats'] });
    },
  });
};

export const useUpdateInsuranceStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateInsuranceStatusInput }) =>
      updateInsuranceStatus(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurances'] });
      queryClient.invalidateQueries({ queryKey: ['insuranceStats'] });
    },
  });
};

export const useDeleteInsurance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteInsurance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurances'] });
      queryClient.invalidateQueries({ queryKey: ['insuranceStats'] });
    },
  });
};
