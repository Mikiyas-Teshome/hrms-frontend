import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchDepartments,
  fetchDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../department.actions';
import {
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from '../department.types';

export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: () => fetchDepartments(),
  });
};

export const useDepartment = (id: string) => {
  return useQuery({
    queryKey: ['department', id],
    queryFn: () => fetchDepartment(id),
    enabled: !!id,
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDepartmentInput) => createDepartment(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateDepartmentInput }) =>
      updateDepartment(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['department', variables.id] });
    },
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
};
