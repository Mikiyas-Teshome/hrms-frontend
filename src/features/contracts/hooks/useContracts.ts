import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchContracts,
  fetchContract,
  createContract,
  updateContract,
  deleteContract,
} from '../contracts.actions';
import {
  CreateContractInput,
  UpdateContractInput,
  ContractFilterInput,
} from '../contracts.types';

export const useContracts = (filter: ContractFilterInput = {}) => {
  return useQuery({
    queryKey: ['contracts', filter],
    queryFn: () => fetchContracts(filter),
  });
};

export const useContract = (id: string) => {
  return useQuery({
    queryKey: ['contract', id],
    queryFn: () => fetchContract(id),
    enabled: !!id,
  });
};

export const useCreateContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateContractInput) => {
      const result = await createContract(input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });
};

export const useUpdateContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateContractInput }) => {
      const result = await updateContract(id, input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });
};

export const useDeleteContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteContract(id);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });
};
