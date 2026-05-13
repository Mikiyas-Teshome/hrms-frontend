export const LOAN_FIELDS_FRAGMENT = `
  fragment LoanFields on EmployeeLoan {
    id
    companyId
    employeeId
    principalAmount
    monthlyInstallment
    remainingBalance
    disbursementDate
    status
    createdAt
    updatedAt
  }
`;

export const GET_LOAN_QUERY = `
  query GetLoan($id: ID!) {
    loan(id: $id) {
      ...LoanFields
    }
  }
  ${LOAN_FIELDS_FRAGMENT}
`;

export const GET_LOANS_QUERY = `
  query GetLoans($companyId: ID!, $employeeId: ID) {
    loans(companyId: $companyId, employeeId: $employeeId) {
      ...LoanFields
    }
  }
  ${LOAN_FIELDS_FRAGMENT}
`;

export const CREATE_LOAN_MUTATION = `
  mutation CreateLoan($input: CreateLoanInput!) {
    createLoan(input: $input) {
      ...LoanFields
    }
  }
  ${LOAN_FIELDS_FRAGMENT}
`;

export const UPDATE_LOAN_MUTATION = `
  mutation UpdateLoan($id: ID!, $input: UpdateLoanInput!) {
    updateLoan(id: $id, input: $input) {
      ...LoanFields
    }
  }
  ${LOAN_FIELDS_FRAGMENT}
`;
