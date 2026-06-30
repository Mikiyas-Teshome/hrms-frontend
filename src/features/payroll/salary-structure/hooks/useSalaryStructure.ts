import { useMutation, useQuery, useQueries, useQueryClient } from '@tanstack/react-query';
import {
  fetchSalaryStructures,
  fetchSalaryStructureById,
  fetchEmployeeSalaryStructure,
  fetchMySalaryStructure,
  createSalaryStructure,
  updateSalaryStructure,
  deleteSalaryStructure,
  assignEmployeeSalary,
  addAllowanceToSalaryStructure,
  removeAllowanceFromSalaryStructure,
  addDeductionToSalaryStructure,
  removeDeductionFromSalaryStructure,
} from '../salary-structure.actions';
import {
  AssignEmployeeSalaryInput,
  CreateSalaryStructureInput,
  UpdateSalaryStructureInput,
  SalaryStructureResponse,
} from '../salary-structure.types';

export const useSalaryStructures = (companyId?: string) => {
  return useQuery({
    queryKey: ['salary-structures', { companyId }],
    queryFn: () => fetchSalaryStructures(companyId!),
    enabled: !!companyId,
  });
};

export const useSalaryStructureById = (id: string) => {
  return useQuery({
    queryKey: ['salary-structure', id],
    queryFn: () => fetchSalaryStructureById(id),
    enabled: !!id,
  });
};

export const useEmployeeSalaryStructure = (employeeId: string, companyId?: string) => {
  return useQuery({
    queryKey: ['employee-salary-structure', employeeId, companyId],
    queryFn: () => fetchEmployeeSalaryStructure(employeeId, companyId!),
    enabled: !!employeeId && !!companyId,
  });
};

export const useMySalaryStructure = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['my-salary-structure'],
    queryFn: () => fetchMySalaryStructure(),
    enabled: options?.enabled ?? true,
  });
};

export const useEmployeeSalaryStructuresMap = (
  employeeIds: string[],
  companyId?: string,
) => {
  const queries = useQueries({
    queries: employeeIds.map((employeeId) => ({
      queryKey: ['employee-salary-structure', employeeId, companyId],
      queryFn: () => fetchEmployeeSalaryStructure(employeeId, companyId!),
      enabled: Boolean(employeeId && companyId),
      staleTime: 60_000,
    })),
  });

  const map = new Map<string, SalaryStructureResponse | null>();
  employeeIds.forEach((employeeId, index) => {
    map.set(employeeId, queries[index]?.data ?? null);
  });

  return {
    map,
    isLoading: queries.some((query) => query.isLoading),
  };
};

export const useCreateSalaryStructure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateSalaryStructureInput) => {
      const result = await createSalaryStructure(input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-structures'] });
    },
  });
};

export const useUpdateSalaryStructure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateSalaryStructureInput }) => {
      const result = await updateSalaryStructure(id, input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['salary-structure', variables.id] });
      queryClient.invalidateQueries({
        queryKey: ['salary-structures', { companyId: variables.input.companyId }],
      });
    },
  });
};

export const useDeleteSalaryStructure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, companyId }: { id: string; companyId: string }) => {
      const result = await deleteSalaryStructure(id, companyId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['salary-structures', { companyId: variables.companyId }],
      });
      queryClient.removeQueries({ queryKey: ['salary-structure', variables.id] });
    },
  });
};

export const useAssignEmployeeSalary = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: AssignEmployeeSalaryInput) => {
      const result = await assignEmployeeSalary(input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['employee-salary-structure', variables.employeeId, variables.companyId],
      });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

export const useAddAllowanceToSalaryStructure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ salaryStructureId, allowanceId }: { salaryStructureId: string; allowanceId: string }) => {
      const result = await addAllowanceToSalaryStructure(salaryStructureId, allowanceId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (data: SalaryStructureResponse) => {
      queryClient.invalidateQueries({ queryKey: ['salary-structure', data.id] });
      queryClient.invalidateQueries({ queryKey: ['salary-structures'] });
      if (data.employeeId) {
        queryClient.invalidateQueries({ queryKey: ['employee-salary-structure', data.employeeId] });
      }
    },
  });
};

export const useRemoveAllowanceFromSalaryStructure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ salaryStructureId, allowanceId }: { salaryStructureId: string; allowanceId: string }) => {
      const result = await removeAllowanceFromSalaryStructure(salaryStructureId, allowanceId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (data: SalaryStructureResponse) => {
      queryClient.invalidateQueries({ queryKey: ['salary-structure', data.id] });
      queryClient.invalidateQueries({ queryKey: ['salary-structures'] });
      if (data.employeeId) {
        queryClient.invalidateQueries({ queryKey: ['employee-salary-structure', data.employeeId] });
      }
    },
  });
};

export const useAddDeductionToSalaryStructure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ salaryStructureId, deductionId }: { salaryStructureId: string; deductionId: string }) => {
      const result = await addDeductionToSalaryStructure(salaryStructureId, deductionId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (data: SalaryStructureResponse) => {
      queryClient.invalidateQueries({ queryKey: ['salary-structure', data.id] });
      queryClient.invalidateQueries({ queryKey: ['salary-structures'] });
      if (data.employeeId) {
        queryClient.invalidateQueries({ queryKey: ['employee-salary-structure', data.employeeId] });
      }
    },
  });
};

export const useRemoveDeductionFromSalaryStructure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ salaryStructureId, deductionId }: { salaryStructureId: string; deductionId: string }) => {
      const result = await removeDeductionFromSalaryStructure(salaryStructureId, deductionId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (data: SalaryStructureResponse) => {
      queryClient.invalidateQueries({ queryKey: ['salary-structure', data.id] });
      queryClient.invalidateQueries({ queryKey: ['salary-structures'] });
      if (data.employeeId) {
        queryClient.invalidateQueries({ queryKey: ['employee-salary-structure', data.employeeId] });
      }
    },
  });
};
