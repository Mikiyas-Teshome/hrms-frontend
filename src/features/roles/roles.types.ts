/** Mirrors the GraphQL JSON scalar returned by the backend for role permissions. */
export type PermissionsMap = Record<string, Record<string, string>>;
 
export enum PermissionScope {
    OWN = 'OWN',
    DEPARTMENT = 'DEPARTMENT',
    COMPANY = 'COMPANY',
    ALL = 'ALL',
}

export interface RolePermissionGrant {
    id: string;
    roleId: string;
    permissionId: string;
    scope: PermissionScope;
    permission?: AppPermission;
}

export interface AppPermission {
    id: string;
    action: string;
    description?: string | null;
    module?: string | null;
    roleId: string;
    createdAt: string;
}

export interface Role {
    id?: string;
    name: string;
    description?: string | null;
    companyId?: string | null;
    createdAt?: string;
    updatedAt?: string;
    permissions?: AppPermission[];
    permissionGrants?: RolePermissionGrant[];
    permissionsMap?: PermissionsMap | null;
}

export interface RolePermissionGrantInput {
    permissionId: string;
    scope: PermissionScope;
}

export interface CreateRoleInput {
    name: string;
    description?: string;
    companyId?: string;
    permissionGrants: RolePermissionGrantInput[];
}

export interface UpdateRoleInput {
    name?: string;
    description?: string;
    permissionGrants?: RolePermissionGrantInput[];
}

export interface UpdateUserRoleInput {
    role: string;
}

export interface CreatePermissionInput {
    action: string;
    description?: string | null;
    roleId: string;
}

export interface UserPermissionOverrideInput {
    userId: string;
    permissionId: string;
    effect: 'ALLOW' | 'DENY' | 'REMOVE';
    scope?: string | null;
    description?: string | null;
}

export type SetUserPermissionInput = UserPermissionOverrideInput;

export interface BulkSetUserPermissionInput {
    overrides: UserPermissionOverrideInput[];
}

export interface UserResponse {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    role: string;
    roleProfile?: Role | null;
    status: string;
    companyId: string;
    department?: string | null;
    phoneNumber?: string | null;
    position?: string | null;
    isEmailVerified: boolean;
    lastLoginAt?: string | null;
    createdAt: string;
    updatedAt: string;
}
export interface ProfileWithPermissionSets {
    user: UserResponse;
}

export interface ProfileWithPermissionSetsResponse {
    profileWithPermissionSets: ProfileWithPermissionSets;
}
