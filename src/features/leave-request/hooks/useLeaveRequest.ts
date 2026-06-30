import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchLeaveRequestsByCompany,
  fetchLeaveRequestsByEmployee,
  fetchLeaveRequest,
  fetchLeaveRequestStats,
  fetchLeaveRequestsPaginated,
  fetchLeaveRequestReview,
  createLeaveRequest,
  cancelLeaveRequest,
  requestLeaveAmendment,
  respondLeaveAmendment,
  uploadLeaveAttachment,
} from '../leave-request.actions';
import {
  CreateLeaveRequestInput,
  LeaveRequestFilterInput,
  LeaveRequestPaginationInput,
  RequestLeaveAmendmentInput,
  RespondLeaveAmendmentInput,
} from '../leave-request.types';

const invalidateLeaveRequestQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  companyOuId?: string,
) => {
  queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
  queryClient.invalidateQueries({ queryKey: ['leave-request-stats'] });
  if (companyOuId) {
    queryClient.invalidateQueries({ queryKey: ['leave-request-stats', companyOuId] });
    queryClient.invalidateQueries({ queryKey: ['leave-requests-paginated', companyOuId] });
  }
};

export const useLeaveRequestStats = (companyOuId?: string) => {
  return useQuery({
    queryKey: ['leave-request-stats', companyOuId],
    queryFn: () => fetchLeaveRequestStats(companyOuId!),
    enabled: !!companyOuId,
  });
};

export const useLeaveRequestsPaginated = (
  companyOuId?: string,
  filter?: LeaveRequestFilterInput,
  pagination?: LeaveRequestPaginationInput,
) => {
  return useQuery({
    queryKey: ['leave-requests-paginated', companyOuId, filter, pagination],
    queryFn: () => fetchLeaveRequestsPaginated(companyOuId!, filter, pagination),
    enabled: !!companyOuId,
  });
};

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

export const useLeaveRequestReview = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['leave-request-review', id],
    queryFn: () => fetchLeaveRequestReview(id),
    enabled: !!id && enabled,
  });
};

export const useCreateLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateLeaveRequestInput) => {
      const result = await createLeaveRequest(input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (_, variables) => {
      invalidateLeaveRequestQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: ['leave-requests', 'employee', variables.employeeId] });
    },
  });
};

export const useCancelLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await cancelLeaveRequest(id);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      invalidateLeaveRequestQueries(queryClient);
    },
  });
};

export const useRequestLeaveAmendment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: RequestLeaveAmendmentInput) => {
      const result = await requestLeaveAmendment(input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (_, variables) => {
      invalidateLeaveRequestQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: ['leave-requests-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['leave-request-review', variables.requestId] });
    },
  });
};

export const useUploadLeaveAttachment = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const result = await uploadLeaveAttachment(file);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });
};

export const useRespondLeaveAmendment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: RespondLeaveAmendmentInput) => {
      const result = await respondLeaveAmendment(input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      invalidateLeaveRequestQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: ['leave-requests', 'employee'] });
    },
  });
};
