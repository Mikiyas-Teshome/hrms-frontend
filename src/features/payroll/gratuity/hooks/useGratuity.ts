import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchCompanyGratuities,
  fetchEmployeeGratuity,
  calculateGratuity,
  calculateEos,
} from '../gratuity.actions';
import { CalculateGratuityInput, CalculateEosInput } from '../gratuity.types';

export const useCompanyGratuities = (companyId: string) => {
  return useQuery({
    queryKey: ['gratuities', 'company', companyId],
    queryFn: () => fetchCompanyGratuities(companyId),
    enabled: !!companyId,
  });
};

export const useEmployeeGratuity = (employeeId: string) => {
  return useQuery({
    queryKey: ['gratuity', 'employee', employeeId],
    queryFn: () => fetchEmployeeGratuity(employeeId),
    enabled: !!employeeId,
  });
};

export const useCalculateGratuity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CalculateGratuityInput) => calculateGratuity(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gratuity', 'employee', variables.employeeId] });
      queryClient.invalidateQueries({ queryKey: ['gratuities'] });
    },
  });
};

export const useCalculateEos = () => {
  return useMutation({
    mutationFn: (input: CalculateEosInput) => calculateEos(input),
  });
};
