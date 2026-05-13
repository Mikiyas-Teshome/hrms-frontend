'use server';

import { gqlRequest, GraphQLService } from '@/lib/graphql-client';
import {
  CREATE_AIR_TICKET_ENTITLEMENT_MUTATION,
  REMOVE_AIR_TICKET_ENTITLEMENT_MUTATION,
  UPDATE_AIR_TICKET_ENTITLEMENT_MUTATION,
  GET_AIR_TICKET_ENTITLEMENTS_QUERY,
} from './air-ticket.queries';
import {
  AirTicketEntitlement,
  CreateAirTicketEntitlementInput,
  UpdateAirTicketEntitlementInput,
} from './air-ticket.types';
import { revalidatePath } from 'next/cache';

export async function fetchAirTicketEntitlements(employeeId: string): Promise<AirTicketEntitlement[]> {
  try {
    const data = await gqlRequest<{ airTicketEntitlements: AirTicketEntitlement[] }>(
      GraphQLService.CORE_HR,
      GET_AIR_TICKET_ENTITLEMENTS_QUERY,
      { employeeId }
    );
    return data.airTicketEntitlements;
  } catch (error) {
    console.error(`Failed to fetch air ticket entitlements for employee ${employeeId}:`, error);
    return [];
  }
}

export async function createAirTicketEntitlement(input: CreateAirTicketEntitlementInput): Promise<AirTicketEntitlement> {
  const data = await gqlRequest<{ createAirTicketEntitlement: AirTicketEntitlement }>(
    GraphQLService.CORE_HR,
    CREATE_AIR_TICKET_ENTITLEMENT_MUTATION,
    { input }
  );
  revalidatePath('/dashboard/employees');
  return data.createAirTicketEntitlement;
}

export async function updateAirTicketEntitlement(id: string, input: UpdateAirTicketEntitlementInput): Promise<AirTicketEntitlement> {
  const data = await gqlRequest<{ updateAirTicketEntitlement: AirTicketEntitlement }>(
    GraphQLService.CORE_HR,
    UPDATE_AIR_TICKET_ENTITLEMENT_MUTATION,
    { id, input }
  );
  revalidatePath('/dashboard/employees');
  return data.updateAirTicketEntitlement;
}

export async function removeAirTicketEntitlement(id: string): Promise<AirTicketEntitlement> {
  const data = await gqlRequest<{ removeAirTicketEntitlement: AirTicketEntitlement }>(
    GraphQLService.CORE_HR,
    REMOVE_AIR_TICKET_ENTITLEMENT_MUTATION,
    { id }
  );
  revalidatePath('/dashboard/employees');
  return data.removeAirTicketEntitlement;
}
