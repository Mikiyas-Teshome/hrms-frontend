'use client';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SalaryStructureResponse } from '@/features/payroll/salary-structure/salary-structure.types';

type EmployeeSalaryComponentsCellProps = {
  structure?: SalaryStructureResponse | null;
  isLoading?: boolean;
  emptyLabel?: string;
};

export function EmployeeSalaryComponentsCell({
  structure,
  isLoading = false,
  emptyLabel = '—',
}: EmployeeSalaryComponentsCellProps) {
  if (isLoading) {
    return <Skeleton className="h-6 w-40 max-w-full" />;
  }

  const allowances = structure?.allowances ?? [];
  const deductions = structure?.deductions ?? [];

  if (!allowances.length && !deductions.length) {
    return <span className="text-xs text-muted-foreground">{emptyLabel}</span>;
  }

  return (
    <div className="flex max-w-md flex-wrap gap-1.5">
      {allowances.map((component) => (
        <Badge
          key={`allowance-${component.id}`}
          variant="outline"
          className="rounded-md border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300"
        >
          {component.name}
        </Badge>
      ))}
      {deductions.map((component) => (
        <Badge
          key={`deduction-${component.id}`}
          variant="outline"
          className="rounded-md border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[11px] font-medium text-red-700 dark:text-red-300"
        >
          {component.name}
        </Badge>
      ))}
    </div>
  );
}
