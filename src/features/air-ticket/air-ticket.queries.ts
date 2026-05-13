export const AIR_TICKET_FIELDS_FRAGMENT = `
  fragment AirTicketFields on AirTicketEntitlement {
    allowanceAmount
    createdAt
    currency
    destination
    employeeId
    entitlementType
    frequency
    id
    nextEligibilityDate
    status
    ticketClass
    updatedAt
  }
`;

export const CREATE_AIR_TICKET_ENTITLEMENT_MUTATION = `
  mutation CreateAirTicketEntitlement($input: CreateAirTicketEntitlementInput!) {
    createAirTicketEntitlement(input: $input) {
      ...AirTicketFields
    }
  }
  ${AIR_TICKET_FIELDS_FRAGMENT}
`;

export const REMOVE_AIR_TICKET_ENTITLEMENT_MUTATION = `
  mutation RemoveAirTicketEntitlement($id: ID!) {
    removeAirTicketEntitlement(id: $id) {
      ...AirTicketFields
    }
  }
  ${AIR_TICKET_FIELDS_FRAGMENT}
`;

export const UPDATE_AIR_TICKET_ENTITLEMENT_MUTATION = `
  mutation UpdateAirTicketEntitlement($id: ID!, $input: UpdateAirTicketEntitlementInput!) {
    updateAirTicketEntitlement(id: $id, input: $input) {
      ...AirTicketFields
    }
  }
  ${AIR_TICKET_FIELDS_FRAGMENT}
`;

export const GET_AIR_TICKET_ENTITLEMENTS_QUERY = `
  query GetAirTicketEntitlements($employeeId: ID!) {
    airTicketEntitlements(employeeId: $employeeId) {
      ...AirTicketFields
    }
  }
  ${AIR_TICKET_FIELDS_FRAGMENT}
`;
