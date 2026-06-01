"use client";

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import {Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  OnboardingStepTabs,
  OnboardingStepTabsList,
  OnboardingStepTabTrigger,
  OnboardingStepTabsContent,
} from "@/components/onboarding/shared/onboarding-step-tabs";
import { useRouter } from "next/navigation";
import { orgStructureSchema, type OrgStructureValues } from "@/components/onboarding/schemas/org-structure";
import { OnboardingFormActions } from "@/components/onboarding/shared/onboarding-form-actions";
import { useOnboarding } from "@/components/onboarding/context/OnboardingContext";
import { useCreateOrganizationUnit, useUpdateOrganizationUnit, useOrganizationHierarchy, useDeactivateOrganizationUnit, useUpdateOrganizationNomenclature, useOrganizationNomenclature } from "@/features/organization/hooks/useOrganization";
import { useToast } from "@/hooks/use-toast";
import { emptyOrgStructureValues } from "@/data/org-structure-defaults";
import { UnitSheet } from "@/components/onboarding/organization/builder/unit-sheet";
import { UnitDetailSheet } from "@/components/onboarding/organization/builder/unit-detail-sheet";
import ConfirmationModal from "@/components/dashboard/shared/ConfirmationModal";
import { HierarchyNode } from "@/components/onboarding/organization/hierarchy-node";
import { HierarchyTreeBuilder } from "@/components/onboarding/organization/builder/hierarchy-tree-builder";
import { SimpleUnitModal } from "@/components/onboarding/organization/builder/simple-unit-modal";
import { OrganizationStructureSkeleton } from "./organization-structure-skeleton";

interface OrganizationStructureFormProps {
  onNext?: () => void;
  onBack?: () => void;
}

export function OrganizationStructureForm({
  onNext,
  onBack,
}: OrganizationStructureFormProps) {
  const { t } = useTranslation("orgStructure");
  const router = useRouter();
  const { setStructureData } = useOnboarding();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("hierarchy");

  // Sheet State
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetConfig, setSheetConfig] = useState<{
    mode: "add" | "edit";
    levelIdx: number;
    unit?: any;
    unitIdx?: number;
    defaultParentId?: string;
  } | null>(null);

  // Simple Modal State (for non-company units)
  const [isSimpleModalOpen, setIsSimpleModalOpen] = useState(false);
  const [simpleModalConfig, setSimpleModalConfig] = useState<{
    mode: "add" | "edit";
    levelIdx: number;
    parentId: string;
    unitIdx?: number;
    unitId?: string; // for units from hierarchy not yet in form units array
    initialName?: string;
  } | null>(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteUnitId, setDeleteUnitId] = useState<string | null>(null);

  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [viewUnitId, setViewUnitId] = useState<string | null>(null);

  // Backend integration
  const createOUMutation = useCreateOrganizationUnit();
  const updateOUMutation = useUpdateOrganizationUnit();
  const deactivateOUMutation = useDeactivateOrganizationUnit();
  const nomenclatureMutation = useUpdateOrganizationNomenclature();
  const { data: nomenclature, refetch: refetchNomenclature } = useOrganizationNomenclature();
  const { data: hierarchy, refetch: refetchHierarchy, isLoading: isHierarchyLoading, isFetching: isHierarchyFetching } = useOrganizationHierarchy();
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<OrgStructureValues>({
    resolver: zodResolver(orgStructureSchema),
    defaultValues: emptyOrgStructureValues,
  });

  const { fields: levelFields } = useFieldArray({
    control,
    name: "hierarchyLevels",
  });

  const { append: appendUnit, remove: removeUnit } = useFieldArray({
    control,
    name: "units",
  });

  const hierarchyLevels = useWatch({ control, name: "hierarchyLevels" });
  const units = useWatch({ control, name: "units" }) || [];

  // Sync group name from nomenclature if available
  useEffect(() => {
    if (nomenclature && nomenclature.length > 0) {
      const groupNom = nomenclature.find(n => n.type === 'GROUP');
      if (groupNom) {
        setValue("groupName", groupNom.label);
        setValue("hierarchyLevels.0.name", groupNom.label);
      }
    }
  }, [nomenclature, setValue]);

  const onSubmit = async (data: OrgStructureValues) => {
    try {      
      const rootGroup = hierarchy?.[0];
      if (!rootGroup) {
        throw new Error("Root group not found. Cannot create hierarchy.");
      }

      const idMap: Record<string, string> = { "root": rootGroup.id };
      
      const unitTypesByLevel = ["COMPANY", "DIVISION", "SUB_DIVISION", "DEPARTMENT"];
      const formUnits = data.units || [];

      for (const type of unitTypesByLevel) {
        const unitsOfType = formUnits.filter(u => u.type === type);
        for (const unit of unitsOfType) {
          const parentKey = unit.parentId || "root";
          const realParentId = idMap[parentKey];
          
          if (!realParentId) continue;

          const response = await createOUMutation.mutateAsync({
            name: unit.name,
            type: unit.type as any,
            parentId: realParentId,
            legalName: (unit as any).legalName,
            taxId: (unit as any).taxId,
            registrationNumber: (unit as any).registrationNumber,
            tradeLicenseNumber: (unit as any).tradeLicenseNumber,
            currency: (unit as any).currency,
            timezone: (unit as any).timezone,
            address: (unit as any).address,
            themeColor: (unit as any).themeColor,
            dunsNumber: (unit as any).dunsNumber,
            industry: (unit as any).industry,
          });

          idMap[unit.id] = response.id;
        }
      }

      setStructureData(data);
      if (onNext) onNext();
      else router.push("/onboarding/hr-policies");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Setup Failed",
        description: error.message || "An error occurred.",
      });
    }
  };

  const handleUpdateNomenclature = async () => {
    try {
      const currentLevels = watch("hierarchyLevels");
      const activeLevels = currentLevels.filter((l, idx) => idx === 0 || l.isActive);
      
      const inputs = activeLevels.map(l => ({
        label: l.name,
        type: l.type
      }));

      await nomenclatureMutation.mutateAsync({
        inputs,
        language: 'en'
      });
      
      if (currentLevels[0]?.name) {
        setValue("groupName", currentLevels[0].name);
      }

      toast({ title: t("hierarchy.nomenclatureUpdated") || "Nomenclature updated" });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Failed to update labels.",
      });
    }
  };

  const flattenHierarchyNodes = (nodes: any[]): any[] => {
    const result: any[] = [];
    const traverse = (node: any) => {
      result.push(node);
      (node.children || []).forEach(traverse);
    };
    nodes.forEach(traverse);
    return result;
  };

  const getParentOptions = (levelIdx: number) => {
    if (levelIdx === 0) return [];
    
    const prevLevel = hierarchyLevels[levelIdx - 1];
    const allExistingUnits = flattenHierarchyNodes(hierarchy || []);
    
    // Combine units from form state and hierarchy tree for robustness
    const allAvailableUnits = [
      ...allExistingUnits,
      ...units.filter(u => !allExistingUnits.some(node => node.id === u.id))
    ];

    if (levelIdx === 1) {
      const rootUnit = hierarchy?.[0];
      return [{ 
        id: rootUnit?.id || "root", 
        name: rootUnit?.name || watch("groupName") || t("builder.groupNamePlaceholder") 
      }];
    }

    return allAvailableUnits
      .filter(u => u.type === prevLevel.type)
      .map(u => ({ id: u.id, name: u.name }));
  };

  const getLabel = (type: string, levelIdx: number) => {
    return hierarchyLevels[levelIdx]?.name || type;
  }

  const flattenUnit = (unit: any) => {
    if (!unit) return null;
    const { companyProfile, ...rest } = unit;
    const { ...profileData } = companyProfile || {};
    return {
      ...rest,
      ...profileData,
    };
  };

  const handleOpenAddSheet = (levelIdx: number, preselectedParentId?: string) => {
    const levelType = hierarchyLevels[levelIdx]?.type;
    
    if (levelType !== "COMPANY") {
      setSimpleModalConfig({
        mode: "add",
        levelIdx,
        parentId: preselectedParentId || "root",
      });
      setSheetConfig(null);
      setIsSimpleModalOpen(true);
      return;
    }

    setSheetConfig({
      mode: "add",
      levelIdx,
      defaultParentId: preselectedParentId,
    });
    setIsSheetOpen(true);
  };

  const handleOpenEditSheet = (unitIdx: number, mode: "edit" | "view") => {
    const unit = units[unitIdx];
    const levelIdx = hierarchyLevels.findIndex(l => l.type === unit.type);

    if (mode === "view") {
      setViewUnitId(unit.id || null);
      setIsDetailSheetOpen(true);
      return;
    }

    if (unit.type !== "COMPANY") {
      setSimpleModalConfig({
        mode: "edit",
        levelIdx,
        parentId: unit.parentId || "root",
        unitIdx,
        initialName: unit.name,
      });
      setSheetConfig(null);
      setIsSimpleModalOpen(true);
      return;
    }

    setSheetConfig({
      mode,
      levelIdx,
      unit: flattenUnit(unit),
      unitIdx,
    });
    setIsSheetOpen(true);
  };

  const handleSaveUnit = async (data: any, forcedMode?: "add" | "edit", forcedUnitIdx?: number, forcedUnitId?: string) => {
    try {
      const rootGroup = hierarchy?.[0];
      if (!rootGroup) throw new Error("Root group not found");
      const parentId = data.parentId === "root" || !data.parentId ? rootGroup.id : data.parentId;

      const mode = forcedMode || sheetConfig?.mode || "add";
      const unitIdx = forcedUnitIdx !== undefined ? forcedUnitIdx : sheetConfig?.unitIdx;
      const unitId = forcedUnitId || sheetConfig?.unit?.id;

      if (mode === "add") {
        const response = await createOUMutation.mutateAsync({
          name: data.name,
          type: data.type,
          parentId: parentId,
          legalName: data.legalName,
          taxId: data.taxId,
          registrationNumber: data.registrationNumber,
          tradeLicenseNumber: data.tradeLicenseNumber,
          currency: data.currency,
          timezone: data.timezone,
          address: data.address,
          themeColor: data.themeColor,
          dunsNumber: data.dunsNumber,
          industry: data.industry,
        });

        appendUnit({ ...data, id: response.id });
        toast({ title: t("builder.unitCreated") || "Unit created" });
      } else if (mode === "edit") {
        const targetId = unitIdx !== undefined ? units[unitIdx]?.id : unitId;
        
        if (!targetId) throw new Error("Could not identify unit to update");

        await updateOUMutation.mutateAsync({
          id: targetId,
          name: data.name,
          legalName: data.legalName,
          taxId: data.taxId,
          registrationNumber: data.registrationNumber,
          tradeLicenseNumber: data.tradeLicenseNumber,
          currency: data.currency,
          timezone: data.timezone,
          address: data.address,
          themeColor: data.themeColor,
          dunsNumber: data.dunsNumber,
          industry: data.industry,
        });

        if (unitIdx !== undefined) {
          const updatedUnits = [...units];
          updatedUnits[unitIdx] = { ...updatedUnits[unitIdx], ...data };
          setValue("units", updatedUnits);
        }
        
        toast({ title: t("builder.unitUpdated") || "Unit updated" });
      }

      // Refetch to ensure the tree reflects latest nested structure
      await refetchHierarchy();
      setIsSheetOpen(false);
      setSheetConfig(null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving unit",
        description: error.message || "Please try again",
      });
    }
  };


  const handleOpenDeleteModal = (unitId: string) => {
    setDeleteUnitId(unitId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteUnitId) {
      try {
        await deactivateOUMutation.mutateAsync(deleteUnitId);
        // Also remove from form units if present
        const unitIdx = units.findIndex((u: any) => u.id === deleteUnitId);
        if (unitIdx !== -1) removeUnit(unitIdx);
        await refetchHierarchy();
        toast({ title: t("builder.unitDeleted") || "Unit successfully removed" });
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Delete Failed",
          description: error.message || "Failed to remove the unit.",
        });
      } finally {
        setIsDeleteModalOpen(false);
        setDeleteUnitId(null);
      }
    }
  };

  const handleLevelToggle = (index: number, checked: boolean) => {
    if (!checked) {
      for (let i = index; i < hierarchyLevels.length; i++) {
        setValue(`hierarchyLevels.${i}.isActive`, false);
      }
    } else {
      setValue(`hierarchyLevels.${index}.isActive`, true);
    }
  };

  const isLevelSwitchDisabled = (index: number): boolean => {
    if (index === 0) return true;
    for (let i = 1; i < index; i++) {
      if (!hierarchyLevels[i]?.isActive) return true;
    }
    return false;
  };

  if (isHierarchyLoading) {
    return <OrganizationStructureSkeleton />;
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <OnboardingStepTabs value={activeTab} onValueChange={setActiveTab}>
        <OnboardingStepTabsList>
          <OnboardingStepTabTrigger value="hierarchy">
            {t("tabs.hierarchy")}
          </OnboardingStepTabTrigger>
          <OnboardingStepTabTrigger value="builder">
            {t("tabs.builder")}
          </OnboardingStepTabTrigger>
        </OnboardingStepTabsList>

        <OnboardingStepTabsContent value="hierarchy">
          <Card className="rounded-[12px] border border-border/80 dark:border-[rgba(0,0,0,0.24)] bg-card dark:bg-[#1D1D1D] shadow-none dark:shadow-[0px_1px_3px_rgba(0,0,0,0.04),0px_1px_2px_-1px_rgba(0,0,0,0.04)] overflow-hidden">
            <CardHeader className="bg-muted/40 dark:bg-[rgba(10,10,10,0.5)] px-6 py-4 dark:py-4.5 border-b border-border/40 dark:border-border/10">
              <CardTitle className="text-sm font-semibold text-foreground dark:text-white font-albert-sans">{t("hierarchy.title")}</CardTitle>
            </CardHeader>
            <CardContent className="px-6 sm:px-10 pb-4 space-y-4">
              <div className="overflow-x-auto overflow-y-hidden -mx-2 px-2 [--indent-size:32px] sm:[--indent-size:48px]">
                {(() => {
                  let tree: React.ReactNode = null;
                  const activeLevelsCount = levelFields.length;
                  for (let i = activeLevelsCount - 1; i >= 0; i--) {
                    tree = (
                      <HierarchyNode
                        key={`level-${i}`}
                        index={i}
                        isLast={i === activeLevelsCount - 1}
                        inner={tree || undefined}
                        hierarchyLevels={hierarchyLevels}
                        t={t}
                        register={register}
                        isLevelSwitchDisabled={isLevelSwitchDisabled}
                        handleLevelToggle={handleLevelToggle}
                        handleUpdateNomenclature={handleUpdateNomenclature}
                      />
                    );
                  }
                  return tree;
                })()}
              </div>

              <div className="flex justify-end pt-1.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    try {
                      await handleUpdateNomenclature();
                      // Wait a moment for the backend to build the root hierarchy node
                      await new Promise((resolve) => setTimeout(resolve, 1500));
                      await Promise.all([
                        refetchHierarchy(),
                        refetchNomenclature()
                      ]);
                      setActiveTab("builder");
                    } catch (error) {
                      console.error("Failed to transition to builder:", error);
                    }
                  }}
                  disabled={isHierarchyFetching}
                  className="h-9 min-w-25 px-4 rounded-[8px] border border-primary dark:border-[#5185F2] text-primary dark:text-primary hover:bg-primary/5 dark:hover:bg-[#5185F2]/5 transition-all font-medium text-sm shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed font-albert-sans"
                >
                  {isHierarchyFetching ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      {t("actions.loading") || "Loading..."}
                    </>
                  ) : (
                    t("hierarchy.continueToBuilder")
                  )}
                </Button>
              </div>

              <div className="flex items-center gap-3 rounded-[12px] bg-primary/5 dark:bg-[rgba(19,109,236,0.12)] border border-primary/10 dark:border-[rgba(19,109,236,0.1)] py-3 px-4 rtl:flex-row-reverse">
                <div className="shrink-0 flex items-center justify-center">
                  <Info className="size-4.5 text-primary dark:text-[#136DEC]" />
                </div>
                <p className="text-sm text-foreground/80 dark:text-white/80 font-normal leading-relaxed font-albert-sans">{t("hierarchy.customizeAlert")}</p>
              </div>
            </CardContent>
          </Card>
        </OnboardingStepTabsContent>

        <OnboardingStepTabsContent value="builder">
          <HierarchyTreeBuilder
            hierarchy={hierarchy}
            levels={hierarchyLevels}
            nomenclature={nomenclature}
            onAddUnit={(levelIdx, parentId) => handleOpenAddSheet(levelIdx, parentId)}
            onEditUnit={(unitId) => {
              if (!unitId || unitId === hierarchy?.[0]?.id) return;
              // Try form units first
              const idx = units.findIndex((u: any) => u.id === unitId);
              if (idx !== -1) { handleOpenEditSheet(idx, "edit"); return; }
              // Fallback: find node in hierarchy tree
              const node = flattenHierarchyNodes(hierarchy || []).find((n: any) => n.id === unitId);
              if (node) {
                const levelIdx = hierarchyLevels.findIndex((l: any) => l.type === node.type);
                if (levelIdx === -1) return;

                if (node.type === "COMPANY") {
                   setSheetConfig({
                     mode: "edit",
                     levelIdx,
                     unit: flattenUnit(node),
                   });
                   setIsSheetOpen(true);
                   return;
                }

                setSimpleModalConfig({
                  mode: "edit",
                  levelIdx,
                  parentId: node.parentId || "root",
                  unitId: node.id,
                  initialName: node.name,
                });
                setIsSimpleModalOpen(true);
              }
            }}
            onDeleteUnit={(unitId) => {
              if (!unitId || unitId === hierarchy?.[0]?.id) return;
              handleOpenDeleteModal(unitId);
            }}
            onViewUnit={(unitId) => {
              if (!unitId || unitId === hierarchy?.[0]?.id) return;
              const idx = units.findIndex((u: any) => u.id === unitId);
              if (idx !== -1) handleOpenEditSheet(idx, "view");
            }}
            t={t}
          />
        </OnboardingStepTabsContent>
      </OnboardingStepTabs>

      <OnboardingFormActions 
        onBack={() => { if (onBack) onBack(); }}
        onContinue={handleSubmit(onSubmit)}
        backLabel={t("actions.back")}
        continueLabel={t("actions.continue")}
        continueType="button"
        showBorder={true}
        isSubmitting={isSubmitting || createOUMutation.isPending}
      />

      <UnitDetailSheet
        isOpen={isDetailSheetOpen}
        onOpenChange={setIsDetailSheetOpen}
        unitId={viewUnitId ?? ""}
        allUnits={[
          { id: "root", name: watch("groupName") || t("builder.groupNamePlaceholder"), parentId: null },
          ...(hierarchy?.[0] ? [{ id: hierarchy[0].id, name: hierarchy[0].name || watch("groupName") || t("builder.groupNamePlaceholder"), parentId: null }] : []),
          ...units.map(u => ({ id: u.id, name: u.name, parentId: u.parentId }))
        ]}
        childLabel={
          viewUnitId && units.find(u => u.id === viewUnitId)
            ? (() => {
                const u = units.find(unit => unit.id === viewUnitId);
                const pIdx = hierarchyLevels.findIndex(l => l.type === u?.type);
                if (pIdx >= 0 && pIdx + 1 < hierarchyLevels.length && hierarchyLevels[pIdx + 1].isActive) {
                   const rawName = hierarchyLevels[pIdx + 1].name;
                   return rawName.toLowerCase().endsWith('s') ? rawName.slice(0, -1) : rawName;
                }
                return undefined;
              })()
            : undefined
        }
        onAddChild={(parentUnit) => {
          const parentLevelIdx = hierarchyLevels.findIndex(l => l.type === parentUnit.type);
          // Find the NEXT ACTIVE level below this one
          let childLevelIdx = -1;
          for (let i = parentLevelIdx + 1; i < hierarchyLevels.length; i++) {
            if (hierarchyLevels[i].isActive) {
              childLevelIdx = i;
              break;
            }
          }

          if (childLevelIdx !== -1) {
            setIsDetailSheetOpen(false);
            handleOpenAddSheet(childLevelIdx, parentUnit.id);
          }
        }}
      />

      {sheetConfig && (
        <UnitSheet 
          isOpen={isSheetOpen}
          onOpenChange={(open) => {
            setIsSheetOpen(open);
            if (!open) setSheetConfig(null);
          }}
          mode={sheetConfig.mode}
          levelType={hierarchyLevels[sheetConfig.levelIdx].type}
          levelName={hierarchyLevels[sheetConfig.levelIdx].name}
          unit={sheetConfig.unit}
          parentOptions={getParentOptions(sheetConfig.levelIdx)}
          defaultParentId={sheetConfig.defaultParentId}
          onSave={handleSaveUnit}
          isSaving={createOUMutation.isPending || updateOUMutation.isPending}
        />
      )}

      <ConfirmationModal 
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title={(() => {
          const u = deleteUnitId ? (units.find((u: any) => u.id === deleteUnitId) || flattenHierarchyNodes(hierarchy || []).find((n: any) => n.id === deleteUnitId)) : null;
          return u ? `Delete ${u.type?.toLowerCase()} data` : t("builder.menu.remove");
        })()}
        message={(() => {
          const u = deleteUnitId ? (units.find((u: any) => u.id === deleteUnitId) || flattenHierarchyNodes(hierarchy || []).find((n: any) => n.id === deleteUnitId)) : null;
          return u ? `Are you sure you want to delete this ${u.type?.toLowerCase()}'s data? This action cannot be reversed.` : t("hierarchy.customizeAlert");
        })()}
        onConfirm={handleConfirmDelete}
      />

      <SimpleUnitModal 
        isOpen={isSimpleModalOpen}
        onOpenChange={setIsSimpleModalOpen}
        title={simpleModalConfig ? `${simpleModalConfig.mode === 'edit' ? 'Edit' : 'Add'} ${getLabel(hierarchyLevels[simpleModalConfig.levelIdx]?.type, simpleModalConfig.levelIdx)}` : "Unit"}
        initialName={simpleModalConfig?.initialName}
        onSave={async (name) => {
          if (!simpleModalConfig) return;
          const type = hierarchyLevels[simpleModalConfig.levelIdx].type;
          
          // Edit a unit that exists in hierarchy but not in form units array
          if (simpleModalConfig.mode === "edit" && simpleModalConfig.unitId && simpleModalConfig.unitIdx === undefined) {
             await handleSaveUnit(
               { name, type, parentId: simpleModalConfig.parentId },
               "edit",
               undefined,
               simpleModalConfig.unitId
             );
            return;
          }

          await handleSaveUnit(
            { name, type, parentId: simpleModalConfig.parentId },
            simpleModalConfig.mode,
            simpleModalConfig.unitIdx
          );
        }}
      />
    </div>
  );
}
