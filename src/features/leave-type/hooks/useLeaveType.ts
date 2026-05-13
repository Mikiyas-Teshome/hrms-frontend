import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchLeaveTypes,
  fetchLeaveType,
  createLeaveType,
  deleteLeaveType,
  updateLeaveType,
} from '../leave-type.actions';
import {
  CreateLeaveTypeInput,
  UpdateLeaveTypeInput,
} from '../leave-type.types';

export const useLeaveTypes = (companyOuId?: string) => {
  return useQuery({
    queryKey: ['leave-types', companyOuId],
    queryFn: () => fetchLeaveTypes(companyOuId!),
    enabled: !!companyOuId,
  });
};

export const useLeaveType = (id: string) => {
  return useQuery({
    queryKey: ['leave-type', id],
    queryFn: () => fetchLeaveType(id),
    enabled: !!id,
  });
};

export const useCreateLeaveType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateLeaveTypeInput) => {
        const result = await createLeaveType(input);
        if (!result.success) throw new Error(result.error);
        return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-types'] });
    },
  });
};

export const useUpdateLeaveType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateLeaveTypeInput }) => {
        const result = await updateLeaveType(id, input);
        if (!result.success) throw new Error(result.error);
        return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-types'] });
    },
  });
};

export const useDeleteLeaveType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
        const result = await deleteLeaveType(id);
        if (!result.success) throw new Error(result.error);
        return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-types'] });
    },
  });
};
