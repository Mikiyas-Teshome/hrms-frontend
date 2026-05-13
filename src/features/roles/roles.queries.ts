export const PERMISSION_FIELDS_FRAGMENT = `
  fragment PermissionFields on Permission {
    id
    action
    description
    roleId
    createdAt
  }
`;

export const CREATE_PERMISSION_MUTATION = `
  mutation CreatePermission($input: CreatePermissionInput!) {
    createPermission(input: $input) {
      ...PermissionFields
    }
  }
  ${PERMISSION_FIELDS_FRAGMENT}
`;

export const REMOVE_PERMISSION_MUTATION = `
  mutation RemovePermission($id: ID!) {
    removePermission(id: $id) {
      ...PermissionFields
    }
  }
  ${PERMISSION_FIELDS_FRAGMENT}
`;

export const SET_USER_PERMISSION_OVERRIDE_MUTATION = `
  mutation SetUserPermissionOverride($input: SetUserPermissionInput!) {
    setUserPermissionOverride(input: $input)
  }
`;

export const SET_USER_PERMISSION_OVERRIDES_MUTATION = `
  mutation SetUserPermissionOverrides($input: BulkSetUserPermissionInput!) {
    setUserPermissionOverrides(input: $input)
  }
`;

export const GET_ROLES_QUERY = `
  query GetRoles($companyId: ID) {
    roles(companyId: $companyId) {
      id
      name
      description
      level
      companyId
      createdAt
      updatedAt
      permissions {
        id
        action
        description
        roleId
        createdAt
      }
      permissionGrants {
        id
        scope
        permissionId
        permission {
          id
          action
          description
          module
        }
      }
      permissionsMap
    }
  }
`;

export const CREATE_ROLE_MUTATION = `
  mutation CreateRole($input: CreateRoleInput!) {
    createRole(input: $input) {
      id
      name
      description
      level
      companyId
      createdAt
      updatedAt
      permissions {
        id
        action
        description
        roleId
        createdAt
      }
      permissionGrants {
        id
        scope
        permissionId
        permission {
          id
          action
          description
          module
        }
      }
      permissionsMap
    }
  }
`;

export const UPDATE_ROLE_MUTATION = `
  mutation UpdateRole($id: ID!, $input: UpdateRoleInput!) {
    updateRole(id: $id, input: $input) {
      id
      name
      description
      level
      companyId
      createdAt
      updatedAt
      permissions {
        id
        action
        description
        roleId
        createdAt
      }
      permissionGrants {
        id
        scope
        permissionId
        permission {
          id
          action
          description
          module
        }
      }
      permissionsMap
    }
  }
`;

export const REMOVE_ROLE_MUTATION = `
  mutation RemoveRole($id: ID!) {
    removeRole(id: $id) {
      id
      name
      level
      companyId
    }
  }
`;

export const GET_ROLE_QUERY = `
  query GetRole($id: ID!) {
    role(id: $id) {
      id
      name
      description
      level
      companyId
      createdAt
      updatedAt
      permissions {
        id
        action
        description
        roleId
        createdAt
      }
      permissionGrants {
        id
        scope
        permissionId
        permission {
          id
          action
          description
          module
        }
      }
      permissionsMap
    }
  }
`;

export const UPDATE_USER_ROLE_MUTATION = `
  mutation UpdateUserRole($userId: String!, $input: UpdateUserRoleInput!) {
    updateUserRole(userId: $userId, input: $input) {
      id
      email
      role
    }
  }
`;

export const GET_PERMISSIONS_QUERY = `
  query GetPermissions {
    permissions {
      id
      action
      description
      roleId
    }
  }
`;
export const PROFILE_WITH_PERMISSION_SETS_QUERY = `
  query ProfileWithPermissionSets($userId: ID) {
    profileWithPermissionSets(userId: $userId) {
      user {
        id
        email
        role
        companyId
        roleProfile {
          id
          name
          permissionsMap
          permissionGrants {
            permissionId
            scope
            permission {
              id
              action
              module
              description
            }
          }
        }
      }
    }
  }
`;
