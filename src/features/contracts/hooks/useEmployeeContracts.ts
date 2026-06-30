import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchEmployeeContracts,
  fetchMyEmployeeContracts,
  fetchEmployeeContract,
  fetchActiveEmployeeContractByTemplate,
  assignEmployeeContract,
  updateDraftEmployeeContract,
  renewEmployeeContract,
  activateEmployeeContract,
  activateMyEmployeeContract,
  rejectMyEmployeeContract,
} from '../employee-contract.actions';
import {
  EmployeeContractFilterInput,
  ActiveEmployeeContractByTemplateFilter,
  AssignEmployeeContractInput,
  UpdateDraftEmployeeContractInput,
  RenewEmployeeContractInput,
} from '../employee-contract.types';

export const useEmployeeContracts = (
  filter: EmployeeContractFilterInput = {},
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ['employee-contracts', filter],
    queryFn: () => fetchEmployeeContracts(filter),
    enabled: options?.enabled ?? true,
  });
};

export const useMyEmployeeContracts = (
  filter: EmployeeContractFilterInput = {},
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ['employee-contracts', 'my', filter],
    queryFn: () => fetchMyEmployeeContracts(filter),
    enabled: options?.enabled ?? true,
  });
};

export const useEmployeeContract = (id: string) => {
  return useQuery({
    queryKey: ['employee-contract', id],
    queryFn: () => fetchEmployeeContract(id),
    enabled: !!id,
  });
};

export const useActiveEmployeeContractByTemplate = (
  input: ActiveEmployeeContractByTemplateFilter | null,
) => {
  return useQuery({
    queryKey: ['employee-contract', 'active-by-template', input],
    queryFn: () => fetchActiveEmployeeContractByTemplate(input!),
    enabled: !!input?.employeeId && !!input?.contractId,
  });
};

const invalidateEmployeeContractQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ['employee-contracts'] });
  queryClient.invalidateQueries({ queryKey: ['employee-contract'] });
  queryClient.invalidateQueries({ queryKey: ['employee'] });
  queryClient.invalidateQueries({ queryKey: ['myEmployee'] });
};

export const useAssignEmployeeContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: AssignEmployeeContractInput) => {
      const result = await assignEmployeeContract(input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => invalidateEmployeeContractQueries(queryClient),
  });
};

export const useUpdateDraftEmployeeContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: UpdateDraftEmployeeContractInput;
    }) => {
      const result = await updateDraftEmployeeContract(id, input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => invalidateEmployeeContractQueries(queryClient),
  });
};

export const useRenewEmployeeContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: RenewEmployeeContractInput }) => {
      const result = await renewEmployeeContract(id, input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => invalidateEmployeeContractQueries(queryClient),
  });
};

export const useActivateEmployeeContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await activateEmployeeContract(id);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => invalidateEmployeeContractQueries(queryClient),
  });
};

export const useActivateMyEmployeeContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await activateMyEmployeeContract(id);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => invalidateEmployeeContractQueries(queryClient),
  });
};

export const useRejectMyEmployeeContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await rejectMyEmployeeContract(id);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => invalidateEmployeeContractQueries(queryClient),
  });
};

