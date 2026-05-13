import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchAirTicketEntitlements,
  createAirTicketEntitlement,
  updateAirTicketEntitlement,
  removeAirTicketEntitlement,
} from '../air-ticket.actions';
import {
  CreateAirTicketEntitlementInput,
  UpdateAirTicketEntitlementInput,
} from '../air-ticket.types';

export const useAirTicketEntitlements = (employeeId: string) => {
  return useQuery({
    queryKey: ['air-ticket-entitlements', employeeId],
    queryFn: () => fetchAirTicketEntitlements(employeeId),
    enabled: !!employeeId,
  });
};

export const useCreateAirTicketEntitlement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAirTicketEntitlementInput) => createAirTicketEntitlement(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['air-ticket-entitlements', variables.employeeId] });
    },
  });
};

export const useUpdateAirTicketEntitlement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAirTicketEntitlementInput }) =>
      updateAirTicketEntitlement(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['air-ticket-entitlements', data.employeeId] });
    },
  });
};

export const useRemoveAirTicketEntitlement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeAirTicketEntitlement(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['air-ticket-entitlements', data.employeeId] });
    },
  });
};
