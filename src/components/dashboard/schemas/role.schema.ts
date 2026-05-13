import * as z from 'zod';
import { PermissionScope } from '@/features/roles/roles.types';

export const roleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  level: z.number().min(1, 'Level must be at least 1').max(5, 'Level cannot exceed 5'),
  description: z.string().optional().or(z.literal('')),
  permissions: z.array(z.string()).min(1, 'At least one permission must be selected'),
  scope: z.nativeEnum(PermissionScope),
  moduleScopes: z.record(z.string(), z.nativeEnum(PermissionScope)),
});

export type RoleFormValues = z.infer<typeof roleSchema>;