'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Info, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    orgStructureSchema,
    type OrgStructureValues,
} from '@/components/onboarding/schemas/org-structure';
import {
    useCreateOrganizationUnit,
    useUpdateOrganizationUnit,
    useOrganizationHierarchy,
    useDeactivateOrganizationUnit,
    useUpdateOrganizationNomenclature,
    useOrganizationNomenclature,
} from '@/features/organization/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';
import { emptyOrgStructureValues } from '@/data/org-structure-defaults';
import { UnitSheet } from '@/components/onboarding/organization/builder/unit-sheet';
import { UnitDetailSheet } from '@/components/onboarding/organization/builder/unit-detail-sheet';
import ConfirmationModal from '@/components/dashboard/shared/ConfirmationModal';
import { HierarchyNode } from '@/components/onboarding/organization/hierarchy-node';
import { HierarchyTreeBuilder } from '@/components/onboarding/organization/builder/hierarchy-tree-builder';
import { SimpleUnitModal } from '@/components/onboarding/organization/builder/simple-unit-modal';
import { OrgHierarchyStats } from '@/components/dashboard/organization/org-stats';
import { DashboardOrgHierarchySkeleton } from './DashboardOrgHierarchySkeleton';

export function DashboardOrganizationHierarchy() {
    const { t } = useTranslation('orgStructure');
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('hierarchy');

    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [sheetConfig, setSheetConfig] = useState<{
        mode: 'add' | 'edit';
        levelIdx: number;
        unit?: any;
        unitIdx?: number;
        defaultParentId?: string;
    } | null>(null);

    const [isSimpleModalOpen, setIsSimpleModalOpen] = useState(false);
    const [simpleModalConfig, setSimpleModalConfig] = useState<{
        mode: 'add' | 'edit';
        levelIdx: number;
        parentId: string;
        unitIdx?: number;
        unitId?: string;
        initialName?: string;
    } | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteUnitId, setDeleteUnitId] = useState<string | null>(null);

    const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
    const [viewUnitId, setViewUnitId] = useState<string | null>(null);

    const createOUMutation = useCreateOrganizationUnit();
    const updateOUMutation = useUpdateOrganizationUnit();
    const deactivateOUMutation = useDeactivateOrganizationUnit();
    const nomenclatureMutation = useUpdateOrganizationNomenclature();
    const { data: nomenclature, refetch: refetchNomenclature } = useOrganizationNomenclature();
    const {
        data: hierarchy,
        refetch: refetchHierarchy,
        isLoading: isHierarchyLoading,
        isFetching: isHierarchyFetching,
    } = useOrganizationHierarchy();

    const {
        register,
        control,
        setValue,
        watch,
    } = useForm<OrgStructureValues>({
        resolver: zodResolver(orgStructureSchema),
        defaultValues: emptyOrgStructureValues,
    });

    const { fields: levelFields } = useFieldArray({ control, name: 'hierarchyLevels' });
    const { append: appendUnit, remove: removeUnit } = useFieldArray({
        control,
        name: 'units',
    });

    const hierarchyLevels = useWatch({ control, name: 'hierarchyLevels' });
    const units = useWatch({ control, name: 'units' }) || [];

    useEffect(() => {
        if (nomenclature && nomenclature.length > 0) {
            const groupNom = nomenclature.find((n) => n.type === 'GROUP');
            if (groupNom) {
                setValue('groupName', groupNom.label);
                setValue('hierarchyLevels.0.name', groupNom.label);
            }
        }
    }, [nomenclature, setValue]);

    const handleUpdateNomenclature = async () => {
        try {
            const currentLevels = watch('hierarchyLevels');
            const activeLevels = currentLevels.filter((l, idx) => idx === 0 || l.isActive);
            const inputs = activeLevels.map((l) => ({ label: l.name, type: l.type }));
            await nomenclatureMutation.mutateAsync({ inputs, language: 'en' });
            if (currentLevels[0]?.name) setValue('groupName', currentLevels[0].name);
            toast({ title: t('hierarchy.nomenclatureUpdated') });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: t('toasts.updateFailed'),
                description: error.message || t('toasts.updateFailedDescription'),
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
        const allAvailableUnits = [
            ...allExistingUnits,
            ...units.filter((u) => !allExistingUnits.some((node: any) => node.id === u.id)),
        ];
        if (levelIdx === 1) {
            const rootUnit = hierarchy?.[0];
            return [
                {
                    id: rootUnit?.id || 'root',
                    name: rootUnit?.name || watch('groupName') || t('builder.groupNamePlaceholder'),
                },
            ];
        }
        return allAvailableUnits
            .filter((u) => u.type === prevLevel.type)
            .map((u) => ({ id: u.id, name: u.name }));
    };

    const getLabel = (type: string, levelIdx: number) =>
        hierarchyLevels[levelIdx]?.name || type;

    const flattenUnit = (unit: any) => {
        if (!unit) return null;
        const { companyProfile, ...rest } = unit;
        const { ...profileData } = companyProfile || {};
        return { ...rest, ...profileData };
    };

    const handleOpenAddSheet = (levelIdx: number, preselectedParentId?: string) => {
        const levelType = hierarchyLevels[levelIdx]?.type;
        if (levelType !== 'COMPANY') {
            setSimpleModalConfig({
                mode: 'add',
                levelIdx,
                parentId: preselectedParentId || 'root',
            });
            setSheetConfig(null);
            setIsSimpleModalOpen(true);
            return;
        }
        setSheetConfig({ mode: 'add', levelIdx, defaultParentId: preselectedParentId });
        setIsSheetOpen(true);
    };

    const handleOpenEditSheet = (unitIdx: number, mode: 'edit' | 'view') => {
        const unit = units[unitIdx];
        const levelIdx = hierarchyLevels.findIndex((l) => l.type === unit.type);
        if (mode === 'view') {
            setViewUnitId(unit.id || null);
            setIsDetailSheetOpen(true);
            return;
        }
        if (unit.type !== 'COMPANY') {
            setSimpleModalConfig({
                mode: 'edit',
                levelIdx,
                parentId: unit.parentId || 'root',
                unitIdx,
                initialName: unit.name,
            });
            setSheetConfig(null);
            setIsSimpleModalOpen(true);
            return;
        }
        setSheetConfig({ mode, levelIdx, unit: flattenUnit(unit), unitIdx });
        setIsSheetOpen(true);
    };

    const handleSaveUnit = async (
        data: any,
        forcedMode?: 'add' | 'edit',
        forcedUnitIdx?: number,
        forcedUnitId?: string,
    ) => {
        try {
            const rootGroup = hierarchy?.[0];
            if (!rootGroup) throw new Error('Root group not found');
            const parentId =
                data.parentId === 'root' || !data.parentId ? rootGroup.id : data.parentId;
            const mode = forcedMode || sheetConfig?.mode || 'add';
            const unitIdx =
                forcedUnitIdx !== undefined ? forcedUnitIdx : sheetConfig?.unitIdx;
            const unitId = forcedUnitId || sheetConfig?.unit?.id;

            if (mode === 'add') {
                const response = await createOUMutation.mutateAsync({
                    name: data.name,
                    type: data.type,
                    parentId,
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
                toast({ title: t('builder.unitCreated') });
            } else {
                const targetId = unitIdx !== undefined ? units[unitIdx]?.id : unitId;
                if (!targetId) throw new Error('Could not identify unit to update');
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
                    setValue('units', updatedUnits);
                }
                toast({ title: t('builder.unitUpdated') });
            }
            await refetchHierarchy();
            setIsSheetOpen(false);
            setSheetConfig(null);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: t('toasts.saveUnitFailed'),
                description: error.message || t('toasts.saveUnitFailedDescription'),
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
                const unitIdx = units.findIndex((u: any) => u.id === deleteUnitId);
                if (unitIdx !== -1) removeUnit(unitIdx);
                await refetchHierarchy();
                toast({ title: t('builder.unitDeleted') });
            } catch (error: any) {
                toast({
                    variant: 'destructive',
                    title: t('toasts.deleteFailed'),
                    description: error.message || t('toasts.deleteFailedDescription'),
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
        return <DashboardOrgHierarchySkeleton />;
    }

    return (
        <div className="space-y-6">
            <OrgHierarchyStats />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full gap-4">
                <div className="flex">
                    <TabsList className="h-9 w-full max-w-[400px] bg-secondary p-0.75 rounded-[10px] border-none">
                        <TabsTrigger
                            value="hierarchy"
                            className="flex-1 h-7 rounded-[8px] data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground font-medium text-sm transition-all"
                        >
                            {t('tabs.hierarchy')}
                        </TabsTrigger>
                        <TabsTrigger
                            value="builder"
                            className="flex-1 h-7 rounded-[8px] data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground font-medium text-sm transition-all"
                        >
                            {t('tabs.builder')}
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="hierarchy" className="space-y-6 focus-visible:outline-none">
                    <Card className="rounded-[12px] border border-border/80 dark:border-[rgba(0,0,0,0.24)] bg-card dark:bg-[#1D1D1D] shadow-none overflow-hidden">
                        <CardHeader className="bg-muted/40 dark:bg-[rgba(10,10,10,0.5)] px-6 py-4 dark:py-[18px] border-b border-border/40 dark:border-border/10">
                            <CardTitle className="text-sm font-semibold text-foreground dark:text-white font-albert-sans">
                                {t('hierarchy.title')}
                            </CardTitle>
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
                                            await new Promise((resolve) =>
                                                setTimeout(resolve, 1500),
                                            );
                                            await Promise.all([
                                                refetchHierarchy(),
                                                refetchNomenclature(),
                                            ]);
                                            setActiveTab('builder');
                                        } catch (error) {
                                            console.error('Failed to switch tab:', error);
                                        }
                                    }}
                                    disabled={isHierarchyFetching}
                                    className="h-9 min-w-[100px] px-4 rounded-[8px] border border-primary dark:border-[#5185F2] text-primary dark:text-primary hover:bg-primary/5 dark:hover:bg-[#5185F2]/5 transition-all font-medium text-sm shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed font-albert-sans"
                                >
                                    {isHierarchyFetching ? (
                                        <>
                                            <Loader2 className="mr-2 size-4 animate-spin" />
                                            {t('actions.loading')}
                                        </>
                                    ) : (
                                        t('hierarchy.continueToBuilder')
                                    )}
                                </Button>
                            </div>

                            <div className="flex items-center gap-3 rounded-[12px] bg-primary/5 dark:bg-[rgba(19,109,236,0.12)] border border-primary/10 dark:border-[rgba(19,109,236,0.1)] py-3 px-4 rtl:flex-row-reverse">
                                <div className="shrink-0 flex items-center justify-center">
                                    <Info className="size-[18px] text-primary dark:text-[#136DEC]" />
                                </div>
                                <p className="text-sm text-foreground/80 dark:text-white/80 font-normal leading-relaxed font-albert-sans">
                                    {t('hierarchy.customizeAlert')}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="builder" className="space-y-6 focus-visible:outline-none">
                    <HierarchyTreeBuilder
                        hierarchy={hierarchy}
                        levels={hierarchyLevels}
                        nomenclature={nomenclature}
                        onAddUnit={(levelIdx, parentId) => handleOpenAddSheet(levelIdx, parentId)}
                        onEditUnit={(unitId) => {
                            if (!unitId || unitId === hierarchy?.[0]?.id) return;
                            const idx = units.findIndex((u: any) => u.id === unitId);
                            if (idx !== -1) {
                                handleOpenEditSheet(idx, 'edit');
                                return;
                            }
                            const node = flattenHierarchyNodes(hierarchy || []).find(
                                (n: any) => n.id === unitId,
                            );
                            if (node) {
                                const levelIdx = hierarchyLevels.findIndex(
                                    (l: any) => l.type === node.type,
                                );
                                if (levelIdx === -1) return;
                                if (node.type === 'COMPANY') {
                                    setSheetConfig({
                                        mode: 'edit',
                                        levelIdx,
                                        unit: flattenUnit(node),
                                    });
                                    setIsSheetOpen(true);
                                    return;
                                }
                                setSimpleModalConfig({
                                    mode: 'edit',
                                    levelIdx,
                                    parentId: node.parentId || 'root',
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
                            if (idx !== -1) handleOpenEditSheet(idx, 'view');
                        }}
                        t={t}
                    />
                </TabsContent>
            </Tabs>

            <UnitDetailSheet
                isOpen={isDetailSheetOpen}
                onOpenChange={setIsDetailSheetOpen}
                unitId={viewUnitId ?? ''}
                allUnits={[
                    {
                        id: 'root',
                        name: watch('groupName') || t('builder.groupNamePlaceholder'),
                        parentId: null,
                    },
                    ...(hierarchy?.[0]
                        ? [
                              {
                                  id: hierarchy[0].id,
                                  name:
                                      hierarchy[0].name ||
                                      watch('groupName') ||
                                      t('builder.groupNamePlaceholder'),
                                  parentId: null,
                              },
                          ]
                        : []),
                    ...units.map((u) => ({ id: u.id, name: u.name, parentId: u.parentId })),
                ]}
                childLabel={
                    viewUnitId && units.find((u) => u.id === viewUnitId)
                        ? (() => {
                              const u = units.find((unit) => unit.id === viewUnitId);
                              const pIdx = hierarchyLevels.findIndex((l) => l.type === u?.type);
                              if (
                                  pIdx >= 0 &&
                                  pIdx + 1 < hierarchyLevels.length &&
                                  hierarchyLevels[pIdx + 1].isActive
                              ) {
                                  const rawName = hierarchyLevels[pIdx + 1].name;
                                  return rawName.toLowerCase().endsWith('s')
                                      ? rawName.slice(0, -1)
                                      : rawName;
                              }
                              return undefined;
                          })()
                        : undefined
                }
                onAddChild={(parentUnit) => {
                    const parentLevelIdx = hierarchyLevels.findIndex(
                        (l) => l.type === parentUnit.type,
                    );
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
                    const u = deleteUnitId
                        ? units.find((u: any) => u.id === deleteUnitId) ||
                          flattenHierarchyNodes(hierarchy || []).find(
                              (n: any) => n.id === deleteUnitId,
                          )
                        : null;
                    if (!u) return t('builder.menu.remove');
                    const levelIdx = hierarchyLevels.findIndex((l) => l.type === (u as any).type);
                    const typeLabel =
                        levelIdx >= 0
                            ? getLabel((u as any).type, levelIdx)
                            : (u as any).type?.toLowerCase();
                    return t('builder.deleteTitle', { type: typeLabel });
                })()}
                message={(() => {
                    const u = deleteUnitId
                        ? units.find((u: any) => u.id === deleteUnitId) ||
                          flattenHierarchyNodes(hierarchy || []).find(
                              (n: any) => n.id === deleteUnitId,
                          )
                        : null;
                    if (!u) return t('hierarchy.customizeAlert');
                    const levelIdx = hierarchyLevels.findIndex((l) => l.type === (u as any).type);
                    const typeLabel =
                        levelIdx >= 0
                            ? getLabel((u as any).type, levelIdx)
                            : (u as any).type?.toLowerCase();
                    return t('builder.deleteMessage', { type: typeLabel });
                })()}
                onConfirm={handleConfirmDelete}
            />

            <SimpleUnitModal
                isOpen={isSimpleModalOpen}
                onOpenChange={setIsSimpleModalOpen}
                title={
                    simpleModalConfig
                        ? t(
                              simpleModalConfig.mode === 'edit'
                                  ? 'builder.sheet.editTitle'
                                  : 'builder.sheet.addTitle',
                              {
                                  type: getLabel(
                                      hierarchyLevels[simpleModalConfig.levelIdx]?.type,
                                      simpleModalConfig.levelIdx,
                                  ),
                              },
                          )
                        : t('builder.unitFallback')
                }
                initialName={simpleModalConfig?.initialName}
                onSave={async (name) => {
                    if (!simpleModalConfig) return;
                    const type = hierarchyLevels[simpleModalConfig.levelIdx].type;
                    if (
                        simpleModalConfig.mode === 'edit' &&
                        simpleModalConfig.unitId &&
                        simpleModalConfig.unitIdx === undefined
                    ) {
                        await handleSaveUnit(
                            { name, type, parentId: simpleModalConfig.parentId },
                            'edit',
                            undefined,
                            simpleModalConfig.unitId,
                        );
                        return;
                    }
                    await handleSaveUnit(
                        { name, type, parentId: simpleModalConfig.parentId },
                        simpleModalConfig.mode,
                        simpleModalConfig.unitIdx,
                    );
                }}
            />
        </div>
    );
}
