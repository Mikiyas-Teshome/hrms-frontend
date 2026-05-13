import { OUType } from "@/types/domain";
import { OrgStructureValues } from "@/components/onboarding/schemas/org-structure";

export const emptyOrgStructureValues: OrgStructureValues = {
  groupName: "",
  hierarchyLevels: [
    { id: "level1", type: OUType.GROUP, name: "Group", isActive: false },
    { id: "level2", type: OUType.COMPANY, name: "Company", isActive: true },
    { id: "level3", type: OUType.DIVISION, name: "Division", isActive: true },
    { id: "level4", type: OUType.SUB_DIVISION, name: "Sub-division", isActive: true },
    { id: "level5", type: OUType.DEPARTMENT, name: "Department", isActive: true },
  ],
  units: [],
  locations: [],
};
