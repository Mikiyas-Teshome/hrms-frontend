'use server';

import { gqlRequest, GraphQLService } from '@/lib/graphql-client';
import { ActionResult, safeAction } from '@/lib/safe-action';
import {
  CREATE_INSURANCE_MUTATION,
  UPDATE_INSURANCE_MUTATION,
  UPDATE_INSURANCE_STATUS_MUTATION,
  REMOVE_INSURANCE_MUTATION,
  GET_INSURANCES_QUERY,
  GET_INSURANCE_STATS_QUERY,
} from './insurance.queries';
import {
  Insurance,
  CreateInsuranceInput,
  UpdateInsuranceInput,
  UpdateInsuranceStatusInput,
  InsuranceFilterInput,
  PaginatedInsuranceResponse,
  InsuranceStats,
} from './insurance.types';
import { revalidatePath } from 'next/cache';

export async function fetchInsuranceStats(ouId?: string): Promise<InsuranceStats> {
  try {
    const data = await gqlRequest<{ insuranceStats: InsuranceStats }>(
      GraphQLService.CORE_HR,
      GET_INSURANCE_STATS_QUERY,
      { ouId: ouId || undefined },
    );
    return data.insuranceStats;
  } catch (error) {
    console.error('Failed to fetch insurance stats:', error);
    return {
      totalPlans: 0,
      activePlans: 0,
      providerCount: 0,
      monthlySpending: 0,
    };
  }
}

export async function fetchInsurances(filter: InsuranceFilterInput = {}): Promise<PaginatedInsuranceResponse> {
  try {
    const data = await gqlRequest<{ insurances: PaginatedInsuranceResponse }>(
      GraphQLService.CORE_HR,
      GET_INSURANCES_QUERY,
      { filter }
    );
    return data.insurances;
  } catch (error) {
    console.error('Failed to fetch insurances:', error);
    return {
        data: [],
        pagination: {
            total: 0,
            page: filter.page || 1,
            limit: filter.limit || 10,
            totalPages: 0
        }
    };
  }
}

export async function createInsurance(input: CreateInsuranceInput): Promise<ActionResult<Insurance>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ createInsurance: Insurance }>(
      GraphQLService.CORE_HR,
      CREATE_INSURANCE_MUTATION,
      { input }
    );
    revalidatePath('/dashboard/benefits/insurance');
    return data.createInsurance;
  });
}

export async function updateInsurance(id: string, input: UpdateInsuranceInput): Promise<ActionResult<Insurance>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ updateInsurance: Insurance }>(
      GraphQLService.CORE_HR,
      UPDATE_INSURANCE_MUTATION,
      { id, input }
    );
    revalidatePath('/dashboard/benefits/insurance');
    return data.updateInsurance;
  });
}

export async function updateInsuranceStatus(
  id: string,
  input: UpdateInsuranceStatusInput,
): Promise<ActionResult<Insurance>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ updateInsuranceStatus: Insurance }>(
      GraphQLService.CORE_HR,
      UPDATE_INSURANCE_STATUS_MUTATION,
      { id, input },
    );
    revalidatePath('/dashboard/benefits/insurance');
    return data.updateInsuranceStatus;
  });
}

export async function deleteInsurance(id: string): Promise<ActionResult<Insurance>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ removeInsurance: Insurance }>(
      GraphQLService.CORE_HR,
      REMOVE_INSURANCE_MUTATION,
      { id }
    );
    revalidatePath('/dashboard/benefits/insurance');
    return data.removeInsurance;
  });
}
