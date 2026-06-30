import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getCompOffBalance,
    getCompOffHistory,
    getCompOffPolicy,
    upsertCompOffPolicy
} from '../comp-off.actions';
import { UpsertCompOffPolicyInput } from '../comp-off.types';

export function useCompOffBalance(userId: string | undefined) {
    return useQuery({
        queryKey: ['compOffBalance', userId],
        queryFn: async () => {
            if (!userId) return null;
            const res = await getCompOffBalance(userId);
            if (!res.success) throw new Error(res.error);
            return res.data;
        },
        enabled: !!userId,
    });
}

export function useCompOffHistory(userId: string | undefined) {
    return useQuery({
        queryKey: ['compOffHistory', userId],
        queryFn: async () => {
            if (!userId) return null;
            const res = await getCompOffHistory(userId);
            if (!res.success) throw new Error(res.error);
            return res.data;
        },
        enabled: !!userId,
    });
}

export function useCompOffPolicy() {
    return useQuery({
        queryKey: ['compOffPolicy'],
        queryFn: async () => {
            const res = await getCompOffPolicy();
            if (!res.success) throw new Error(res.error);
            return res.data;
        },
    });
}

export function useUpsertCompOffPolicy() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (input: UpsertCompOffPolicyInput) => {
            const res = await upsertCompOffPolicy(input);
            if (!res.success) throw new Error(res.error);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['compOffPolicy'] });
        },
    });
}
