'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { AssignEmployeeSalaryFormValues } from '@/components/payroll/assign-employee-salary-sheet';
import { useEmployee } from '@/features/employee/hooks/useEmployee';
import { useProfile } from '@/features/auth/hooks/useAuth';
import { useCompanyOptions } from '@/features/organization/hooks/useOrganization';
import {
  useEmployeeSalaryStructure,
  useAssignEmployeeSalary,
  useSalaryStructures,
} from '@/features/payroll/salary-structure/hooks/useSalaryStructure';
import { useEmployeePayrollPreview } from '@/features/payroll/hooks/usePayroll';
import { getAttendanceRecords } from '@/features/attendance/attendance.actions';
import { AttendanceRecord } from '@/features/attendance/attendance.types';
import { isPercentageType, PayrollComponentLineResponse } from '@/features/payroll/payroll.types';
import { useToast } from '@/hooks/use-toast';
import { getUserFacingErrorMessage } from '@/lib/parse-api-error';
import { useDisplayCurrency } from '@/features/settings/hooks/useDisplayCurrency';

export function useEmployeeSalaryDetailPage(employeeId: string) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation(['payroll', 'dashboard']);
  const { toast } = useToast();

  const { data: employee, isLoading: employeeLoading } = useEmployee(employeeId);
  const { data: profile } = useProfile();
  const tenantCompanyId = profile?.companyId ?? '';
  const { currencyCode, formatAmount } = useDisplayCurrency(
    employee?.orgUnit?.orgUnitId ?? tenantCompanyId,
  );
  const { companies: companiesData, isLoading: isLoadingCompanies } = useCompanyOptions();

  const companyOptions = useMemo(
    () =>
      companiesData?.map((company) => ({
        label: company.name || company.displayLabel || company.id,
        value: company.id,
      })) ?? [],
    [companiesData],
  );

  const [selectedOuId, setSelectedOuId] = useState('');

  const preferredOuId = useMemo(() => {
    if (!companyOptions.length) {
      return '';
    }
    return (
      employee?.orgUnit?.orgUnitId ??
      employee?.departmentId ??
      companyOptions[0]?.value ??
      ''
    );
  }, [companyOptions, employee?.orgUnit?.orgUnitId, employee?.departmentId]);

  const resolvedOuId = useMemo(() => {
    if (selectedOuId && companyOptions.some((option) => option.value === selectedOuId)) {
      return selectedOuId;
    }
    return preferredOuId;
  }, [selectedOuId, companyOptions, preferredOuId]);

  const structureScopeId = resolvedOuId || companyOptions[0]?.value || tenantCompanyId;

  const { data: salaryStructure, isLoading: structureLoading } = useEmployeeSalaryStructure(
    employeeId,
    tenantCompanyId,
  );
  const {
    data: payrollPreview,
    isLoading: previewLoading,
    isError: previewError,
  } = useEmployeePayrollPreview(
    salaryStructure ? employeeId : undefined,
    tenantCompanyId,
  );
  const { data: salaryStructures = [], isLoading: structuresLoading } =
    useSalaryStructures(structureScopeId);

  const assignSalary = useAssignEmployeeSalary();
  const [isAssignSheetManuallyOpen, setIsAssignSheetManuallyOpen] = useState(false);
  const [assignSheetDismissed, setAssignSheetDismissed] = useState(false);

  const shouldAutoOpenAssignSheet =
    !assignSheetDismissed &&
    !structureLoading &&
    !!employee &&
    (!salaryStructure ||
      (searchParams.get('edit') === 'salary' && !!salaryStructure));

  const isAssignSheetOpen = isAssignSheetManuallyOpen || shouldAutoOpenAssignSheet;

  const setIsAssignSheetOpen = (open: boolean) => {
    if (!open) {
      setAssignSheetDismissed(true);
      setIsAssignSheetManuallyOpen(false);
      return;
    }
    setIsAssignSheetManuallyOpen(true);
  };

  const salaryEditInitialValues = useMemo((): AssignEmployeeSalaryFormValues | undefined => {
    if (!salaryStructure?.id || salaryStructure.baseSalary == null) {
      return undefined;
    }

    return {
      salaryStructureId: salaryStructure.id,
      baseSalary: Number(salaryStructure.baseSalary),
    };
  }, [salaryStructure]);

  const handleAssignSalary = (values: AssignEmployeeSalaryFormValues) => {
    if (!tenantCompanyId) {
      return;
    }

    assignSalary.mutate(
      {
        companyId: tenantCompanyId,
        employeeId,
        salaryStructureId: values.salaryStructureId,
        baseSalary: values.baseSalary,
        currency: currencyCode.toUpperCase(),
      },
      {
        onSuccess: () => {
          setIsAssignSheetOpen(false);
          if (searchParams.get('edit')) {
            router.replace(`/dashboard/payroll/salaries/${employeeId}`);
          }
          toast({
            title: t('common.success', 'Success'),
            description: t(
              salaryStructure
                ? 'payrollData.success.salaryUpdated'
                : 'payrollData.success.structureCreated',
              salaryStructure ? 'Salary updated successfully' : 'Salary assigned successfully',
            ),
          });
        },
        onError: (error) => {
          toast({
            title: t('common.error', 'Error'),
            description: getUserFacingErrorMessage(
              error,
              t('payrollData.errors.salaryAssignFailed', 'Could not save salary. Please try again.'),
            ),
            variant: 'destructive',
          });
        },
      },
    );
  };

  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [attendanceFetchState, setAttendanceFetchState] = useState<{
    key: string;
    records: AttendanceRecord[];
  } | null>(null);

  const attendanceFetchKey =
    employee?.userId && payrollPreview
      ? `${employee.userId}:${payrollPreview.periodStart}:${payrollPreview.periodEnd}`
      : null;

  useEffect(() => {
    if (!attendanceFetchKey || !employee?.userId || !payrollPreview) {
      return;
    }

    let cancelled = false;

    getAttendanceRecords({
      userId: employee.userId,
      startDate: payrollPreview.periodStart,
      endDate: payrollPreview.periodEnd,
    }).then((result) => {
      if (cancelled) {
        return;
      }
      setAttendanceFetchState({
        key: attendanceFetchKey,
        records: result.success ? result.data : [],
      });
    });

    return () => {
      cancelled = true;
    };
  }, [attendanceFetchKey, employee?.userId, payrollPreview]);

  const attendanceRecords =
    attendanceFetchState?.key === attendanceFetchKey ? attendanceFetchState.records : [];

  const attendanceRecordsLoading =
    !!attendanceFetchKey && attendanceFetchState?.key !== attendanceFetchKey;

  const formatCurrency = (value: number) =>
    formatAmount(value, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const formatComponentLabel = (name: string, type: string, rawValue: number) => {
    if (isPercentageType(type)) {
      return `${name} (${rawValue}%)`;
    }
    return name;
  };

  const payrollEligible = payrollPreview?.payrollEligible ?? false;
  const ineligibilityReason = payrollPreview?.ineligibilityReason ?? null;
  const monthlyBaseSalary = payrollPreview?.monthlyBasicSalary ?? 0;
  const basicSalary = payrollPreview?.basicSalary ?? 0;
  const totalAllowances = payrollPreview?.totalAllowances ?? 0;
  const totalDeductions = payrollPreview?.totalDeductions ?? 0;
  const totalOvertime = payrollPreview?.totalOvertime ?? 0;
  const totalDutyOvertime = payrollPreview?.totalDutyOvertime ?? 0;
  const unpaidLeaveDeduction = payrollPreview?.unpaidLeaveDeduction ?? 0;
  const loanDeduction = payrollPreview?.loanDeduction ?? 0;
  const grossPay = payrollPreview?.grossPay ?? 0;
  const netSalary = payrollPreview?.netPay ?? 0;
  const attendanceSummary = payrollPreview?.attendance;

  const ineligibilityMessage = useMemo(() => {
    if (!ineligibilityReason) {
      return null;
    }
    const key = `payrollData.detail.ineligibility.${ineligibilityReason}`;
    return t(key, ineligibilityReason);
  }, [ineligibilityReason, t]);

  const earningLines = useMemo(() => {
    if (!payrollPreview || !payrollEligible) {
      return [];
    }

    const lines: PayrollComponentLineResponse[] = [
      {
        id: 'basic-salary',
        name: t('payrollData.detail.basicSalary', 'Basic salary'),
        type: 'fixed',
        rawValue: payrollPreview.monthlyBasicSalary,
        amount: payrollPreview.basicSalary,
      },
      ...payrollPreview.allowances,
    ];

    if (payrollPreview.totalOvertime > 0) {
      lines.push({
        id: 'overtime',
        name: t('payrollData.detail.overtime', 'Overtime'),
        type: 'fixed',
        rawValue: payrollPreview.totalOvertime,
        amount: payrollPreview.totalOvertime,
      });
    }

    if (payrollPreview.totalDutyOvertime > 0) {
      lines.push({
        id: 'duty-overtime',
        name: t('payrollData.detail.dutyOvertime', 'Duty overtime'),
        type: 'fixed',
        rawValue: payrollPreview.totalDutyOvertime,
        amount: payrollPreview.totalDutyOvertime,
      });
    }

    return lines;
  }, [payrollPreview, payrollEligible, t]);

  const deductionLines = useMemo(() => {
    if (!payrollPreview || !payrollEligible) {
      return [];
    }

    const lines = [...payrollPreview.deductions];

    if (payrollPreview.unpaidLeaveDeduction > 0) {
      lines.push({
        id: 'unpaid-leave',
        name: t('payrollData.detail.unpaidDeduction', 'Unpaid leave deduction'),
        type: 'fixed',
        rawValue: payrollPreview.unpaidLeaveDeduction,
        amount: payrollPreview.unpaidLeaveDeduction,
      });
    }

    if (payrollPreview.loanDeduction > 0) {
      lines.push({
        id: 'loan-deduction',
        name: t('payrollData.detail.loanDeduction', 'Loan deduction'),
        type: 'fixed',
        rawValue: payrollPreview.loanDeduction,
        amount: payrollPreview.loanDeduction,
      });
    }

    return lines;
  }, [payrollPreview, payrollEligible, t]);

  const totalDeductionAmount =
    totalDeductions + unpaidLeaveDeduction + loanDeduction;

  const employeeName = [employee?.firstName, employee?.lastName].filter(Boolean).join(' ');
  const isPageLoading = employeeLoading || structureLoading || previewLoading;

  return {
    t,
    router,
    employee,
    employeeName,
    salaryStructure,
    payrollPreview,
    previewLoading,
    previewError,
    employeeLoading,
    structureLoading,
    isPageLoading,
    payrollEligible,
    ineligibilityMessage,
    monthlyBaseSalary,
    basicSalary,
    totalAllowances,
    totalDeductions,
    totalOvertime,
    totalDutyOvertime,
    unpaidLeaveDeduction,
    loanDeduction,
    grossPay,
    netSalary,
    attendanceSummary,
    earningLines,
    deductionLines,
    totalDeductionAmount,
    formatCurrency,
    formatComponentLabel,
    attendanceRecords,
    attendanceRecordsLoading,
    selectedIds,
    setSelectedIds,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    isAssignSheetOpen,
    setIsAssignSheetOpen,
    salaryStructures,
    structuresLoading,
    companyOptions,
    structureScopeId: resolvedOuId,
    setSelectedOuId,
    isLoadingCompanies,
    currencyCode,
    salaryEditInitialValues,
    isAssignPending: assignSalary.isPending,
    handleAssignSalary,
  };
}
