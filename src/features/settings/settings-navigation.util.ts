import { hasPermission } from '@/features/auth/utils/permissions';
import type { PermissionsMap } from '@/features/roles/roles.types';
import {
    SETTINGS_NAV_CONFIG,
    type SettingsNavConfigItem,
    type SettingsPermissionRule,
} from './settings-navigation.config';

function isSettingsRuleAllowed(
    permissionsMap: PermissionsMap | null | undefined,
    rule: SettingsPermissionRule,
): boolean {
    if ('alwaysVisible' in rule && rule.alwaysVisible) {
        return true;
    }

    if ('permissionsAny' in rule) {
        return rule.permissionsAny.some(({ module, action }) =>
            hasPermission(permissionsMap, module, action),
        );
    }

    return false;
}

export function getVisibleSettingsNavItems(
    permissionsMap: PermissionsMap | null | undefined,
): SettingsNavConfigItem[] {
    if (!permissionsMap) {
        return SETTINGS_NAV_CONFIG.filter((item) => 'alwaysVisible' in item.rule && item.rule.alwaysVisible);
    }

    return SETTINGS_NAV_CONFIG.filter((item) => isSettingsRuleAllowed(permissionsMap, item.rule));
}

export function canAccessSettings(permissionsMap: PermissionsMap | null | undefined): boolean {
    return getVisibleSettingsNavItems(permissionsMap).length > 0;
}

export function isSettingsSectionAllowed(
    permissionsMap: PermissionsMap | null | undefined,
    sectionId: string,
): boolean {
    const item = SETTINGS_NAV_CONFIG.find((entry) => entry.id === sectionId);
    if (!item) {
        return false;
    }

    return isSettingsRuleAllowed(permissionsMap, item.rule);
}
