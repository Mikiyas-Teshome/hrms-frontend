export const ALLOWANCE_FIELDS_FRAGMENT = `
  fragment AllowanceFields on AllowanceResponse {
    id
    companyId
    name
    type
    value
    taxable
    createdAt
    updatedAt
  }
`;

export const GET_ALLOWANCES_QUERY = `
  query GetAllowances($companyId: String!) {
    allowances(companyId: $companyId) {
      ...AllowanceFields
    }
  }
  ${ALLOWANCE_FIELDS_FRAGMENT}
`;

export const CREATE_ALLOWANCE_MUTATION = `
  mutation CreateAllowance($input: CreateAllowanceInput!) {
    createAllowance(input: $input) {
      ...AllowanceFields
    }
  }
  ${ALLOWANCE_FIELDS_FRAGMENT}
`;

export const DELETE_ALLOWANCE_MUTATION = `
  mutation DeleteAllowance($id: ID!) {
    deleteAllowance(id: $id)
  }
`;
