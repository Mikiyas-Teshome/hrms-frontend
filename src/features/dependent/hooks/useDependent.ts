import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchDependents,
  createDependent,
  updateDependent,
  removeDependent,
} from '../dependent.actions';
import {
  CreateDependentInput,
  UpdateDependentInput,
} from '../dependent.types';

export const useDependents = (employeeId: string) => {
  return useQuery({
    queryKey: ['dependents', employeeId],
    queryFn: () => fetchDependents(employeeId),
    enabled: !!employeeId,
  });
};

export const useCreateDependent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDependentInput) => createDependent(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dependents', variables.employeeId] });
    },
  });
};

export const useUpdateDependent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateDependentInput }) =>
      updateDependent(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dependents', data.employeeId] });
    },
  });
};

export const useRemoveDependent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeDependent(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dependents', data.employeeId] });
    },
  });
};
