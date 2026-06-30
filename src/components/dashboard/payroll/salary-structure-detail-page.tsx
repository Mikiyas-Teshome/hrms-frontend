"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  CheckCircle2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getUserFacingErrorMessage } from "@/lib/parse-api-error";
import { useDisplayCurrency } from "@/features/settings/hooks/useDisplayCurrency";
import { formatIntlCurrency } from "@/lib/currency";
import { isPercentageType } from "@/features/payroll/payroll.types";
import {
  useSalaryStructureById,
  useUpdateSalaryStructure,
  useDeleteSalaryStructure,
  useAddAllowanceToSalaryStructure,
  useRemoveAllowanceFromSalaryStructure,
  useAddDeductionToSalaryStructure,
  useRemoveDeductionFromSalaryStructure,
} from "@/features/payroll/salary-structure/hooks/useSalaryStructure";
import {
  SalaryStructureSheet,
  SalaryStructureFormValues,
  mapStructureToFormValues,
} from "@/components/payroll/salary-structure-sheet";
import { syncSalaryStructureOvertimePolicies } from "@/features/payroll/salary-structure/salary-structure-overtime.util";
import { useCompanyOptions } from "@/features/organization/hooks/useOrganization";
import ConfirmationModal from "@/components/dashboard/shared/ConfirmationModal";
import {
  DetailField,
  DetailFieldGrid,
  DetailSectionCard,
} from "@/components/dashboard/shared/entity-detail-cards";
import {
  usePayrollAllowances,
  usePayrollDeductions,
} from "@/features/payroll/hooks/usePayroll";

function DetailPageSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-full overflow-hidden animate-pulse">
      <div className="h-8 w-32 bg-muted rounded" />
      <div className="h-10 w-64 bg-muted rounded" />
      <div className="rounded-xl bg-slate-50/50 dark:bg-zinc-950/30 p-6 space-y-6">
        <div className="h-48 bg-muted rounded-xl" />
        <div className="h-40 bg-muted rounded-xl" />
        <div className="h-56 bg-muted rounded-xl" />
      </div>
    </div>
  );
}

export function SalaryStructureDetailPage({ structureId }: { structureId: string }) {
  const router = useRouter();
  const { t } = useTranslation(["payroll", "dashboard"]);
  const { toast } = useToast();

  const { data: structure, isLoading } = useSalaryStructureById(structureId);
  const { companies: companiesData, isLoading: isLoadingCompanies } = useCompanyOptions();
  const updateStructure = useUpdateSalaryStructure();
  const deleteStructure = useDeleteSalaryStructure();
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const companyOptions = React.useMemo(
    () =>
      companiesData?.map((company) => ({
        label: company.name || company.displayLabel || company.id,
        value: company.id,
      })) ?? [],
    [companiesData],
  );

  const { currencyCode } = useDisplayCurrency(
    structure?.ouId ?? structure?.companyId,
  );
  const structureOuId = structure?.ouId ?? structure?.companyId;
  const { data: allowancesList = [] } = usePayrollAllowances(structureOuId);
  const { data: deductionsList = [] } = usePayrollDeductions(structureOuId);

  const addAllowance = useAddAllowanceToSalaryStructure();
  const removeAllowance = useRemoveAllowanceFromSalaryStructure();
  const addDeduction = useAddDeductionToSalaryStructure();
  const removeDeduction = useRemoveDeductionFromSalaryStructure();

  const formatComponentValue = (value: number, type: string) =>
    isPercentageType(type) ? `${value}%` : formatIntlCurrency(value, currencyCode);

  const linkedAllowanceIds = useMemo(
    () => new Set(structure?.allowances.map((item) => item.id) ?? []),
    [structure?.allowances],
  );
  const linkedDeductionIds = useMemo(
    () => new Set(structure?.deductions.map((item) => item.id) ?? []),
    [structure?.deductions],
  );

  const availableAllowances = allowancesList.filter((item) => !linkedAllowanceIds.has(item.id));
  const availableDeductions = deductionsList.filter((item) => !linkedDeductionIds.has(item.id));

  const handleAddAllowance = (allowanceId: string) => {
    addAllowance.mutate(
      { salaryStructureId: structureId, allowanceId },
      {
        onSuccess: () => {
          toast({
            title: t("common.success", "Success"),
            description: t(
              "payrollData.salaryStructures.allowanceLinked",
              "Allowance linked successfully",
            ),
          });
        },
        onError: (error) =>
          toast({
            title: t("common.error", "Error"),
            description: error.message,
            variant: "destructive",
          }),
      },
    );
  };

  const handleSaveStructure = async (values: SalaryStructureFormValues) => {
    if (!structure) return;

    try {
      const policyIds = await syncSalaryStructureOvertimePolicies(
        values.companyId,
        values.overtimeRules,
        structure,
        values.name,
      );

      await updateStructure.mutateAsync({
        id: structure.id,
        input: {
          companyId: structure.companyId,
          name: values.name,
          code: values.code || undefined,
          description: values.description || undefined,
          ouId: values.companyId,
          normalOvertimePolicyId: policyIds.normalOvertimePolicyId,
          weekendOvertimePolicyId: policyIds.weekendOvertimePolicyId,
          holidayOvertimePolicyId: policyIds.holidayOvertimePolicyId,
          dutyOvertimePolicyId: structure.dutyOvertimePolicy?.id,
          allowanceIds: values.allowanceIds,
          deductionIds: values.deductionIds,
        },
      });

      setIsEditSheetOpen(false);
      toast({
        title: t("common.success", "Success"),
        description: t(
          "payrollData.salaryStructures.updated",
          "Salary structure updated successfully",
        ),
      });
    } catch (error) {
      toast({
        title: t("common.error", "Error"),
        description:
          error instanceof Error
            ? error.message
            : t("payrollData.errors.updateFailed", "Failed to update salary structure"),
        variant: "destructive",
      });
    }
  };

  const handleDeleteStructure = () => {
    if (!structure) return;

    deleteStructure.mutate(
      { id: structure.id, companyId: structure.companyId },
      {
        onSuccess: () => {
          toast({
            title: t("common.success", "Success"),
            description: t(
              "payrollData.salaryStructures.deleted",
              "Salary structure deleted successfully",
            ),
          });
          router.push("/dashboard/payroll/salary-structures");
        },
        onError: (error) =>
          toast({
            title: t("common.error", "Error"),
            description: getUserFacingErrorMessage(
              error,
              t("payrollData.errors.deleteFailed", "Failed to delete salary structure"),
            ),
            variant: "destructive",
          }),
      },
    );
  };

  const isDeleteBlocked = (structure?.assignedEmployeeCount ?? 0) > 0;

  const handleAddDeduction = (deductionId: string) => {
    addDeduction.mutate(
      { salaryStructureId: structureId, deductionId },
      {
        onSuccess: () => {
          toast({
            title: t("common.success", "Success"),
            description: t(
              "payrollData.salaryStructures.deductionLinked",
              "Deduction linked successfully",
            ),
          });
        },
        onError: (error) =>
          toast({
            title: t("common.error", "Error"),
            description: error.message,
            variant: "destructive",
          }),
      },
    );
  };

  const renderAddComponentAction = (
    items: { id: string; name: string }[],
    onAdd: (id: string) => void,
    isPending: boolean,
    label: string,
  ) => {
    if (items.length === 0) return null;

    return (
      <Select onValueChange={onAdd}>
        <SelectTrigger
          size="sm"
          className="h-8 w-auto gap-1.5 text-xs font-semibold border-slate-200 dark:border-zinc-700"
          disabled={isPending}
        >
          <Plus className="w-3.5 h-3.5 shrink-0" />
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };

  if (isLoading) {
    return <DetailPageSkeleton />;
  }

  if (!structure) {
    return (
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => router.push("/dashboard/payroll/salary-structures")}
            className="flex items-center text-sm font-medium text-foreground gap-2 hover:opacity-70 transition-opacity w-fit"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            {t("payrollData.detail.back", "Back")}
          </button>
          <p className="text-muted-foreground">
            {t("payrollData.salaryStructures.notFound", "Salary structure not found")}
          </p>
        </div>
    );
  }

  return (
      <div className="flex flex-col gap-6 w-full max-w-full overflow-hidden pb-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col items-start gap-3">
            <button
              type="button"
              onClick={() => router.push("/dashboard/payroll/salary-structures")}
              className="flex items-center text-sm font-medium text-foreground gap-2 hover:opacity-70 transition-opacity"
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
              {t("payrollData.detail.back", "Back")}
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{structure.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {structure.code ? (
                  <Badge
                    variant="outline"
                    className="bg-slate-100/80 text-slate-800 dark:bg-zinc-800 dark:text-zinc-200 border-0 text-xs font-semibold"
                  >
                    {structure.code}
                  </Badge>
                ) : null}
                <Badge
                  variant="outline"
                  className={`border-0 rounded-full px-2.5 py-0.5 text-xs font-semibold gap-1 ${
                    structure.isActive
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : "bg-slate-100/80 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  {structure.isActive ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : null}
                  {structure.isActive
                    ? t("payrollData.status.active", "Active")
                    : t("payrollData.status.inactive", "Inactive")}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 h-9 border-slate-200 dark:border-zinc-700"
              onClick={() => setIsEditSheetOpen(true)}
            >
              <Pencil className="w-4 h-4" />
              {t("payrollData.actions.edit", "Edit")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 h-9 text-destructive border-destructive/30 hover:bg-destructive/10 disabled:opacity-50"
              disabled={isDeleteBlocked}
              title={
                isDeleteBlocked
                  ? t(
                      "payrollData.salaryStructures.deleteBlockedMessage",
                      "This salary structure is assigned to employees and cannot be deleted. Reassign those employees first.",
                    )
                  : undefined
              }
              onClick={() => {
                if (isDeleteBlocked) {
                  toast({
                    title: t("common.error", "Error"),
                    description: t(
                      "payrollData.salaryStructures.deleteBlockedMessage",
                      "This salary structure is assigned to employees and cannot be deleted. Reassign those employees first.",
                    ),
                    variant: "destructive",
                  });
                  return;
                }
                setDeleteConfirmOpen(true);
              }}
            >
              <Trash2 className="w-4 h-4" />
              {t("payrollData.actions.delete", "Delete")}
            </Button>
          </div>
        </div>

        <div className="rounded-xl bg-slate-50/50 dark:bg-zinc-950/30 p-4 sm:p-6 space-y-6">
          <DetailSectionCard
            title={t("payrollData.salaryStructures.structureInfo", "Structure info")}
          >
            <DetailFieldGrid>
              <DetailField
                label={t("payrollData.salaryStructures.name", "Name")}
                value={structure.name}
              />
              <DetailField
                label={t("payrollData.salaryStructures.code", "Code")}
                value={structure.code}
              />
              <DetailField
                label={t("payrollData.columns.status", "Status")}
                value={
                  structure.isActive
                    ? t("payrollData.status.active", "Active")
                    : t("payrollData.status.inactive", "Inactive")
                }
              />
              <DetailField
                label={t("payrollData.detail.earnings", "Allowances")}
                value={structure.allowances.length.toString()}
              />
              <DetailField
                label={t("payrollData.detail.deductions", "Deductions")}
                value={structure.deductions.length.toString()}
              />
              {structure.description ? (
                <DetailField
                  label={t("payrollData.salaryStructures.description", "Description")}
                  className="md:col-span-2"
                >
                  <span className="font-normal text-slate-700 dark:text-zinc-300 leading-relaxed">
                    {structure.description}
                  </span>
                </DetailField>
              ) : null}
            </DetailFieldGrid>
          </DetailSectionCard>

          <DetailSectionCard
            title={t("payrollData.salaryStructures.overtimePolicies", "Overtime policies")}
            delayClassName="duration-300 delay-75"
          >
            <DetailFieldGrid>
              <DetailField
                label={t("payrollData.salaryStructures.normalOt", "Normal overtime")}
                value={structure.normalOvertimePolicy?.name}
              />
              <DetailField
                label={t("payrollData.salaryStructures.weekendOt", "Weekend overtime")}
                value={structure.weekendOvertimePolicy?.name}
              />
              <DetailField
                label={t("payrollData.salaryStructures.holidayOt", "Holiday overtime")}
                value={structure.holidayOvertimePolicy?.name}
              />
              <DetailField
                label={t("payrollData.salaryStructures.dutyOt", "Duty overtime")}
                value={structure.dutyOvertimePolicy?.name}
              />
            </DetailFieldGrid>
          </DetailSectionCard>

          <DetailSectionCard
            title={t("payrollData.detail.earnings", "Allowances")}
            delayClassName="duration-300 delay-100"
            action={renderAddComponentAction(
              availableAllowances,
              handleAddAllowance,
              addAllowance.isPending,
              t("payrollData.salaryStructures.addAllowance", "Add allowance"),
            )}
          >
            {structure.allowances.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-zinc-500">
                {t(
                  "payrollData.salaryStructures.noLinkedAllowances",
                  "No allowances linked to this structure yet.",
                )}
              </p>
            ) : (
              <DetailFieldGrid>
                {structure.allowances.map((item) => (
                  <div
                    key={item.id}
                    className="border border-slate-100/90 dark:border-zinc-900 rounded-lg p-4 bg-white dark:bg-zinc-950/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-800 dark:text-zinc-100 truncate">
                        {item.name}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge
                          variant="outline"
                          className="bg-slate-100/80 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border-0 text-[11px] font-semibold capitalize"
                        >
                          {item.type.toLowerCase()}
                        </Badge>
                        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatComponentValue(item.value, item.type)}
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                      disabled={removeAllowance.isPending}
                      onClick={() =>
                        removeAllowance.mutate({
                          salaryStructureId: structureId,
                          allowanceId: item.id,
                        })
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </DetailFieldGrid>
            )}
          </DetailSectionCard>

          <DetailSectionCard
            title={t("payrollData.detail.deductions", "Deductions")}
            delayClassName="duration-300 delay-150"
            action={renderAddComponentAction(
              availableDeductions,
              handleAddDeduction,
              addDeduction.isPending,
              t("payrollData.salaryStructures.addDeduction", "Add deduction"),
            )}
          >
            {structure.deductions.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-zinc-500">
                {t(
                  "payrollData.salaryStructures.noLinkedDeductions",
                  "No deductions linked to this structure yet.",
                )}
              </p>
            ) : (
              <DetailFieldGrid>
                {structure.deductions.map((item) => (
                  <div
                    key={item.id}
                    className="border border-slate-100/90 dark:border-zinc-900 rounded-lg p-4 bg-white dark:bg-zinc-950/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-800 dark:text-zinc-100 truncate">
                        {item.name}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge
                          variant="outline"
                          className="bg-slate-100/80 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border-0 text-[11px] font-semibold capitalize"
                        >
                          {item.type.toLowerCase()}
                        </Badge>
                        <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                          {formatComponentValue(item.value, item.type)}
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                      disabled={removeDeduction.isPending}
                      onClick={() =>
                        removeDeduction.mutate({
                          salaryStructureId: structureId,
                          deductionId: item.id,
                        })
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </DetailFieldGrid>
            )}
          </DetailSectionCard>
        </div>

        <SalaryStructureSheet
          isOpen={isEditSheetOpen}
          onOpenChange={setIsEditSheetOpen}
          defaultCompanyId={structure.companyId}
          companyOptions={companyOptions}
          isLoadingCompanies={isLoadingCompanies}
          defaultValues={mapStructureToFormValues(structure)}
          onSubmit={handleSaveStructure}
          isSubmitting={updateStructure.isPending}
        />

        <ConfirmationModal
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          title={t("payrollData.salaryStructures.deleteTitle", "Delete salary structure")}
          message={t(
            "payrollData.salaryStructures.deleteMessage",
            'Are you sure you want to delete "{{name}}"? This cannot be undone.',
            { name: structure.name },
          )}
          confirmLabel={t("payrollData.actions.delete", "Delete")}
          onConfirm={handleDeleteStructure}
          isLoading={deleteStructure.isPending}
        />
      </div>
  );
}
