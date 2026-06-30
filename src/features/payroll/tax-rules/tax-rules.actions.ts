'use server';

import { gqlRequest, GraphQLService } from '@/lib/graphql-client';
import { ActionResult, safeAction } from '@/lib/safe-action';
import { revalidatePath } from 'next/cache';
import {
  CREATE_TAX_RULE_MUTATION,
  DELETE_TAX_RULE_MUTATION,
  GET_TAX_RULE_QUERY,
  GET_TAX_RULES_QUERY,
  UPDATE_TAX_RULE_MUTATION,
} from './tax-rules.queries';
import {
  CreateTaxRuleInput,
  TaxRuleResponse,
  UpdateTaxRuleInput,
} from './tax-rules.types';

export async function fetchTaxRules(companyId?: string): Promise<TaxRuleResponse[]> {
  try {
    const data = await gqlRequest<{ taxRules: TaxRuleResponse[] }>(
      GraphQLService.PAYROLL,
      GET_TAX_RULES_QUERY,
      { companyId },
    );
    return data.taxRules ?? [];
  } catch (error) {
    console.error('Failed to fetch tax rules:', error);
    return [];
  }
}

export async function fetchTaxRule(id: string): Promise<TaxRuleResponse | null> {
  try {
    const data = await gqlRequest<{ taxRule: TaxRuleResponse }>(
      GraphQLService.PAYROLL,
      GET_TAX_RULE_QUERY,
      { id },
    );
    return data.taxRule ?? null;
  } catch (error) {
    console.error('Failed to fetch tax rule:', error);
    return null;
  }
}

export async function createTaxRuleAction(
  input: CreateTaxRuleInput,
): Promise<ActionResult<TaxRuleResponse>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ createTaxRule: TaxRuleResponse }>(
      GraphQLService.PAYROLL,
      CREATE_TAX_RULE_MUTATION,
      { input },
    );
    revalidatePath('/dashboard/payroll/tax-rules');
    return data.createTaxRule;
  });
}

export async function updateTaxRuleAction(
  id: string,
  input: UpdateTaxRuleInput,
): Promise<ActionResult<TaxRuleResponse>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ updateTaxRule: TaxRuleResponse }>(
      GraphQLService.PAYROLL,
      UPDATE_TAX_RULE_MUTATION,
      { id, input },
    );
    revalidatePath('/dashboard/payroll/tax-rules');
    return data.updateTaxRule;
  });
}

export async function deleteTaxRuleAction(id: string): Promise<ActionResult<boolean>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ deleteTaxRule: boolean }>(
      GraphQLService.PAYROLL,
      DELETE_TAX_RULE_MUTATION,
      { id },
    );
    revalidatePath('/dashboard/payroll/tax-rules');
    return data.deleteTaxRule;
  });
}
