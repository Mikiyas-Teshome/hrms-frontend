import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchMedicalInsurances,
  createMedicalInsurance,
  updateMedicalInsurance,
  removeMedicalInsurance,
} from '../medical-insurance.actions';
import {
  CreateMedicalInsuranceInput,
  UpdateMedicalInsuranceInput,
} from '../medical-insurance.types';

export const useMedicalInsurances = (employeeId: string) => {
  return useQuery({
    queryKey: ['medical-insurances', employeeId],
    queryFn: () => fetchMedicalInsurances(employeeId),
    enabled: !!employeeId,
  });
};

export const useCreateMedicalInsurance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMedicalInsuranceInput) => createMedicalInsurance(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['medical-insurances', variables.employeeId] });
    },
  });
};

export const useUpdateMedicalInsurance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateMedicalInsuranceInput }) =>
      updateMedicalInsurance(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['medical-insurances', data.employeeId] });
    },
  });
};

export const useRemoveMedicalInsurance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeMedicalInsurance(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['medical-insurances', data.employeeId] });
    },
  });
};
