"use client";

import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Eye, FileText, Pencil, ToggleRight, Trash2, Users, CheckCircle2, DollarSign, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UniversalDataTable, ColumnConfig } from "@/components/ui/universal-data-table";
import { TableActionMenu } from "@/components/ui/table-action-menu";
import SummaryStatCard from "@/components/dashboard/shared/SummaryStatCard";
import { SummaryStatCardSkeleton } from "@/components/common/SummaryStatSkeleton";
import { useRouter } from "next/navigation";
import { useEmployees } from "@/features/employee/hooks/useEmployee";
import { EmployeeResponse } from "@/features/employee/employee.types";
import { format } from "date-fns";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useDisplayCurrency } from "@/features/settings/hooks/useDisplayCurrency";
import { formatIntlCurrency } from "@/lib/currency";

export default function EmployeeSalariesPage() {
  const { t } = useTranslation("dashboard");
  const router = useRouter();
  const { data: employees = [], isLoading } = useEmployees();
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const { currencyCode, formatAmount } = useDisplayCurrency();

  const columns: ColumnConfig<EmployeeResponse>[] = [
    {
      key: "firstName",
      label: t("payrollData.columns.employee", "Employee"),
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 rounded-full border">
            <AvatarImage src="" alt={`${item.firstName} ${item.lastName}`} />
            <AvatarFallback>{item.firstName.charAt(0)}{item.lastName.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="font-semibold">{item.firstName} {item.lastName}</span>
        </div>
      ),
    },
    {
      key: "salary",
      label: t("payrollData.columns.salary", "Salary"),
      sortable: true,
      render: (item) => (
        <span className="text-muted-foreground">
          {formatIntlCurrency(item.salary || 0, item.currency || currencyCode)}
        </span>
      ),
    },
    {
      key: "jobTitle",
      label: t("payrollData.columns.jobTitle", "Job title"),
      sortable: true,
      render: (item) => <span className="text-muted-foreground">{item.jobTitle}</span>,
    },
    {
      key: "status",
      label: t("payrollData.columns.status", "Status"),
      sortable: true,
      render: (item) => {
        const isActive = item.status.toLowerCase() === "active";
        const statusText = item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase();
        return (
          <Badge
            variant="outline"
            className={`border rounded-[6px] px-2.5 py-1 text-[12px] font-medium gap-1.5 ${
              isActive 
                ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-300"
                : "bg-red-500/10 text-red-700 border-red-500/30 dark:text-red-300"
            }`}
          >
            {isActive ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-300" />
            )}
            {statusText}
          </Badge>
        );
      },
    },
    {
      key: "createdAt",
      label: t("payrollData.columns.createdDate", "Created date"),
      sortable: true,
      render: (item) => <span className="text-muted-foreground">{format(new Date(item.createdAt), "MMM d, yyyy")}</span>,
    },
  ];

  const renderRowActions = (item: EmployeeResponse) => (
    <TableActionMenu
      actions={[
        {
          label: t("payrollData.actions.view", "View"),
          icon: Eye,
          onClick: (e) => {
            e.stopPropagation();
            router.push(`/dashboard/payroll/salaries/${item.id}`);
          },
        },
        {
          label: t("payrollData.actions.showPayroll", "Show payroll"),
          icon: FileText,
          onClick: (e) => e.stopPropagation(),
        },
        {
          label: t("payrollData.actions.edit", "Edit"),
          icon: Pencil,
          onClick: (e) => e.stopPropagation(),
        },
        {
          label: t("payrollData.actions.changeStatus", "Change status"),
          icon: ToggleRight,
          onClick: (e) => e.stopPropagation(),
        },
        {
          label: t("payrollData.actions.delete", "Delete"),
          icon: Trash2,
          isDanger: true,
          onClick: (e) => e.stopPropagation(),
        },
      ]}
    />
  );

  const activeEmployeesCount = employees.filter(e => e.status.toLowerCase() === 'active').length;
  const totalSalary = employees.reduce((acc, curr) => acc + (curr.salary || 0), 0);

  return (
    <ProtectedRoute module="employee_salaries">
      <div className="flex flex-col gap-6 w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-bold text-foreground">
          {t("payrollData.salariesTitle", "Employee salaries")}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <SummaryStatCardSkeleton />
            <SummaryStatCardSkeleton />
            <SummaryStatCardSkeleton />
          </>
        ) : (
          <>
            <SummaryStatCard
              title={t("payrollData.stats.numberEmployees", "Number of employees")}
              value={employees.length.toString()}
              icon={Users}
              iconColor="#2865E3"
              iconBgColor="transparent"
              borderColor="#2865E380"
            />
            <SummaryStatCard
              title={t("payrollData.stats.activeEmployees", "Active employees")}
              value={activeEmployeesCount.toString()}
              icon={CheckCircle2}
              iconColor="#22C55E"
              iconBgColor="transparent"
              borderColor="#22C55E80"
            />
            <SummaryStatCard
              title={t("payrollData.stats.totalSalary", "Total employee salary")}
              value={formatAmount(totalSalary)}
              icon={DollarSign}
              iconColor="#22C55E"
              iconBgColor="transparent"
              borderColor="#22C55E80"
            />
          </>
        )}
      </div>

      <UniversalDataTable
        data={employees}
        columns={columns}
        isLoading={isLoading}
        enableSelection={true}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder={t("payrollData.searchPlaceholder", "Search for employees")}
        showFilter={true}
        filterText={t("payrollData.filter1", "Filter")}
        currentPage={currentPage}
        totalPages={1}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        totalItems={employees.length}
        renderRowActions={renderRowActions}
        onRowClick={(item) => router.push(`/dashboard/payroll/salaries/${item.id}`)}
      />
      </div>
    </ProtectedRoute>
  );
}
