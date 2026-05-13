import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAuditLogs, createAuditLog } from '../audit.actions';
import { CreateAuditLogInput } from '../audit.types';

export const useAuditLogs = (filters: { companyId?: string; entityId?: string; entityType?: string } = {}) => {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => fetchAuditLogs(filters),
  });
};

export const useCreateAuditLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAuditLogInput) => createAuditLog(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
  });
};
