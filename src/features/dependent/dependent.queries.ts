export const DEPENDENT_FIELDS_FRAGMENT = `
  fragment DependentFields on Dependent {
    id
    employeeId
    firstName
    lastName
    dateOfBirth
    gender
    relationship
    isCoveredByInsurance
    isEligibleForTickets
    nationalId
    nationality
    passportNumber
    createdAt
    updatedAt
  }
`;

export const CREATE_DEPENDENT_MUTATION = `
  mutation CreateDependent($input: CreateDependentInput!) {
    createDependent(input: $input) {
      ...DependentFields
    }
  }
  ${DEPENDENT_FIELDS_FRAGMENT}
`;

export const REMOVE_DEPENDENT_MUTATION = `
  mutation RemoveDependent($id: ID!) {
    removeDependent(id: $id) {
      ...DependentFields
    }
  }
  ${DEPENDENT_FIELDS_FRAGMENT}
`;

export const UPDATE_DEPENDENT_MUTATION = `
  mutation UpdateDependent($id: ID!, $input: UpdateDependentInput!) {
    updateDependent(id: $id, input: $input) {
      ...DependentFields
    }
  }
  ${DEPENDENT_FIELDS_FRAGMENT}
`;

export const GET_DEPENDENTS_QUERY = `
  query GetDependents($employeeId: ID!) {
    dependents(employeeId: $employeeId) {
      ...DependentFields
    }
  }
  ${DEPENDENT_FIELDS_FRAGMENT}
`;
