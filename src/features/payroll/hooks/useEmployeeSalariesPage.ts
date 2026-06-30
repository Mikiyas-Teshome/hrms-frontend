'use client';

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AssignEmployeeSalaryFormValues } from '@/components/payroll/assign-employee-salary-sheet';
import { useEmployees } from '@/features/employee/hooks/useEmployee';
import { EmployeeResponse } from '@/features/employee/employee.types';
import { useDisplayCurrency } from '@/features/settings/hooks/useDisplayCurrency';
import { useProfile } from '@/features/auth/hooks/useAuth';
import { useCompanyOptions } from '@/features/organization/hooks/useOrganization';
import {
  useAssignEmployeeSalary,
  useEmployeeSalaryStructuresMap,
  useSalaryStructures,
} from '@/features/payroll/salary-structure/hooks/useSalaryStructure';
import { useToast } from '@/hooks/use-toast';
import { getUserFacingErrorMessage } from '@/lib/parse-api-error';
import { SalaryStructureResponse } from '@/features/payroll/salary-structure/salary-structure.types';

function hasEmployeeSalaryStructure(
  salaryStructureMap: Map<string, SalaryStructureResponse | null>,
  employeeId: string,
) {
  const structure = salaryStructureMap.get(employeeId);
  return Boolean(structure?.id && structure.baseSalary != null);
}

export function useEmployeeSalariesPage() {
  const { t } = useTranslation(['payroll', 'dashboard']);
  const { toast } = useToast();
  const { data: profile } = useProfile();
  const companyId = profile?.companyId ?? '';
  const { currencyCode, formatAmount } = useDisplayCurrency();
  const { data: employees = [], isLoading: isLoadingEmployees } = useEmployees();
  const employeeIds = useMemo(() => employees.map((employee) => employee.id), [employees]);
  const { map: salaryStructureMap, isLoading: isLoadingStructures } =
    useEmployeeSalaryStructuresMap(employeeIds, companyId);
  const { companies: companiesData, isLoading: isLoadingCompanies } = useCompanyOptions();
  const assignSalary = useAssignEmployeeSalary();

  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [sheetEmployee, setSheetEmployee] = useState<EmployeeResponse | null>(null);
  const [isAssignSheetOpen, setIsAssignSheetOpen] = useState(false);
  const [sheetOuId, setSheetOuId] = useState('');
  const [sheetMode, setSheetMode] = useState<'assign' | 'edit'>('assign');

  const companyOptions = useMemo(
    () =>
      companiesData?.map((company) => ({
        label: company.name || company.displayLabel || company.id,
        value: company.id,
      })) ?? [],
    [companiesData],
  );

  const preferredSheetOuId = useMemo(() => {
    if (!sheetEmployee) {
      return '';
    }
    return (
      sheetEmployee.orgUnit?.orgUnitId ??
      sheetEmployee.departmentId ??
      companyOptions[0]?.value ??
      companyId
    );
  }, [sheetEmployee, companyOptions, companyId]);

  const resolvedSheetOuId = useMemo(() => {
    if (sheetOuId && companyOptions.some((option) => option.value === sheetOuId)) {
      return sheetOuId;
    }
    return preferredSheetOuId;
  }, [sheetOuId, companyOptions, preferredSheetOuId]);

  const structureScopeId = resolvedSheetOuId || companyId;

  const { data: salaryStructures = [], isLoading: structuresLoading } = useSalaryStructures(
    isAssignSheetOpen ? structureScopeId : undefined,
  );

  const sheetInitialValues = useMemo((): AssignEmployeeSalaryFormValues | undefined => {
    if (!sheetEmployee || sheetMode !== 'edit') {
      return undefined;
    }

    const structure = salaryStructureMap.get(sheetEmployee.id);
    if (!structure?.id || structure.baseSalary == null) {
      return undefined;
    }

    return {
      salaryStructureId: structure.id,
      baseSalary: Number(structure.baseSalary),
    };
  }, [sheetEmployee, sheetMode, salaryStructureMap]);

  const openSalarySheet = (employee: EmployeeResponse) => {
    const hasStructure = hasEmployeeSalaryStructure(salaryStructureMap, employee.id);
    setSheetMode(hasStructure ? 'edit' : 'assign');
    setSheetEmployee(employee);
    setSheetOuId(
      employee.orgUnit?.orgUnitId ??
        employee.departmentId ??
        companyOptions[0]?.value ??
        companyId,
    );
    setIsAssignSheetOpen(true);
  };

  const handleAssignSheetOpenChange = (open: boolean) => {
    setIsAssignSheetOpen(open);
    if (!open) {
      setSheetEmployee(null);
    }
  };

  const handleAssignSalary = (values: AssignEmployeeSalaryFormValues) => {
    if (!companyId || !sheetEmployee) {
      return;
    }

    assignSalary.mutate(
      {
        companyId,
        employeeId: sheetEmployee.id,
        salaryStructureId: values.salaryStructureId,
        baseSalary: values.baseSalary,
        currency: currencyCode.toUpperCase(),
      },
      {
        onSuccess: () => {
          const wasEdit = sheetMode === 'edit';
          setIsAssignSheetOpen(false);
          setSheetEmployee(null);
          toast({
            title: t('common.success', 'Success'),
            description: t(
              wasEdit ? 'payrollData.success.salaryUpdated' : 'payrollData.success.structureCreated',
              wasEdit ? 'Salary updated successfully' : 'Salary assigned successfully',
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

  const filteredEmployees = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) {
      return employees;
    }
    return employees.filter((employee) => {
      const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
      return (
        fullName.includes(query) ||
        employee.email.toLowerCase().includes(query) ||
        employee.jobTitle?.toLowerCase().includes(query)
      );
    });
  }, [employees, searchValue]);

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / pageSize));
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEmployees.slice(start, start + pageSize);
  }, [filteredEmployees, currentPage, pageSize]);

  const resolveEmployeeSalary = (employee: EmployeeResponse) => {
    const assignedStructure = salaryStructureMap.get(employee.id);
    return assignedStructure?.baseSalary ?? employee.salary ?? 0;
  };

  const activeEmployeesCount = employees.filter(
    (employee) => employee.status.toLowerCase() === 'active',
  ).length;
  const totalSalary = employees.reduce((acc, employee) => acc + resolveEmployeeSalary(employee), 0);
  const isLoading = isLoadingEmployees;

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const checkHasStructure = (employeeId: string) =>
    hasEmployeeSalaryStructure(salaryStructureMap, employeeId);

  return {
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
    structureScopeId: resolvedSheetOuId,
    salaryStructures,
    structuresLoading,
    companyOptions,
    isLoadingCompanies,
    sheetInitialValues,
    isAssignPending: assignSalary.isPending,
    openSalarySheet,
    handleAssignSheetOpenChange,
    handleAssignSalary,
    resolveEmployeeSalary,
    hasEmployeeSalaryStructure: checkHasStructure,
    setSheetOuId,
  };
}
