export const BANK_ACCOUNT_FIELDS_FRAGMENT = `
  fragment BankAccountFields on BankAccount {
    accountName
    accountNumber
    bankName
    branchName
    createdAt
    employeeId
    iban
    id
    isPrimary
    routingNumber
    swiftCode
    updatedAt
  }
`;

export const CREATE_BANK_ACCOUNT_MUTATION = `
  mutation CreateBankAccount($input: CreateBankAccountInput!) {
    createBankAccount(input: $input) {
      ...BankAccountFields
    }
  }
  ${BANK_ACCOUNT_FIELDS_FRAGMENT}
`;

export const REMOVE_BANK_ACCOUNT_MUTATION = `
  mutation RemoveBankAccount($id: ID!) {
    removeBankAccount(id: $id) {
      ...BankAccountFields
    }
  }
  ${BANK_ACCOUNT_FIELDS_FRAGMENT}
`;

export const UPDATE_BANK_ACCOUNT_MUTATION = `
  mutation UpdateBankAccount($id: ID!, $input: UpdateBankAccountInput!) {
    updateBankAccount(id: $id, input: $input) {
      ...BankAccountFields
    }
  }
  ${BANK_ACCOUNT_FIELDS_FRAGMENT}
`;

export const GET_BANK_ACCOUNT_QUERY = `
  query GetBankAccount($id: ID!) {
    bankAccount(id: $id) {
      ...BankAccountFields
    }
  }
  ${BANK_ACCOUNT_FIELDS_FRAGMENT}
`;

export const GET_BANK_ACCOUNTS_QUERY = `
  query GetBankAccounts($employeeId: ID!) {
    bankAccounts(employeeId: $employeeId) {
      ...BankAccountFields
    }
  }
  ${BANK_ACCOUNT_FIELDS_FRAGMENT}
`;
