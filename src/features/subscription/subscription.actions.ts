'use server';

import { gqlRequest, GraphQLService } from '@/lib/graphql-client';
import { publicGqlRequest } from '@/lib/public-graphql-client';
import { revalidatePath } from 'next/cache';
import {
    CREATE_SUBSCRIPTION_PLAN_MUTATION,
    UPDATE_SUBSCRIPTION_PLAN_MUTATION,
    DELETE_SUBSCRIPTION_PLAN_MUTATION,
    GET_SUBSCRIPTION_PLAN_QUERY,
    GET_SUBSCRIPTION_PLANS_QUERY,
} from './subscription.queries';
import {
    CreatePlanInput,
    PlanType,
    UpdatePlanInput
} from './subscription.types';

export async function createSubscriptionPlan(input: CreatePlanInput): Promise<PlanType> {
    const data = await gqlRequest<{ createSubscriptionPlan: PlanType }>(
        GraphQLService.AUTH,
        CREATE_SUBSCRIPTION_PLAN_MUTATION,
        { input }
    );
    revalidatePath('/dashboard/admin/subscriptions');
    return data.createSubscriptionPlan;
}

export async function updateSubscriptionPlan(input: UpdatePlanInput): Promise<PlanType> {
    const data = await gqlRequest<{ updateSubscriptionPlan: PlanType }>(
        GraphQLService.AUTH,
        UPDATE_SUBSCRIPTION_PLAN_MUTATION,
        { input }
    );
    revalidatePath(`/dashboard/admin/subscriptions/${input.id}`);
    revalidatePath('/dashboard/admin/subscriptions');
    return data.updateSubscriptionPlan;
}

export async function deleteSubscriptionPlan(id: string): Promise<boolean> {
    const data = await gqlRequest<{ deleteSubscriptionPlan: boolean }>(
        GraphQLService.AUTH,
        DELETE_SUBSCRIPTION_PLAN_MUTATION,
        { id }
    );
    revalidatePath('/dashboard/admin/subscriptions');
    return data.deleteSubscriptionPlan;
}

export async function getSubscriptionPlan(id: string): Promise<PlanType> {
    const data = await gqlRequest<{ getSubscriptionPlan: PlanType }>(
        GraphQLService.AUTH,
        GET_SUBSCRIPTION_PLAN_QUERY,
        { id }
    );
    return data.getSubscriptionPlan;
}

export async function getSubscriptionPlans(): Promise<PlanType[]> {
    const data = await publicGqlRequest<{ getSubscriptionPlans: PlanType[] }>(
        GET_SUBSCRIPTION_PLANS_QUERY
    );
    return data.getSubscriptionPlans;
}
