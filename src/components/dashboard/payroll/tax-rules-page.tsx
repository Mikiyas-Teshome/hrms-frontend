"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { CheckCircle2, FileText, Layers, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UniversalDataTable, ColumnConfig } from "@/components/ui/universal-data-table";
import { TableActionMenu } from "@/components/ui/table-action-menu";
import SummaryStatCard from "@/components/dashboard/shared/SummaryStatCard";
import { SummaryStatCardSkeleton } from "@/components/common/SummaryStatSkeleton";
import ConfirmationModal from "@/components/dashboard/shared/ConfirmationModal";
import { TaxRuleSheet } from "@/components/payroll/tax-rule-sheet";
import { useProfile } from "@/features/auth/hooks/useAuth";
import {
  useCreateTaxRule,
  useDeleteTaxRule,
  useTaxRules,
  useUpdateTaxRule,
} from "@/features/payroll/tax-rules/hooks/useTaxRules";
import {
  findScheduleConflictRule,
  formatTaxRulePeriod,
  isTaxRuleScheduleConflictError,
} from "@/features/payroll/tax-rules/tax-rules-conflict.util";
import {
  CreateTaxRuleInput,
  TaxRuleResponse,
  TaxRuleStatus,
} from "@/features/payroll/tax-rules/tax-rules.types";
import { useToast } from "@/hooks/use-toast";

export function TaxRulesPage() {
  const { t } = useTranslation(["payroll", "dashboard"]);
  const { toast } = useToast();
  const { data: profile } = useProfile();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<TaxRuleResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TaxRuleResponse | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const companyId = profile?.companyId ?? "";
  const { data: taxRules = [], isLoading } = useTaxRules(companyId);
  const createMutation = useCreateTaxRule();
  const updateMutation = useUpdateTaxRule();
  const deleteMutation = useDeleteTaxRule();

  const filteredTaxRules = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) {
      return taxRules;
    }
    return taxRules.filter(
      (rule) =>
        rule.name.toLowerCase().includes(query) ||
        (rule.description?.toLowerCase().includes(query) ?? false) ||
        rule.status.toLowerCase().includes(query),
    );
  }, [taxRules, searchValue]);

  const paginatedTaxRules = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTaxRules.slice(start, start + pageSize);
  }, [filteredTaxRules, currentPage, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredTaxRules.length / pageSize));

  const stats = useMemo(
    () => ({
      total: taxRules.length,
      active: taxRules.filter((rule) => rule.status === TaxRuleStatus.active).length,
      inactive: taxRules.filter((rule) => rule.status === TaxRuleStatus.inactive).length,
      brackets: taxRules.reduce((sum, rule) => sum + rule.brackets.length, 0),
    }),
    [taxRules],
  );

  const handleEdit = useCallback((rule: TaxRuleResponse) => {
    setEditing(rule);
    setSheetOpen(true);
  }, []);

  const handleDeleteClick = useCallback((rule: TaxRuleResponse) => {
    setDeleteTarget(rule);
  }, []);

  const renderRowActions = useCallback(
    (item: TaxRuleResponse) => (
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
    ),
    [t, handleEdit, handleDeleteClick],
  );

  const columns: ColumnConfig<TaxRuleResponse>[] = useMemo(
    () => [
      {
        key: "name",
        label: t("taxRules.columns.name", "Name"),
        sortable: true,
        render: (row) => <span className="font-medium text-foreground">{row.name}</span>,
      },
      {
        key: "status",
        label: t("taxRules.columns.status", "Status"),
        sortable: true,
        render: (row) => (
          <Badge
            variant="outline"
            className={`border rounded-full px-2.5 py-0.5 text-[12px] font-medium gap-1 ${
              row.status === TaxRuleStatus.active
                ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-300"
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            {row.status === TaxRuleStatus.active && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300" />
            )}
            {row.status === TaxRuleStatus.active
              ? t("taxRules.status.active", "Active")
              : t("taxRules.status.inactive", "Inactive")}
          </Badge>
        ),
      },
      {
        key: "effectiveFrom",
        label: t("taxRules.columns.effectiveFrom", "Effective from"),
        sortable: true,
        render: (row) => format(new Date(row.effectiveFrom), "yyyy-MM-dd"),
      },
      {
        key: "effectiveTo",
        label: t("taxRules.columns.effectiveTo", "Effective to"),
        sortable: true,
        render: (row) =>
          row.effectiveTo ? format(new Date(row.effectiveTo), "yyyy-MM-dd") : "—",
      },
      {
        key: "brackets",
        label: t("taxRules.columns.brackets", "Brackets"),
        sortable: true,
        render: (row) => <span className="text-foreground">{row.brackets.length}</span>,
      },
    ],
    [t],
  );

  const handleSubmit = async (values: CreateTaxRuleInput): Promise<boolean> => {
    const result = editing
      ? await updateMutation.mutateAsync({ id: editing.id, input: values })
      : await createMutation.mutateAsync(values);

    if (!result.success) {
      const errorMessage = result.error ?? "";
      if (isTaxRuleScheduleConflictError(errorMessage)) {
        const conflicting = findScheduleConflictRule(taxRules, values, editing?.id);
        if (conflicting) {
          setEditing(conflicting);
        }
        const serverTranslated =
          errorMessage.length > 0 && !errorMessage.includes("TAX_RULE_SCHEDULE_CONFLICT");
        const description = serverTranslated
          ? errorMessage
          : conflicting
            ? t("taxRules.errors.scheduleConflict", {
                name: conflicting.name,
                period: formatTaxRulePeriod(conflicting.effectiveFrom, conflicting.effectiveTo),
              })
            : t(
                "taxRules.errors.scheduleConflictGeneric",
                "An active tax rule already covers this period. Update the existing rule or choose a later effective start date.",
              );
        toast({
          title: t("taxRules.errors.saveFailed", "Could not save tax rule"),
          description,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: t("taxRules.errors.saveFailed", "Could not save tax rule"),
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: editing
        ? t("taxRules.success.updated", "Tax rule updated")
        : t("taxRules.success.created", "Tax rule created"),
    });
    setEditing(null);
    return true;
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await deleteMutation.mutateAsync(deleteTarget.id);
    if (!result.success) {
      toast({
        title: t("taxRules.errors.deleteFailed", "Could not delete tax rule"),
        description: result.error,
        variant: "destructive",
      });
      return;
    }
    toast({ title: t("taxRules.success.deleted", "Tax rule deleted") });
    setDeleteTarget(null);
  };

  return (
      <div className="flex flex-col gap-6 w-full max-w-full overflow-hidden">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[24px] font-bold text-foreground">
              {t("taxRules.title", "Income tax rules")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t(
                "taxRules.subtitle",
                "Configure progressive tax brackets per tenant. Payroll uses the rule active on each period end date.",
              )}
            </p>
          </div>
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-medium"
            onClick={() => {
              setEditing(null);
              setSheetOpen(true);
            }}
            disabled={!companyId}
          >
            <Plus className="w-4 h-4" />
            {t("taxRules.actions.create", "New tax rule")}
          </Button>
        </div>

        <TaxRuleSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          initial={editing}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />

        <ConfirmationModal
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title={t("taxRules.delete.title", "Delete tax rule")}
          message={t(
            "taxRules.delete.description",
            'Are you sure you want to delete "{{name}}"? Existing payslips keep their stored tax snapshot.',
            { name: deleteTarget?.name ?? "" },
          )}
          confirmLabel={t("payrollData.actions.delete", "Delete")}
          onConfirm={handleDelete}
          isLoading={deleteMutation.isPending}
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
                title={t("taxRules.stats.total", "Total rules")}
                value={stats.total.toString()}
                icon={Layers}
                iconColor="#2865E3"
                iconBgColor="transparent"
                borderColor="#2865E380"
              />
              <SummaryStatCard
                title={t("taxRules.stats.active", "Active rules")}
                value={stats.active.toString()}
                icon={CheckCircle2}
                iconColor="#22C55E"
                iconBgColor="transparent"
                borderColor="#22C55E80"
              />
              <SummaryStatCard
                title={t("taxRules.stats.inactive", "Inactive rules")}
                value={stats.inactive.toString()}
                icon={FileText}
                iconColor="#D97706"
                iconBgColor="transparent"
                borderColor="#D9770680"
              />
              <SummaryStatCard
                title={t("taxRules.stats.brackets", "Total brackets")}
                value={stats.brackets.toString()}
                icon={FileText}
                iconColor="#22C55E"
                iconBgColor="transparent"
                borderColor="#22C55E80"
              />
            </>
          )}
        </div>

        <UniversalDataTable
          data={paginatedTaxRules}
          columns={columns}
          isLoading={isLoading}
          searchValue={searchValue}
          onSearchChange={(value) => {
            setSearchValue(value);
            setCurrentPage(1);
          }}
          searchPlaceholder={t("taxRules.searchPlaceholder", "Search tax rules")}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          totalItems={filteredTaxRules.length}
          emptyMessage={t("taxRules.empty", "No tax rules configured yet.")}
          renderRowActions={renderRowActions}
        />
      </div>
  );
}
