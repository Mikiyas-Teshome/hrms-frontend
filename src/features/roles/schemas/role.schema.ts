import * as z from 'zod';
import { PermissionScope } from '@/features/roles/roles.types';

export const roleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  description: z.string().optional().or(z.literal('')),
  permissions: z.array(z.string()).min(1, 'At least one permission must be selected'),
  scope: z.nativeEnum(PermissionScope),
  permissionScopes: z.record(z.string(), z.nativeEnum(PermissionScope)),
});

export type RoleFormValues = z.infer<typeof roleSchema>;