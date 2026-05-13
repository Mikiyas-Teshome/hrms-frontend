"use client";

import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Eye, Wallet, CheckCircle2, CircleDashed, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UniversalDataTable, ColumnConfig } from "@/components/ui/universal-data-table";
import { TableActionMenu } from "@/components/ui/table-action-menu";
import SummaryStatCard from "@/components/dashboard/shared/SummaryStatCard";
import { format } from "date-fns";
import { 
  usePayrollRuns, 
  useCreatePayrollRun, 
  useFinalizePayrollRun, 
  useMarkPayrollRunPaid 
} from "@/features/payroll/hooks/usePayroll";
import { useProfile } from "@/features/auth/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { TableAction } from "@/components/ui/table-action-menu";
import { PayrollRunResponse } from "@/features/payroll/payroll.types";
import { ProtectedRoute } from "@/components/auth/protected-route";

interface LocalDateRange {
    from: Date | null;
    to: Date | null;
}

export default function PayrollRunsPage() {
  const { t } = useTranslation("dashboard");
  const { data: profile } = useProfile();
  const { data: payrollRuns = [], isLoading } = usePayrollRuns(profile?.companyId);
  const { toast } = useToast();
  const createRun = useCreatePayrollRun();
  const finalizeRun = useFinalizePayrollRun();
  const markPaid = useMarkPayrollRunPaid();
  
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRunRange, setNewRunRange] = useState<LocalDateRange | undefined>();

  const handleCreateRun = () => {
    if (!profile?.companyId) {
      toast({
        title: t("common.error", "Error"),
        description: t("payrollData.errors.noCompany", "Company ID not found. Please try again later."),
        variant: "destructive",
      });
      return;
    }
    
    if (!newRunRange?.from || !newRunRange?.to) {
      toast({
        title: t("common.error", "Error"),
        description: t("payrollData.errors.selectDates", "Please select a date range"),
        variant: "destructive",
      });
      return;
    }

    createRun.mutate({
      companyId: profile?.companyId || "",
      startDate: newRunRange.from.toISOString(),
      endDate: newRunRange.to.toISOString(),
    }, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        setNewRunRange(undefined);
        toast({
          title: t("common.success", "Success"),
          description: t("payrollData.success.runCreated", "Payroll run created successfully"),
        });
      },
      onError: (error) => {
        toast({
          title: t("common.error", "Error"),
          description: error.message || t("payrollData.errors.createFailed", "Failed to create payroll run"),
          variant: "destructive",
        });
      }
    });
  };

  const handleFinalize = (id: string) => {
    finalizeRun.mutate(id, {
      onSuccess: () => {
        toast({
          title: t("common.success", "Success"),
          description: t("payrollData.success.runFinalized", "Payroll run finalized"),
        });
      }
    });
  };

  const handleMarkPaid = (id: string) => {
    markPaid.mutate(id, {
      onSuccess: () => {
        toast({
          title: t("common.success", "Success"),
          description: t("payrollData.success.runPaid", "Payroll run marked as paid"),
        });
      }
    });
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDateRange = (start: string, end: string) => {
    try {
      return `${format(new Date(start), "MMM d")} - ${format(new Date(end), "MMM d, yyyy")}`;
    } catch (error) {
      return "Invalid Date";
    }
  };

  const columns: ColumnConfig<PayrollRunResponse>[] = [
    {
      key: "id",
      label: t("payrollData.columns.id", "ID"),
      sortable: true,
      render: (item) => <span className="font-semibold text-xs text-muted-foreground uppercase">{item.id.split('-')[0]}</span>,
    },
    {
      key: "payPeriod",
      label: t("payrollData.columns.payPeriod", "Pay period"),
      sortable: true,
      render: (item) => (
        <span className="text-muted-foreground">
          {formatDateRange(item.startDate, item.endDate)}
        </span>
      ),
    },
    {
      key: "startDate",
      label: t("payrollData.columns.startDate", "Start date"),
      sortable: true,
      render: (item) => <span className="text-muted-foreground">{format(new Date(item.startDate), "MMM d, yyyy")}</span>,
    },
    {
      key: "endDate",
      label: t("payrollData.columns.endDate", "End date"),
      sortable: true,
      render: (item) => <span className="text-muted-foreground">{format(new Date(item.endDate), "MMM d, yyyy")}</span>,
    },
    {
      key: "status",
      label: t("payrollData.columns.status", "Status"),
      sortable: true,
      render: (item) => {
        const isCompleted = item.status.toLowerCase() === "paid" || item.status.toLowerCase() === "finalized";
        const statusText = item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase();
        return (
          <Badge
            variant="outline"
            className={`border rounded-[6px] px-2.5 py-1 text-[12px] font-medium gap-1.5 ${
              isCompleted 
                ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-300"
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300" />
            ) : (
              <CircleDashed className="w-3.5 h-3.5 text-amber-500" />
            )}
            {statusText}
          </Badge>
        );
      },
    },
    {
      key: "createdAt",
      label: t("payrollData.columns.createdAt", "Created at"),
      sortable: true,
      render: (item) => <span className="text-muted-foreground">{format(new Date(item.createdAt), "MMM d, yyyy")}</span>,
    },
  ];

  const renderRowActions = (item: PayrollRunResponse) => {
    const actions: TableAction[] = [
      {
        label: t("payrollData.actions.view", "View"),
        icon: Eye,
      },
    ];

    if (item.status.toLowerCase() === "draft") {
      actions.push({
        label: t("payrollData.actions.finalize", "Finalize"),
        icon: CheckCircle2,
        onClick: (e) => {
          e.stopPropagation();
          handleFinalize(item.id);
        },
      });
    }

    if (item.status.toLowerCase() === "finalized") {
      actions.push({
        label: t("payrollData.actions.markPaid", "Mark as paid"),
        icon: Wallet,
        onClick: (e) => {
          e.stopPropagation();
          handleMarkPaid(item.id);
        },
      });
    }

    return (
      <TableActionMenu actions={actions} />
    );
  };

  const completedRunsCount = payrollRuns.filter(r => r.status.toLowerCase() === 'paid' || r.status.toLowerCase() === 'finalized').length;
  const pendingRunsCount = payrollRuns.length - completedRunsCount;

  return (
    <ProtectedRoute module="payroll_runs">
      <div className="flex flex-col gap-6 w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-bold text-foreground">
          {t("payrollData.runsTitle", "Payroll runs")}
        </h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              {t("payrollData.actions.createRun", "Create payroll run")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px] p-8">
            <DialogHeader className="gap-2">
              <DialogTitle className="text-2xl font-bold">{t("payrollData.dialogs.createRunTitle", "Create New Payroll Run")}</DialogTitle>
            </DialogHeader>
            <div className="py-6 flex flex-col gap-6">
              <p className="text-[15px] text-muted-foreground leading-relaxed">
                {t("payrollData.dialogs.createRunDesc", "Select the period for this payroll run. This will calculate earnings and deductions for all eligible employees within this range.")}
              </p>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-foreground/80 ml-1">{t("payrollData.dialogs.periodLabel", "Payroll Period")}</label>
                <DateRangePicker 
                  value={newRunRange} 
                  onChange={setNewRunRange}
                  className="w-full"
                />
              </div>
            </div>
            <DialogFooter className="gap-3 pt-2">
              <Button variant="ghost" onClick={() => setIsCreateDialogOpen(false)} className="px-6 font-semibold">
                {t("common.cancel", "Cancel")}
              </Button>
              <Button 
                onClick={handleCreateRun} 
                disabled={createRun.isPending || !profile?.companyId} 
                className="px-8 font-semibold rounded-lg"
              >
                {createRun.isPending ? t("common.creating", "Creating...") : t("common.create", "Create Run")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryStatCard
          title={t("payrollData.stats.totalRuns", "Total runs")}
          value={payrollRuns.length.toString()}
          icon={Wallet}
          iconColor="#2865E3"
          iconBgColor="transparent"
          borderColor="#2865E380"
        />
        <SummaryStatCard
          title={t("payrollData.stats.completedRuns", "Completed runs")}
          value={completedRunsCount.toString()}
          icon={CheckCircle2}
          iconColor="#22C55E"
          iconBgColor="transparent"
          borderColor="#22C55E80"
        />
        <SummaryStatCard
          title={t("payrollData.stats.pendingRun", "Pending run")}
          value={pendingRunsCount.toString()}
          icon={CircleDashed}
          iconColor="#D97706"
          iconBgColor="transparent"
          borderColor="#D9770680"
        />
        <SummaryStatCard
          title={t("payrollData.stats.totalGrossPay", "Total gross pay")}
          value="N/A"
          icon={DollarSign}
          iconColor="#22C55E"
          iconBgColor="transparent"
          borderColor="#22C55E80"
        />
      </div>

      <UniversalDataTable
        data={payrollRuns}
        columns={columns}
        isLoading={isLoading}
        enableSelection={true}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder={t("payrollData.searchPlaceholder", "Search payroll runs")}
        showFilter={true}
        filterText={t("payrollData.filter1", "Filter")}
        currentPage={currentPage}
        totalPages={1}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        totalItems={payrollRuns.length}
        renderRowActions={renderRowActions}
      />
      </div>
    </ProtectedRoute>
  );
}
