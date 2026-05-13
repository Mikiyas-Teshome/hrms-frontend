export const DEDUCTION_FIELDS_FRAGMENT = `
  fragment DeductionFields on DeductionResponse {
    id
    companyId
    name
    type
    value
    recurring
    createdAt
    updatedAt
  }
`;

export const GET_DEDUCTIONS_QUERY = `
  query GetDeductions($companyId: String!) {
    deductions(companyId: $companyId) {
      ...DeductionFields
    }
  }
  ${DEDUCTION_FIELDS_FRAGMENT}
`;

export const CREATE_DEDUCTION_MUTATION = `
  mutation CreateDeduction($input: CreateDeductionInput!) {
    createDeduction(input: $input) {
      ...DeductionFields
    }
  }
  ${DEDUCTION_FIELDS_FRAGMENT}
`;

export const DELETE_DEDUCTION_MUTATION = `
  mutation DeleteDeduction($id: ID!) {
    deleteDeduction(id: $id)
  }
`;
