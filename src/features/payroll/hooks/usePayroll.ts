import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchPayrollConfig,
  fetchUpcomingPayrollDate,
  fetchPayrollRun,
  fetchPayrollRuns,
  fetchPayrollRunsPaginated,
  fetchPayslip,
  fetchPayslipsPaginated,
  fetchEmployeePayrollPreview,
  createPayrollRun,
  finalizePayrollRun,
  markPayrollRunPaid,
  deletePayrollRun,
  generatePayslip,
  regeneratePayslip,
  generatePayrollRunPayslips,
  generateWpsFile,
  updatePayrollConfig,
  createPayrollComponent,
  createPayrollComponentsBatch,
  updatePayrollComponent,
  fetchPayrollComponents,
  fetchEmployeeSalaryHistory,
  upsertPayrollComponents,
  deletePayrollComponent,
} from '../payroll.actions';
import {
  CreatePayrollRunInput,
  GeneratePayslipInput,
  GeneratePayrollRunPayslipsInput,
  GenerateWpsInput,
  UpdatePayrollConfigInput,
  CreatePayrollComponentInput,
  UpdatePayrollComponentInput,
  UpsertPayrollComponentInput,
  PayrollComponentType,
  PayrollComponentFilterInput,
  PayrollComponentPaginationInput,
  PayrollComponentResponse,
  PAYROLL_COMPONENTS_ALL_PAGE_SIZE,
  PayrollRunFilterInput,
  PayrollRunPaginationInput,
  PayrollRunSortBy,
  PayrollRunListSortOrder,
  PayslipFilterInput,
  PayslipPaginationInput,
  PAYROLL_RUNS_ALL_PAGE_SIZE,
} from '../payroll.types';

export const usePayrollConfig = (companyId?: string) => {
  return useQuery({
    queryKey: ['payroll-config', { companyId }],
    queryFn: () => fetchPayrollConfig(companyId!),
    enabled: !!companyId,
  });
};

export const useUpcomingPayrollDate = (companyId?: string) => {
  return useQuery({
    queryKey: ['upcoming-payroll-date', { companyId }],
    queryFn: () => fetchUpcomingPayrollDate(companyId!),
    enabled: !!companyId,
  });
};

export const usePayrollComponents = (
  ouId?: string,
  filter?: PayrollComponentFilterInput,
  pagination?: PayrollComponentPaginationInput,
) => {
  return useQuery({
    queryKey: ['payroll-components', { ouId, filter, pagination }],
    queryFn: () => fetchPayrollComponents(ouId!, filter, pagination),
    enabled: !!ouId,
  });
};

export const useAllPayrollComponents = (
  ouId?: string,
  filter?: PayrollComponentFilterInput,
) => {
  return usePayrollComponents(ouId, filter, { size: PAYROLL_COMPONENTS_ALL_PAGE_SIZE });
};

export const usePayrollAllowances = (ouId?: string) => {
  const query = useAllPayrollComponents(ouId, { category: PayrollComponentType.ALLOWANCE });

  return {
    ...query,
    data: (query.data?.data ?? []) as PayrollComponentResponse[],
  };
};

export const usePayrollDeductions = (ouId?: string) => {
  const query = useAllPayrollComponents(ouId, { category: PayrollComponentType.DEDUCTION });

  return {
    ...query,
    data: (query.data?.data ?? []) as PayrollComponentResponse[],
  };
};

export const useEmployeePayrollPreview = (
  employeeId?: string,
  companyId?: string,
) => {
  return useQuery({
    queryKey: ['employee-payroll-preview', employeeId, companyId],
    queryFn: async () => {
      const result = await fetchEmployeePayrollPreview({
        employeeId: employeeId!,
        companyId: companyId!,
      });
      if (!result) {
        throw new Error('Failed to load payroll calculation');
      }
      return result;
    },
    enabled: !!employeeId && !!companyId,
  });
};

export const usePayrollRuns = (companyId?: string) => {
  return useQuery({
    queryKey: ['payroll-runs', { companyId }],
    queryFn: () => fetchPayrollRuns(companyId!),
    enabled: !!companyId,
  });
};

export const usePayrollRunsPaginated = (
  companyId?: string,
  filter?: PayrollRunFilterInput,
  pagination?: PayrollRunPaginationInput,
) => {
  return useQuery({
    queryKey: ['payroll-runs-paginated', { companyId, filter, pagination }],
    queryFn: () => fetchPayrollRunsPaginated(companyId!, filter, pagination),
    enabled: !!companyId,
  });
};

export const useAllPayrollRuns = (companyId?: string) => {
  return usePayrollRunsPaginated(
    companyId,
    {
      sortBy: PayrollRunSortBy.START_DATE,
      sortOrder: PayrollRunListSortOrder.DESC,
    },
    { page: 1, size: PAYROLL_RUNS_ALL_PAGE_SIZE },
  );
};

export const usePayrollRun = (id: string) => {
  return useQuery({
    queryKey: ['payroll-run', id],
    queryFn: () => fetchPayrollRun(id),
    enabled: !!id,
  });
};

export const usePayslip = (id: string) => {
  return useQuery({
    queryKey: ['payslip', id],
    queryFn: () => fetchPayslip(id),
    enabled: !!id,
  });
};

export const usePayslipsPaginated = (
  companyId: string | undefined,
  filter?: PayslipFilterInput,
  pagination?: PayslipPaginationInput,
  enabled = true,
) => {
  return useQuery({
    queryKey: ['payslips-paginated', companyId, filter, pagination],
    queryFn: () => fetchPayslipsPaginated(companyId!, filter, pagination),
    enabled: !!companyId && enabled,
  });
};

export const useCreatePayrollRun = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreatePayrollRunInput) => {
      const result = await createPayrollRun(input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-runs'] });
      queryClient.invalidateQueries({ queryKey: ['payroll-runs-paginated'] });
    },
  });
};

export const useFinalizePayrollRun = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await finalizePayrollRun(id);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['payroll-run', id] });
      queryClient.invalidateQueries({ queryKey: ['payroll-runs'] });
      queryClient.invalidateQueries({ queryKey: ['payroll-runs-paginated'] });
    },
  });
};

export const useMarkPayrollRunPaid = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await markPayrollRunPaid(id);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['payroll-run', id] });
      queryClient.invalidateQueries({ queryKey: ['payroll-runs'] });
      queryClient.invalidateQueries({ queryKey: ['payroll-runs-paginated'] });
    },
  });
};

export const useDeletePayrollRun = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deletePayrollRun(id);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-runs'] });
      queryClient.invalidateQueries({ queryKey: ['payroll-runs-paginated'] });
    },
  });
};

export const useGeneratePayslip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: GeneratePayslipInput) => {
      const result = await generatePayslip(input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payslips-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['payroll-runs'] });
      queryClient.invalidateQueries({ queryKey: ['payroll-runs-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['payroll-run', variables.payrollRunId] });
    },
  });
};

export const useRegeneratePayslip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: GeneratePayslipInput) => {
      const result = await regeneratePayslip(input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payslips-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['payslip'] });
      queryClient.invalidateQueries({ queryKey: ['payroll-runs'] });
      queryClient.invalidateQueries({ queryKey: ['payroll-runs-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['payroll-run', variables.payrollRunId] });
    },
  });
};

export const useGeneratePayrollRunPayslips = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: GeneratePayrollRunPayslipsInput) => {
      const result = await generatePayrollRunPayslips(input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payslips-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['payroll-runs'] });
      queryClient.invalidateQueries({ queryKey: ['payroll-runs-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['payroll-run', variables.payrollRunId] });
    },
  });
};

export const useGenerateWpsFile = () => {
  return useMutation({
    mutationFn: async (input: GenerateWpsInput) => {
      const result = await generateWpsFile(input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });
};

export const useUpdatePayrollConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdatePayrollConfigInput) => {
      const result = await updatePayrollConfig(input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (updatedConfig) => {
      queryClient.setQueryData(['payroll-config', { companyId: updatedConfig.companyId }], updatedConfig);
      queryClient.invalidateQueries({ queryKey: ['payroll-config'] });
      queryClient.invalidateQueries({ queryKey: ['salary-structures'] });
    },
  });
};

export const useCreatePayrollComponent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreatePayrollComponentInput) => {
      const result = await createPayrollComponent(input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-components'] });
    },
  });
};

export const useCreatePayrollComponentsBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (inputs: CreatePayrollComponentInput[]) => {
      const result = await createPayrollComponentsBatch(inputs);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-components'] });
    },
  });
};

export const useUpsertPayrollComponents = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (inputs: UpsertPayrollComponentInput[]) => {
      const result = await upsertPayrollComponents(inputs);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-components'] });
    },
  });
};

export const useDeletePayrollComponent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, category }: { id: string; category: PayrollComponentType }) => {
      const result = await deletePayrollComponent(id, category);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-components'] });
    },
  });
};

export const useUpdatePayrollComponent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdatePayrollComponentInput) => {
      const result = await updatePayrollComponent(input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-components'] });
    },
  });
};

export const useEmployeeSalaryHistory = (employeeId: string) => {
  return useQuery({
    queryKey: ['salary-history', employeeId],
    queryFn: () => fetchEmployeeSalaryHistory(employeeId),
    enabled: !!employeeId,
  });
};
