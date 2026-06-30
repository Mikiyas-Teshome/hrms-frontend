'use server';

import { gqlRequest, GraphQLService } from '@/lib/graphql-client';
import { ActionResult, safeAction } from '@/lib/safe-action';
import { revalidatePath } from 'next/cache';
import {
    GET_COMP_OFF_BALANCE_QUERY,
    GET_COMP_OFF_HISTORY_QUERY,
    GET_COMP_OFF_POLICY_QUERY,
    UPSERT_COMP_OFF_POLICY_MUTATION
} from './comp-off.queries';
import {
    CompOffBalance,
    CompOffBankEntry,
    CompOffPolicy,
    UpsertCompOffPolicyInput
} from './comp-off.types';

export async function getCompOffBalance(userId: string): Promise<ActionResult<CompOffBalance>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ compOffBalance: CompOffBalance }>(
            GraphQLService.ATTENDANCE,
            GET_COMP_OFF_BALANCE_QUERY,
            { userId }
        );
        return data.compOffBalance;
    });
}

export async function getCompOffHistory(userId: string): Promise<ActionResult<CompOffBankEntry[]>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ compOffHistory: CompOffBankEntry[] }>(
            GraphQLService.ATTENDANCE,
            GET_COMP_OFF_HISTORY_QUERY,
            { userId }
        );
        return data.compOffHistory;
    });
}

export async function getCompOffPolicy(): Promise<ActionResult<CompOffPolicy | null>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ compOffPolicy: CompOffPolicy | null }>(
            GraphQLService.ATTENDANCE,
            GET_COMP_OFF_POLICY_QUERY,
            {}
        );
        return data.compOffPolicy;
    });
}

export async function upsertCompOffPolicy(input: UpsertCompOffPolicyInput): Promise<ActionResult<CompOffPolicy>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ upsertCompOffPolicy: CompOffPolicy }>(
            GraphQLService.ATTENDANCE,
            UPSERT_COMP_OFF_POLICY_MUTATION,
            { input }
        );
        revalidatePath('/dashboard/settings');
        return data.upsertCompOffPolicy;
    });
}
