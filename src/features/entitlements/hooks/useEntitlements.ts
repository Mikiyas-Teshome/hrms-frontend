import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchBenefitEntitlements,
  fetchBenefitEntitlementStats,
  createBenefitEntitlement,
  updateBenefitEntitlement,
  updateBenefitEntitlementStatus,
  deleteBenefitEntitlement,
} from '../entitlements.actions';
import {
  CreateBenefitEntitlementInput,
  UpdateBenefitEntitlementInput,
  UpdateBenefitEntitlementStatusInput,
  BenefitEntitlementFilterInput,
} from '../entitlements.types';

export const useBenefitEntitlements = (filter: BenefitEntitlementFilterInput = {}) => {
  return useQuery({
    queryKey: ['benefitEntitlements', filter],
    queryFn: () => fetchBenefitEntitlements(filter),
  });
};

export const useBenefitEntitlementStats = (ouId?: string) => {
  return useQuery({
    queryKey: ['benefitEntitlementStats', ouId],
    queryFn: () => fetchBenefitEntitlementStats(ouId),
  });
};

export const useCreateBenefitEntitlement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBenefitEntitlementInput) => createBenefitEntitlement(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefitEntitlements'] });
      queryClient.invalidateQueries({ queryKey: ['benefitEntitlementStats'] });
    },
  });
};

export const useUpdateBenefitEntitlement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBenefitEntitlementInput }) =>
      updateBenefitEntitlement(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefitEntitlements'] });
      queryClient.invalidateQueries({ queryKey: ['benefitEntitlementStats'] });
    },
  });
};

export const useUpdateBenefitEntitlementStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBenefitEntitlementStatusInput }) =>
      updateBenefitEntitlementStatus(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefitEntitlements'] });
      queryClient.invalidateQueries({ queryKey: ['benefitEntitlementStats'] });
    },
  });
};

export const useDeleteBenefitEntitlement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBenefitEntitlement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefitEntitlements'] });
      queryClient.invalidateQueries({ queryKey: ['benefitEntitlementStats'] });
    },
  });
};
