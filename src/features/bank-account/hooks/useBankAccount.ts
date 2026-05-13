import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchBankAccounts,
  fetchBankAccount,
  createBankAccount,
  updateBankAccount,
  removeBankAccount,
} from '../bank-account.actions';
import {
  CreateBankAccountInput,
  UpdateBankAccountInput,
} from '../bank-account.types';

export const useBankAccounts = (employeeId: string) => {
  return useQuery({
    queryKey: ['bank-accounts', employeeId],
    queryFn: () => fetchBankAccounts(employeeId),
    enabled: !!employeeId,
  });
};

export const useBankAccount = (id: string) => {
  return useQuery({
    queryKey: ['bank-account', id],
    queryFn: () => fetchBankAccount(id),
    enabled: !!id,
  });
};

export const useCreateBankAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateBankAccountInput) => {
      const result = await createBankAccount(input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts', variables.employeeId] });
    },
  });
};

export const useUpdateBankAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateBankAccountInput }) => {
      const result = await updateBankAccount(id, input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts', data.employeeId] });
      queryClient.invalidateQueries({ queryKey: ['bank-account', data.id] });
    },
  });
};

export const useRemoveBankAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await removeBankAccount(id);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts', data.employeeId] });
    },
  });
};
