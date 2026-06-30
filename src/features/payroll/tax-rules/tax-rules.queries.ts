export const TAX_BRACKET_FIELDS_FRAGMENT = `
  fragment TaxBracketFields on TaxBracketResponse {
    id
    minAmount
    maxAmount
    rate
    sortOrder
  }
`;

export const TAX_RULE_FIELDS_FRAGMENT = `
  fragment TaxRuleFields on TaxRuleResponse {
    id
    companyId
    name
    description
    status
    effectiveFrom
    effectiveTo
    createdAt
    updatedAt
    brackets {
      ...TaxBracketFields
    }
  }
  ${TAX_BRACKET_FIELDS_FRAGMENT}
`;

export const GET_TAX_RULES_QUERY = `
  query GetTaxRules($companyId: String) {
    taxRules(companyId: $companyId) {
      ...TaxRuleFields
    }
  }
  ${TAX_RULE_FIELDS_FRAGMENT}
`;

export const GET_TAX_RULE_QUERY = `
  query GetTaxRule($id: ID!) {
    taxRule(id: $id) {
      ...TaxRuleFields
    }
  }
  ${TAX_RULE_FIELDS_FRAGMENT}
`;

export const CREATE_TAX_RULE_MUTATION = `
  mutation CreateTaxRule($input: CreateTaxRuleInput!) {
    createTaxRule(input: $input) {
      ...TaxRuleFields
    }
  }
  ${TAX_RULE_FIELDS_FRAGMENT}
`;

export const UPDATE_TAX_RULE_MUTATION = `
  mutation UpdateTaxRule($id: ID!, $input: UpdateTaxRuleInput!) {
    updateTaxRule(id: $id, input: $input) {
      ...TaxRuleFields
    }
  }
  ${TAX_RULE_FIELDS_FRAGMENT}
`;

export const DELETE_TAX_RULE_MUTATION = `
  mutation DeleteTaxRule($id: ID!) {
    deleteTaxRule(id: $id)
  }
`;
