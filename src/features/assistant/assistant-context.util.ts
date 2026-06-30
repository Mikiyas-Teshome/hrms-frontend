import {
  AssistantContextInput,
  AssistantFilterOptionsResponse,
  AssistantSelectOption,
} from './assistant.types';
import type { PermissionsMap } from '@/features/roles/roles.types';

export type AssistantUiContextState = {
  organizationId: string;
  focusAreaId: string;
  datePresetId: string;
};

export const DEFAULT_ASSISTANT_UI_CONTEXT: AssistantUiContextState = {
  organizationId: 'all',
  focusAreaId: 'all',
  datePresetId: 'this_month',
};

const DEFAULT_DATE_PRESETS: AssistantSelectOption[] = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'last_7_days', label: 'Last 7 days' },
  { id: 'last_30_days', label: 'Last 30 days' },
  { id: 'this_month', label: 'This month' },
  { id: 'last_month', label: 'Last month' },
];

const hasModuleAccess = (map: PermissionsMap, module: string): boolean =>
  Boolean(map.all?.manage || map[module]?.read || map[module]?.manage);

export function buildFocusAreasFromPermissionsMap(map: PermissionsMap): AssistantSelectOption[] {
  const focusAreas: AssistantSelectOption[] = [{ id: 'all', label: 'All modules' }];

  if (hasModuleAccess(map, 'employees')) {
    focusAreas.push({ id: 'employees', label: 'Employees' });
  }
  if (hasModuleAccess(map, 'attendance')) {
    focusAreas.push({ id: 'attendance', label: 'Attendance' });
  }
  if (hasModuleAccess(map, 'leave_requests')) {
    focusAreas.push({ id: 'leave', label: 'Leave' });
  }
  if (hasModuleAccess(map, 'reports_payroll')) {
    focusAreas.push({ id: 'payroll', label: 'Payroll' });
  }
  if (hasModuleAccess(map, 'compliance')) {
    focusAreas.push({ id: 'documents', label: 'Documents' });
  }

  return focusAreas;
}

export function buildOrganizationsFromHrFilterOptions(
  options?: {
    companies: Array<{ id: string; name: string }>;
    divisions: Array<{ id: string; name: string }>;
    subDivisions: Array<{ id: string; name: string }>;
  },
): AssistantSelectOption[] {
  if (!options) {
    return [{ id: 'all', label: 'Full organization' }];
  }

  return [
    { id: 'all', label: 'Full organization' },
    ...options.companies.map((unit) => ({ id: `company:${unit.id}`, label: unit.name })),
    ...options.divisions.map((unit) => ({ id: `division:${unit.id}`, label: unit.name })),
    ...options.subDivisions.map((unit) => ({ id: `division:${unit.id}`, label: unit.name })),
  ];
}

export function resolveAssistantFilterOptions(
  apiOptions: AssistantFilterOptionsResponse | undefined,
  permissionsMap: PermissionsMap,
  hrFilterOptions?: {
    companies: Array<{ id: string; name: string }>;
    divisions: Array<{ id: string; name: string }>;
    subDivisions: Array<{ id: string; name: string }>;
  },
): AssistantFilterOptionsResponse {
  const apiFocusAreas = apiOptions?.focusAreas ?? [];
  const focusAreas =
    apiFocusAreas.length > 1 ? apiFocusAreas : buildFocusAreasFromPermissionsMap(permissionsMap);

  const apiOrganizations = apiOptions?.organizations ?? [];
  const organizations =
    apiOrganizations.length > 1
      ? apiOrganizations
      : buildOrganizationsFromHrFilterOptions(hrFilterOptions);

  return {
    organizations,
    focusAreas,
    datePresets:
      apiOptions?.datePresets && apiOptions.datePresets.length > 0
        ? apiOptions.datePresets
        : DEFAULT_DATE_PRESETS,
  };
}

export function buildAssistantContextInput(state: AssistantUiContextState): AssistantContextInput | undefined {
  const context: AssistantContextInput = {};

  if (state.organizationId.startsWith('company:')) {
    context.companyOuId = state.organizationId.replace('company:', '');
  } else if (state.organizationId.startsWith('division:')) {
    context.divisionOuId = state.organizationId.replace('division:', '');
  }

  if (state.focusAreaId !== 'all') {
    context.focusArea = state.focusAreaId;
  }

  if (state.datePresetId) {
    context.datePreset = state.datePresetId;
  }

  return Object.keys(context).length > 0 ? context : undefined;
}

export function getAssistantContextLabel(
  options: AssistantFilterOptionsResponse | undefined,
  state: AssistantUiContextState,
): string {
  const org =
    options?.organizations.find((item) => item.id === state.organizationId)?.label ?? 'Full organization';
  const focus = options?.focusAreas.find((item) => item.id === state.focusAreaId)?.label ?? 'All modules';
  const date = options?.datePresets.find((item) => item.id === state.datePresetId)?.label ?? 'This month';
  return `${org} · ${focus} · ${date}`;
}

export function parseStoredAssistantContext(
  contextFilters?: string,
): AssistantUiContextState {
  if (!contextFilters) {
    return DEFAULT_ASSISTANT_UI_CONTEXT;
  }

  try {
    const parsed = JSON.parse(contextFilters) as AssistantContextInput;
    return {
      organizationId: parsed.divisionOuId
        ? `division:${parsed.divisionOuId}`
        : parsed.companyOuId
          ? `company:${parsed.companyOuId}`
          : 'all',
      focusAreaId: parsed.focusArea ?? 'all',
      datePresetId: parsed.datePreset ?? 'this_month',
    };
  } catch {
    return DEFAULT_ASSISTANT_UI_CONTEXT;
  }
}
