import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchBankAccounts,
  fetchMyBankAccounts,
  fetchBankAccount,
  createBankAccount,
  createMyBankAccount,
  updateBankAccount,
  updateMyBankAccount,
  removeBankAccount,
} from '../bank-account.actions';
import {
  BANK_ACCOUNTS_QUERY_KEY,
  MY_BANK_ACCOUNTS_QUERY_KEY,
} from '../bank-account.constants';
import {
  BankAccount,
  CreateBankAccountInput,
  CreateMyBankAccountInput,
  UpdateBankAccountInput,
} from '../bank-account.types';

const upsertBankAccountInCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  account: BankAccount,
) => {
  const merge = (current: BankAccount[] | undefined) => {
    const list = current ?? [];
    const index = list.findIndex((item) => item.id === account.id);
    if (index === -1) {
      return [account, ...list];
    }
    const next = [...list];
    next[index] = account;
    return next;
  };

  queryClient.setQueryData<BankAccount[]>(
    [BANK_ACCOUNTS_QUERY_KEY, account.employeeId],
    merge,
  );
  queryClient.setQueryData<BankAccount[]>([MY_BANK_ACCOUNTS_QUERY_KEY], merge);
};

const invalidateBankAccountQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  employeeId?: string,
) => {
  queryClient.invalidateQueries({ queryKey: [MY_BANK_ACCOUNTS_QUERY_KEY] });
  if (employeeId) {
    queryClient.invalidateQueries({ queryKey: [BANK_ACCOUNTS_QUERY_KEY, employeeId] });
  }
};

export const useBankAccounts = (employeeId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [BANK_ACCOUNTS_QUERY_KEY, employeeId],
    queryFn: () => fetchBankAccounts(employeeId),
    enabled: options?.enabled ?? !!employeeId,
  });
};

export const useMyBankAccounts = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [MY_BANK_ACCOUNTS_QUERY_KEY],
    queryFn: () => fetchMyBankAccounts(),
    enabled: options?.enabled ?? true,
  });
};

export const useBankAccount = (id: string) => {
  return useQuery({
    queryKey: ['bank-account', id],
    queryFn: () => fetchBankAccount(id),
    enabled: !!id,
  });
};

export const useCreateMyBankAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateMyBankAccountInput) => {
      const result = await createMyBankAccount(input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (data) => {
      upsertBankAccountInCache(queryClient, data);
      invalidateBankAccountQueries(queryClient, data.employeeId);
    },
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
    onSuccess: (data, variables) => {
      upsertBankAccountInCache(queryClient, data);
      invalidateBankAccountQueries(queryClient, variables.employeeId);
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
      upsertBankAccountInCache(queryClient, data);
      invalidateBankAccountQueries(queryClient, data.employeeId);
      queryClient.invalidateQueries({ queryKey: ['bank-account', data.id] });
    },
  });
};

export const useUpdateMyBankAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateBankAccountInput }) => {
      const result = await updateMyBankAccount(id, input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (data) => {
      upsertBankAccountInCache(queryClient, data);
      invalidateBankAccountQueries(queryClient, data.employeeId);
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
      invalidateBankAccountQueries(queryClient, data.employeeId);
    },
  });
};
