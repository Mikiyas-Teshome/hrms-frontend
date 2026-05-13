'use server';

import { gqlRequest, GraphQLService } from '@/lib/graphql-client';
import { ActionResult, safeAction } from '@/lib/safe-action';
import { 
    GET_ROLES_QUERY, 
    CREATE_ROLE_MUTATION, 
    UPDATE_ROLE_MUTATION, 
    REMOVE_ROLE_MUTATION, 
    UPDATE_USER_ROLE_MUTATION,
    GET_ROLE_QUERY,
    GET_PERMISSIONS_QUERY,
    PROFILE_WITH_PERMISSION_SETS_QUERY
} from './roles.queries';
import { 
    Role, 
    CreateRoleInput, 
    UpdateRoleInput, 
    UpdateUserRoleInput, 
    UserResponse,
    CreatePermissionInput,
    SetUserPermissionInput,
    BulkSetUserPermissionInput,
    AppPermission,
    ProfileWithPermissionSetsResponse
} from './roles.types';
import { revalidatePath } from 'next/cache';

import {
    CREATE_PERMISSION_MUTATION,
    REMOVE_PERMISSION_MUTATION,
    SET_USER_PERMISSION_OVERRIDE_MUTATION,
    SET_USER_PERMISSION_OVERRIDES_MUTATION
} from './roles.queries';

export async function createPermission(input: CreatePermissionInput): Promise<ActionResult<AppPermission>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ createPermission: AppPermission }>(
            GraphQLService.AUTH,
            CREATE_PERMISSION_MUTATION,
            { input }
        );
        revalidatePath('/dashboard/roles');
        return data.createPermission;
    });
}

export async function removePermission(id: string): Promise<ActionResult<AppPermission>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ removePermission: AppPermission }>(
            GraphQLService.AUTH,
            REMOVE_PERMISSION_MUTATION,
            { id }
        );
        revalidatePath('/dashboard/roles');
        return data.removePermission;
    });
}

export async function setUserPermissionOverride(input: SetUserPermissionInput): Promise<ActionResult<boolean>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ setUserPermissionOverride: boolean }>(
            GraphQLService.AUTH,
            SET_USER_PERMISSION_OVERRIDE_MUTATION,
            { input }
        );
        revalidatePath('/dashboard/employees');
        return data.setUserPermissionOverride;
    });
}

export async function setUserPermissionOverrides(input: BulkSetUserPermissionInput): Promise<ActionResult<boolean>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ setUserPermissionOverrides: boolean }>(
            GraphQLService.AUTH,
            SET_USER_PERMISSION_OVERRIDES_MUTATION,
            { input }
        );
        revalidatePath('/dashboard/employees');
        return data.setUserPermissionOverrides;
    });
}

export async function fetchRoles(companyId?: string): Promise<Role[]> {
    try {
        const data = await gqlRequest<{ roles: Role[] }>(
            GraphQLService.AUTH,
            GET_ROLES_QUERY,
            { companyId }
        );
        return data.roles;
    } catch (error) {
        console.error('Failed to fetch roles:', error);
        return [];
    }
}

export async function createRole(input: CreateRoleInput): Promise<ActionResult<Role>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ createRole: Role }>(
            GraphQLService.AUTH,
            CREATE_ROLE_MUTATION,
            { input }
        );
        revalidatePath('/dashboard/roles');
        return data.createRole;
    });
}

export async function updateRole(id: string, input: UpdateRoleInput): Promise<ActionResult<Role>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ updateRole: Role }>(
            GraphQLService.AUTH,
            UPDATE_ROLE_MUTATION,
            { id, input }
        );
        revalidatePath('/dashboard/roles');
        return data.updateRole;
    });
}

export async function removeRole(id: string): Promise<ActionResult<Role>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ removeRole: Role }>(
            GraphQLService.AUTH,
            REMOVE_ROLE_MUTATION,
            { id }
        );
        revalidatePath('/dashboard/roles');
        return data.removeRole;
    });
}

export async function updateUserRole(userId: string, input: UpdateUserRoleInput): Promise<ActionResult<UserResponse>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ updateUserRole: UserResponse }>(
            GraphQLService.AUTH,
            UPDATE_USER_ROLE_MUTATION,
            { userId, input }
        );
        revalidatePath('/dashboard/employees');
        return data.updateUserRole;
    });
}

export async function fetchRoleById(id: string): Promise<Role | null> {
    try {
        const data = await gqlRequest<{ role: Role }>(
            GraphQLService.AUTH,
            GET_ROLE_QUERY,
            { id }
        );
        return data.role;
    } catch (error) {
        console.error('Failed to fetch role:', error);
        return null;
    }
}

export async function fetchPermissions(): Promise<AppPermission[]> {
    try {
        const data = await gqlRequest<{ permissions: AppPermission[] }>(
            GraphQLService.AUTH,
            GET_PERMISSIONS_QUERY
        );
        return data.permissions;
    } catch (error) {
        console.error('Failed to fetch permissions:', error);
        return [];
    }
}
export async function fetchProfileWithPermissionSets(userId?: string): Promise<ProfileWithPermissionSetsResponse | null> {
    try {
        const data = await gqlRequest<ProfileWithPermissionSetsResponse>(
            GraphQLService.AUTH,
            PROFILE_WITH_PERMISSION_SETS_QUERY,
            { userId }
        );
        return data;
    } catch (error) {
        console.error('Failed to fetch profile with permission sets:', error);
        return null;
    }
}
