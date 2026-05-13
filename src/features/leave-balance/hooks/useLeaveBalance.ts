import { useQuery } from '@tanstack/react-query';

export const useLeaveBalances = () => {
    return useQuery({
        queryKey: ['leave-balances'],
        queryFn: async () => {
            // Simulated failing API call to fall back to dummy data
            throw new Error("API not working");
        },
    });
};
