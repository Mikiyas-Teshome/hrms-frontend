import { useMutation, useQuery } from '@tanstack/react-query';
import {
    createSubscriptionPlan,
    deleteSubscriptionPlan,
    getSubscriptionPlan,
    getSubscriptionPlans,
    updateSubscriptionPlan
} from '../subscription.actions';
import {
    CreatePlanInput,
    UpdatePlanInput
} from '../subscription.types';

export const useCreateSubscriptionPlan = () => {
    return useMutation({
        mutationFn: (input: CreatePlanInput) => createSubscriptionPlan(input),
    });
};

export const useUpdateSubscriptionPlan = () => {
    return useMutation({
        mutationFn: (input: UpdatePlanInput) => updateSubscriptionPlan(input),
    });
};

export const useDeleteSubscriptionPlan = () => {
    return useMutation({
        mutationFn: (id: string) => deleteSubscriptionPlan(id),
    });
};

export const useSubscriptionPlans = () => {
    return useQuery({
        queryKey: ['subscription-plans'],
        queryFn: () => getSubscriptionPlans(),
    });
};

export const useSubscriptionPlan = (id: string) => {
    return useQuery({
        queryKey: ['subscription-plan', id],
        queryFn: () => getSubscriptionPlan(id),
        enabled: !!id,
    });
};
