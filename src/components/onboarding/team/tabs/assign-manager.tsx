"use client";

import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { FormSelect } from "@/components/ui/FormSelect";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useProfile } from "@/features/auth/hooks/useAuth";
import { useEmployees } from "@/features/employee/hooks/useEmployee";
import { useOrganizationHierarchy, useAssignUserToOU } from "@/features/organization/hooks/useOrganization";
import { useRoles } from "@/features/roles/hooks/useRoles";
import { OrganizationUnitType } from "@/features/organization/organization.types";
import { UniversalDataTable, ColumnConfig } from "@/components/ui/universal-data-table";
import { useToast } from "@/hooks/use-toast";

interface AssignManagerTabProps {
  t: any;
}

export function AssignManagerTab({ t }: AssignManagerTabProps) {
  const { toast } = useToast();
  const { data: profile } = useProfile();
  const { data: employees, isLoading: employeesLoading } = useEmployees();
  const { data: hierarchy, isLoading: hierarchyLoading, refetch: refetchHierarchy } = useOrganizationHierarchy();
  const { data: roles } = useRoles(profile?.companyId);
  const assignMutation = useAssignUserToOU();
  const { control, setValue } = useForm({
    defaultValues: {
      selectedLevel: "",
      managerAssignments: {} as Record<string, string>
    }
  });

  const selectedLevel = useWatch({ control, name: "selectedLevel" });
  const managerAssignments = useWatch({ control, name: "managerAssignments" }) || {};

  const flattenUnits = (units: OrganizationUnitType[]): OrganizationUnitType[] => {
    let flat: OrganizationUnitType[] = [];
    units.forEach((unit) => {
      flat.push(unit);
      if (unit.children?.length) flat = flat.concat(flattenUnits(unit.children));
    });
    return flat;
  };

  const allUnits = hierarchy ? flattenUnits(hierarchy) : [];
  const uniqueLevels = Array.from(new Set(allUnits.map(u => u.type))).map(type => {
    const name = type.charAt(0) + type.slice(1).toLowerCase().replace('_', ' ');
    return { id: type, name };
  });

  useEffect(() => {
    if (!selectedLevel && uniqueLevels.length > 0) {
      setValue("selectedLevel", uniqueLevels[0].id);
    }
  }, [uniqueLevels, selectedLevel, setValue]);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());


  const availableUnits = allUnits.filter(u => u.type === selectedLevel);
  const allEmployees = employees || [];

  const columns: ColumnConfig<OrganizationUnitType>[] = [
    { key: "name", label: t("unitTable.name") },
    { 
      key: "totalMembers", 
      label: t("unitTable.membersCount"), 
      render: (item) => item.totalMembers ?? item.members?.length ?? 0 
    },
    {
      key: "members",
      label: t("unitTable.members"),
      render: (item) => {
        if (!item.members || item.members.length === 0) return "-";
        return item.members.map(m => `${m.firstName} ${m.lastName}`).join(", ");
      }
    },
    {
      key: "manager",
      label: t("unitTable.manager"),
      render: (item) => {
          const manager = item.members?.find(m => m.role === "MANAGER");
          return manager ? `${manager.firstName} ${manager.lastName}` : "-";
      }
    }
  ];

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
      <Card className="overflow-hidden rounded-[12px] border border-border bg-card shadow-none">
        <CardHeader className="flex h-14 flex-row items-center border-b border-border/40 bg-muted/30 px-6 py-0 space-y-0">
          <CardTitle className="text-[15px] font-semibold text-foreground">{t("assignManagers.title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col p-6">
          <div className="w-95">
            <FormSelect
              id="selectedLevel"
              label={t("assignManagers.selectLevel")}
              placeholder={hierarchyLoading ? t("assignManagers.loading") : t("assignManagers.selectLevelPlaceholder")}
              control={control}
              name="selectedLevel"
              options={uniqueLevels.map(l => ({ label: l.name, value: l.id }))}
              t={t}
            />
          </div>
          
          <div className="border-t border-border/40 mb-6"></div>

          <div className="flex flex-col gap-4">
            {hierarchyLoading ? (
              <div className="flex items-center justify-center p-8 text-muted-foreground gap-2">
                <Loader2 className="size-4 animate-spin" />
                <span className="text-sm">{t("assignManagers.loading")}</span>
              </div>
            ) : availableUnits.length === 0 ? (
              <div className="p-8 text-center text-[13px] text-muted-foreground/60 border border-dashed rounded-[12px]">
                {t("assignManagers.noUnits")}
              </div>
            ) : (
              availableUnits.map((unit) => (
                <div key={unit.id} className="flex items-center justify-between p-5 border border-border/60 rounded-[12px] h-23 shadow-sm">
                  <span className="text-[15px] font-medium text-foreground">{unit.name}</span>
                  <div className="flex flex-col w-85">
                    <FormSelect
                      id={`manager-${unit.id}`}
                      label={t("assignManagers.assignManagerLabel")}
                      placeholder={employeesLoading ? t("assignManagers.loading") : t("assignManagers.selectManagerPlaceholder")}
                      control={control}
                      name={`managerAssignments.${unit.id}` as any}
                      options={allEmployees.filter(emp => !!emp.userId).map(emp => ({ label: `${emp.firstName} ${emp.lastName}`, value: emp.userId as string }))}
                      t={t}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end pt-8">
            <Button 
              type="button" 
              disabled={assignMutation.isPending}
              onClick={async () => {
                const managerRole = roles?.find(r => r.name === "MANAGER");
                const unitIdsWithManagers = Object.keys(managerAssignments).filter(id => !!managerAssignments[id]);
                
                if (unitIdsWithManagers.length === 0) {
                  toast({ title: t("assignManagers.title"), description: t("assignManagers.noUnits") });
                  return;
                }

                try {
                  const promises = unitIdsWithManagers.map(ouId => assignMutation.mutateAsync({
                    ouId,
                    userId: managerAssignments[ouId],
                    roleId: managerRole?.id
                  }));

                  await Promise.all(promises);
                  toast({ title: "Success", description: t("assignManagers.successMessage") });
                  await refetchHierarchy();
                } catch (error: any) {
                  toast({ title: "Error", description: error.message || t("assignManagers.errorMessage"), variant: "destructive" });
                }
              }}
              className="px-6 h-[40px] text-[14px] bg-primary/10 hover:bg-primary/20 text-primary font-medium shadow-none rounded-[8px] gap-2 border-none transition-colors"
            >
              {assignMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              {t("assignManagers.saveAssignment")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4">
        <UniversalDataTable
          columns={columns}
          data={availableUnits}
          isLoading={hierarchyLoading}
          currentPage={1} pageSize={10} totalPages={1} totalItems={availableUnits.length}
          onPageChange={() => {}} onPageSizeChange={() => {}}
          enableSelection selectedIds={selectedIds} onSelectionChange={setSelectedIds}
          emptyMessage={t("assignManagers.noUnits")}
        />
      </div>
    </div>
  );
}
