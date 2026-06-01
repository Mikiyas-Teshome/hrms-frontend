import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchEmployees,
  fetchPaginatedEmployees,
  fetchEmployee,
  createEmployee,
  updateEmployee,
  updateMyEmployeeProfile,
  deleteEmployee,
  fetchMyEmployeeProfile,
  initiateTransfer,
  inviteEmployee,
  fetchEmployeeTransferHistory,
  recordTransfer,
  updateEmployeeStatus,
} from '../employee.actions';
import {
  CreateEmployeeInput,
  UpdateEmployeeInput,
  UpdateMyEmployeeProfileInput,
  EmployeesFilters,
  EmployeeListFilterInput,
  PaginationInput,
  TransferEmployeeInput,
  CreateInvitationInput,
  RecordTransferInput,
  UpdateEmployeeStatusInput,
} from '../employee.types';

export const useEmployees = (filters: EmployeesFilters = {}, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['employees', filters],
    queryFn: async () => {
      const data = await fetchEmployees(filters);
      return data;
    },
    enabled: options?.enabled ?? true,
  });
};

export const usePaginatedEmployees = (
  pagination: PaginationInput = {},
  filter: EmployeeListFilterInput = {},
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ['employees', 'paginated', pagination, filter],
    queryFn: () => fetchPaginatedEmployees(pagination, filter),
    enabled: options?.enabled ?? true,
  });
};

export const useEmployee = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => fetchEmployee(id),
    enabled: options?.enabled ?? !!id,
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateEmployeeInput) => {
      const result = await createEmployee(input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

export const useUpdateMyEmployeeProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateMyEmployeeProfileInput) => {
      const result = await updateMyEmployeeProfile(input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', 'profile'] });
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateEmployeeInput }) => {
      const result = await updateEmployee(id, input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['employee', 'profile'] });
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteEmployee(id);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

export const useMyEmployeeProfile = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['employee', 'profile'],
    queryFn: () => fetchMyEmployeeProfile(),
    enabled: options?.enabled ?? true,
  });
};

export const useInitiateTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: TransferEmployeeInput) => {
      const result = await initiateTransfer(input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

export const useInviteEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateInvitationInput) => {
      const result = await inviteEmployee(input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

export const useEmployeeTransferHistory = (employeeId: string) => {
  return useQuery({
    queryKey: ['employee-transfer-history', employeeId],
    queryFn: () => fetchEmployeeTransferHistory(employeeId),
    enabled: !!employeeId,
  });
};

export const useRecordTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: RecordTransferInput) => {
      const result = await recordTransfer(input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employee-transfer-history', variables.employeeId] });
    },
  });
};

export const useUpdateEmployeeStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateEmployeeStatusInput }) => {
      const result = await updateEmployeeStatus(id, input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', variables.id] });
    },
  });
};
