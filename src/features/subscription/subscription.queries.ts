export const PLAN_FIELDS_FRAGMENT = `
  fragment PlanFields on PlanType {
    id
    name
    description
    price
    currency
    tier
    isActive
    features
    createdAt
    updatedAt
  }
`;

export const CREATE_SUBSCRIPTION_PLAN_MUTATION = `
  mutation CreateSubscriptionPlan($input: CreatePlanInput!) {
    createSubscriptionPlan(input: $input) {
      ...PlanFields
    }
  }
  ${PLAN_FIELDS_FRAGMENT}
`;

export const UPDATE_SUBSCRIPTION_PLAN_MUTATION = `
  mutation UpdateSubscriptionPlan($input: UpdatePlanInput!) {
    updateSubscriptionPlan(input: $input) {
      ...PlanFields
    }
  }
  ${PLAN_FIELDS_FRAGMENT}
`;

export const DELETE_SUBSCRIPTION_PLAN_MUTATION = `
  mutation DeleteSubscriptionPlan($id: ID!) {
    deleteSubscriptionPlan(id: $id)
  }
`;

export const GET_SUBSCRIPTION_PLAN_QUERY = `
  query GetSubscriptionPlan($id: ID!) {
    getSubscriptionPlan(id: $id) {
      ...PlanFields
    }
  }
  ${PLAN_FIELDS_FRAGMENT}
`;

export const GET_SUBSCRIPTION_PLANS_QUERY = `
  query GetSubscriptionPlans {
    getSubscriptionPlans {
      ...PlanFields
    }
  }
  ${PLAN_FIELDS_FRAGMENT}
`;
