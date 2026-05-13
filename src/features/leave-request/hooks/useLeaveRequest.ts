import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchLeaveRequestsByCompany,
  fetchLeaveRequestsByEmployee,
  fetchLeaveRequest,
  createLeaveRequest,
  cancelLeaveRequest,
} from '../leave-request.actions';
import {
  CreateLeaveRequestInput,
} from '../leave-request.types';

export const useLeaveRequestsByCompany = () => {
  return useQuery({
    queryKey: ['leave-requests', 'company'],
    queryFn: () => fetchLeaveRequestsByCompany(),
  });
};

export const useLeaveRequestsByEmployee = (employeeId: string) => {
  return useQuery({
    queryKey: ['leave-requests', 'employee', employeeId],
    queryFn: () => fetchLeaveRequestsByEmployee(employeeId),
    enabled: !!employeeId,
  });
};

export const useLeaveRequest = (id: string) => {
  return useQuery({
    queryKey: ['leave-request', id],
    queryFn: () => fetchLeaveRequest(id),
    enabled: !!id,
  });
};

export const useCreateLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLeaveRequestInput) => createLeaveRequest(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests', 'company'] });
      queryClient.invalidateQueries({ queryKey: ['leave-requests', 'employee', variables.employeeId] });
    },
  });
};

export const useCancelLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelLeaveRequest(id),
    onSuccess: () => {
      // Invalidating all leave requests as we don't know the exact scopes affected by default
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leave-request'] });
    },
  });
};
