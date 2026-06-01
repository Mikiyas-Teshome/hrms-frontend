'use server';

import { gqlRequest, GraphQLService } from '@/lib/graphql-client';
import { ActionResult, safeAction } from '@/lib/safe-action';
import {
  CREATE_BANK_ACCOUNT_MUTATION,
  CREATE_MY_BANK_ACCOUNT_MUTATION,
  REMOVE_BANK_ACCOUNT_MUTATION,
  UPDATE_BANK_ACCOUNT_MUTATION,
  GET_BANK_ACCOUNT_QUERY,
  GET_BANK_ACCOUNTS_QUERY,
} from './bank-account.queries';
import {
  BankAccount,
  CreateBankAccountInput,
  CreateMyBankAccountInput,
  UpdateBankAccountInput,
} from './bank-account.types';

export async function fetchBankAccounts(employeeId: string): Promise<BankAccount[]> {
  try {
    const data = await gqlRequest<{ bankAccounts: BankAccount[] }>(
      GraphQLService.CORE_HR,
      GET_BANK_ACCOUNTS_QUERY,
      { employeeId }
    );
    return data.bankAccounts;
  } catch (error) {
    console.error(`Failed to fetch bank accounts for employee ${employeeId}:`, error);
    return [];
  }
}

export async function fetchBankAccount(id: string): Promise<BankAccount | null> {
  try {
    const data = await gqlRequest<{ bankAccount: BankAccount }>(
      GraphQLService.CORE_HR,
      GET_BANK_ACCOUNT_QUERY,
      { id }
    );
    return data.bankAccount;
  } catch (error) {
    console.error(`Failed to fetch bank account ${id}:`, error);
    return null;
  }
}

export async function createMyBankAccount(input: CreateMyBankAccountInput): Promise<ActionResult<BankAccount>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ createMyBankAccount: BankAccount }>(
      GraphQLService.CORE_HR,
      CREATE_MY_BANK_ACCOUNT_MUTATION,
      { input }
    );
    return data.createMyBankAccount;
  });
}

export async function createBankAccount(input: CreateBankAccountInput): Promise<ActionResult<BankAccount>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ createBankAccount: BankAccount }>(
      GraphQLService.CORE_HR,
      CREATE_BANK_ACCOUNT_MUTATION,
      { input }
    );
    // revalidatePath('/dashboard/employees');
    return data.createBankAccount;
  });
}

export async function updateBankAccount(id: string, input: UpdateBankAccountInput): Promise<ActionResult<BankAccount>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ updateBankAccount: BankAccount }>(
      GraphQLService.CORE_HR,
      UPDATE_BANK_ACCOUNT_MUTATION,
      { id, input }
    );
    // revalidatePath('/dashboard/employees');
    return data.updateBankAccount;
  });
}

export async function removeBankAccount(id: string): Promise<ActionResult<BankAccount>> {
  return safeAction(async () => {
    const data = await gqlRequest<{ removeBankAccount: BankAccount }>(
      GraphQLService.CORE_HR,
      REMOVE_BANK_ACCOUNT_MUTATION,
      { id }
    );
    // revalidatePath('/dashboard/employees');
    return data.removeBankAccount;
  });
}
