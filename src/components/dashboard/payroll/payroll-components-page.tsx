"use client";

import { useTranslation } from "react-i18next";
import { useState, useMemo, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { FileText, Pencil, Trash2, CheckCircle2, DollarSign, Activity, Plus, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UniversalDataTable, ColumnConfig } from "@/components/ui/universal-data-table";
import { TableActionMenu } from "@/components/ui/table-action-menu";
import SummaryStatCard from "@/components/dashboard/shared/SummaryStatCard";
import { SummaryStatCardSkeleton } from "@/components/common/SummaryStatSkeleton";
import { cn } from "@/lib/utils";
import {
  usePayrollComponents,
  useCreatePayrollComponent,
  useUpdatePayrollComponent,
  useDeletePayrollComponent,
} from "@/features/payroll/hooks/usePayroll";
import {
  PayrollComponentType,
  PayrollComponentValueType,
  PayrollComponentFilterInput,
  isPercentageType,
} from "@/features/payroll/payroll.types";
import { PayrollComponentSheet, PayrollComponentValues } from "@/components/payroll/payroll-component-sheet";
import { FormSelect } from "@/components/ui/FormSelect";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/features/auth/hooks/useAuth";
import { useCompanyOptions } from "@/features/organization/hooks/useOrganization";
import ConfirmationModal from "@/components/dashboard/shared/ConfirmationModal";

type UnifiedComponent = {
  id: string;
  name: string;
  type: "Allowance" | "Deduction";
  value: number;
  valueType: PayrollComponentValueType;
  taxable?: boolean;
  recurring?: boolean;
  description?: string;
  isActive: boolean;
};

const ALL_FILTER_VALUE = "all";

type ComponentFilterDraft = {
  category: string;
  status: string;
  calculationType: string;
};

const defaultFilterDraft: ComponentFilterDraft = {
  category: ALL_FILTER_VALUE,
  status: ALL_FILTER_VALUE,
  calculationType: ALL_FILTER_VALUE,
};

function countActiveFilters(filter: PayrollComponentFilterInput): number {
  let count = 0;
  if (filter.category) count += 1;
  if (filter.isActive !== undefined) count += 1;
  if (filter.type) count += 1;
  return count;
}

function mapDraftToFilter(
  draft: ComponentFilterDraft,
  search?: string,
): PayrollComponentFilterInput {
  return {
    ...(search ? { search } : {}),
    ...(draft.category !== ALL_FILTER_VALUE
      ? { category: draft.category as PayrollComponentType }
      : {}),
    ...(draft.status === "active"
      ? { isActive: true }
      : draft.status === "inactive"
        ? { isActive: false }
        : {}),
    ...(draft.calculationType !== ALL_FILTER_VALUE
      ? { type: draft.calculationType as PayrollComponentValueType }
      : {}),
  };
}

function mapFilterToDraft(filter: PayrollComponentFilterInput): ComponentFilterDraft {
  return {
    category: filter.category ?? ALL_FILTER_VALUE,
    status:
      filter.isActive === true
        ? "active"
        : filter.isActive === false
          ? "inactive"
          : ALL_FILTER_VALUE,
    calculationType: filter.type ?? ALL_FILTER_VALUE,
  };
}

function mapToUnifiedComponent(component: {
  id: string;
  name: string;
  category: PayrollComponentType;
  type: PayrollComponentValueType;
  value: number;
  taxable?: boolean;
  recurring?: boolean;
  description?: string;
  isActive: boolean;
}): UnifiedComponent {
  return {
    id: component.id,
    name: component.name,
    type: component.category === PayrollComponentType.DEDUCTION ? "Deduction" : "Allowance",
    value: component.value,
    valueType: component.type,
    taxable: component.taxable,
    recurring: component.recurring,
    description: component.description,
    isActive: component.isActive,
  };
}

export function PayrollComponentsPage() {
  const { t } = useTranslation(["payroll", "dashboard"]);
  const { toast } = useToast();
  const { data: profile } = useProfile();
  const { companies: companiesData, isLoading: isLoadingCompanies } = useCompanyOptions();

  const ouForm = useForm({
    defaultValues: {
      ouId: "",
    },
  });

  const selectedOuId = useWatch({
    control: ouForm.control,
    name: "ouId",
  });

  const ouId = selectedOuId || profile?.companyId;

  const [searchValue, setSearchValue] = useState("");
  const [activeFilter, setActiveFilter] = useState<PayrollComponentFilterInput>({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterForm = useForm<ComponentFilterDraft>({
    defaultValues: defaultFilterDraft,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<UnifiedComponent | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [componentToDelete, setComponentToDelete] = useState<UnifiedComponent | null>(null);

  const companyOptions = useMemo(
    () =>
      companiesData?.map((company) => ({
        label: company.name || company.displayLabel || company.id,
        value: company.id,
      })) ?? [],
    [companiesData],
  );

  const defaultOuId = useMemo(
    () => companyOptions[0]?.value ?? "",
    [companyOptions],
  );

  useEffect(() => {
    if (!defaultOuId) return;

    const currentOuId = ouForm.getValues("ouId");
    const hasValidSelection = companyOptions.some((option) => option.value === currentOuId);

    if (!hasValidSelection) {
      ouForm.setValue("ouId", defaultOuId, { shouldDirty: false });
    }
  }, [defaultOuId, companyOptions, ouForm]);

  const [prevSelectedOuId, setPrevSelectedOuId] = useState(selectedOuId);
  if (selectedOuId !== prevSelectedOuId) {
    setPrevSelectedOuId(selectedOuId);
    setCurrentPage(1);
    setSelectedIds(new Set());
  }

  useEffect(() => {
    const debounce = setTimeout(() => {
      setActiveFilter((prev) => ({
        ...prev,
        search: searchValue.trim() || undefined,
      }));
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(debounce);
  }, [searchValue]);

  const activeFilterCount = countActiveFilters(activeFilter);

  const handleApplyFilters = () => {
    const draft = filterForm.getValues();
    setActiveFilter(mapDraftToFilter(draft, searchValue.trim() || undefined));
    setCurrentPage(1);
    setFiltersOpen(false);
  };

  const handleResetFilters = () => {
    filterForm.reset(defaultFilterDraft);
    setActiveFilter((prev) => ({
      search: prev.search,
    }));
    setCurrentPage(1);
  };

  const handleOpenFilters = () => {
    filterForm.reset(mapFilterToDraft(activeFilter));
    setFiltersOpen((open) => !open);
  };

  const { data: componentsResponse, isLoading, isFetching } = usePayrollComponents(
    ouId,
    activeFilter,
    { page: currentPage, size: pageSize },
  );

  const createComponent = useCreatePayrollComponent();
  const updateComponent = useUpdatePayrollComponent();
  const deleteComponent = useDeletePayrollComponent();

  const tableData = useMemo(
    () => (componentsResponse?.data ?? []).map(mapToUnifiedComponent),
    [componentsResponse?.data],
  );

  const metaData = componentsResponse?.metaData;
  const summary = componentsResponse?.summary;

  const stats = useMemo(() => ({
    total: metaData?.total ?? 0,
    active: summary?.activeCount ?? 0,
    fixed: summary?.fixedCount ?? 0,
    totalValue: summary?.totalFixedValue ?? 0,
  }), [metaData?.total, summary]);

  const sheetDefaultValues = useMemo<Partial<PayrollComponentValues> | undefined>(() => {
    if (editingComponent) {
      return {
        ouId,
        name: editingComponent.name,
        category: editingComponent.type === "Allowance"
          ? PayrollComponentType.ALLOWANCE
          : PayrollComponentType.DEDUCTION,
        type: editingComponent.valueType,
        value: editingComponent.value,
        description: editingComponent.description ?? "",
        taxable: editingComponent.taxable ?? true,
        recurring: editingComponent.recurring ?? true,
      };
    }

    return ouId ? { ouId } : undefined;
  }, [editingComponent, ouId]);

  const resetForm = () => {
    setEditingComponent(null);
  };

  const handleSave = (data: {
    ouId: string;
    name: string;
    category: PayrollComponentType;
    type: PayrollComponentValueType;
    value: number;
    taxable?: boolean;
    recurring?: boolean;
    description?: string;
  }) => {
    const targetOuId = data.ouId || ouId;

    if (!data.name?.trim() || !Number.isFinite(data.value) || !targetOuId) {
      toast({
        title: t("common.error", "Error"),
        description: !targetOuId
          ? "Organization unit is missing. Please select a company."
          : t("payrollData.errors.requiredFields", "Please fill in all required fields"),
        variant: "destructive",
      });
      return;
    }

    const payload = {
      ouId: targetOuId,
      name: data.name,
      type: data.type,
      value: data.value,
      category: data.category,
      description: data.description,
      ...(data.category === PayrollComponentType.ALLOWANCE
        ? { taxable: data.taxable ?? true }
        : { recurring: data.recurring ?? true }),
    };

    if (editingComponent) {
      updateComponent.mutate({
        id: editingComponent.id,
        ...payload,
      }, {
        onSuccess: () => {
          setIsModalOpen(false);
          resetForm();
          toast({
            title: t("common.success", "Success"),
            description: t("payrollData.success.componentUpdated", "Payroll component updated successfully"),
          });
        },
        onError: (error) => {
          toast({
            title: t("common.error", "Error"),
            description: error.message || t("payrollData.errors.updateFailed", "Failed to update component"),
            variant: "destructive",
          });
        }
      });
    } else {
      createComponent.mutate(payload, {
        onSuccess: () => {
          setIsModalOpen(false);
          resetForm();
          toast({
            title: t("common.success", "Success"),
            description: t("payrollData.success.componentCreated", "Payroll component created successfully"),
          });
        },
        onError: (error) => {
          toast({
            title: t("common.error", "Error"),
            description: error.message || t("payrollData.errors.createFailed", "Failed to create component"),
            variant: "destructive",
          });
        }
      });
    }
  };

  const handleDeleteClick = (item: UnifiedComponent) => {
    setComponentToDelete(item);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!componentToDelete) return;
    deleteComponent.mutate({
      id: componentToDelete.id,
      category: componentToDelete.type === "Allowance" ? PayrollComponentType.ALLOWANCE : PayrollComponentType.DEDUCTION,
    }, {
      onSuccess: () => {
        setDeleteConfirmOpen(false);
        setComponentToDelete(null);
        toast({
          title: t("common.success", "Success"),
          description: t("payrollData.success.componentDeleted", "Component deleted successfully"),
        });
      },
      onError: (error) => {
        toast({
          title: t("common.error", "Error"),
          description: error.message || t("payrollData.errors.deleteFailed", "Failed to delete component"),
          variant: "destructive",
        });
      }
    });
  };

  const columns: ColumnConfig<UnifiedComponent>[] = [
    {
      key: "name",
      label: t("payrollData.columns.componentName", "Component name"),
      sortable: true,
      render: (item) => (
        <span className="font-semibold text-foreground">{item.name}</span>
      ),
    },
    {
      key: "description",
      label: t("payrollData.columns.description", "Description"),
      sortable: false,
      render: (item) => (
        <span className="text-sm text-muted-foreground">
          {item.description || t("payrollData.noDescription", "—")}
        </span>
      ),
    },
    {
      key: "type",
      label: t("payrollData.columns.type", "Type"),
      sortable: true,
      render: (item) => {
        const isDeduction = item.type === "Deduction";
        return (
          <Badge
            variant="outline"
            className={`px-2 py-0.5 text-[12px] font-medium rounded-full bg-transparent ${
              isDeduction
                ? "text-red-600 border-red-500/30 dark:text-red-400"
                : "text-emerald-600 border-emerald-500/30 dark:text-emerald-400"
            }`}
          >
            {item.type}
          </Badge>
        );
      },
    },
    {
      key: "valueType",
      label: t("payrollData.columns.calculationType", "Calculation type"),
      sortable: true,
      render: (item) => <span className="text-foreground capitalize">{item.valueType.toLowerCase()}</span>,
    },
    {
      key: "value",
      label: t("payrollData.columns.value", "Value"),
      sortable: true,
      render: (item) => (
        <span className="text-foreground">
          {isPercentageType(item.valueType) ? `${item.value}%` : `$${item.value}`}
        </span>
      ),
    },
    {
      key: "status",
      label: t("payrollData.columns.status", "Status"),
      sortable: true,
      render: (item) => {
        return (
          <Badge
            variant="outline"
            className={`border rounded-full px-2.5 py-0.5 text-[12px] font-medium gap-1 ${
              item.isActive
                ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-300"
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            {item.isActive && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300" />}
            {item.isActive ? t("payrollData.status.active", "Active") : t("payrollData.status.inactive", "Inactive")}
          </Badge>
        );
      },
    },
  ];

  const renderRowActions = (item: UnifiedComponent) => (
    <TableActionMenu
      actions={[
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
          onClick: (e) => {
            e.stopPropagation();
            handleDeleteClick(item);
          },
        },
      ]}
    />
  );

  const handleEdit = (item: UnifiedComponent) => {
    setEditingComponent(item);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-[24px] font-bold text-foreground">
          {t("payrollData.componentsTitle", "Payroll components")}
        </h1>
        <div className="flex items-center gap-3">
          <FormSelect
            id="payroll-components-ouId"
            label={t("setup.selectCompany", "Company selection")}
            placeholder={
              isLoadingCompanies
                ? t("setup.loadingCompanies", "Loading...")
                : t("setup.selectCompanyPlaceholder", "Select company")
            }
            control={ouForm.control}
            name="ouId"
            options={companyOptions}
            t={t}
            containerClassName="w-[220px]"
          />
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-medium"
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            disabled={!ouId}
          >
            <Plus className="w-4 h-4 rtl:ml-1" />
            {t("payrollData.addComponent", "Add payroll component")}
          </Button>
        </div>
      </div>

      <PayrollComponentSheet
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        defaultOuId={ouId}
        companyOptions={companyOptions}
        isLoadingCompanies={isLoadingCompanies}
        defaultValues={sheetDefaultValues}
        onSubmit={handleSave}
        isSubmitting={createComponent.isPending || updateComponent.isPending}
      />

      <ConfirmationModal
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={t("payrollData.deleteConfirmTitle", "Delete Payroll Component")}
        message={t("payrollData.deleteConfirmMessage", "Are you sure you want to delete the payroll component \"{{name}}\"? This action cannot be undone.", { name: componentToDelete?.name || '' })}
        confirmLabel={t("payrollData.actions.delete", "Delete")}
        onConfirm={handleConfirmDelete}
        isLoading={deleteComponent.isPending}
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
              title={t("payrollData.stats.noOfComponents", "Number of components")}
              value={stats.total.toString()}
              icon={FileText}
              iconColor="#2865E3"
              iconBgColor="transparent"
              borderColor="#2865E380"
            />
            <SummaryStatCard
              title={t("payrollData.stats.activeComponents", "Active components")}
              value={stats.active.toString()}
              icon={CheckCircle2}
              iconColor="#22C55E"
              iconBgColor="transparent"
              borderColor="#22C55E80"
            />
            <SummaryStatCard
              title={t("payrollData.stats.fixedAmountComponents", "Fixed amount components")}
              value={stats.fixed.toString()}
              icon={Activity}
              iconColor="#D97706"
              iconBgColor="transparent"
              borderColor="#D9770680"
            />
            <SummaryStatCard
              title={t("payrollData.stats.monthlyComponentValue", "Monthly component value")}
              value={`$${stats.totalValue.toLocaleString()}`}
              icon={DollarSign}
              iconColor="#22C55E"
              iconBgColor="transparent"
              borderColor="#22C55E80"
            />
          </>
        )}
      </div>

      <UniversalDataTable
        data={tableData}
        columns={columns}
        isLoading={isLoading || isFetching}
        enableSelection={true}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder={t("payrollData.searchPlaceholder", "Search components")}
        showFilter={true}
        filterText={t("payrollData.filter1", "Filter")}
        onFilterClick={handleOpenFilters}
        renderCustomFilter={
          <Button
            variant="outline"
            size="default"
            className={cn(
              "h-10 gap-2 border-input",
              (filtersOpen || activeFilterCount > 0) && "bg-muted",
            )}
            onClick={handleOpenFilters}
          >
            <Filter className="h-4 w-4" />
            <span>{t("payrollData.filter1", "Filter")}</span>
            {activeFilterCount > 0 ? (
              <span className="ml-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                {activeFilterCount}
              </span>
            ) : null}
          </Button>
        }
        renderFilterPanel={
          filtersOpen ? (
            <div className="rounded-[8px] border border-border bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <FormSelect
                  id="payroll-filter-category"
                  label={t("payrollData.filters.category", "Category")}
                  control={filterForm.control}
                  name="category"
                  options={[
                    { value: ALL_FILTER_VALUE, label: t("payrollData.filters.allCategories", "All categories") },
                    { value: PayrollComponentType.ALLOWANCE, label: t("payrollData.filters.allowance", "Allowance") },
                    { value: PayrollComponentType.DEDUCTION, label: t("payrollData.filters.deduction", "Deduction") },
                  ]}
                  t={t}
                  containerClassName="flex flex-col gap-2"
                />
                <FormSelect
                  id="payroll-filter-status"
                  label={t("payrollData.filters.status", "Status")}
                  control={filterForm.control}
                  name="status"
                  options={[
                    { value: ALL_FILTER_VALUE, label: t("payrollData.filters.allStatuses", "All statuses") },
                    { value: "active", label: t("payrollData.status.active", "Active") },
                    { value: "inactive", label: t("payrollData.status.inactive", "Inactive") },
                  ]}
                  t={t}
                  containerClassName="flex flex-col gap-2"
                />
                <FormSelect
                  id="payroll-filter-calculation-type"
                  label={t("payrollData.filters.calculationType", "Calculation type")}
                  control={filterForm.control}
                  name="calculationType"
                  options={[
                    { value: ALL_FILTER_VALUE, label: t("payrollData.filters.allCalculationTypes", "All types") },
                    { value: PayrollComponentValueType.FIXED, label: t("payrollData.filters.fixed", "Fixed") },
                    { value: PayrollComponentValueType.PERCENTAGE, label: t("payrollData.filters.percentage", "Percentage") },
                  ]}
                  t={t}
                  containerClassName="flex flex-col gap-2"
                />
                <div className="flex items-end gap-3">
                  <Button
                    className="h-10 flex-1"
                    onClick={handleApplyFilters}
                  >
                    {t("payrollData.filters.apply", "Apply filters")}
                  </Button>
                  <Button
                    variant="outline"
                    className="h-10 flex-1"
                    onClick={handleResetFilters}
                  >
                    {t("payrollData.filters.reset", "Reset")}
                  </Button>
                </div>
              </div>
            </div>
          ) : null
        }
        currentPage={metaData?.page ?? currentPage}
        totalPages={metaData?.totalPages ?? 0}
        pageSize={metaData?.size ?? pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        totalItems={metaData?.total ?? 0}
        renderRowActions={renderRowActions}
      />
    </div>
  );
}
