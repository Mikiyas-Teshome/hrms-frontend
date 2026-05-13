export const ACTIVATE_COMPANY_MUTATION = `
  mutation ActivateCompany($id: String!) {
    activateCompany(id: $id) {
      id
      name
      status
      updatedAt
    }
  }
`;

export const CREATE_COMPANY_MUTATION = `
  mutation CreateCompany($input: CreateCompanyInput!) {
    createCompany(input: $input) {
      id
      name
      slug
      status
      tier
      createdAt
    }
  }
`;

export const SUSPEND_COMPANY_MUTATION = `
  mutation SuspendCompany($id: String!) {
    suspendCompany(id: $id) {
      id
      name
      status
      updatedAt
    }
  }
`;

export const UPDATE_COMPANY_MUTATION = `
  mutation UpdateCompany($id: String!, $input: UpdateCompanyInput!) {
    updateCompany(id: $id, input: $input) {
      id
      name
      slug
      description
      logo
      website
      updatedAt
    }
  }
`;

export const UPDATE_COMPANY_BRANDING_MUTATION = `
  mutation UpdateCompanyBranding($id: String!, $input: BrandingInput!) {
    updateCompanyBranding(id: $id, input: $input) {
      id
      name
      updatedAt
    }
  }
`;

export const UPDATE_COMPANY_FIREBASE_MUTATION = `
  mutation UpdateCompanyFirebase($id: String!, $input: FirebaseConfigInput!) {
    updateCompanyFirebase(id: $id, input: $input) {
      id
      name
      updatedAt
    }
  }
`;

export const UPDATE_COMPANY_SMTP_MUTATION = `
  mutation UpdateCompanySmtp($id: String!, $input: SmtpConfigInput!) {
    updateCompanySmtp(id: $id, input: $input) {
      id
      name
      updatedAt
    }
  }
`;

export const GET_COMPANIES_QUERY = `
  query GetCompanies {
    companies {
      id
      name
      slug
      status
      tier
      currentEmployees
      maxEmployees
      createdAt
    }
  }
`;

export const GET_COMPANY_QUERY = `
  query GetCompany($id: String!) {
    company(id: $id) {
      id
      name
      slug
      description
      logo
      website
      status
      tier
      currentEmployees
      maxEmployees
      createdAt
      updatedAt
    }
  }
`;

export const GET_COMPANY_BY_SLUG_QUERY = `
  query GetCompanyBySlug($slug: String!) {
    companyBySlug(slug: $slug) {
      id
      name
      slug
      description
      logo
      website
      status
      tier
      currentEmployees
      maxEmployees
      createdAt
      updatedAt
    }
  }
`;

export const GET_COMPANY_SUBSCRIPTION_STATUS_QUERY = `
  query GetCompanySubscriptionStatus($id: String!) {
    companySubscriptionStatus(id: $id) {
      status
      expiresAt
      plan
    }
  }
`;
