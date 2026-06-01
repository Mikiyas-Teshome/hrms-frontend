export const USER_FIELDS_FRAGMENT = `
  fragment UserFields on UserResponse {
    id
    email
    firstName
    lastName
    fullName
    role
    status
    companyId
    department
    position
    phoneNumber
    isEmailVerified
    onboardingComplete
    onboardingStep
    createdAt
    updatedAt
    lastLoginAt
  }
`;

export const ORGANIZATION_UNIT_FRAGMENT = `
  fragment OrganizationUnitFields on OrganizationUnitType {
    id
    name
    parentId
    companyId
    status
    type
    displayLabel
    totalMembers
    employeeCount
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
  query GetOrganizationHierarchy($limit: Int, $maxDepth: Int, $page: Int, $rootId: ID, $status: String) {
    getOrganizationHierarchy(limit: $limit, maxDepth: $maxDepth, page: $page, rootId: $rootId, status: $status) {
      ...OrganizationUnitFields
      members {
        ...UserFields
      }
      children {
        ...OrganizationUnitFields
        members {
          ...UserFields
        }
        children {
          ...OrganizationUnitFields
          members {
            ...UserFields
          }
          children {
            ...OrganizationUnitFields
            members {
              ...UserFields
            }
            children {
              ...OrganizationUnitFields
              members {
                ...UserFields
              }
            }
          }
        }
      }
    }
  }
  ${ORGANIZATION_UNIT_FRAGMENT}
  ${USER_FIELDS_FRAGMENT}
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
        ...UserFields
      }
      children {
        ...OrganizationUnitFields
        members {
          ...UserFields
        }
      }
    }
  }
  ${ORGANIZATION_UNIT_FRAGMENT}
  ${USER_FIELDS_FRAGMENT}
`;
