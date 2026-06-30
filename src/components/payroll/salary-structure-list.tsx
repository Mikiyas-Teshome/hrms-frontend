'use client';

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit2, Layers, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useSalaryStructures,
  useCreateSalaryStructure,
  useUpdateSalaryStructure,
  useDeleteSalaryStructure,
} from '@/features/payroll/salary-structure/hooks/useSalaryStructure';
import { useCompanyOptions } from '@/features/organization/hooks/useOrganization';
import {
  SalaryStructureSheet,
  type SalaryStructureFormValues,
  mapStructureToFormValues,
} from '@/components/payroll/salary-structure-sheet';
import ConfirmationModal from '@/components/dashboard/shared/ConfirmationModal';
import { SalaryStructureResponse } from '@/features/payroll/salary-structure/salary-structure.types';
import { syncSalaryStructureOvertimePolicies } from '@/features/payroll/salary-structure/salary-structure-overtime.util';
import { useToast } from '@/hooks/use-toast';
import { getUserFacingErrorMessage } from '@/lib/parse-api-error';
import { rowActionsClass, rowActionsGroupClass } from '@/lib/row-actions';
import { cn } from '@/lib/utils';

type SalaryStructureListProps = {
  companyId: string;
};

export function SalaryStructureList({ companyId }: SalaryStructureListProps) {
  const { t } = useTranslation(['payroll', 'dashboard']);
  const { toast } = useToast();

  const { data: structures = [], isLoading: isLoadingStructures } = useSalaryStructures(companyId);
  const { companies: companiesData, isLoading: isLoadingCompanies } = useCompanyOptions();

  const createStructure = useCreateSalaryStructure();
  const updateStructure = useUpdateSalaryStructure();
  const deleteStructure = useDeleteSalaryStructure();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState<SalaryStructureResponse | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [structureToDelete, setStructureToDelete] = useState<SalaryStructureResponse | null>(null);

  const companyOptions = useMemo(() => {
    return (
      (companiesData as any[])?.map((c) => ({
        label: c.name || c.displayLabel || c.companyProfile?.legalName || c.id,
        value: c.id,
      })) || []
    );
  }, [companiesData]);

  const sheetDefaultValues = useMemo<Partial<SalaryStructureFormValues> | undefined>(() => {
    if (editingStructure) {
      return mapStructureToFormValues(editingStructure);
    }
    return companyId ? { companyId } : undefined;
  }, [editingStructure, companyId]);

  const handleEdit = (structure: SalaryStructureResponse) => {
    setEditingStructure(structure);
    setIsSheetOpen(true);
  };

  const handleDelete = (structure: SalaryStructureResponse) => {
    if ((structure.assignedEmployeeCount ?? 0) > 0) {
      toast({
        title: t('common.error', 'Error'),
        description: t(
          'payrollData.salaryStructures.deleteBlockedMessage',
          'This salary structure is assigned to employees and cannot be deleted. Reassign those employees first.',
        ),
        variant: 'destructive',
      });
      return;
    }
    setStructureToDelete(structure);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!structureToDelete) return;
    try {
      await deleteStructure.mutateAsync({ id: structureToDelete.id, companyId: structureToDelete.companyId });
      toast({
        title: t('common.success', 'Success'),
        description: t('payrollData.salaryStructures.deleted', 'Salary structure deleted successfully'),
      });
      setDeleteConfirmOpen(false);
      setStructureToDelete(null);
    } catch (err: unknown) {
      toast({
        title: t('common.error', 'Error'),
        description: getUserFacingErrorMessage(
          err,
          t('payrollData.errors.deleteFailed', 'Failed to delete salary structure'),
        ),
        variant: 'destructive',
      });
    }
  };

  const handleSave = async (values: SalaryStructureFormValues) => {
    if (!values.name?.trim()) {
      toast({
        title: t('common.error', 'Error'),
        description: t('payrollData.errors.requiredFields', 'Please fill in all required fields'),
        variant: 'destructive',
      });
      return;
    }

    try {
      const policyIds = await syncSalaryStructureOvertimePolicies(
        values.companyId,
        values.overtimeRules,
        editingStructure,
        values.name,
      );

      if (editingStructure) {
        await updateStructure.mutateAsync({
          id: editingStructure.id,
          input: {
            companyId: editingStructure.companyId,
            name: values.name,
            code: values.code || undefined,
            description: values.description || undefined,
            ouId: values.companyId,
            normalOvertimePolicyId: policyIds.normalOvertimePolicyId,
            weekendOvertimePolicyId: policyIds.weekendOvertimePolicyId,
            holidayOvertimePolicyId: policyIds.holidayOvertimePolicyId,
            dutyOvertimePolicyId: editingStructure.dutyOvertimePolicy?.id,
            allowanceIds: values.allowanceIds,
            deductionIds: values.deductionIds,
          },
        });
        toast({
          title: t('common.success', 'Success'),
          description: t('payrollData.salaryStructures.updated', 'Salary structure updated successfully'),
        });
      } else {
        await createStructure.mutateAsync({
          companyId: values.companyId,
          name: values.name,
          code: values.code || undefined,
          description: values.description || undefined,
          ouId: values.companyId,
          normalOvertimePolicyId: policyIds.normalOvertimePolicyId,
          weekendOvertimePolicyId: policyIds.weekendOvertimePolicyId,
          holidayOvertimePolicyId: policyIds.holidayOvertimePolicyId,
          allowanceIds: values.allowanceIds,
          deductionIds: values.deductionIds,
        });
        toast({
          title: t('common.success', 'Success'),
          description: t('payrollData.salaryStructures.created', 'Salary structure created successfully'),
        });
      }
      setIsSheetOpen(false);
      setEditingStructure(null);
    } catch (err: any) {
      toast({
        title: t('common.error', 'Error'),
        description: err.message || t('payrollData.errors.saveFailed', 'Failed to save salary structure'),
        variant: 'destructive',
      });
    }
  };

  const isLoading = isLoadingStructures;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-[13px] font-semibold text-foreground rtl:text-end">
          {t('payrollData.salaryStructures.title', 'Salary Structures')}
        </h4>
        <Button
          type="button"
          onClick={() => {
            setEditingStructure(null);
            setIsSheetOpen(true);
          }}
          className="h-9 rounded-[8px] bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5"
        >
          <Plus className="size-3.5" />
          {t('payrollData.salaryStructures.add', 'Add Structure')}
        </Button>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="border border-border shadow-none">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 w-2/3">
                  <Skeleton className="size-10 rounded-lg shrink-0" />
                  <div className="space-y-2 w-full">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))
        ) : structures.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-border rounded-xl">
            <Layers className="size-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">
              {t('payrollData.salaryStructures.createFirst', 'No salary structures configured yet.')}
            </p>
          </div>
        ) : (
          structures.map((structure) => {
            return (
              <div
                key={structure.id}
                className={cn(
                  rowActionsGroupClass,
                  'flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border transition-all duration-200 bg-card hover:bg-muted/5',
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg shrink-0 flex items-center justify-center bg-muted text-muted-foreground">
                    <Layers className="size-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {structure.name}
                      </span>
                      {structure.code && (
                        <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-medium border-border">
                          {structure.code}
                        </Badge>
                      )}
                    </div>
                    {structure.description && (
                      <p className="text-[12px] text-muted-foreground font-normal line-clamp-1 max-w-md">
                        {structure.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span>
                        {t('payrollData.columns.components', 'Components')}: {structure.allowances.length} {t('payrollData.detail.earnings', 'Earnings')}, {structure.deductions.length} {t('payrollData.detail.deductions', 'Deductions')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={cn(rowActionsClass, 'flex items-center gap-2 self-end sm:self-center')}>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => handleEdit(structure)}
                    >
                      <Edit2 className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive disabled:opacity-40"
                      disabled={(structure.assignedEmployeeCount ?? 0) > 0}
                      title={
                        (structure.assignedEmployeeCount ?? 0) > 0
                          ? t(
                              'payrollData.salaryStructures.deleteBlockedMessage',
                              'This salary structure is assigned to employees and cannot be deleted. Reassign those employees first.',
                            )
                          : undefined
                      }
                      onClick={() => handleDelete(structure)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <SalaryStructureSheet
        isOpen={isSheetOpen}
        onOpenChange={(open) => {
          setIsSheetOpen(open);
          if (!open) setEditingStructure(null);
        }}
        defaultCompanyId={companyId}
        companyOptions={companyOptions}
        isLoadingCompanies={isLoadingCompanies}
        defaultValues={sheetDefaultValues}
        onSubmit={handleSave}
        isSubmitting={createStructure.isPending || updateStructure.isPending}
      />

      <ConfirmationModal
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={t('payrollData.salaryStructures.deleteTitle', 'Delete Salary Structure')}
        message={t(
          'payrollData.salaryStructures.deleteMessage',
          'Are you sure you want to delete "{{name}}"? This cannot be undone.',
          { name: structureToDelete?.name ?? '' }
        )}
        confirmLabel={t('payrollData.actions.delete', 'Delete')}
        onConfirm={confirmDelete}
        isLoading={deleteStructure.isPending}
      />
    </div>
  );
}
