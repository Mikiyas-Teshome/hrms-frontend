export type TicketEntitlementType = 'cash' | 'actual';

export interface AirTicketEntitlement {
    id: string;
    employeeId: string;
    allowanceAmount?: number | null;
    currency: string;
    destination?: string | null;
    entitlementType: TicketEntitlementType;
    frequency: string;
    nextEligibilityDate?: string | null;
    status: string;
    ticketClass?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAirTicketEntitlementInput {
    employeeId: string;
    allowanceAmount?: number;
    currency: string;
    destination?: string;
    entitlementType?: TicketEntitlementType;
    frequency?: string;
    nextEligibilityDate?: string;
    status?: string;
    ticketClass?: string;
}

export interface UpdateAirTicketEntitlementInput {
    allowanceAmount?: number;
    currency?: string;
    destination?: string;
    entitlementType?: TicketEntitlementType;
    frequency?: string;
    nextEligibilityDate?: string;
    status?: string;
    ticketClass?: string;
}
