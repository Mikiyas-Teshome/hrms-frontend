import * as zod from "zod";
import { OUType } from "@/types/domain";

export const orgStructureSchema = zod.object({
  groupName: zod.string().min(1, "groupNameRequired"),
  hierarchyLevels: zod.array(
    zod.object({
      id: zod.string(),
      type: zod.nativeEnum(OUType),
      name: zod.string().min(1, "levelNameRequired"),
      isActive: zod.boolean(),
    })
  ),
  units: zod.array(
    zod.object({
      id: zod.string(),
      name: zod.string().min(1, "unitNameRequired"),
      type: zod.nativeEnum(OUType),
      parentId: zod.string().optional(),
      industry: zod.string().optional(),
      address: zod.string().optional(),
      legalName: zod.string().optional(),
      taxId: zod.string().optional(),
      registrationNumber: zod.string().optional(),
      tradeLicenseNumber: zod.string().optional(),
      currency: zod.string().optional(),
      timezone: zod.string().optional(),
      themeColor: zod.string().optional(),
      dunsNumber: zod.string().optional(),
    })
  ),
  locations: zod.array(
    zod.object({
      name: zod.string().min(1, "locationNameRequired"),
      address: zod.string().min(1, "addressRequired"),
    })
  ).optional(),
});

export type OrgStructureValues = zod.infer<typeof orgStructureSchema>;
