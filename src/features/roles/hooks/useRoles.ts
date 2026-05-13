import { useMutation, useQuery } from '@tanstack/react-query';
import { 
    fetchRoles, 
    createRole, 
    updateRole, 
    removeRole, 
    updateUserRole, 
    fetchRoleById,
    createPermission,
    removePermission,
    setUserPermissionOverride,
    setUserPermissionOverrides
} from '../roles.actions';
import { 
    CreateRoleInput, 
    UpdateRoleInput, 
    UpdateUserRoleInput,
    CreatePermissionInput,
    SetUserPermissionInput,
    BulkSetUserPermissionInput
} from '../roles.types';

export const useRoles = (companyId?: string) => {
    return useQuery({
        queryKey: ['roles', 'list', companyId],
        queryFn: () => fetchRoles(companyId),
    });
};

export const useRole = (id: string) => {
    return useQuery({
        queryKey: ['roles', 'detail', id],
        queryFn: () => fetchRoleById(id),
        enabled: !!id,
    });
};

export const useCreateRole = () => {
    return useMutation({
        mutationFn: async (input: CreateRoleInput) => {
            const result = await createRole(input);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useUpdateRole = () => {
    return useMutation({
        mutationFn: async ({ id, input }: { id: string; input: UpdateRoleInput }) => {
            const result = await updateRole(id, input);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useRemoveRole = () => {
    return useMutation({
        mutationFn: async (id: string) => {
            const result = await removeRole(id);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useUpdateUserRole = () => {
    return useMutation({
        mutationFn: async ({ userId, input }: { userId: string; input: UpdateUserRoleInput }) => {
            const result = await updateUserRole(userId, input);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useCreatePermission = () => {
    return useMutation({
        mutationFn: async (input: CreatePermissionInput) => {
            const result = await createPermission(input);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useRemovePermission = () => {
    return useMutation({
        mutationFn: async (id: string) => {
            const result = await removePermission(id);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useSetUserPermissionOverride = () => {
    return useMutation({
        mutationFn: async (input: SetUserPermissionInput) => {
            const result = await setUserPermissionOverride(input);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useSetUserPermissionOverrides = () => {
    return useMutation({
        mutationFn: async (input: BulkSetUserPermissionInput) => {
            const result = await setUserPermissionOverrides(input);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};
