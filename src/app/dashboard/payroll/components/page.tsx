"use client";

import { useTranslation } from "react-i18next";
import { useState, useMemo } from "react";
import { Eye, FileText, Pencil, ToggleRight, Trash2, CheckCircle2, DollarSign, Activity, Plus, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UniversalDataTable, ColumnConfig } from "@/components/ui/universal-data-table";
import { TableActionMenu } from "@/components/ui/table-action-menu";
import SummaryStatCard from "@/components/dashboard/shared/SummaryStatCard";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAllowances, useDeleteAllowance } from "@/features/allowance/hooks/useAllowance";
import { useDeductions, useDeleteDeduction } from "@/features/deduction/hooks/useDeduction";
import { useCreatePayrollComponent, useUpdatePayrollComponent } from "@/features/payroll/hooks/usePayroll";
import { PayrollComponentType } from "@/features/payroll/payroll.types";
import { PayrollComponentSheet } from "@/components/payroll/payroll-component-sheet";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { useProfile } from "@/features/auth/hooks/useAuth";
// import { mockPayrollComponents } from "@/data/mock-payroll";

type UnifiedComponent = {
  id: string;
  name: string;
  type: "Allowance" | "Deduction";
  value: number;
  valueType: string;
  taxable?: boolean;
  recurring?: boolean;
  description?: string;
};

export default function PayrollComponentsPage() {
  const { t } = useTranslation("dashboard");
  const { toast } = useToast();
  const { data: profile } = useProfile();
  const { data: allowances = [], isLoading: isLoadingAllowances } = useAllowances(profile?.companyId);
  const { data: deductions = [], isLoading: isLoadingDeductions } = useDeductions(profile?.companyId);
  const createComponent = useCreatePayrollComponent();
  const updateComponent = useUpdatePayrollComponent();
  const deleteAllowance = useDeleteAllowance();
  const deleteDeduction = useDeleteDeduction();

  const unifiedData = useMemo(() => {
    const combined = [
      ...allowances.map(a => ({
        id: a.id,
        name: a.name,
        type: "Allowance" as const,
        value: a.value,
        valueType: a.type || 'FIXED',
        taxable: a.taxable,
      })),
      ...deductions.map(d => ({
        id: d.id,
        name: d.name,
        type: "Deduction" as const,
        value: d.value,
        valueType: d.type || 'FIXED',
        recurring: d.recurring,
      }))
    ];
    return combined as UnifiedComponent[];
  }, [allowances, deductions]);

  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<UnifiedComponent | null>(null);

  const resetForm = () => {
    setEditingComponent(null);
  };

  const handleSave = (data: any) => {
    if (!data.name || data.value === undefined || !profile?.companyId) {
      toast({
        title: t("common.error", "Error"),
        description: !profile?.companyId 
          ? "Company ID is missing. Please refresh the page." 
          : t("payrollData.errors.requiredFields", "Please fill in all required fields"),
        variant: "destructive",
      });
      return;
    }

    if (editingComponent) {
      updateComponent.mutate({
        id: editingComponent.id,
        name: data.name,
        type: data.type,
        value: data.value,
        componentType: data.category,
        taxable: data.taxable,
        recurring: data.recurring,
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
      createComponent.mutate({
        companyId: profile.companyId,
        name: data.name,
        type: data.type, // "fixed" or "percentage"
        value: data.value,
        componentType: data.category,
        taxable: data.taxable,
        recurring: data.recurring,
      }, {
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

  const handleDelete = (item: UnifiedComponent) => {
    const mutation = item.type === "Allowance" ? deleteAllowance : deleteDeduction;
    
    mutation.mutate(item.id, {
      onSuccess: () => {
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
      render: (item) => <span className="font-semibold text-foreground">{item.name}</span>,
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
      render: (item) => <span className="text-foreground">{item.valueType === 'PERCENTAGE' ? `${item.value}%` : `$${item.value}`}</span>,
    },
    {
      key: "status",
      label: t("payrollData.columns.status", "Status"),
      sortable: true,
      render: (item) => {
        return (
          <Badge
            variant="outline"
            className="border rounded-full px-2.5 py-0.5 text-[12px] font-medium gap-1 bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-300"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300" />
            {t("payrollData.status.active", "Active")}
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
          onClick: () => handleEdit(item),
        },
        {
          label: t("payrollData.actions.generate", "Regenerate"),
          icon: RefreshCw,
          onClick: () => {
            // handleRegenerate(item);
          },
        },
        {
          label: t("payrollData.actions.delete", "Delete"),
          icon: Trash2,
          isDanger: true,
          onClick: () => handleDelete(item),
        },
      ]}
    />
  );

  const handleEdit = (item: UnifiedComponent) => {
    setEditingComponent(item);
    setIsModalOpen(true);
  };

  const stats = {
    total: unifiedData.length,
    active: unifiedData.length, // Assuming all are active for now
    fixed: unifiedData.filter(d => d.valueType === 'FIXED').length,
    totalValue: unifiedData.reduce((acc, curr) => curr.valueType === 'FIXED' ? acc + curr.value : acc, 0)
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-bold text-foreground">
          {t("payrollData.componentsTitle", "Payroll components")}
        </h1>
        <Button 
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-medium" 
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4 rtl:ml-1" />
          {t("payrollData.addComponent", "Add payroll component")}
        </Button>

        <PayrollComponentSheet
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          defaultValues={editingComponent ? {
            name: editingComponent.name,
            category: editingComponent.type.toLowerCase() === "allowance" ? PayrollComponentType.ALLOWANCE : PayrollComponentType.DEDUCTION,
            type: editingComponent.valueType.toLowerCase(),
            value: editingComponent.value,
            taxable: editingComponent.taxable,
            recurring: editingComponent.recurring,
          } : undefined}
          onSubmit={(data) => {
            // We'll refactor handleSave to accept the data directly
            handleSave(data);
          }}
          isSubmitting={createComponent.isPending || updateComponent.isPending}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
      </div>

      <UniversalDataTable
        data={unifiedData}
        columns={columns}
        isLoading={isLoadingAllowances || isLoadingDeductions}
        enableSelection={true}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder={t("payrollData.searchPlaceholder", "Search components")}
        showFilter={true}
        filterText={t("payrollData.filter1", "Filter")}
        currentPage={currentPage}
        totalPages={1}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        totalItems={unifiedData.length}
        renderRowActions={renderRowActions}
      />
    </div>
  );
}
