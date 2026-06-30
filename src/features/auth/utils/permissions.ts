import { PermissionsMap } from "@/features/roles/roles.types";

export const hasModuleAccess = (
  permissionsMap: PermissionsMap | null | undefined,
  module: string,
  options?: { action?: string; actionsAny?: string[] },
): boolean => {
  if (!permissionsMap) {
    return false;
  }

  if (permissionsMap["all"]?.["manage"]) {
    return true;
  }

  const modulePerms = permissionsMap[module];
  if (!modulePerms) {
    return false;
  }

  const checkAction = (action: string) =>
    !!modulePerms[action] ||
    !!modulePerms["manage"] ||
    (action === "read" && Object.keys(modulePerms).length > 0);

  const actionsAny = options?.actionsAny;
  if (actionsAny?.length) {
    return actionsAny.some((action) => checkAction(action));
  }

  return checkAction(options?.action ?? "read");
};

export const hasPermission = (
  permissionsMap: PermissionsMap | null | undefined,
  module: string,
  action: string = "read"
): boolean => {
  if (!permissionsMap) return false;
  
  if (permissionsMap["all"]?.["manage"]) {
    return true;
  }

  if (permissionsMap[module]?.["manage"]) {
    return true;
  }

  if (permissionsMap[module]?.[action]) {
    return true;
  }

  return false;
};
