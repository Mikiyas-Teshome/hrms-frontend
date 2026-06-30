'use server';

import { authGqlRequest } from '@/lib/auth-graphql-client';
import { safeAction, type ActionResult } from '@/lib/safe-action';
import {
  EXECUTIVE_DASHBOARD_QUERY,
  UPDATE_EXECUTIVE_DASHBOARD_MUTATION,
} from './executive-dashboard.queries';
import type {
  ExecutiveDashboardResponse,
  UpdateExecutiveDashboardInput,
} from './executive-dashboard.types';

export const getExecutiveDashboard = async (): Promise<
  ActionResult<ExecutiveDashboardResponse>
> => {
  return safeAction(async () => {
    const data = await authGqlRequest<{ executiveDashboard: ExecutiveDashboardResponse }>(
      EXECUTIVE_DASHBOARD_QUERY,
    );
    return data.executiveDashboard;
  });
};

export const updateExecutiveDashboard = async (
  input: UpdateExecutiveDashboardInput,
): Promise<ActionResult<ExecutiveDashboardResponse>> => {
  return safeAction(async () => {
    const data = await authGqlRequest<{ updateExecutiveDashboard: ExecutiveDashboardResponse }>(
      UPDATE_EXECUTIVE_DASHBOARD_MUTATION,
      { input },
    );
    return data.updateExecutiveDashboard;
  });
};
