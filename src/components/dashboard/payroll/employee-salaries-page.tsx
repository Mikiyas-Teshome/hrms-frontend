"use client";

import { useRouter } from "next/navigation";
import { Eye, FileText, Pencil, Plus, Users, CheckCircle2, DollarSign, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UniversalDataTable, ColumnConfig } from "@/components/ui/universal-data-table";
import { TableActionMenu } from "@/components/ui/table-action-menu";
import SummaryStatCard from "@/components/dashboard/shared/SummaryStatCard";
import { SummaryStatCardSkeleton } from "@/components/common/SummaryStatSkeleton";
import { AssignEmployeeSalarySheet } from "@/components/payroll/assign-employee-salary-sheet";
import { EmployeePayrollContractStatus, EmployeeResponse } from "@/features/employee/employee.types";
import { format } from "date-fns";
import { EmployeeSalaryComponentsCell } from "@/components/payroll/employee-salary-components-cell";
import { useEmployeeSalariesPage } from "@/features/payroll/hooks/useEmployeeSalariesPage";

export function EmployeeSalariesPage() {
  const router = useRouter();
  const {
    t,
    formatAmount,
    currencyCode,
    employees,
    salaryStructureMap,
    isLoadingStructures,
    isLoading,
    activeEmployeesCount,
    totalSalary,
    paginatedEmployees,
    filteredEmployees,
    totalPages,
    searchValue,
    handleSearchChange,
    currentPage,
    setCurrentPage,
    pageSize,
    handlePageSizeChange,
    selectedIds,
    setSelectedIds,
    sheetEmployee,
    isAssignSheetOpen,
    sheetMode,
    structureScopeId,
    salaryStructures,
    structuresLoading,
    companyOptions,
    isLoadingCompanies,
    sheetInitialValues,
    isAssignPending,
    openSalarySheet,
    handleAssignSheetOpenChange,
    handleAssignSalary,
    resolveEmployeeSalary,
    hasEmployeeSalaryStructure,
    setSheetOuId,
  } = useEmployeeSalariesPage();

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
      render: (item) => {
        const contractPending =
          item.payrollContractStatus === EmployeePayrollContractStatus.DRAFT;
        const salary = resolveEmployeeSalary(item);
        return (
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground">
              {formatAmount(salary)}
            </span>
            {contractPending ? (
              <Badge
                variant="outline"
                className="w-fit border-amber-500/30 bg-amber-500/10 text-[11px] text-amber-800 dark:text-amber-200"
              >
                {t("payrollData.columns.contractPending", "Contract pending")}
              </Badge>
            ) : null}
          </div>
        );
      },
    },
    {
      key: "components",
      label: t("payrollData.columns.components", "Components"),
      render: (item) => (
        <EmployeeSalaryComponentsCell
          structure={salaryStructureMap.get(item.id)}
          isLoading={isLoadingStructures}
          emptyLabel={t("payrollData.columns.noComponents", "No structure assigned")}
        />
      ),
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
            className={`gap-1.5 rounded-[6px] border px-2.5 py-1 text-[12px] font-medium ${
              isActive
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300"
            }`}
          >
            {isActive ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-300" />
            ) : (
              <XCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-300" />
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
      render: (item) => (
        <span className="text-muted-foreground">
          {format(new Date(item.createdAt), "MMM d, yyyy")}
        </span>
      ),
    },
  ];

  const renderRowActions = (item: EmployeeResponse) => {
    const hasStructure = hasEmployeeSalaryStructure(item.id);

    return (
      <TableActionMenu
        actions={[
          {
            label: t("payrollData.actions.view", "View"),
            icon: Eye,
            disabled: !hasStructure,
            onClick: (e) => {
              e.stopPropagation();
              if (hasStructure) {
                router.push(`/dashboard/payroll/salaries/${item.id}`);
              }
            },
          },
          {
            label: t("payrollData.actions.showPayroll", "Show payroll"),
            icon: FileText,
            disabled: !hasStructure,
            onClick: (e) => e.stopPropagation(),
          },
          {
            label: hasStructure
              ? t("payrollData.actions.edit", "Edit")
              : t("payrollData.detail.assignStructure", "Assign salary"),
            icon: hasStructure ? Pencil : Plus,
            onClick: (e) => {
              e.stopPropagation();
              openSalarySheet(item);
            },
          },
        ]}
      />
    );
  };

  return (
    <div className="flex w-full max-w-full flex-col gap-6 overflow-hidden">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-bold text-foreground">
          {t("payrollData.salariesTitle", "Employee salaries")}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              title={t("payrollData.stats.totalSalary", "Total assigned base salary")}
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
        data={paginatedEmployees}
        columns={columns}
        isLoading={isLoading}
        enableSelection={true}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        searchPlaceholder={t("payrollData.searchPlaceholder", "Search for employees")}
        showFilter={true}
        filterText={t("payrollData.filter1", "Filter")}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
        totalItems={filteredEmployees.length}
        renderRowActions={renderRowActions}
        onRowClick={(item) => {
          if (hasEmployeeSalaryStructure(item.id)) {
            router.push(`/dashboard/payroll/salaries/${item.id}`);
          } else {
            openSalarySheet(item);
          }
        }}
      />

      <AssignEmployeeSalarySheet
        isOpen={isAssignSheetOpen}
        onOpenChange={handleAssignSheetOpenChange}
        employeeName={
          sheetEmployee
            ? `${sheetEmployee.firstName} ${sheetEmployee.lastName}`.trim()
            : undefined
        }
        structures={salaryStructures}
        isLoadingStructures={structuresLoading}
        companyOptions={companyOptions}
        selectedCompanyId={structureScopeId}
        onCompanyChange={setSheetOuId}
        isLoadingCompanies={isLoadingCompanies}
        currencyCode={currencyCode}
        isSubmitting={isAssignPending}
        mode={sheetMode}
        initialValues={sheetInitialValues}
        onSubmit={handleAssignSalary}
      />
    </div>
  );
}
