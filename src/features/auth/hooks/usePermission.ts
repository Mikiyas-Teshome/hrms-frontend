"use client";

import { useAuth } from "@/contexts/AuthContext";
import { hasPermission } from "../utils/permissions";

export const usePermission = (module: string, action: string = "read") => {
  const { permissionsMap } = useAuth();
  return hasPermission(permissionsMap, module, action);
};
