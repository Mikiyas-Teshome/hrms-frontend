import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchPayrollConfig,
  fetchUpcomingPayrollDate,
  fetchPayrollRun,
  fetchPayrollRuns,
  fetchPayslip,
  fetchPayslipsByEmployee,
  fetchPayslipsByPayrollRun,
  fetchSalaryStructure,
  createPayrollRun,
  finalizePayrollRun,
  markPayrollRunPaid,
  generatePayslip,
  generateWpsFile,
  updatePayrollConfig,
  createSalaryStructure,
  addAllowanceToSalaryStructure,
  removeAllowanceFromSalaryStructure,
  addDeductionToSalaryStructure,
  removeDeductionFromSalaryStructure,
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
  GenerateWpsInput,
  UpdatePayrollConfigInput,
  CreateSalaryStructureInput,
  CreatePayrollComponentInput,
  UpdatePayrollComponentInput,
  UpsertPayrollComponentInput,
  PayrollComponentType,
  SalaryStructureResponse,
  PayrollComponent,
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

export const usePayrollComponents = (companyId?: string, isActive?: boolean) => {
  return useQuery({
    queryKey: ['payroll-components', { companyId, isActive }],
    queryFn: () => fetchPayrollComponents(companyId!, isActive),
    enabled: !!companyId,
  });
};

export const usePayrollRuns = (companyId?: string) => {
  return useQuery({
    queryKey: ['payroll-runs', { companyId }],
    queryFn: () => fetchPayrollRuns(companyId!),
    enabled: !!companyId,
  });
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

export const usePayslipsByEmployee = (employeeId: string) => {
  return useQuery({
    queryKey: ['payslips', 'employee', employeeId],
    queryFn: () => fetchPayslipsByEmployee(employeeId),
    enabled: !!employeeId,
  });
};

export const usePayslipsByPayrollRun = (payrollRunId: string) => {
  return useQuery({
    queryKey: ['payslips', 'payroll-run', payrollRunId],
    queryFn: () => fetchPayslipsByPayrollRun(payrollRunId),
    enabled: !!payrollRunId,
  });
};

export const useSalaryStructure = (employeeId: string) => {
  return useQuery({
    queryKey: ['salary-structure', employeeId],
    queryFn: () => fetchSalaryStructure(employeeId),
    enabled: !!employeeId,
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
      queryClient.invalidateQueries({ queryKey: ['payslips', 'employee', variables.employeeId] });
      queryClient.invalidateQueries({ queryKey: ['payslips', 'payroll-run', variables.payrollRunId] });
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
      queryClient.setQueryData(['payroll-config'], updatedConfig);
    },
  });
};

export const useCreateSalaryStructure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateSalaryStructureInput) => {
      const result = await createSalaryStructure(input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['salary-structure', variables.employeeId] });
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
      queryClient.invalidateQueries({ queryKey: ['salary-structure', data.employeeId] });
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
      queryClient.invalidateQueries({ queryKey: ['salary-structure', data.employeeId] });
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
      queryClient.invalidateQueries({ queryKey: ['salary-structure', data.employeeId] });
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
      queryClient.invalidateQueries({ queryKey: ['salary-structure', data.employeeId] });
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
    onSuccess: (_, variables) => {
      if (variables.componentType === PayrollComponentType.ALLOWANCE) {
        queryClient.invalidateQueries({ queryKey: ['allowances'] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['deductions'] });
      }
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
      queryClient.invalidateQueries({ queryKey: ['allowances'] });
      queryClient.invalidateQueries({ queryKey: ['deductions'] });
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
    onSuccess: (updatedComponents, variables) => {
      const companyId = variables[0]?.companyId;
      
      // Update the main components list cache
      queryClient.setQueryData(['payroll-components', { companyId, isActive: undefined }], (old: PayrollComponent[] | undefined) => {
        if (!old) return updatedComponents;
        
        // Merge updated components into the existing list
        const updatedIds = new Set(updatedComponents.map(c => c.id));
        const filteredOld = old.filter(c => !updatedIds.has(c.id));
        return [...filteredOld, ...updatedComponents];
      });

      // Also update specific caches for allowances and deductions if they exist
      queryClient.invalidateQueries({ queryKey: ['allowances', { companyId }] });
      queryClient.invalidateQueries({ queryKey: ['deductions', { companyId }] });
    },
  });
};

export const useDeletePayrollComponent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, componentType }: { id: string; componentType: PayrollComponentType }) => {
      const result = await deletePayrollComponent(id, componentType);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.setQueryData(['payroll-components', { isActive: undefined }], (old: any[] | undefined) => {
        return old?.filter(c => c.id !== id);
      });
      queryClient.invalidateQueries({ queryKey: ['allowances'] });
      queryClient.invalidateQueries({ queryKey: ['deductions'] });
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
    onSuccess: (_, variables) => {
      if (variables.componentType === PayrollComponentType.ALLOWANCE) {
        queryClient.invalidateQueries({ queryKey: ['allowances'] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['deductions'] });
      }
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
