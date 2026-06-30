import { useQuery } from '@tanstack/react-query';
import { getInvitationOnboardContext } from '@/features/auth/auth.actions';

export const useInvitationOnboardContext = (token: string, tenantId?: string) => {
    return useQuery({
        queryKey: ['invitation-onboard-context', token, tenantId],
        queryFn: async () => {
            const result = await getInvitationOnboardContext(token, tenantId);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data;
        },
        enabled: Boolean(token),
        staleTime: 5 * 60 * 1000,
        retry: false,
    });
};
