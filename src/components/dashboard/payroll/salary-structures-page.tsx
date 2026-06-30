"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useForm, useWatch } from "react-hook-form";
import {
  CheckCircle2,
  Eye,
  FileText,
  Layers,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UniversalDataTable, ColumnConfig } from "@/components/ui/universal-data-table";
import { TableActionMenu } from "@/components/ui/table-action-menu";
import SummaryStatCard from "@/components/dashboard/shared/SummaryStatCard";
import { SummaryStatCardSkeleton } from "@/components/common/SummaryStatSkeleton";
import { useProfile } from "@/features/auth/hooks/useAuth";
import { useCompanyOptions } from "@/features/organization/hooks/useOrganization";
import { FormSelect } from "@/components/ui/FormSelect";
import {
  useSalaryStructures,
  useCreateSalaryStructure,
  useUpdateSalaryStructure,
  useDeleteSalaryStructure,
} from "@/features/payroll/salary-structure/hooks/useSalaryStructure";
import { syncSalaryStructureOvertimePolicies } from "@/features/payroll/salary-structure/salary-structure-overtime.util";
import ConfirmationModal from "@/components/dashboard/shared/ConfirmationModal";
import { SalaryStructureResponse } from "@/features/payroll/salary-structure/salary-structure.types";
import {
  SalaryStructureSheet,
  SalaryStructureFormValues,
  mapStructureToFormValues,
} from "@/components/payroll/salary-structure-sheet";
import { useToast } from "@/hooks/use-toast";
import { getUserFacingErrorMessage } from "@/lib/parse-api-error";

export function SalaryStructuresPage() {
  const { t } = useTranslation(["payroll", "dashboard"]);
  const router = useRouter();
  const { toast } = useToast();
  const { data: profile } = useProfile();
  const { companies: companiesData, isLoading: isLoadingCompanies } = useCompanyOptions();

  const companyForm = useForm({
    defaultValues: {
      companyId: "",
    },
  });

  const selectedCompanyId = useWatch({
    control: companyForm.control,
    name: "companyId",
  });

  const companyId = selectedCompanyId || profile?.companyId;

  const companyOptions = useMemo(
    () =>
      companiesData?.map((company) => ({
        label: company.name || company.displayLabel || company.id,
        value: company.id,
      })) ?? [],
    [companiesData],
  );

  const defaultCompanyId = useMemo(
    () => companyOptions[0]?.value ?? "",
    [companyOptions],
  );

  useEffect(() => {
    if (!defaultCompanyId) return;

    const currentCompanyId = companyForm.getValues("companyId");
    const hasValidSelection = companyOptions.some((option) => option.value === currentCompanyId);

    if (!hasValidSelection) {
      companyForm.setValue("companyId", defaultCompanyId, { shouldDirty: false });
    }
  }, [defaultCompanyId, companyOptions, companyForm]);

  const { data: structures = [], isLoading } = useSalaryStructures(companyId);
  const createStructure = useCreateSalaryStructure();
  const updateStructure = useUpdateSalaryStructure();
  const deleteStructure = useDeleteSalaryStructure();

  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState<SalaryStructureResponse | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [structureToDelete, setStructureToDelete] = useState<SalaryStructureResponse | null>(null);

  const filteredStructures = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) return structures;
    return structures.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        (item.code?.toLowerCase().includes(query) ?? false) ||
        (item.description?.toLowerCase().includes(query) ?? false),
    );
  }, [structures, searchValue]);

  const paginatedStructures = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStructures.slice(start, start + pageSize);
  }, [filteredStructures, currentPage, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredStructures.length / pageSize));

  const stats = useMemo(
    () => ({
      total: structures.length,
      active: structures.filter((s) => s.isActive).length,
      withAllowances: structures.filter((s) => s.allowances.length > 0).length,
      withDeductions: structures.filter((s) => s.deductions.length > 0).length,
    }),
    [structures],
  );

  const sheetDefaultValues = useMemo<Partial<SalaryStructureFormValues> | undefined>(() => {
    if (editingStructure) {
      return mapStructureToFormValues(editingStructure);
    }
    return companyId ? { companyId } : undefined;
  }, [editingStructure, companyId]);

  const resetForm = () => {
    setEditingStructure(null);
  };

  const handleSave = async (values: SalaryStructureFormValues) => {
    if (!values.companyId || !values.name?.trim()) {
      toast({
        title: t("common.error", "Error"),
        description: t("payrollData.errors.requiredFields", "Please fill in all required fields"),
        variant: "destructive",
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
        setIsSheetOpen(false);
        resetForm();
        toast({
          title: t("common.success", "Success"),
          description: t(
            "payrollData.salaryStructures.updated",
            "Salary structure updated successfully",
          ),
        });
        return;
      }

      await createStructure.mutateAsync({
        companyId: profile?.companyId ?? values.companyId,
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
      setIsSheetOpen(false);
      resetForm();
      toast({
        title: t("common.success", "Success"),
        description: t(
          "payrollData.salaryStructures.created",
          "Salary structure created successfully",
        ),
      });
    } catch (error) {
      toast({
        title: t("common.error", "Error"),
        description: error instanceof Error ? error.message : t("payrollData.errors.saveFailed", "Failed to save salary structure"),
        variant: "destructive",
      });
    }
  };

  const handleEdit = (item: SalaryStructureResponse) => {
    setEditingStructure(item);
    setIsSheetOpen(true);
  };

  const handleDelete = (item: SalaryStructureResponse) => {
    if ((item.assignedEmployeeCount ?? 0) > 0) {
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
    setStructureToDelete(item);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!structureToDelete || !companyId) return;

    deleteStructure.mutate(
      { id: structureToDelete.id, companyId: structureToDelete.companyId },
      {
        onSuccess: () => {
          setDeleteConfirmOpen(false);
          setStructureToDelete(null);
          toast({
            title: t("common.success", "Success"),
            description: t(
              "payrollData.salaryStructures.deleted",
              "Salary structure deleted successfully",
            ),
          });
        },
        onError: (error) => {
          toast({
            title: t("common.error", "Error"),
            description: getUserFacingErrorMessage(
              error,
              t("payrollData.errors.deleteFailed", "Failed to delete salary structure"),
            ),
            variant: "destructive",
          });
        },
      },
    );
  };

  const columns: ColumnConfig<SalaryStructureResponse>[] = [
    {
      key: "name",
      label: t("payrollData.salaryStructures.name", "Name"),
      sortable: true,
      render: (item) => (
        <span className="font-semibold text-foreground">{item.name}</span>
      ),
    },
    {
      key: "code",
      label: t("payrollData.salaryStructures.code", "Code"),
      sortable: true,
      render: (item) => (
        <span className="text-sm text-muted-foreground">{item.code || t("payrollData.noDescription", "—")}</span>
      ),
    },
    {
      key: "description",
      label: t("payrollData.columns.description", "Description"),
      render: (item) => (
        <span
          className="text-sm text-muted-foreground truncate block max-w-[280px]"
          title={item.description || undefined}
        >
          {item.description || t("payrollData.noDescription", "—")}
        </span>
      ),
    },
    {
      key: "allowances",
      label: t("payrollData.detail.earnings", "Earnings"),
      sortable: true,
      render: (item) => <span className="text-foreground">{item.allowances.length}</span>,
    },
    {
      key: "deductions",
      label: t("payrollData.detail.deductions", "Deductions"),
      sortable: true,
      render: (item) => <span className="text-foreground">{item.deductions.length}</span>,
    },
    {
      key: "isActive",
      label: t("payrollData.columns.status", "Status"),
      sortable: true,
      render: (item) => (
        <Badge
          variant="outline"
          className={`border rounded-full px-2.5 py-0.5 text-[12px] font-medium gap-1 ${
            item.isActive
              ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-300"
              : "bg-muted text-muted-foreground border-border"
          }`}
        >
          {item.isActive && (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300" />
          )}
          {item.isActive
            ? t("payrollData.status.active", "Active")
            : t("payrollData.status.inactive", "Inactive")}
        </Badge>
      ),
    },
  ];

  const renderRowActions = (item: SalaryStructureResponse) => (
    <TableActionMenu
      actions={[
        {
          label: t("payrollData.actions.view", "View"),
          icon: Eye,
          onClick: (e) => {
            e.stopPropagation();
            router.push(`/dashboard/payroll/salary-structures/${item.id}`);
          },
        },
        {
          label: t("payrollData.actions.edit", "Edit"),
          icon: Pencil,
          onClick: (e) => {
            e.stopPropagation();
            handleEdit(item);
          },
        },
        {
          label: t("payrollData.actions.delete", "Delete"),
          icon: Trash2,
          isDanger: true,
          disabled: (item.assignedEmployeeCount ?? 0) > 0,
          onClick: (e) => {
            e.stopPropagation();
            handleDelete(item);
          },
        },
      ]}
    />
  );

  return (
      <div className="flex flex-col gap-6 w-full max-w-full overflow-hidden">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-[24px] font-bold text-foreground">
            {t("payrollData.salaryStructures.title", "Salary structures")}
          </h1>
          <div className="flex items-center gap-3">
            <FormSelect
              id="salary-structures-companyId"
              label={t("setup.selectCompany", "Company selection")}
              placeholder={
                isLoadingCompanies
                  ? t("setup.loadingCompanies", "Loading...")
                  : t("setup.selectCompanyPlaceholder", "Select company")
              }
              control={companyForm.control}
              name="companyId"
              options={companyOptions}
              t={t}
              containerClassName="w-[220px]"
            />
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-medium"
              onClick={() => {
                resetForm();
                setIsSheetOpen(true);
              }}
              disabled={!companyId}
            >
              <Plus className="w-4 h-4 rtl:ml-1" />
              {t("payrollData.salaryStructures.add", "Add structure")}
            </Button>
          </div>
        </div>

        <SalaryStructureSheet
          isOpen={isSheetOpen}
          onOpenChange={(open) => {
            setIsSheetOpen(open);
            if (!open) resetForm();
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
          title={t("payrollData.salaryStructures.deleteTitle", "Delete salary structure")}
          message={t(
            "payrollData.salaryStructures.deleteMessage",
            'Are you sure you want to delete "{{name}}"? This cannot be undone.',
            { name: structureToDelete?.name ?? "" },
          )}
          confirmLabel={t("payrollData.actions.delete", "Delete")}
          onConfirm={confirmDelete}
          isLoading={deleteStructure.isPending}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            <>
              <SummaryStatCardSkeleton />
              <SummaryStatCardSkeleton />
              <SummaryStatCardSkeleton />
              <SummaryStatCardSkeleton />
            </>
          ) : (
            <>
              <SummaryStatCard
                title={t("payrollData.salaryStructures.total", "Total structures")}
                value={stats.total.toString()}
                icon={Layers}
                iconColor="#2865E3"
                iconBgColor="transparent"
                borderColor="#2865E380"
              />
              <SummaryStatCard
                title={t("payrollData.salaryStructures.active", "Active structures")}
                value={stats.active.toString()}
                icon={CheckCircle2}
                iconColor="#22C55E"
                iconBgColor="transparent"
                borderColor="#22C55E80"
              />
              <SummaryStatCard
                title={t("payrollData.salaryStructures.withAllowances", "With allowances")}
                value={stats.withAllowances.toString()}
                icon={FileText}
                iconColor="#D97706"
                iconBgColor="transparent"
                borderColor="#D9770680"
              />
              <SummaryStatCard
                title={t("payrollData.salaryStructures.withDeductions", "With deductions")}
                value={stats.withDeductions.toString()}
                icon={FileText}
                iconColor="#22C55E"
                iconBgColor="transparent"
                borderColor="#22C55E80"
              />
            </>
          )}
        </div>

        <UniversalDataTable
          data={paginatedStructures}
          columns={columns}
          isLoading={isLoading}
          enableSelection={true}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder={t(
            "payrollData.salaryStructures.search",
            "Search salary structures",
          )}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          totalItems={filteredStructures.length}
          renderRowActions={renderRowActions}
          onRowClick={(item) => router.push(`/dashboard/payroll/salary-structures/${item.id}`)}
        />
      </div>
  );
}
