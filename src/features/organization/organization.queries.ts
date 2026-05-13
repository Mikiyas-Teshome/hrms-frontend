export const ORGANIZATION_UNIT_FRAGMENT = `
  fragment OrganizationUnitFields on OrganizationUnitType {
    id
    name
    parentId
    status
    type
    displayLabel
    totalMembers
    companyProfile {
      id
      legalName
      registrationNumber
      taxId
      industry
      address
      timezone
      currency
      tradeLicenseNumber
      themeColor
      dunsNumber
    }
  }
`;

export const UNASSIGN_USER_FROM_OU_MUTATION = `
  mutation UnassignUserFromOU($ouId: String!, $userId: String!) {
    unassignUserFromOU(ouId: $ouId, userId: $userId)
  }
`;

export const ASSIGN_USER_TO_OU_MUTATION = `
  mutation AssignUserToOU($input: AssignUserOuInput!) {
    assignUserToOU(input: $input)
  }
`;

export const CREATE_ORGANIZATION_UNIT_MUTATION = `
  mutation CreateOrganizationUnit($input: CreateOrganizationUnitInput!) {
    createOrganizationUnit(input: $input) {
      ...OrganizationUnitFields
    }
  }
  ${ORGANIZATION_UNIT_FRAGMENT}
`;

export const DEACTIVATE_ORGANIZATION_UNIT_MUTATION = `
  mutation DeactivateOrganizationUnit($id: ID!) {
    deactivateOrganizationUnit(id: $id) {
      ...OrganizationUnitFields
    }
  }
  ${ORGANIZATION_UNIT_FRAGMENT}
`;

export const UPDATE_ORGANIZATION_UNIT_MUTATION = `
  mutation UpdateOrganizationUnit($input: UpdateOrganizationUnitInput!) {
    updateOrganizationUnit(input: $input) {
      ...OrganizationUnitFields
    }
  }
  ${ORGANIZATION_UNIT_FRAGMENT}
`;

export const UPDATE_ORGANIZATION_NOMENCLATURE_MUTATION = `
  mutation UpdateOrganizationNomenclature($inputs: [NomenclatureInput!]!, $language: String! = "en") {
    updateOrganizationNomenclature(inputs: $inputs, language: $language) {
      label
      language
      type
    }
  }
`;

export const GET_ORGANIZATION_HIERARCHY_QUERY = `
  query GetOrganizationHierarchy {
    getOrganizationHierarchy {
      ...OrganizationUnitFields
      members {
        id
        email
        firstName
        lastName
        role
        status
      }
      children {
        ...OrganizationUnitFields
        members {
          id
          email
          firstName
          lastName
          role
          status
        }
        children {
          ...OrganizationUnitFields
          members {
            id
            email
            firstName
            lastName
            role
            status
          }
          children {
            ...OrganizationUnitFields
            members {
              id
              email
              firstName
              lastName
              role
              status
            }
            children {
              ...OrganizationUnitFields
              members {
                id
                email
                firstName
                lastName
                role
                status
              }
            }
          }
        }
      }
    }
  }
  ${ORGANIZATION_UNIT_FRAGMENT}
`;

export const GET_ORGANIZATION_NOMENCLATURE_QUERY = `
  query GetOrganizationNomenclature($language: String! = "en") {
    getOrganizationNomenclature(language: $language) {
      label
      language
      type
    }
  }
`;

export const GET_ORGANIZATION_UNIT_QUERY = `
  query GetOrganizationUnit($id: ID!) {
    getOrganizationUnit(id: $id) {
      ...OrganizationUnitFields
      members {
        id
        email
        firstName
        lastName
        role
        status
        department
        position
      }
      children {
        ...OrganizationUnitFields
      }
    }
  }
  ${ORGANIZATION_UNIT_FRAGMENT}
`;
