'use server';

import { gqlRequest, GraphQLService } from '@/lib/graphql-client';
import { ActionResult, safeAction } from '@/lib/safe-action';
import { revalidatePath } from 'next/cache';
import {
  CREATE_BENEFIT_ENTITLEMENT_MUTATION,
  UPDATE_BENEFIT_ENTITLEMENT_MUTATION,
  UPDATE_BENEFIT_ENTITLEMENT_STATUS_MUTATION,
  REMOVE_BENEFIT_ENTITLEMENT_MUTATION,
  GET_BENEFIT_ENTITLEMENTS_QUERY,
  GET_BENEFIT_ENTITLEMENT_STATS_QUERY,
} from './entitlements.queries';
import {
  BenefitEntitlement,
  CreateBenefitEntitlementInput,
  UpdateBenefitEntitlementInput,
  UpdateBenefitEntitlementStatusInput,
  BenefitEntitlementFilterInput,
  PaginatedBenefitEntitlementResponse,
  BenefitEntitlementStats,
} from './entitlements.types';

export async function fetchBenefitEntitlementStats(
  ouId?: string,
): Promise<BenefitEntitlementStats> {
  try {
    const data = await gqlRequest<{ benefitEntitlementStats: BenefitEntitlementStats }>(
      GraphQLService.CORE_HR,
      GET_BENEFIT_ENTITLEMENT_STATS_QUERY,
      { ouId: ouId || undefined },
    );
    return data.benefitEntitlementStats;
  } catch (error) {
    console.error('Failed to fetch benefit entitlement stats:', error);
    return {
      totalEntitlements: 0,
      activeEntitlements: 0,
      assignedToAll: 0,
      monthlySpending: 0,
    };
  }
}

export async function fetchBenefitEntitlements(
  filter: BenefitEntitlementFilterInput = {},
): Promise<PaginatedBenefitEntitlementResponse> {
  try {
    const data = await gqlRequest<{ benefitEntitlements: PaginatedBenefitEntitlementResponse }>(
      GraphQLService.CORE_HR,
      GET_BENEFIT_ENTITLEMENTS_QUERY,
      { filter },
    );
    return data.benefitEntitlements;
  } catch (error) {
    console.error('Failed to fetch benefit entitlements:', error);
    return {
      data: [],
      pagination: {
        total: 0,
        page: filter.page || 1,
        limit: filter.limit || 10,
        totalPages: 0,
      },
    };
  }
}

export async function createBenefitEntitlement(
  input: CreateBenefitEntitlementInput,
): Promise<ActionResult<BenefitEntitlement>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ createBenefitEntitlement: BenefitEntitlement }>(
      GraphQLService.CORE_HR,
      CREATE_BENEFIT_ENTITLEMENT_MUTATION,
      { input },
    );
    revalidatePath('/dashboard/benefits/entitlements');
    return data.createBenefitEntitlement;
  });
}

export async function updateBenefitEntitlement(
  id: string,
  input: UpdateBenefitEntitlementInput,
): Promise<ActionResult<BenefitEntitlement>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ updateBenefitEntitlement: BenefitEntitlement }>(
      GraphQLService.CORE_HR,
      UPDATE_BENEFIT_ENTITLEMENT_MUTATION,
      { id, input },
    );
    revalidatePath('/dashboard/benefits/entitlements');
    return data.updateBenefitEntitlement;
  });
}

export async function updateBenefitEntitlementStatus(
  id: string,
  input: UpdateBenefitEntitlementStatusInput,
): Promise<ActionResult<BenefitEntitlement>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ updateBenefitEntitlementStatus: BenefitEntitlement }>(
      GraphQLService.CORE_HR,
      UPDATE_BENEFIT_ENTITLEMENT_STATUS_MUTATION,
      { id, input },
    );
    revalidatePath('/dashboard/benefits/entitlements');
    return data.updateBenefitEntitlementStatus;
  });
}

export async function deleteBenefitEntitlement(
  id: string,
): Promise<ActionResult<BenefitEntitlement>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ removeBenefitEntitlement: BenefitEntitlement }>(
      GraphQLService.CORE_HR,
      REMOVE_BENEFIT_ENTITLEMENT_MUTATION,
      { id },
    );
    revalidatePath('/dashboard/benefits/entitlements');
    return data.removeBenefitEntitlement;
  });
}
