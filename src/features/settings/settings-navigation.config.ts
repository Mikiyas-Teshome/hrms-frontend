export type SettingsPermissionRule =
    | { alwaysVisible: true }
    | { permissionsAny: Array<{ module: string; action: string }> };

export type SettingsNavConfigItem = {
    id: string;
    labelKey: string;
    rule: SettingsPermissionRule;
};

export const SETTINGS_NAV_CONFIG: SettingsNavConfigItem[] = [
    {
        id: 'general',
        labelKey: 'nav.general',
        rule: { permissionsAny: [{ module: 'company', action: 'update' }] },
    },
    {
        id: 'appearance',
        labelKey: 'nav.appearance',
        rule: { permissionsAny: [{ module: 'company', action: 'update' }] },
    },
    {
        id: 'org-preferences',
        labelKey: 'nav.orgPreferences',
        rule: { permissionsAny: [{ module: 'company', action: 'update' }] },
    },
    {
        id: 'attendance',
        labelKey: 'nav.attendance',
        rule: {
            permissionsAny: [
                { module: 'shifts', action: 'create' },
                { module: 'shifts', action: 'update' },
                { module: 'attendance', action: 'override' },
            ],
        },
    },
    {
        id: 'leave',
        labelKey: 'nav.leave',
        rule: {
            permissionsAny: [
                { module: 'leave_policies', action: 'create' },
                { module: 'leave_policies', action: 'update' },
                { module: 'leave_balances', action: 'update' },
            ],
        },
    },
    {
        id: 'payroll',
        labelKey: 'nav.payroll',
        rule: {
            permissionsAny: [
                { module: 'payroll_components', action: 'update' },
                { module: 'payroll_components', action: 'create' },
                { module: 'payroll_runs', action: 'update' },
                { module: 'employee_salaries', action: 'update' },
            ],
        },
    },
    {
        id: 'security',
        labelKey: 'nav.security',
        rule: { alwaysVisible: true },
    },
    {
        id: 'comp-off',
        labelKey: 'nav.compOff',
        rule: {
            permissionsAny: [
                { module: 'shifts', action: 'create' },
                { module: 'shifts', action: 'update' },
                { module: 'attendance', action: 'override' },
            ],
        },
    },
];
