import { PermissionsMap } from "@/features/roles/roles.types";

export const hasPermission = (
  permissionsMap: PermissionsMap | null | undefined,
  module: string,
  action: string = "read"
): boolean => {
  if (!permissionsMap) return false;
  
  // Wildcard: 'all' module with 'manage' action grants everything
  if (permissionsMap["all"]?.["manage"]) {
    return true;
  }

  // Check for 'manage' action on the specific module
  if (permissionsMap[module]?.["manage"]) {
    return true;
  }

  // Direct check: permissionsMap[module][action]
  if (permissionsMap[module]?.[action]) {
    return true;
  }

  return false;
};
