import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchApprovalsByRequest,
  actOnApproval,
} from '../approval.actions';
import {
  ApprovalActInput,
} from '../approval.types';

export const useApprovalsByRequest = (requestId: string) => {
  return useQuery({
    queryKey: ['approvals', 'request', requestId],
    queryFn: () => fetchApprovalsByRequest(requestId),
    enabled: !!requestId,
  });
};

export const useActOnApproval = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ApprovalActInput) => actOnApproval(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['approvals', 'request', variables.requestId] });
      // Depending on the domain logic, we might also want to invalidate leave-requests
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] }); 
    },
  });
};
