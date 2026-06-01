"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Wallet,
  Briefcase,
  Hourglass,
  CheckCircle2,
  CircleDashed,
  Info,
  Plus,
  Trash2
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UniversalDataTable, ColumnConfig } from "@/components/ui/universal-data-table";

import SummaryStatCard from "@/components/dashboard/shared/SummaryStatCard";
import { SummaryStatCardSkeleton } from "@/components/common/SummaryStatSkeleton";
import { useEmployee } from "@/features/employee/hooks/useEmployee";
import { useProfile } from "@/features/auth/hooks/useAuth";
import { 
  useSalaryStructure, 
  useCreateSalaryStructure,
  useAddAllowanceToSalaryStructure,
  useRemoveAllowanceFromSalaryStructure,
  useAddDeductionToSalaryStructure,
  useRemoveDeductionFromSalaryStructure
} from "@/features/payroll/hooks/usePayroll";
import { useAllowances } from "@/features/allowance/hooks/useAllowance";
import { useDeductions } from "@/features/deduction/hooks/useDeduction";
import { mockAttendanceSummary, mockDailyAttendance } from "@/data/mock-payroll";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { useDisplayCurrency } from "@/features/settings/hooks/useDisplayCurrency";
import { formatIntlCurrency } from "@/lib/currency";
// import { mockEmployeeSalaries, mockEarnings, mockDeductions } from "@/data/mock-payroll";

export default function EmployeeSalaryDetailPage({ params }: { params: Promise<{ employeeId: string }> }) {
  const router = useRouter();
  const { t, i18n } = useTranslation("dashboard");
  const { toast } = useToast();
  const { employeeId } = React.use(params);

  const { data: employee, isLoading: employeeLoading } = useEmployee(employeeId);
  const { currencyCode } = useDisplayCurrency(employee?.orgUnit?.orgUnitId);
  /*
  const mockEmp = mockEmployeeSalaries.find(e => e.id === employeeId) || mockEmployeeSalaries[0];
  const employee = {
    id: mockEmp.id,
    firstName: mockEmp.name.split(' ')[0],
    lastName: mockEmp.name.split(' ').slice(1).join(' '),
    salary: mockEmp.salary,
    status: mockEmp.status,
    currency: "USD",
  };
  const employeeLoading = false;
  */

  const { data: salaryStructure, isLoading: structureLoading } = useSalaryStructure(employeeId);
  /*
  const salaryStructure = {
    id: "struct-1",
    allowances: mockEarnings.map(e => ({ id: e.id, name: e.name, value: e.amount })),
    deductions: mockDeductions.map(d => ({ id: d.id, name: d.name, value: d.amount })),
  };
  const structureLoading = false;
  */

  const { data: profile } = useProfile();
  const { data: allowancesList = [] } = useAllowances(profile?.companyId);
  const { data: deductionsList = [] } = useDeductions(profile?.companyId);
  // const deductionsList = mockDeductions.map(d => ({ id: d.id, name: d.name, value: d.amount }));

  const createStructure = useCreateSalaryStructure();
  const addAllowance = useAddAllowanceToSalaryStructure();
  const removeAllowance = useRemoveAllowanceFromSalaryStructure();
  const addDeduction = useAddDeductionToSalaryStructure();
  const removeDeduction = useRemoveDeductionFromSalaryStructure();

  const [newBasicSalary, setNewBasicSalary] = useState<number>(0);
  const [newCurrency, setNewCurrency] = useState<string>(currencyCode);

  React.useEffect(() => {
    setNewCurrency(currencyCode);
  }, [currencyCode]);

  const handleCreateStructure = () => {
    if (newBasicSalary <= 0) {
      toast({
        title: t("common.error", "Error"),
        description: t("payrollData.errors.invalidSalary", "Please enter a valid basic salary"),
        variant: "destructive",
      });
      return;
    }

    createStructure.mutate({
      employeeId,
      basicSalary: newBasicSalary,
      currency: newCurrency,
    }, {
      onSuccess: () => {
        toast({
          title: t("common.success", "Success"),
          description: t("payrollData.success.structureCreated", "Salary structure created successfully"),
        });
      }
    });
  };

  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Daily attendance table columns (Mocked for now as per original)
  const columns: ColumnConfig<typeof mockDailyAttendance[0]>[] = [
    { key: "date", label: t("payrollData.columns.createdDate", "Date").split(" ")[0], sortable: true },
    { key: "clockIn", label: "Clock in", sortable: true },
    { key: "clockOut", label: "Clock out", sortable: true },
    { key: "totalTime", label: "Total time", sortable: true },
    { key: "overtime", label: t("payrollData.detail.overtime", "Overtime"), sortable: true },
    {
      key: "status",
      label: t("payrollData.columns.status", "Status"),
      sortable: true,
      render: (item) => {
        const isPresent = item.status === "Present";
        const statusText = isPresent ? t("payrollData.status.present", "Present") : t("payrollData.status.onLeave", "On leave");
        return (
          <Badge
            variant="outline"
            className={`border rounded-[6px] px-2.5 py-1 text-[12px] font-medium gap-1.5 ${
              isPresent
                ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-300"
                : "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-300"
            }`}
          >
            {isPresent ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300" />
            ) : (
              <CircleDashed className="w-3.5 h-3.5 text-amber-500" />
            )}
            {statusText}
          </Badge>
        );
      },
    },
  ];

  const formatCurrency = (value: number, currency?: string) =>
    formatIntlCurrency(value, currency || salaryStructure?.currency || employee?.currency || currencyCode, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const totalAllowances = salaryStructure?.allowances.reduce((acc, curr) => acc + curr.value, 0) || 0;
  const totalDeductions = salaryStructure?.deductions.reduce((acc, curr) => acc + curr.value, 0) || 0;
  const basicSalary = employee?.salary || 0;
  const netSalary = (basicSalary + totalAllowances) - totalDeductions;

  const handleAddAllowance = (allowanceId: string) => {
    if (!salaryStructure) return;
    addAllowance.mutate({ salaryStructureId: salaryStructure.id, allowanceId });
  };

  const handleRemoveAllowance = (allowanceId: string) => {
    if (!salaryStructure) return;
    removeAllowance.mutate({ salaryStructureId: salaryStructure.id, allowanceId });
  };

  const handleAddDeduction = (deductionId: string) => {
    if (!salaryStructure) return;
    addDeduction.mutate({ salaryStructureId: salaryStructure.id, deductionId });
  };

  const handleRemoveDeduction = (deductionId: string) => {
    if (!salaryStructure) return;
    removeDeduction.mutate({ salaryStructureId: salaryStructure.id, deductionId });
  };

  if (employeeLoading || structureLoading) {
    return (
      <div className="flex flex-col gap-8 w-full max-w-full overflow-hidden pb-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
          <div className="flex flex-col items-start gap-3">
            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryStatCardSkeleton />
          <SummaryStatCardSkeleton />
          <SummaryStatCardSkeleton />
          <SummaryStatCardSkeleton />
        </div>
        <div className="h-9 w-full bg-muted animate-pulse rounded-lg mt-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-25 bg-muted animate-pulse rounded-[12px]" />
          ))}
        </div>
      </div>
    );
  }

  if (!salaryStructure) {
    return (
      <div className="flex flex-col gap-8 w-full max-w-full overflow-hidden pb-10">
        <div className="flex flex-col gap-4 pt-2">
          <button 
            onClick={() => router.back()} 
            className="flex items-center text-sm font-medium text-foreground gap-2 hover:opacity-70 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            {t("payrollData.detail.back", "Back")}
          </button>
          <h1 className="text-[24px] font-bold text-foreground">{employee?.firstName} {employee?.lastName}</h1>
        </div>

        <div className="flex flex-col items-center justify-center p-12 bg-card border border-dashed border-border rounded-2xl gap-6">
          <div className="bg-primary/10 p-4 rounded-full">
            <Wallet className="w-12 h-12 text-primary" />
          </div>
          <div className="text-center flex flex-col gap-2">
            <h3 className="text-xl font-bold">{t("payrollData.detail.noStructure", "No Salary Structure Found")}</h3>
            <p className="text-muted-foreground max-w-md">
              {t("payrollData.detail.noStructureDesc", "This employee doesn't have a salary structure yet. Create one to manage their earnings and deductions.")}
            </p>
          </div>
          
          <div className="flex flex-col gap-4 w-full max-w-xs">
            <div className="flex flex-col gap-2">
              <Label htmlFor="basic-salary">{t("payrollData.detail.basicSalary", "Basic salary")}</Label>
              <Input 
                id="basic-salary"
                type="number" 
                placeholder="Enter basic salary" 
                value={newBasicSalary || ""} 
                onChange={(e) => setNewBasicSalary(parseFloat(e.target.value))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="currency">{t("payrollData.detail.currency", "Currency")}</Label>
              <Input 
                id="currency"
                placeholder={currencyCode} 
                value={newCurrency} 
                onChange={(e) => setNewCurrency(e.target.value)}
              />
            </div>
            <Button onClick={handleCreateStructure} disabled={createStructure.isPending} className="mt-2">
              {createStructure.isPending ? t("common.creating", "Creating...") : t("payrollData.detail.createStructure", "Create Salary Structure")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-full overflow-hidden pb-10">
      
      {/* Top Header Navigation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
        <div className="flex flex-col items-start gap-3">
          <button 
            onClick={() => router.back()} 
            className="flex items-center text-sm font-medium text-foreground gap-2 hover:opacity-70 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            {t("payrollData.detail.back", "Back")}
          </button>
          <h1 className="text-[24px] font-bold text-foreground">{employee?.firstName} {employee?.lastName}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-[40px] px-4 font-medium rounded-lg gap-2" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            {t("payrollData.detail.previous", "Previous")}
          </Button>
          <Button variant="outline" className="h-[40px] px-4 font-medium rounded-lg gap-2 bg-muted/40 hover:bg-muted">
            {t("payrollData.detail.next", "Next")}
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryStatCard
          title={t("payrollData.detail.salaryGross", "Salary (gross)")}
          value={formatCurrency(basicSalary + totalAllowances)}
          icon={Wallet}
          iconColor="#2865E3"
          iconBgColor="#EFF4FF"
          borderColor="#D1E0FF"
        />
        <SummaryStatCard
          title={t("payrollData.detail.salaryNet", "Salary (Net)")}
          value={formatCurrency(netSalary)}
          icon={Wallet}
          iconColor="#2865E3"
          iconBgColor="#EFF4FF"
          borderColor="#D1E0FF"
        />
        <SummaryStatCard
          title={t("payrollData.detail.workingDays", "Working days")}
          value="26"
          icon={Briefcase}
          iconColor="#9B51E0"
          iconBgColor="#F3E8FF"
          borderColor="#E9D5FF"
        />
        <SummaryStatCard
          title={t("payrollData.detail.attendanceRate", "Attendance rate")}
          value="89%"
          icon={Hourglass}
          iconColor="#F79009"
          iconBgColor="#FFFAEB"
          borderColor="#FEF0C7"
        />
      </div>

      {/* Main content calculation */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-[18px] font-bold text-foreground">{t("payrollData.detail.calculatorTitle", "payroll calculation")}</h2>
          <Select defaultValue="current">
            <SelectTrigger className="w-full sm:w-60 h-10 bg-card shadow-sm border-border">
              <SelectValue placeholder="Select payroll" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Structure</SelectItem>
              <SelectItem value="feb-2026">Feb 2026 payroll</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="earning-deduction" className="w-full" dir={i18n.dir() as "ltr" | "rtl"}>
          <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-lg flex-wrap sm:flex-nowrap">
            <TabsTrigger className="flex-1 min-w-37.5 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md py-2.5 text-[14px]" value="attendance-summary">{t("payrollData.detail.tabs.attendanceSummary", "Attendance summary")}</TabsTrigger>
            <TabsTrigger className="flex-1 min-w-37.5 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md py-2.5 text-[14px]" value="daily-attendance">{t("payrollData.detail.tabs.dailyRecord", "Daily attendance record")}</TabsTrigger>
            <TabsTrigger className="flex-1 min-w-37.5 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md py-2.5 text-[14px]" value="earning-deduction">{t("payrollData.detail.tabs.earningDeduction", "Earning & deduction")}</TabsTrigger>
            <TabsTrigger className="flex-1 min-w-37.5 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md py-2.5 text-[14px]" value="net-salary">{t("payrollData.detail.tabs.netSalary", "Net salary")}</TabsTrigger>
          </TabsList>
          
          <div className="mt-8">
            <TabsContent value="attendance-summary" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex flex-col justify-center bg-card border border-border rounded-[12px] p-5 h-25">
                  <p className="text-sm font-medium text-muted-foreground">{t("payrollData.detail.working", "Working days")}</p>
                  <p className="text-[18px] font-bold mt-2">{mockAttendanceSummary.workingDays}</p>
                </div>
                <div className="flex flex-col justify-center bg-card border border-border rounded-[12px] p-5 h-25">
                  <p className="text-sm font-medium text-muted-foreground">{t("payrollData.detail.present", "Present days")}</p>
                  <p className="text-[18px] font-bold mt-2">{mockAttendanceSummary.presentDays}</p>
                </div>
                <div className="flex flex-col justify-center bg-card border border-border rounded-[12px] p-5 h-25">
                  <p className="text-sm font-medium text-muted-foreground">{t("payrollData.detail.half", "Half days")}</p>
                  <p className="text-[18px] font-bold mt-2">{mockAttendanceSummary.halfDays}</p>
                </div>
                <div className="flex flex-col justify-center bg-card border border-border rounded-[12px] p-5 h-25">
                  <p className="text-sm font-medium text-muted-foreground">{t("payrollData.detail.absent", "Absent days")}</p>
                  <p className="text-[18px] font-bold mt-2">{mockAttendanceSummary.absentDays}</p>
                </div>
                <div className="flex flex-col justify-center bg-card border border-border rounded-[12px] p-5 h-25">
                  <p className="text-sm font-medium text-muted-foreground">{t("payrollData.detail.paidLeave", "Paid leave days")}</p>
                  <p className="text-[18px] font-bold mt-2">{mockAttendanceSummary.paidLeaveDays}</p>
                </div>
                <div className="flex flex-col justify-center bg-card border border-border rounded-[12px] p-5 h-25">
                  <p className="text-sm font-medium text-muted-foreground">{t("payrollData.detail.unpaidLeave", "Unpaid leave days")}</p>
                  <p className="text-[18px] font-bold mt-2">{mockAttendanceSummary.unpaidLeaveDays}</p>
                </div>
                <div className="flex flex-col justify-center bg-card border border-border rounded-[12px] p-5 h-25">
                  <p className="text-sm font-medium text-muted-foreground">{t("payrollData.detail.overtime", "Overtime")}</p>
                  <p className="text-[18px] font-bold mt-2">{mockAttendanceSummary.overtime}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="daily-attendance" className="mt-0">
              <UniversalDataTable
                data={mockDailyAttendance}
                columns={columns}
                enableSelection={true}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                currentPage={currentPage}
                totalPages={1}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                totalItems={mockDailyAttendance.length}
                showSearch={false}
                showFilter={false}
              />
            </TabsContent>

            <TabsContent value="earning-deduction" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Earnings Table */}
                <div className="flex flex-col border border-border rounded-[12px] bg-card overflow-hidden">
                  <div className="bg-muted/40 border-b border-border p-4 flex justify-between items-center">
                    <p className="text-sm font-semibold text-muted-foreground">{t("payrollData.detail.earnings", "Earnings")}</p>
                    <Select onValueChange={handleAddAllowance}>
                      <SelectTrigger className="w-[150px] h-8 text-xs">
                        <Plus className="w-3 h-3 mr-1" /> Add Earning
                      </SelectTrigger>
                      <SelectContent>
                        {allowancesList.map(a => (
                          <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col p-4">
                    <div className="flex items-center justify-between py-4 border-b border-border/70 font-bold text-foreground">
                      <span>Basic Salary</span>
                      <span>+ {formatCurrency(basicSalary)}</span>
                    </div>
                    {salaryStructure?.allowances.map((allowance) => (
                      <div key={allowance.id} className="group flex items-center justify-between py-4 border-b border-border/70 last:border-0 hover:bg-muted/30">
                        <span className="text-[14px] font-bold text-foreground">{allowance.name}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-[14px] font-medium text-emerald-600 dark:text-emerald-400">+ {formatCurrency(allowance.value)}</span>
                          <button 
                            onClick={() => handleRemoveAllowance(allowance.id)}
                            className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-6 pb-2">
                      <span className="text-[16px] font-bold text-foreground">{t("payrollData.detail.totalEarning", "Total earning")}</span>
                      <span className="text-[16px] font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(basicSalary + totalAllowances)}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions Table */}
                <div className="flex flex-col border border-border rounded-[12px] bg-card overflow-hidden">
                  <div className="bg-muted/40 border-b border-border p-4 flex justify-between items-center">
                    <p className="text-sm font-semibold text-muted-foreground">{t("payrollData.detail.deductions", "Deductions")}</p>
                    <Select onValueChange={handleAddDeduction}>
                      <SelectTrigger className="w-[150px] h-8 text-xs">
                        <Plus className="w-3 h-3 mr-1" /> Add Deduction
                      </SelectTrigger>
                      <SelectContent>
                        {deductionsList.map(d => (
                          <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col p-4">
                    {salaryStructure?.deductions.map((deduction) => (
                      <div key={deduction.id} className="group flex items-center justify-between py-4 border-b border-border/70 last:border-0 hover:bg-muted/30">
                        <span className="text-[14px] font-bold text-foreground">{deduction.name}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-[14px] font-medium text-red-600 dark:text-red-400">- {formatCurrency(deduction.value)}</span>
                          <button 
                            onClick={() => handleRemoveDeduction(deduction.id)}
                            className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-6 pb-2">
                      <span className="text-[16px] font-bold text-foreground">{t("payrollData.detail.totalDeduction", "Total deduction")}</span>
                      <span className="text-[16px] font-bold text-red-600 dark:text-red-400">{formatCurrency(totalDeductions)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="net-salary" className="mt-0">
              <div className="flex flex-col border border-border rounded-[12px] bg-card overflow-hidden">
                <div className="bg-muted/40 border-b border-border px-4 py-3">
                  <p className="text-sm font-semibold text-muted-foreground">{t("payrollData.detail.earnings", "Earnings")}</p>
                </div>
                <div className="flex flex-col p-4 w-full text-sm">
                  {/* Rows */}
                  <div className="flex justify-between py-4 border-b border-border/70 font-medium text-foreground">
                    <span>{t("payrollData.detail.basicSalary", "Basic salary")}</span>
                    <span className="text-primary font-bold">{formatCurrency(basicSalary)}</span>
                  </div>
                  <div className="flex justify-between py-4 border-b border-border/70 font-medium">
                    <span>{t("payrollData.detail.totalEarning", "Total allowances")}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">+ {formatCurrency(totalAllowances)}</span>
                  </div>
                  <div className="flex justify-between py-4 border-b border-border/70 font-medium">
                    <span>{t("payrollData.detail.overtime", "Overtime")}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">+ {formatCurrency(0)}</span>
                  </div>
                  <div className="flex justify-between py-4 border-b border-border/70 font-medium">
                    <span>{t("payrollData.detail.totalDeduction", "Total deduction")}</span>
                    <span className="text-red-600 dark:text-red-400 font-bold">- {formatCurrency(totalDeductions)}</span>
                  </div>
                  <div className="flex justify-between py-4 border-b border-border/70 font-medium">
                    <span>{t("payrollData.detail.unpaidDeduction", "Unpaid leave deduction")}</span>
                    <span className="text-red-600 dark:text-red-400 font-bold">- 0.0</span>
                  </div>
                  <div className="flex justify-between py-4 border-b border-border/70 font-medium">
                    <span>{t("payrollData.detail.absentDeduction", "Absent day deduction")}</span>
                    <span className="text-red-600 dark:text-red-400 font-bold">- 0.0</span>
                  </div>
                  <div className="flex justify-between items-center py-4 font-bold text-[16px] text-foreground">
                    <span>{t("payrollData.detail.tabs.netSalary", "Net salary")}</span>
                    <span className="text-foreground">{formatCurrency(netSalary)}</span>
                  </div>
                </div>
              </div>

              {/* Formula text */}
              <div className="mt-4 flex items-start gap-3 bg-primary/10 p-4 rounded-xl border border-primary/20 text-[13px] text-muted-foreground">
                <div className="bg-primary/20 p-1.5 rounded-full">
                  <Info className="w-4 h-4 text-primary" />
                </div>
                <div className="flex flex-col gap-1">
                  <p>
                    <span className="font-semibold text-foreground">{t("payrollData.detail.calcFormula", "Calculation Formula")}: </span> 
                    {t("payrollData.detail.formula", "Net Salary = (Basic Salary + Allowances) - (Absent day × Unpaid Leave Days) + Overtime - Deductions")}
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">{t("payrollData.detail.breakdownLabel", "Unpaid Leave Days Breakdown")}: </span>
                    {t("payrollData.detail.breakdownValue", "Unpaid Leaves, Absent Days, Half Days, Total Unpaid Days")}
                  </p>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
